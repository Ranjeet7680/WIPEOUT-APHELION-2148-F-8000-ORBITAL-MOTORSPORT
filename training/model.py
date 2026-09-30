import torch
import torch.nn as nn
from torch.distributions.normal import Normal
import numpy as np

def layer_init(layer: nn.Linear, std: float = np.sqrt(2), bias_const: float = 0.0) -> nn.Linear:
    nn.init.orthogonal_(layer.weight, std)
    nn.init.constant_(layer.bias, bias_const)
    return layer

class ResidualBlock(nn.Module):
    def __init__(self, hidden_dim: int = 128):
        super().__init__()
        self.fc = layer_init(nn.Linear(hidden_dim, hidden_dim))
        self.act = nn.GELU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.act(x + self.fc(x))

class RacingActorCritic(nn.Module):
    def __init__(self, obs_dim: int = 48, act_dim: int = 5):
        super().__init__()
        self.obs_dim = obs_dim
        self.act_dim = act_dim

        # Shared Backbone: Dense(48 -> 128) + GELU + ResidualBlock(128)
        self.backbone = nn.Sequential(
            layer_init(nn.Linear(obs_dim, 128)),
            nn.GELU(),
            ResidualBlock(128),
        )

        # Actor Head: Outputs raw means before channel-specific activation
        self.actor_head = layer_init(nn.Linear(128, act_dim), std=0.01)
        # Learnable exploration parameter (initialized to ~0.54 std)
        self.actor_logstd = nn.Parameter(torch.full((1, act_dim), -0.6))

        # Critic Head: Value function baseline V(s)
        self.critic = nn.Sequential(
            layer_init(nn.Linear(128, 64)),
            nn.GELU(),
            layer_init(nn.Linear(64, 1), std=1.0),
        )

    def _apply_action_activations(self, raw_means: torch.Tensor) -> torch.Tensor:
        # Index 0, 1: Steering and Pitch -> [-1.0, 1.0] (Tanh)
        steer_pitch = torch.tanh(raw_means[..., :2])
        # Index 2, 3, 4: Throttle, Left Brake, Right Brake -> [0.0, 1.0] (Sigmoid)
        throttle_brakes = torch.sigmoid(raw_means[..., 2:])
        return torch.cat([steer_pitch, throttle_brakes], dim=-1)

    def get_value(self, x: torch.Tensor) -> torch.Tensor:
        features = self.backbone(x)
        return self.critic(features)

    def get_action_and_value(self, x: torch.Tensor, action: torch.Tensor = None):
        features = self.backbone(x)
        raw_means = self.actor_head(features)
        action_mean = self._apply_action_activations(raw_means)

        action_std = torch.exp(self.actor_logstd.expand_as(action_mean))
        dist = Normal(action_mean, action_std)

        if action is None:
            # Re-parameterized sampling with numerical clamping
            sampled = dist.rsample()
            action = torch.empty_like(sampled)
            action[..., :2] = torch.clamp(sampled[..., :2], -1.0, 1.0)
            action[..., 2:] = torch.clamp(sampled[..., 2:], 0.0, 1.0)

        # Sum log probabilities across all 5 independent actuation dimensions
        log_prob = dist.log_prob(action).sum(dim=-1)
        entropy = dist.entropy().sum(dim=-1)
        value = self.critic(features).squeeze(-1)

        return action, log_prob, entropy, value

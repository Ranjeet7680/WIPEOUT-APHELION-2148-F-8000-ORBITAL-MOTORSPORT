import os
import torch
import torch.nn as nn
from model import RacingActorCritic

# ============================================================================
# WIPEOUT: APHELION - ONNX EXPORT PIPELINE FOR WEBNN & ONNX RUNTIME WEB
# Wraps trained agent into clean deterministic inference graph and compiles ONNX
# Inputs: [batch_size, 48] -> Outputs: [batch_size, 5]
# ============================================================================

class InferenceDeployablePolicy(nn.Module):
    """Clean inference graph exporting strictly the deterministic actor mean."""
    def __init__(self, trained_agent: RacingActorCritic):
        super().__init__()
        self.backbone = trained_agent.backbone
        self.actor_head = trained_agent.actor_head

    def forward(self, observation: torch.Tensor) -> torch.Tensor:
        features = self.backbone(observation)
        raw_means = self.actor_head(features)

        # Exact channel activations matching WebNN specification
        steer_pitch = torch.tanh(raw_means[..., :2])
        throttle_brakes = torch.sigmoid(raw_means[..., 2:])

        return torch.cat([steer_pitch, throttle_brakes], dim=-1)

def export_policy():
    agent = RacingActorCritic(obs_dim=48, act_dim=5)
    checkpoint_path = "./checkpoints/racing_policy_final.pt"

    if os.path.exists(checkpoint_path):
        print(f"Loading trained checkpoint from {checkpoint_path}...")
        agent.load_state_dict(torch.load(checkpoint_path, map_location="cpu"))
    else:
        print(f"Checkpoint not found at {checkpoint_path}. Exporting initialized policy baseline...")

    agent.eval()

    deployable_model = InferenceDeployablePolicy(agent)
    dummy_input = torch.randn(15, 48, dtype=torch.float32)  # 15-craft batch

    targets = [
        "./models/racing_policy_aphelion.onnx",
        "./public/models/racing_policy_aphelion.onnx"
    ]

    for output_path in targets:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        torch.onnx.export(
            deployable_model,
            dummy_input,
            output_path,
            export_params=True,
            opset_version=17,
            do_constant_folding=True,
            input_names=["observation_input"],
            output_names=["action_output"],
            dynamic_axes={
                "observation_input": {0: "batch_size"},
                "action_output": {0: "batch_size"},
            },
        )
        print(f"ONNX policy successfully compiled to: {output_path}")

    print("Export pipeline complete! Ready for WebNN and ONNX Runtime Web.")

if __name__ == "__main__":
    export_policy()

import os
import time
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from model import RacingActorCritic
from env_sim import VectorRacingEnv

# ============================================================================
# WIPEOUT: APHELION - PPO OPTIMIZATION ENGINE & VECTORIZED TRAINING LOOP
# Vectorized Rollout Collection (16 Envs) -> GAE (0.95/0.99) -> Clipped PPO
# ============================================================================

def parse_args():
    parser = argparse.ArgumentParser(description="WIPEOUT: APHELION PPO Training")
    parser.add_argument("--total-timesteps", type=int, default=100_000, help="Total timesteps (default: 100k, prod: 10M)")
    parser.add_argument("--env-count", type=int, default=16, help="Parallel environments")
    parser.add_argument("--rollout-steps", type=int, default=512, help="Rollout horizon per iteration")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--minibatch-size", type=int, default=512, help="PPO Minibatch size")
    parser.add_argument("--epochs", type=int, default=8, help="PPO update epochs")
    return parser.parse_args()

def train():
    args = parse_args()

    ENV_COUNT = args.env_count
    ROLLOUT_STEPS = args.rollout_steps
    TOTAL_TIMESTEPS = args.total_timesteps
    LEARNING_RATE = args.lr
    BATCH_SIZE = ENV_COUNT * ROLLOUT_STEPS
    MINIBATCH_SIZE = min(args.minibatch_size, BATCH_SIZE)
    UPDATE_EPOCHS = args.epochs
    GAMMA = 0.99
    GAE_LAMBDA = 0.95
    CLIP_EPSILON = 0.2
    VF_COEF = 0.5
    ENTROPY_COEF = 0.005
    MAX_GRAD_NORM = 0.5

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 1. Initialize Vectorized Environment Simulation
    envs = VectorRacingEnv(num_envs=ENV_COUNT, episode_length=ROLLOUT_STEPS)
    agent = RacingActorCritic(obs_dim=48, act_dim=5).to(device)
    optimizer = optim.Adam(agent.parameters(), lr=LEARNING_RATE, eps=1e-5)

    # 2. Pre-allocate Rollout Storage Buffers
    obs_buffer = torch.zeros((ROLLOUT_STEPS, ENV_COUNT, 48), dtype=torch.float32, device=device)
    actions_buffer = torch.zeros((ROLLOUT_STEPS, ENV_COUNT, 5), dtype=torch.float32, device=device)
    logprobs_buffer = torch.zeros((ROLLOUT_STEPS, ENV_COUNT), dtype=torch.float32, device=device)
    rewards_buffer = torch.zeros((ROLLOUT_STEPS, ENV_COUNT), dtype=torch.float32, device=device)
    dones_buffer = torch.zeros((ROLLOUT_STEPS, ENV_COUNT), dtype=torch.float32, device=device)
    values_buffer = torch.zeros((ROLLOUT_STEPS, ENV_COUNT), dtype=torch.float32, device=device)

    # Initial environment reset
    next_obs_np = envs.reset()
    next_obs = torch.from_numpy(next_obs_np).to(device)
    next_done = torch.zeros(ENV_COUNT, dtype=torch.float32, device=device)

    num_updates = max(1, TOTAL_TIMESTEPS // BATCH_SIZE)

    print("=" * 78)
    print(f"[WIPEOUT: APHELION] Starting PPO Optimization Engine")
    print(f"Device: {device} | Environments: {ENV_COUNT} | Rollout Horizon: {ROLLOUT_STEPS}")
    print(f"Batch Size: {BATCH_SIZE} | Minibatch: {MINIBATCH_SIZE} | Iterations: {num_updates}")
    print("=" * 78)

    t_start_total = time.time()

    for update in range(1, num_updates + 1):
        frac = 1.0 - (update - 1.0) / num_updates
        optimizer.param_groups[0]["lr"] = frac * LEARNING_RATE

        # --- Phase 1: Environment Rollout Collection ---
        agent.eval()
        for step in range(ROLLOUT_STEPS):
            obs_buffer[step] = next_obs
            dones_buffer[step] = next_done

            with torch.no_grad():
                action, logprob, _, value = agent.get_action_and_value(next_obs)
                values_buffer[step] = value

            actions_buffer[step] = action
            logprobs_buffer[step] = logprob

            # Step physical simulation
            next_obs_raw, reward, done, _ = envs.step(action.cpu().numpy())
            next_obs = torch.from_numpy(next_obs_raw).to(device)
            rewards_buffer[step] = torch.from_numpy(reward).to(device)
            next_done = torch.from_numpy(done).to(device)

        # --- Phase 2: Generalized Advantage Estimation (GAE) ---
        with torch.no_grad():
            next_value = agent.get_value(next_obs).squeeze(-1)
            advantages = torch.zeros_like(rewards_buffer)
            lastgaelam = 0.0

            for t in reversed(range(ROLLOUT_STEPS)):
                if t == ROLLOUT_STEPS - 1:
                    nextnonterminal = 1.0 - next_done
                    nextvalues = next_value
                else:
                    nextnonterminal = 1.0 - dones_buffer[t + 1]
                    nextvalues = values_buffer[t + 1]

                delta = rewards_buffer[t] + GAMMA * nextvalues * nextnonterminal - values_buffer[t]
                advantages[t] = lastgaelam = delta + GAMMA * GAE_LAMBDA * nextnonterminal * lastgaelam

            returns = advantages + values_buffer

        # Flatten rollout dimensions: [ROLLOUT_STEPS, ENV_COUNT, ...] -> [BATCH_SIZE, ...]
        b_obs = obs_buffer.reshape(-1, 48)
        b_logprobs = logprobs_buffer.reshape(-1)
        b_actions = actions_buffer.reshape(-1, 5)
        b_advantages = advantages.reshape(-1)
        b_returns = returns.reshape(-1)
        b_values = values_buffer.reshape(-1)

        # Normalize advantages across batch
        b_advantages = (b_advantages - b_advantages.mean()) / (b_advantages.std() + 1e-8)

        # --- Phase 3: PPO Minibatch Updates ---
        agent.train()
        b_inds = np.arange(BATCH_SIZE)
        clipfracs = []

        for epoch in range(UPDATE_EPOCHS):
            np.random.shuffle(b_inds)
            for start in range(0, BATCH_SIZE, MINIBATCH_SIZE):
                end = start + MINIBATCH_SIZE
                mb_inds = b_inds[start:end]

                _, newlogprob, entropy, newvalue = agent.get_action_and_value(
                    b_obs[mb_inds], b_actions[mb_inds]
                )

                logratio = newlogprob - b_logprobs[mb_inds]
                ratio = torch.exp(logratio)

                with torch.no_grad():
                    approx_kl = ((ratio - 1.0) - logratio).mean()
                    clipfracs.append(((ratio - 1.0).abs() > CLIP_EPSILON).float().mean().item())

                # Surrogate Clipped Policy Loss
                mb_advantages = b_advantages[mb_inds]
                pg_loss1 = -mb_advantages * ratio
                pg_loss2 = -mb_advantages * torch.clamp(ratio, 1.0 - CLIP_EPSILON, 1.0 + CLIP_EPSILON)
                pg_loss = torch.max(pg_loss1, pg_loss2).mean()

                # Value Function Loss with clipping
                v_loss_unclipped = (newvalue - b_returns[mb_inds]) ** 2
                v_clipped = b_values[mb_inds] + torch.clamp(
                    newvalue - b_values[mb_inds], -CLIP_EPSILON, CLIP_EPSILON
                )
                v_loss_clipped = (v_clipped - b_returns[mb_inds]) ** 2
                v_loss = 0.5 * torch.max(v_loss_unclipped, v_loss_clipped).mean()

                # Entropy Bonus
                entropy_loss = entropy.mean()

                loss = pg_loss - (ENTROPY_COEF * entropy_loss) + (VF_COEF * v_loss)

                optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(agent.parameters(), MAX_GRAD_NORM)
                optimizer.step()

        mean_reward = rewards_buffer.mean().item()
        mean_speed = envs.speed.mean()

        if update % max(1, num_updates // 10) == 0 or update == 1 or update == num_updates:
            print(
                f"Iter {update:04d}/{num_updates:04d} | "
                f"Reward: {mean_reward:+.3f} | "
                f"Speed: {mean_speed:.1f} m/s | "
                f"Loss: {loss.item():.4f} | "
                f"PG Loss: {pg_loss.item():.4f} | "
                f"VF Loss: {v_loss.item():.4f} | "
                f"KL: {approx_kl.item():.5f}"
            )

    elapsed = time.time() - t_start_total
    print("=" * 78)
    print(f"Training Complete in {elapsed:.2f}s! Saving checkpoint...")

    # 4. Save Final Checkpoint
    os.makedirs("./checkpoints", exist_ok=True)
    checkpoint_path = "./checkpoints/racing_policy_final.pt"
    torch.save(agent.state_dict(), checkpoint_path)
    print(f"Successfully saved checkpoint to: {checkpoint_path}")

if __name__ == "__main__":
    train()

import torch
import numpy as np
from model import RacingActorCritic
from reward import compute_racing_reward
from env_sim import VectorRacingEnv

# ============================================================================
# WIPEOUT: APHELION - PPO TRAINING PIPELINE UNIT TEST & VERIFICATION
# ============================================================================

def test_pipeline():
    print("1. Testing Model Architecture & Tensor Shapes...")
    obs_dim = 48
    act_dim = 5
    batch_size = 16

    model = RacingActorCritic(obs_dim=obs_dim, act_dim=act_dim)
    dummy_obs = torch.randn(batch_size, obs_dim)

    # Forward pass
    action, logprob, entropy, value = model.get_action_and_value(dummy_obs)

    assert action.shape == (batch_size, act_dim), f"Action shape mismatch: {action.shape}"
    assert logprob.shape == (batch_size,), f"Logprob shape mismatch: {logprob.shape}"
    assert entropy.shape == (batch_size,), f"Entropy shape mismatch: {entropy.shape}"
    assert value.shape == (batch_size,), f"Value shape mismatch: {value.shape}"

    # Verify action ranges: steer & pitch in [-1, 1], throttle & brakes in [0, 1]
    steer_pitch = action[:, :2]
    throttle_brakes = action[:, 2:]

    assert (steer_pitch >= -1.0001).all() and (steer_pitch <= 1.0001).all(), "Steer/Pitch out of [-1, 1] bounds!"
    assert (throttle_brakes >= -0.0001).all() and (throttle_brakes <= 1.0001).all(), "Throttle/Brakes out of [0, 1] bounds!"

    print("   [OK] Actor-Critic forward pass verified.")
    print("   [OK] Action tensor clamped to continuous specifications.")

    print("\n2. Testing Multi-Objective Reward Shaping Function...")
    r1 = compute_racing_reward(
        forward_velocity=350.0,
        lateral_offset=0.0,
        hull_height=1.6,
        target_height=1.6,
        wall_impact_force=0.0,
        in_slipstream=True,
        airbrake_active=False,
        track_curvature=0.001
    )
    print(f"   Nominal High-Speed + Drafting Reward: {r1:.3f}")
    assert r1 > 1.5, f"Expected high reward on nominal racing, got {r1}"

    r_crash = compute_racing_reward(
        forward_velocity=100.0,
        lateral_offset=12.0,
        hull_height=4.0,
        target_height=1.6,
        wall_impact_force=45.0,
        in_slipstream=False,
        airbrake_active=True,
        track_curvature=0.001
    )
    print(f"   Collision + Off-line + Off-altitude Penalty: {r_crash:.3f}")
    assert r_crash < 0.0, f"Expected heavy penalty on crash, got {r_crash}"
    print("   [OK] Reward shaping function verified.")

    print("\n3. Testing VectorRacingEnv Simulation Step...")
    env = VectorRacingEnv(num_envs=batch_size, episode_length=100)
    obs = env.reset()
    assert obs.shape == (batch_size, 48), f"Obs shape mismatch: {obs.shape}"

    actions_np = action.detach().numpy()
    next_obs, rewards, dones, _ = env.step(actions_np)

    assert next_obs.shape == (batch_size, 48), f"Next obs shape mismatch: {next_obs.shape}"
    assert rewards.shape == (batch_size,), f"Rewards shape mismatch: {rewards.shape}"
    assert dones.shape == (batch_size,), f"Dones shape mismatch: {dones.shape}"

    print(f"   Mean Step Reward: {rewards.mean():.3f} | Mean Speed: {env.speed.mean():.1f} m/s")
    print("   [OK] Vectorized environment simulation verified.")

    print("\n" + "=" * 60)
    print("All PPO Actor-Critic and Simulation Tests PASSED successfully!")
    print("=" * 60)

if __name__ == "__main__":
    test_pipeline()

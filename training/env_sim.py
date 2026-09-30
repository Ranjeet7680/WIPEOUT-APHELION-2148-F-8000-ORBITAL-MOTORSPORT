import numpy as np
from reward import compute_racing_reward

# ============================================================================
# WIPEOUT: APHELION - VECTORIZED 48-DIM RACING ENVIRONMENT SIMULATION
# Implements parallel physics stepping matching the WebNN/WebGPU runtime
# ============================================================================

class VectorRacingEnv:
    def __init__(self, num_envs: int = 16, episode_length: int = 2048):
        self.num_envs = num_envs
        self.episode_length = episode_length
        self.track_length = 5000.0  # 5 km circuit
        self.half_width = 16.0      # 32m track width

        # Craft States
        self.progress = np.zeros(num_envs, dtype=np.float32)
        self.speed = np.zeros(num_envs, dtype=np.float32)
        self.lateral_offset = np.zeros(num_envs, dtype=np.float32)
        self.height = np.full(num_envs, 1.6, dtype=np.float32)
        self.heading_error = np.zeros(num_envs, dtype=np.float32)
        self.step_counts = np.zeros(num_envs, dtype=np.int32)

        # Procedural curvature profile (sine / cosine wave combination)
        self.reset()

    def _get_curvature(self, s: np.ndarray) -> np.ndarray:
        # Returns track curvature kappa = 1 / R
        return 0.02 * np.sin(s * 0.003) * np.cos(s * 0.001)

    def _get_grade(self, s: np.ndarray) -> np.ndarray:
        return 0.08 * np.sin(s * 0.002)

    def _get_bank(self, s: np.ndarray) -> np.ndarray:
        return 0.25 * np.sin(s * 0.004)

    def reset(self) -> np.ndarray:
        self.progress = np.random.uniform(0, 100.0, size=self.num_envs).astype(np.float32)
        self.speed = np.random.uniform(220.0, 320.0, size=self.num_envs).astype(np.float32)
        self.lateral_offset = np.random.uniform(-4.0, 4.0, size=self.num_envs).astype(np.float32)
        self.height = np.full(self.num_envs, 1.6, dtype=np.float32)
        self.heading_error = np.random.uniform(-0.05, 0.05, size=self.num_envs).astype(np.float32)
        self.step_counts = np.zeros(self.num_envs, dtype=np.int32)

        return self._build_observations()

    def _build_observations(self) -> np.ndarray:
        obs = np.zeros((self.num_envs, 48), dtype=np.float32)

        curv = self._get_curvature(self.progress)
        grade = self._get_grade(self.progress)
        bank = self._get_bank(self.progress)

        for e in range(self.num_envs):
            lat = self.lateral_offset[e]
            hd = self.heading_error[e]

            # 1. 16 Horizontal Raycasts in local XZ plane [0..1] (0m to 120m)
            for i in range(16):
                angle = (i / 16.0) * 2.0 * np.pi
                cos_a, sin_a = np.cos(angle + hd), np.sin(angle + hd)
                # Distance to walls at +- half_width
                if abs(cos_a) > 0.05:
                    wall_dist = (self.half_width - lat) / cos_a if cos_a > 0 else (-self.half_width - lat) / cos_a
                    d = max(0.5, min(abs(wall_dist), 120.0))
                else:
                    d = 120.0
                obs[e, i] = d / 120.0

            # 2. 4 Hull Suspension Height Probes [0..1] (0m to 10m)
            h = self.height[e]
            obs[e, 16] = np.clip((h + 0.1 * np.sin(self.progress[e])) / 10.0, 0.0, 1.0)
            obs[e, 17] = np.clip((h - 0.1 * np.sin(self.progress[e])) / 10.0, 0.0, 1.0)
            obs[e, 18] = np.clip(h / 10.0, 0.0, 1.0)
            obs[e, 19] = np.clip(h / 10.0, 0.0, 1.0)

            # 3. Local Linear Velocity (vx, vy, vz / 400 m/s)
            obs[e, 20] = np.clip((lat * 2.0) / 400.0, -1.0, 1.0) # lateral speed
            obs[e, 21] = 0.01
            obs[e, 22] = np.clip(self.speed[e] / 400.0, -1.0, 1.0) # forward speed

            # 4. Local Angular Velocity (wx, wy, wz / 4pi)
            obs[e, 23] = np.clip(grade[e] / (4.0 * np.pi), -1.0, 1.0)
            obs[e, 24] = np.clip(hd * 10.0 / (4.0 * np.pi), -1.0, 1.0)
            obs[e, 25] = np.clip(bank[e] / (4.0 * np.pi), -1.0, 1.0)

            # 5. Track Spline Delta
            obs[e, 26] = np.clip(lat / self.half_width, -1.0, 1.0)
            obs[e, 27] = np.clip(bank[e] / np.pi, -1.0, 1.0)
            obs[e, 28] = np.clip(grade[e], -1.0, 1.0)
            obs[e, 29] = np.clip(hd, -1.0, 1.0)

            # 6. Ahead Curvature (Lookaheads: 20m, 50m, 100m)
            lookaheads = [20.0, 50.0, 100.0]
            for idx, dist in enumerate(lookaheads):
                s_ahead = self.progress[e] + dist
                k = self._get_curvature(s_ahead)
                obs[e, 30 + idx * 2] = np.clip(k * 50.0, -1.0, 1.0)
                obs[e, 30 + idx * 2 + 1] = 0.0

            # 7. Nearest Rivals (mocked based on other env crafts)
            other_e = (e + 1) % self.num_envs
            rel_s = (self.progress[other_e] - self.progress[e]) % self.track_length
            if rel_s > self.track_length * 0.5:
                rel_s -= self.track_length
            rel_lat = self.lateral_offset[other_e] - lat
            rel_vel = self.speed[other_e] - self.speed[e]

            obs[e, 36] = np.clip(rel_lat / 100.0, -1.0, 1.0)
            obs[e, 37] = 0.0
            obs[e, 38] = np.clip(rel_s / 100.0, -1.0, 1.0)
            obs[e, 39] = 0.0
            obs[e, 40] = 0.0
            obs[e, 41] = np.clip(rel_vel / 400.0, -1.0, 1.0)

            # Rival 2 (null or distant)
            for j in range(6):
                obs[e, 42 + j] = 0.0

        return obs

    def step(self, actions: np.ndarray):
        # Actions: [steer, pitch, throttle, left_brake, right_brake]
        dt = 1.0 / 60.0  # 60Hz physics step
        rewards = np.zeros(self.num_envs, dtype=np.float32)
        dones = np.zeros(self.num_envs, dtype=np.float32)

        steer = actions[:, 0]
        pitch = actions[:, 1]
        throttle = actions[:, 2]
        left_brake = actions[:, 3]
        right_brake = actions[:, 4]

        # Physics integration
        brake_sum = left_brake + right_brake
        accel = throttle * 120.0 - (brake_sum * 150.0) - (0.0004 * (self.speed ** 2))
        self.speed = np.clip(self.speed + accel * dt, 80.0, 420.0)

        # Lateral movement
        yaw_rate = steer * 4.5 + (left_brake - right_brake) * 3.5
        self.heading_error += yaw_rate * dt
        self.heading_error *= 0.88  # Damping

        self.lateral_offset += (self.speed * np.sin(self.heading_error) + steer * 12.0) * dt
        self.progress = (self.progress + self.speed * dt) % self.track_length

        # Height dynamics (PID equilibrium around 1.6m)
        self.height += (1.6 - self.height) * 4.0 * dt + (pitch * 0.5 * dt)
        self.height = np.clip(self.height, 0.4, 3.5)

        # Curvature at current progress
        curvs = self._get_curvature(self.progress)

        for e in range(self.num_envs):
            self.step_counts[e] += 1
            lat = self.lateral_offset[e]

            # Wall collision force
            impact_force = 0.0
            if abs(lat) > (self.half_width - 1.2):
                impact_force = (abs(lat) - (self.half_width - 1.2)) * 60.0
                self.lateral_offset[e] = np.sign(lat) * (self.half_width - 1.2)
                self.speed[e] *= 0.92

            # Slipstream condition
            in_slipstream = False
            other_e = (e + 1) % self.num_envs
            rel_s = (self.progress[other_e] - self.progress[e]) % self.track_length
            if 10.0 < rel_s < 60.0 and abs(lat - self.lateral_offset[other_e]) < 3.0:
                in_slipstream = True
                self.speed[e] += 40.0 * dt

            # Compute Reward
            r = compute_racing_reward(
                forward_velocity=float(self.speed[e]),
                lateral_offset=float(lat),
                hull_height=float(self.height[e]),
                target_height=1.6,
                wall_impact_force=float(impact_force),
                in_slipstream=in_slipstream,
                airbrake_active=bool(brake_sum[e] > 0.3),
                track_curvature=float(abs(curvs[e]))
            )
            rewards[e] = r

            # Check termination
            if self.step_counts[e] >= self.episode_length:
                dones[e] = 1.0

        next_obs = self._build_observations()
        return next_obs, rewards, dones, {}

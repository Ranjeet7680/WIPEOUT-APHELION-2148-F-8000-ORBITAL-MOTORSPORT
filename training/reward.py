import numpy as np

# ============================================================================
# WIPEOUT: APHELION - REWARD SHAPING FUNCTION FOR ANTI-GRAVITY RACING
# Multi-objective balancing: Progress, Apex tracking, Altitude stability,
# Collision avoidance, Airbrake cornering incentives, and Slipstream bonuses
# ============================================================================

def compute_racing_reward(
    forward_velocity: float,      # Velocity along track tangent (m/s)
    lateral_offset: float,        # Distance from racing spline centerline (m)
    hull_height: float,           # Distance above track surface (m)
    target_height: float = 1.6,   # Nominal repulsor suspension height (m)
    wall_impact_force: float = 0.0,# Peak G-force from collision
    in_slipstream: bool = False,
    airbrake_active: bool = False,
    track_curvature: float = 0.0, # Curvature kappa = 1 / R
) -> float:
    # 1. Primary Progress: Normalized forward speed (target: 350 m/s ~ 1260 km/h)
    r_progress = (forward_velocity / 350.0) * 1.5

    # 2. Apex Accuracy: Gaussian penalty around racing line
    r_apex = np.exp(-0.5 * (lateral_offset / 3.0) ** 2) * 0.4

    # 3. Levitation Suspension Penalty: Keep craft at target altitude
    height_error = abs(hull_height - target_height)
    p_height = (height_error ** 2) * 0.8

    # 4. Impact Scrape / Collision Penalty
    p_wall = (wall_impact_force / 50.0) * 2.0

    # 5. Strategic Airbrake Incentive: Reward braking only when approaching sharp curves
    b_airbrake = 0.0
    if airbrake_active:
        if track_curvature > 0.015:  # Tight chicane / hairpin
            b_airbrake = 0.3
        else:  # Dragging on straights penalized
            b_airbrake = -0.4

    # 6. Aerodynamic Drafting / Slipstream Bonus
    b_draft = 0.25 if in_slipstream else 0.0

    return float(r_progress + r_apex + b_airbrake + b_draft - p_height - p_wall)

// ============================================================================
// WIPEOUT: APHELION - PROPORTIONAL-INTEGRAL-DERIVATIVE (PID) CONTROLLER
// High-precision repulsor suspension damping and height regulation
// ============================================================================

export class PIDController {
  constructor(kp = 85.0, ki = 4.0, kd = 22.0, maxOutput = 450.0) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
    this.maxOutput = maxOutput;

    this.integral = 0;
    this.previousError = 0;
    this.hasPrevious = false;
  }

  reset() {
    this.integral = 0;
    this.previousError = 0;
    this.hasPrevious = false;
  }

  compute(target, current, dt) {
    if (dt <= 0) return 0;

    const error = target - current;

    // Proportional term
    const pTerm = this.kp * error;

    // Integral term with anti-windup clamp
    this.integral += error * dt;
    this.integral = Math.max(Math.min(this.integral, 25.0), -25.0);
    const iTerm = this.ki * this.integral;

    // Derivative term (rate of change of error)
    let dTerm = 0;
    if (this.hasPrevious) {
      const errorRate = (error - this.previousError) / dt;
      dTerm = this.kd * errorRate;
    } else {
      this.hasPrevious = true;
    }
    this.previousError = error;

    const output = pTerm + iTerm + dTerm;
    return Math.max(Math.min(output, this.maxOutput), -this.maxOutput);
  }
}

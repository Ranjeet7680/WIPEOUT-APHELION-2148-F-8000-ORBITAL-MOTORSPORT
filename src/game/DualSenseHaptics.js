// ============================================================================
// WIPEOUT: APHELION - DUALSENSE ADVANCED HAPTICS & WEBHID ENGINE
// Voice-coil frequency modulation, aerodynamic shear rumble, and adaptive triggers
// ============================================================================

export class DualSenseHaptics {
  constructor() {
    this.gamepad = null;
    this.hasHaptics = false;
    this.lastTriggerClunk = false;
  }

  update(speedKmh, throttle, airbrakeAmount, repulsorCompression, isScraping) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;

    const gp = gamepads[0];
    const speedRatio = Math.min(speedKmh / 1400.0, 1.2);

    // Standard Gamepad Vibration Actuator
    if (gp.vibrationActuator && gp.vibrationActuator.playEffect) {
      // High-frequency motor: aerodynamic shear & Mach 1 wake
      const highFreq = Math.min(0.1 + (speedRatio * 0.4) + (isScraping ? 0.6 : 0), 1.0);

      // Low-frequency motor: repulsor cushion compression over track ridges
      const lowFreq = Math.min((repulsorCompression * 0.5) + (airbrakeAmount * 0.35) + (isScraping ? 0.5 : 0), 1.0);

      gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 80,
        weakMagnitude: highFreq,
        strongMagnitude: lowFreq
      }).catch(() => {});
    }

    // Mach 1 Airbrake Flap Mechanical "Clunk"
    const pastMach1 = speedKmh > 1020;
    if (pastMach1 && airbrakeAmount > 0.5 && !this.lastTriggerClunk) {
      this.lastTriggerClunk = true;
      if (gp.vibrationActuator && gp.vibrationActuator.playEffect) {
        gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: 120,
          weakMagnitude: 0.9,
          strongMagnitude: 0.8
        }).catch(() => {});
      }
    } else if (airbrakeAmount < 0.2) {
      this.lastTriggerClunk = false;
    }
  }
}

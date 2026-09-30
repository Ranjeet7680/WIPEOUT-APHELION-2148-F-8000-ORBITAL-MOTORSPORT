// ============================================================================
// WIPEOUT: APHELION - BATCHED NEURAL AGENT CONTROLLER
// Dispatches all competing non-player crafts concurrently via WebNN/WebGPU
// Maps 5 continuous policy channels to mechanical flight controls & airbrakes
// ============================================================================

import { extractCraftTelemetry } from './telemetry-extractor.js';
import { OBS_DIM, ACTION_DIM } from './types.js';

export class NeuralAgentController {
  constructor(neuralSystem, numCrafts, inputDim = OBS_DIM, outputDim = ACTION_DIM) {
    this.system = neuralSystem;
    this.numCrafts = numCrafts;
    this.inputDim = inputDim;
    this.outputDim = outputDim;

    this.controls = [];
    for (let i = 0; i < numCrafts; i++) {
      this.controls.push({
        steering: 0,
        pitchTrim: 0,
        throttle: 0,
        leftAirbrake: 0,
        rightAirbrake: 0
      });
    }
  }

  setNumCrafts(count) {
    this.numCrafts = count;
    while (this.controls.length < count) {
      this.controls.push({
        steering: 0,
        pitchTrim: 0,
        throttle: 0,
        leftAirbrake: 0,
        rightAirbrake: 0
      });
    }
  }

  async updateTick(crafts, track, playerCraft = null) {
    if (!this.system.isReady || crafts.length === 0) return this.controls;

    const count = Math.min(crafts.length, this.system.batchSize);

    // 1. Vectorize telemetry for all active opponent crafts
    for (let i = 0; i < count; i++) {
      const rivals = [];
      if (playerCraft) rivals.push(playerCraft);
      for (let j = 0; j < crafts.length; j++) {
        if (j !== i) rivals.push(crafts[j]);
      }

      extractCraftTelemetry(
        i,
        this.system.inputBuffer,
        this.inputDim,
        crafts[i],
        track,
        rivals
      );
    }

    // 2. Execute parallelized WebNN / WebGPU graph inference
    const outputData = await this.system.runInference();

    // 3. Map continuous policy tensors to mechanical control registers
    for (let i = 0; i < count; i++) {
      const outBase = i * this.outputDim;

      this.controls[i].steering      = outputData[outBase + 0]; // [-1.0, 1.0] (Tanh)
      this.controls[i].pitchTrim     = outputData[outBase + 1]; // [-1.0, 1.0] (Tanh)
      this.controls[i].throttle      = outputData[outBase + 2]; // [ 0.0, 1.0] (Sigmoid)
      this.controls[i].leftAirbrake  = outputData[outBase + 3]; // [ 0.0, 1.0] (Sigmoid)
      this.controls[i].rightAirbrake = outputData[outBase + 4]; // [ 0.0, 1.0] (Sigmoid)

      // Apply controls directly to AI racer instance
      if (typeof crafts[i].applyFlightControls === 'function') {
        crafts[i].applyFlightControls(this.controls[i]);
      }
    }

    return this.controls;
  }
}

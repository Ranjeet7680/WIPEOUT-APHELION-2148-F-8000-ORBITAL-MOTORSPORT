// ============================================================================
// WIPEOUT: APHELION - LOW-LATENCY NEURAL INFERENCE ENGINE
// Multi-Tier Execution Provider Hierarchy:
// 1. WebNN W3C Native API (navigator.ml - NPU/GPU graph compilation)
// 2. ONNX Runtime Web (WebNN, WebGPU, WASM execution providers)
// 3. Native WebGPU Compute Shader (neural_inference.wgsl direct compute pass)
// 4. Vectorized SIMD128 / Fast TypedArray CPU Engine
// ============================================================================

import { OBS_DIM, ACTION_DIM } from './types.js';
import { generateCalibratedPolicyWeights } from './weights-generator.js';
import { createWebNNContext, buildNativePolicyGraph } from './native-webnn-graph.js';
import { WebGPUNeuralEngine } from './webgpu-neural-engine.js';
import { SIMDNeuralEngine } from './simd-neural-engine.js';

export class NeuralTrajectorySystem {
  constructor(config = {}) {
    this.batchSize = config.batchSize || 4;
    this.inputDim = config.inputDim || OBS_DIM;
    this.outputDim = config.outputDim || ACTION_DIM;
    this.modelPath = config.modelPath || null;

    // Pre-allocated memory buffers for zero-copy per-frame inference
    this.inputBuffer = new Float32Array(this.batchSize * this.inputDim);
    this.outputBuffer = new Float32Array(this.batchSize * this.outputDim);

    // Policy Weights & Biases
    this.weights = generateCalibratedPolicyWeights();

    // Active Engine State
    this.isInitialized = false;
    this.backendName = 'INITIALIZING';
    this.latencyMs = 0.32;
    this.executionCount = 0;

    // Backends
    this.webnnContext = null;
    this.webnnGraph = null;
    this.ortSession = null;
    this.ortInputTensor = null;
    this.webgpuEngine = null;
    this.simdEngine = new SIMDNeuralEngine(this.batchSize, this.weights);
  }

  async initialize(webgpuDevice = null) {
    // ------------------------------------------------------------------------
    // TIER 1: Direct W3C WebNN API (navigator.ml) targeting discrete NPU or GPU
    // ------------------------------------------------------------------------
    try {
      const webnnRes = await createWebNNContext();
      if (webnnRes && webnnRes.context) {
        this.webnnContext = webnnRes.context;
        this.webnnGraph = await buildNativePolicyGraph(this.webnnContext, this.batchSize, this.weights);
        this.backendName = `WebNN (${webnnRes.deviceType.toUpperCase()})`;
        this.isInitialized = true;
        console.log(`[NeuralTrajectorySystem] Initialized on ${this.backendName}`);
        return;
      }
    } catch (err) {
      console.warn('[NeuralTrajectorySystem] WebNN W3C API unavailable, probing ORT/WebGPU:', err);
    }

    // ------------------------------------------------------------------------
    // TIER 2: ONNX Runtime Web with WebNN / WebGPU providers
    // ------------------------------------------------------------------------
    if (this.modelPath) {
      try {
        const ort = await import('onnxruntime-web');
        const sessionOptions = {
          executionProviders: [
            {
              name: 'webnn',
              deviceType: 'gpu',
              powerPreference: 'high-performance'
            },
            {
              name: 'webgpu',
              preferredLayout: 'NCHW'
            },
            'wasm'
          ],
          graphOptimizationLevel: 'all',
          enableCpuMemArena: true,
          enableMemPattern: true,
          executionMode: 'sequential'
        };

        this.ortSession = await ort.InferenceSession.create(this.modelPath, sessionOptions);
        this.ortInputTensor = new ort.Tensor('float32', this.inputBuffer, [this.batchSize, this.inputDim]);
        this.backendName = 'ORT Web (WebNN/WebGPU)';
        this.isInitialized = true;
        console.log('[NeuralTrajectorySystem] Initialized with ONNX Runtime Web.');
        return;
      } catch (err) {
        console.warn('[NeuralTrajectorySystem] ORT model load skipped, continuing to native WebGPU compute pass.');
      }
    }

    // ------------------------------------------------------------------------
    // TIER 3: Direct WebGPU Compute Shader Inference Pass
    // ------------------------------------------------------------------------
    if (webgpuDevice) {
      try {
        this.webgpuEngine = new WebGPUNeuralEngine(webgpuDevice, this.batchSize, this.weights);
        if (this.webgpuEngine.isReady) {
          this.backendName = 'WebGPU Compute (Direct)';
          this.isInitialized = true;
          console.log('[NeuralTrajectorySystem] Initialized on WebGPU Compute Shader.');
          return;
        }
      } catch (err) {
        console.warn('[NeuralTrajectorySystem] WebGPU Compute Engine initialization failed:', err);
      }
    }

    // ------------------------------------------------------------------------
    // TIER 4: Vectorized SIMD128 / Fast TypedArray CPU Fallback Engine
    // ------------------------------------------------------------------------
    this.backendName = 'SIMD128 (CPU Vectorized)';
    this.isInitialized = true;
    console.log('[NeuralTrajectorySystem] Running on ultra-low-latency SIMD128 CPU Engine.');
  }

  get isReady() {
    return this.isInitialized;
  }

  async runInference() {
    if (!this.isInitialized) return this.outputBuffer;

    const tStart = performance.now();

    // 1. Direct WebNN Native Graph
    if (this.webnnGraph && this.webnnContext) {
      try {
        const inputs = { observation_input: this.inputBuffer };
        const outputs = { action_output: this.outputBuffer };
        await this.webnnContext.compute(this.webnnGraph, inputs, outputs);
      } catch (err) {
        // Fall back to SIMD if runtime error occurs
        this.simdEngine.compute(this.inputBuffer, this.outputBuffer);
      }
    }
    // 2. ONNX Runtime Web
    else if (this.ortSession && this.ortInputTensor) {
      try {
        const feeds = { 'observation_input': this.ortInputTensor };
        const results = await this.ortSession.run(feeds);
        const outData = results['action_output'].data;
        this.outputBuffer.set(outData);
      } catch (err) {
        this.simdEngine.compute(this.inputBuffer, this.outputBuffer);
      }
    }
    // 3. WebGPU Compute Shader
    else if (this.webgpuEngine && this.webgpuEngine.isReady) {
      try {
        await this.webgpuEngine.compute(this.inputBuffer, this.outputBuffer);
      } catch (err) {
        this.simdEngine.compute(this.inputBuffer, this.outputBuffer);
      }
    }
    // 4. SIMD128 TypedArray Engine
    else {
      this.simdEngine.compute(this.inputBuffer, this.outputBuffer);
    }

    const tEnd = performance.now();
    const duration = tEnd - tStart;
    this.latencyMs = this.latencyMs * 0.9 + duration * 0.1; // Smooth exponential moving average
    this.executionCount++;

    return this.outputBuffer;
  }
}

// ============================================================================
// WIPEOUT: APHELION - WEBGPU MULTI-PASS REPULSOR PIPELINE
// Native WebGPU Compute (PDE Wave Sim) + Screen-Space Gravitational Lensing Pass
// ============================================================================

import repulsorSimWGSL from '../shaders/repulsor_sim.wgsl?raw';
import repulsorLensingWGSL from '../shaders/repulsor_lensing.wgsl?raw';

export class WebGPURepulsorPipeline {
  constructor() {
    this.device = null;
    this.computePipeline = null;
    this.renderPipeline = null;
    this.stateTextures = [];
    this.normalTexture = null;
    this.simUniformBuffer = null;
    this.cameraUniformBuffer = null;
    this.proxyUniformBuffer = null;
    this.sceneSampler = null;
    this.pingPongIndex = 0;
    this.isReady = false;
  }

  async initialize(device, presentationFormat = 'bgra8unorm') {
    this.device = device;

    try {
      // 1. Create Simulation State Textures (R32Float for Heightfield PDE, 512x512)
      for (let i = 0; i < 2; i++) {
        this.stateTextures.push(
          device.createTexture({
            size: [512, 512, 1],
            format: 'r32float',
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
          })
        );
      }

      // 2. Normal & Distortion Buffer (RGBA16Float, 512x512)
      this.normalTexture = device.createTexture({
        size: [512, 512, 1],
        format: 'rgba16float',
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING,
      });

      // 3. Uniform Buffers
      // SimUniforms: craftPosUV (vec2), repulsorForce (f32), damping (f32), waveSpeedSq (f32), deltaTime (f32), resolution (vec2) -> 32 bytes
      this.simUniformBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // CameraUniforms: viewProjInverse (mat4), viewMatrix (mat4), projMatrix (mat4), cameraWorldPos (vec3+pad), viewportSize (vec2+pad) -> 240 bytes
      this.cameraUniformBuffer = device.createBuffer({
        size: 256,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // ProxyUniforms: worldMatrix (mat4), intensity (f32), dispersion (f32), thermalGlowColor (vec3) -> 96 bytes
      this.proxyUniformBuffer = device.createBuffer({
        size: 128,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // Sampler
      this.sceneSampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
      });

      // 4. Compile Compute Pipeline (Damped Wave Equation PDE)
      const simModule = device.createShaderModule({ code: repulsorSimWGSL });
      this.computePipeline = device.createComputePipeline({
        layout: 'auto',
        compute: { module: simModule, entryPoint: 'cs_main' },
      });

      // 5. Compile Screen-Space Lensing Render Pipeline
      const lensingModule = device.createShaderModule({ code: repulsorLensingWGSL });
      this.renderPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module: lensingModule, entryPoint: 'vs_main' },
        fragment: {
          module: lensingModule,
          entryPoint: 'fs_main',
          targets: [
            {
              format: presentationFormat,
              blend: {
                color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
                alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
              }
            }
          ],
        },
        primitive: { topology: 'triangle-list' },
      });

      this.isReady = true;
      console.log('WebGPU Repulsor Pipeline successfully initialized.');
    } catch (err) {
      console.warn('WebGPU Repulsor Pipeline failed to initialize:', err);
      this.isReady = false;
    }
  }

  updateUniforms(craftUV, repulsorForce, deltaTime, cameraData, proxyData) {
    if (!this.isReady || !this.device) return;

    // Sim Uniforms
    const simData = new Float32Array([
      craftUV.x, craftUV.y,
      repulsorForce,
      0.025, // damping
      0.35,  // waveSpeedSq
      deltaTime,
      512.0, 512.0 // resolution
    ]);
    this.device.queue.writeBuffer(this.simUniformBuffer, 0, simData);

    // Camera Uniforms
    if (cameraData) {
      this.device.queue.writeBuffer(this.cameraUniformBuffer, 0, cameraData);
    }

    // Proxy Uniforms
    if (proxyData) {
      this.device.queue.writeBuffer(this.proxyUniformBuffer, 0, proxyData);
    }
  }

  execute(commandEncoder, outputView, sceneColorView, sceneDepthView) {
    if (!this.isReady) return;

    const current = this.stateTextures[this.pingPongIndex];
    const previous = this.stateTextures[1 - this.pingPongIndex];
    const next = previous; // Ping-pong target

    // --- 1. COMPUTE PASS: Solve Damped Wave Equation PDE ---
    const computeBindGroup = this.device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.simUniformBuffer } },
        { binding: 1, resource: current.createView() },
        { binding: 2, resource: previous.createView() },
        { binding: 3, resource: next.createView() },
        { binding: 4, resource: this.normalTexture.createView() },
      ],
    });

    const computePass = commandEncoder.beginComputePass({ label: 'Repulsor Wave Sim PDE' });
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, computeBindGroup);
    computePass.dispatchWorkgroups(512 / 16, 512 / 16);
    computePass.end();

    // Flip index for next frame
    this.pingPongIndex = 1 - this.pingPongIndex;

    // --- 2. RENDER PASS: Screen-Space Refractive Gravitational Lensing ---
    const cameraBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.cameraUniformBuffer } }],
    });

    const proxyBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(1),
      entries: [{ binding: 0, resource: { buffer: this.proxyUniformBuffer } }],
    });

    const sceneBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(2),
      entries: [
        { binding: 0, resource: this.sceneSampler },
        { binding: 1, resource: sceneColorView },
        { binding: 2, resource: sceneDepthView },
        { binding: 3, resource: this.normalTexture.createView() },
      ],
    });

    const renderPass = commandEncoder.beginRenderPass({
      label: 'Repulsor Lensing Pass',
      colorAttachments: [
        {
          view: outputView,
          loadOp: 'load',
          storeOp: 'store',
        },
      ],
    });
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, cameraBindGroup);
    renderPass.setBindGroup(1, proxyBindGroup);
    renderPass.setBindGroup(2, sceneBindGroup);
    renderPass.draw(3, 1, 0, 0);
    renderPass.end();
  }
}

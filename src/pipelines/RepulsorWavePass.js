import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// ============================================================================
// WIPEOUT: APHELION - MULTI-PASS REPULSOR PDE WAVE SIMULATION & LENSING PASS
// Pass 1: OPAQUE SCENE PASS (Color RGBA16F + SceneDepthTexture D32)
// Pass 2: COMPUTE / GPGPU PASS (Ping-Pong 512x512 Wave Equation PDE Solver)
// Pass 3: SCREEN-SPACE REFRACTION & CHROMATIC LENSING PASS
// ============================================================================

export class RepulsorWavePass extends Pass {
  constructor(scene, camera, width, height) {
    super();

    this.scene = scene;
    this.camera = camera;
    this.width = width;
    this.height = height;
    this.simRes = 512;

    // Repulsor simulation state uniforms
    this.craftPosUV = new THREE.Vector2(0.5, 0.5);
    this.repulsorForce = 0.8;
    this.damping = 0.025;
    this.waveSpeedSq = 0.35;
    this.intensity = 1.2;
    this.dispersion = 1.8; // Chromatic aberration factor
    this.thermalGlowColor = new THREE.Color(0x00F0FF);

    // 1. OPAQUE SCENE TARGET (RGBA16Float / HalfFloat with DepthTexture)
    this.sceneRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthTexture: new THREE.DepthTexture(width, height, THREE.UnsignedIntType)
    });

    // 2. PING-PONG 512x512 SIMULATION STATE TARGETS (R: current, G: previous, B: normal.x, A: normal.y)
    const simTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping
    };

    this.simTargetCurrent = new THREE.WebGLRenderTarget(this.simRes, this.simRes, simTargetOptions);
    this.simTargetPrevious = new THREE.WebGLRenderTarget(this.simRes, this.simRes, simTargetOptions);

    // 3. FULLSCREEN QUAD & ORTHO CAM FOR GPGPU SIMULATION
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quadGeometry = new THREE.PlaneGeometry(2, 2);

    // Setup shaders
    this.setupWaveSimulationShader();
    this.setupScreenSpaceLensingShader();

    this.fsQuad = new FullScreenQuad(this.lensingMaterial);
  }

  setupWaveSimulationShader() {
    const waveSimVS = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const waveSimFS = `
      precision highp float;
      uniform sampler2D uStateCurrent;
      uniform sampler2D uStatePrevious;
      uniform vec2 uCraftPosUV;
      uniform float uRepulsorForce;
      uniform float uDamping;
      uniform float uWaveSpeedSq;
      uniform vec2 uResolution;
      varying vec2 vUv;

      void main() {
        vec2 texel = 1.0 / uResolution;

        // 1. 5-point Laplacian stencil
        float c = texture2D(uStateCurrent, vUv).r;
        float l = texture2D(uStateCurrent, vUv + vec2(-texel.x, 0.0)).r;
        float r = texture2D(uStateCurrent, vUv + vec2(texel.x, 0.0)).r;
        float t = texture2D(uStateCurrent, vUv + vec2(0.0, texel.y)).r;
        float b = texture2D(uStateCurrent, vUv + vec2(0.0, -texel.y)).r;
        float prev = texture2D(uStatePrevious, vUv).r;

        float laplacian = (l + r + t + b) - 4.0 * c;

        // 2. Continuous downward impulse injection from craft repulsor footprint
        float dist = distance(vUv, uCraftPosUV);
        float footprintRadius = 0.045; // Localized coil radius
        float impulse = 0.0;
        if (dist < footprintRadius) {
          float decay = cos((dist / footprintRadius) * 1.5707963);
          impulse = uRepulsorForce * decay * 2.5;
        }

        // 3. Discrete Verlet integration step
        float accel = uWaveSpeedSq * laplacian - (uDamping * (c - prev)) + impulse;
        float next = 2.0 * c - prev + accel;

        // 4. Central difference normal vector for visual lensing
        float dX = (r - l) * 0.5;
        float dY = (b - t) * 0.5;
        vec3 normal = normalize(vec3(-dX, -dY, 1.0));

        // Output: R = next displacement, G = current (becomes prev), B/A = packed normal
        gl_FragColor = vec4(next, c, normal.x * 0.5 + 0.5, normal.y * 0.5 + 0.5);
      }
    `;

    this.waveSimMaterial = new THREE.ShaderMaterial({
      vertexShader: waveSimVS,
      fragmentShader: waveSimFS,
      uniforms: {
        uStateCurrent: { value: null },
        uStatePrevious: { value: null },
        uCraftPosUV: { value: this.craftPosUV },
        uRepulsorForce: { value: this.repulsorForce },
        uDamping: { value: this.damping },
        uWaveSpeedSq: { value: this.waveSpeedSq },
        uResolution: { value: new THREE.Vector2(this.simRes, this.simRes) }
      },
      depthTest: false,
      depthWrite: false
    });

    this.waveSimMesh = new THREE.Mesh(this.quadGeometry, this.waveSimMaterial);
    this.waveSimScene = new THREE.Scene();
    this.waveSimScene.add(this.waveSimMesh);
  }

  setupScreenSpaceLensingShader() {
    const lensingVS = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const lensingFS = `
      precision highp float;
      uniform sampler2D uSceneColor;
      uniform sampler2D uSceneDepth;
      uniform sampler2D uWaveNormal;
      uniform float uIntensity;
      uniform float uDispersion;
      uniform vec3 uThermalGlowColor;
      uniform vec2 uViewportSize;
      uniform vec2 uCraftScreenPos;
      uniform float uNear;
      uniform float uFar;
      varying vec2 vUv;

      float linearizeDepth(float d) {
        return (2.0 * uNear * uFar) / (uFar + uNear - (d * 2.0 - 1.0) * (uFar - uNear));
      }

      void main() {
        vec2 screenUV = vUv;

        // 1. Sample wave normal & amplitude
        vec4 waveData = texture2D(uWaveNormal, screenUV);
        float next = waveData.r;
        float waveAmplitude = abs(next);
        vec2 normalXY = (waveData.ba * 2.0 - 1.0);

        // Screen-space mask focused around craft repulsor footprint
        float screenDist = distance(screenUV, uCraftScreenPos);
        float footprintMask = smoothstep(0.45, 0.04, screenDist);
        waveAmplitude *= footprintMask;

        if (waveAmplitude < 0.0005) {
          gl_FragColor = texture2D(uSceneColor, screenUV);
          return;
        }

        // 2. Linear depth bounds test to prevent foreground bleeding
        float rawDepth = texture2D(uSceneDepth, screenUV).r;
        float sceneDepth = linearizeDepth(rawDepth);

        // 3. Screen-space refractive offset
        float distortionStrength = uIntensity * waveAmplitude * 0.035;
        vec2 refractOffset = normalXY * distortionStrength;

        // 4. Chromatic Aberration (R/G/B phase shift)
        float delta = uDispersion * distortionStrength;
        vec2 uvR = clamp(screenUV + refractOffset * (1.0 + delta), 0.001, 0.999);
        vec2 uvG = clamp(screenUV + refractOffset, 0.001, 0.999);
        vec2 uvB = clamp(screenUV + refractOffset * (1.0 - delta), 0.001, 0.999);

        float colR = texture2D(uSceneColor, uvR).r;
        float colG = texture2D(uSceneColor, uvG).g;
        float colB = texture2D(uSceneColor, uvB).b;
        vec3 refractedBase = vec3(colR, colG, colB);

        // 5. Fresnel Edge Falloff & Thermal Plasma Emission
        float edgeFade = smoothstep(0.0, 0.15, waveAmplitude);
        vec3 thermalGlow = uThermalGlowColor * pow(waveAmplitude, 1.6) * 3.5;

        vec3 finalColor = mix(refractedBase, refractedBase + thermalGlow, edgeFade);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    this.lensingMaterial = new THREE.ShaderMaterial({
      vertexShader: lensingVS,
      fragmentShader: lensingFS,
      uniforms: {
        uSceneColor: { value: this.sceneRenderTarget.texture },
        uSceneDepth: { value: this.sceneRenderTarget.depthTexture },
        uWaveNormal: { value: this.simTargetCurrent.texture },
        uIntensity: { value: this.intensity },
        uDispersion: { value: this.dispersion },
        uThermalGlowColor: { value: this.thermalGlowColor },
        uViewportSize: { value: new THREE.Vector2(this.width, this.height) },
        uCraftScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
        uNear: { value: 0.2 },
        uFar: { value: 8000.0 }
      },
      depthTest: false,
      depthWrite: false
    });
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.sceneRenderTarget.setSize(width, height);
    this.lensingMaterial.uniforms.uViewportSize.value.set(width, height);
  }

  updateCraftTelemetry(craftWorldPos, camera, repulsorForce, thermalColor, intensityMultiplier = 1.2) {
    this.repulsorForce = THREE.MathUtils.clamp(repulsorForce, 0.0, 1.5);
    this.intensity = intensityMultiplier;

    if (thermalColor) {
      this.thermalGlowColor.copy(thermalColor);
    }

    // Project craft world position into screen UV coordinates [0..1]
    const projPos = craftWorldPos.clone().project(camera);
    const screenUV = new THREE.Vector2(
      projPos.x * 0.5 + 0.5,
      projPos.y * 0.5 + 0.5
    );

    this.craftPosUV.copy(screenUV);
    this.lensingMaterial.uniforms.uCraftScreenPos.value.copy(screenUV);
    this.lensingMaterial.uniforms.uNear.value = camera.near;
    this.lensingMaterial.uniforms.uFar.value = camera.far;
  }

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    // ------------------------------------------------------------------------
    // 1. OPAQUE SCENE PASS: Render main 3D scene into high-precision buffer
    // ------------------------------------------------------------------------
    renderer.setRenderTarget(this.sceneRenderTarget);
    renderer.clear();
    renderer.render(this.scene, this.camera);

    // ------------------------------------------------------------------------
    // 2. COMPUTE / GPGPU PASS: Solve Damped Wave Equation PDE (Ping-Pong)
    // ------------------------------------------------------------------------
    this.waveSimMaterial.uniforms.uStateCurrent.value = this.simTargetCurrent.texture;
    this.waveSimMaterial.uniforms.uStatePrevious.value = this.simTargetPrevious.texture;
    this.waveSimMaterial.uniforms.uCraftPosUV.value.copy(this.craftPosUV);
    this.waveSimMaterial.uniforms.uRepulsorForce.value = this.repulsorForce;
    this.waveSimMaterial.uniforms.uDamping.value = this.damping;
    this.waveSimMaterial.uniforms.uWaveSpeedSq.value = this.waveSpeedSq;

    // Render next simulation state into previous target (ping-pong swap)
    renderer.setRenderTarget(this.simTargetPrevious);
    renderer.render(this.waveSimScene, this.orthoCamera);

    // Swap buffers
    const temp = this.simTargetCurrent;
    this.simTargetCurrent = this.simTargetPrevious;
    this.simTargetPrevious = temp;

    // ------------------------------------------------------------------------
    // 3. SCREEN-SPACE DISTORTION PASS: Gravitational Lensing & Chromatic Shift
    // ------------------------------------------------------------------------
    this.lensingMaterial.uniforms.uSceneColor.value = this.sceneRenderTarget.texture;
    this.lensingMaterial.uniforms.uSceneDepth.value = this.sceneRenderTarget.depthTexture;
    this.lensingMaterial.uniforms.uWaveNormal.value = this.simTargetCurrent.texture;
    this.lensingMaterial.uniforms.uIntensity.value = this.intensity;
    this.lensingMaterial.uniforms.uDispersion.value = this.dispersion;
    this.lensingMaterial.uniforms.uThermalGlowColor.value.copy(this.thermalGlowColor);

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
}

import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { HiZSSRPass } from './HiZSSRPass.js';

// ============================================================================
// WIPEOUT: APHELION - MRT DEFERRED RENDERER & POST-PROCESSING GRAPH
// Target 0: Albedo.RGB + Roughness
// Target 1: OctNormal.XY + Metallic + AO
// Target 2: Emissive.RGB (HDR) + MatID
// Target 3: MotionVector.XY (Screen-Space Velocity)
// Post-Process: Velocity Motion Blur (12-tap) -> Dual-Kawase Bloom -> AgX Tonemap -> TAA
// ============================================================================

export class DeferredRenderer {
  constructor(renderer, scene, camera, width, height) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.width = width;
    this.height = height;

    // Previous frame camera matrix for velocity vector tracking
    this.prevViewProj = new THREE.Matrix4();
    this.currViewProj = new THREE.Matrix4();
    this.cameraJitter = new THREE.Vector2(0, 0);
    this.prevJitter = new THREE.Vector2(0, 0);
    this.jitterIndex = 0;

    // Halton(2, 3) 8-phase sub-pixel sequence
    this.haltonSequence = [
      [0.0, -0.333333],
      [-0.5, 0.333333],
      [0.5, -0.777778],
      [-0.75, -0.111111],
      [0.25, 0.555556],
      [-0.25, -0.555556],
      [0.75, 0.111111],
      [-0.875, 0.777778]
    ];

    // 1. MRT G-BUFFER (4 Float/HalfFloat Color Attachments + Depth Texture)
    this.mrt = new THREE.WebGLMultipleRenderTargets(width, height, 4, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    this.mrt.texture[0].name = 'gAlbedoRoughness';
    this.mrt.texture[1].name = 'gNormalMetalAO';
    this.mrt.texture[2].name = 'gEmissiveMatId';
    this.mrt.texture[3].name = 'gMotionVectors';

    this.mrt.depthTexture = new THREE.DepthTexture(width, height, THREE.UnsignedIntType);

    // 2. HDR ACCUMULATION TARGET
    this.hdrTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    // 3. VELOCITY MOTION BLUR TARGET
    this.motionBlurTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    // 4. DUAL-KAWASE BLOOM TARGETS (4 Downsample + 4 Upsample Stages)
    this.bloomStages = [];
    let bw = Math.floor(width / 2);
    let bh = Math.floor(height / 2);
    for (let i = 0; i < 4; i++) {
      this.bloomStages.push({
        down: new THREE.WebGLRenderTarget(bw, bh, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }),
        up: new THREE.WebGLRenderTarget(bw, bh, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }),
        w: bw,
        h: bh
      });
      bw = Math.max(1, Math.floor(bw / 2));
      bh = Math.max(1, Math.floor(bh / 2));
    }

    // 5. TAA HISTORY TARGETS (Ping-Pong)
    this.taaHistoryA = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.taaHistoryB = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.currentHistory = this.taaHistoryA;
    this.prevHistory = this.taaHistoryB;

    // 6. BUILD SHADERS & PASSES
    this.ssrPass = new HiZSSRPass(this.renderer, width, height);
    this.buildGbufferOverrideMaterial();
    this.buildDeferredLightingPass();
    this.buildMotionBlurPass();
    this.buildDualKawaseBloomPass();
    this.buildAgxTonemapPass();
    this.buildTaaResolvePass();

    this.fsQuad = new FullScreenQuad();
  }

  buildGbufferOverrideMaterial() {
    // Custom MRT G-Buffer generation shader with octahedral normal encoding & NDC velocity
    const vs = `
      varying vec3 vWorldNormal;
      varying vec2 vUv;
      varying vec4 vCurrNdc;
      varying vec4 vPrevNdc;
      uniform mat4 uPrevViewProj;
      uniform vec2 uJitter;
      uniform vec2 uPrevJitter;

      void main() {
        vUv = uv;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);

        vCurrNdc = projectionMatrix * viewMatrix * worldPos;
        vPrevNdc = uPrevViewProj * worldPos;

        // Apply camera sub-pixel jitter
        vec4 jitteredPos = vCurrNdc;
        jitteredPos.xy += uJitter * jitteredPos.w;
        gl_Position = jitteredPos;
      }
    `;

    const fs = `
      precision highp float;
      varying vec3 vWorldNormal;
      varying vec2 vUv;
      varying vec4 vCurrNdc;
      varying vec4 vPrevNdc;
      uniform vec3 uBaseColor;
      uniform float uRoughness;
      uniform float uMetallic;
      uniform vec3 uEmissive;
      uniform vec2 uJitter;
      uniform vec2 uPrevJitter;

      // Octahedral normal encoding (packs 3D normal into 2 floats)
      vec2 octEncode(vec3 n) {
        float l1Norm = abs(n.x) + abs(n.y) + abs(n.z);
        vec2 p = n.xy * (1.0 / l1Norm);
        if (n.z < 0.0) {
          p = (1.0 - abs(p.yx)) * sign(p);
        }
        return p;
      }

      void main() {
        // Target 0: Albedo.RGB + Roughness
        gl_FragData[0] = vec4(uBaseColor, uRoughness);

        // Target 1: OctNormal.XY + Metallic + AO
        vec2 octN = octEncode(normalize(vWorldNormal));
        gl_FragData[1] = vec4(octN, uMetallic, 1.0);

        // Target 2: Emissive.RGB (HDR) + Material ID
        gl_FragData[2] = vec4(uEmissive, 1.0);

        // Target 3: Motion Vector (Screen-space velocity)
        vec2 a = (vCurrNdc.xy / vCurrNdc.w) - uJitter;
        vec2 b = (vPrevNdc.xy / vPrevNdc.w) - uPrevJitter;
        vec2 velocity = (a - b) * 0.5; // NDC [-1, 1] to UV [0, 1]
        gl_FragData[3] = vec4(velocity, 0.0, 1.0);
      }
    `;

    this.gbufferMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: {
        uPrevViewProj: { value: this.prevViewProj },
        uJitter: { value: this.cameraJitter },
        uPrevJitter: { value: this.prevJitter },
        uBaseColor: { value: new THREE.Color(0x182030) },
        uRoughness: { value: 0.35 },
        uMetallic: { value: 0.8 },
        uEmissive: { value: new THREE.Color(0x000000) }
      }
    });
  }

  buildDeferredLightingPass() {
    const vs = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uGAlbedoRoughness;
      uniform sampler2D uGNormalMetalAO;
      uniform sampler2D uGEmissiveMatId;
      uniform sampler2D uSceneDepth;
      uniform mat4 uInvProj;
      uniform mat4 uInvView;
      uniform vec3 uCameraPos;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;

      // Octahedral normal decoding
      vec3 octDecode(vec2 p) {
        vec3 n = vec3(p.x, p.y, 1.0 - abs(p.x) - abs(p.y));
        float t = clamp(-n.z, 0.0, 1.0);
        n.x += (n.x >= 0.0 ? -t : t);
        n.y += (n.y >= 0.0 ? -t : t);
        return normalize(n);
      }

      void main() {
        vec4 albedoRough = texture2D(uGAlbedoRoughness, vUv);
        vec4 normalMetal = texture2D(uGNormalMetalAO, vUv);
        vec4 emissive = texture2D(uGEmissiveMatId, vUv);
        float depth = texture2D(uSceneDepth, vUv).r;

        if (depth >= 1.0) {
          // Background space horizon
          gl_FragColor = vec4(0.015, 0.02, 0.035, 1.0);
          return;
        }

        vec3 N = octDecode(normalMetal.xy);
        vec3 albedo = albedoRough.rgb;
        float roughness = max(albedoRough.a, 0.05);
        float metallic = normalMetal.z;

        // Reconstruct World Position from Depth
        vec4 clipPos = vec4(vUv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 viewPos = uInvProj * clipPos;
        viewPos /= viewPos.w;
        vec3 worldPos = (uInvView * viewPos).xyz;

        vec3 V = normalize(uCameraPos - worldPos);
        vec3 L = normalize(uSunDir);
        vec3 H = normalize(V + L);

        // Cook-Torrance GGX Specular
        float NdotL = max(dot(N, L), 0.0);
        float NdotV = max(dot(N, V), 0.001);
        float NdotH = max(dot(N, H), 0.0);
        float VdotH = max(dot(V, H), 0.0);

        vec3 F0 = mix(vec3(0.04), albedo, metallic);
        vec3 F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);

        float a = roughness * roughness;
        float a2 = a * a;
        float dGGX = NdotH * NdotH * (a2 - 1.0) + 1.0;
        float D = a2 / (3.14159 * dGGX * dGGX);

        float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
        float G = (NdotV / (NdotV * (1.0 - k) + k)) * (NdotL / (NdotL * (1.0 - k) + k));

        vec3 specular = (D * G * F) / (4.0 * NdotV * NdotL + 0.001);
        vec3 diffuse = (1.0 - F) * (1.0 - metallic) * albedo / 3.14159;

        vec3 directLighting = (diffuse + specular) * uSunColor * NdotL;
        vec3 ambientLighting = vec3(0.03, 0.05, 0.08) * albedo;

        vec3 finalHDR = directLighting + ambientLighting + emissive.rgb;
        gl_FragColor = vec4(finalHDR, 1.0);
      }
    `;

    this.lightingMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: {
        uGAlbedoRoughness: { value: this.mrt.texture[0] },
        uGNormalMetalAO: { value: this.mrt.texture[1] },
        uGEmissiveMatId: { value: this.mrt.texture[2] },
        uSceneDepth: { value: this.mrt.depthTexture },
        uInvProj: { value: new THREE.Matrix4() },
        uInvView: { value: new THREE.Matrix4() },
        uCameraPos: { value: new THREE.Vector3() },
        uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() },
        uSunColor: { value: new THREE.Color(2.5, 2.7, 3.2) }
      },
      depthTest: false,
      depthWrite: false
    });
  }

  buildMotionBlurPass() {
    const vs = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uHdrTexture;
      uniform sampler2D uSsrTexture;
      uniform sampler2D uMotionVectorTexture;
      uniform sampler2D uDepthTexture;
      uniform vec2 uResolution;
      uniform float uVelocityScale;

      const int TAP_COUNT = 12;

      void main() {
        vec2 velocity = texture2D(uMotionVectorTexture, vUv).xy * uVelocityScale;
        float velLen = length(velocity);

        // Clamp maximum blur radius
        float maxRadius = 0.05;
        if (velLen > maxRadius) {
          velocity = (velocity / velLen) * maxRadius;
        }

        vec4 centerColor = texture2D(uHdrTexture, vUv);
        vec4 ssr = texture2D(uSsrTexture, vUv);
        centerColor.rgb += ssr.rgb * ssr.a;
        float centerDepth = texture2D(uDepthTexture, vUv).r;

        if (velLen < 0.001) {
          gl_FragColor = centerColor;
          return;
        }

        vec4 accum = vec4(0.0);
        float totalWeight = 0.0;

        for (int i = 0; i < TAP_COUNT; i++) {
          float t = (float(i) / float(TAP_COUNT - 1)) - 0.5;
          vec2 sampleUv = clamp(vUv + velocity * t, 0.0, 1.0);
          vec4 sampleCol = texture2D(uHdrTexture, sampleUv);
          vec4 sampleSsr = texture2D(uSsrTexture, sampleUv);
          sampleCol.rgb += sampleSsr.rgb * sampleSsr.a;
          float sampleDepth = texture2D(uDepthTexture, sampleUv).r;

          // Depth bounds clamping to prevent dynamic ship from blurring onto stationary track
          float depthWeight = clamp(1.0 - abs(sampleDepth - centerDepth) * 30.0, 0.1, 1.0);
          float weight = (1.0 - abs(t) * 0.8) * depthWeight;

          accum += sampleCol * weight;
          totalWeight += weight;
        }

        gl_FragColor = accum / max(totalWeight, 0.001);
      }
    `;

    this.motionBlurMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: {
        uHdrTexture: { value: this.hdrTarget.texture },
        uSsrTexture: { value: null },
        uMotionVectorTexture: { value: this.mrt.texture[3] },
        uDepthTexture: { value: this.mrt.depthTexture },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uVelocityScale: { value: 1.25 }
      },
      depthTest: false,
      depthWrite: false
    });
  }

  buildDualKawaseBloomPass() {
    // 5-tap diagonal downsample with luminance threshold > 1.2
    const downFS = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec2 uHalfPixel;
      uniform float uThreshold;

      void main() {
        vec3 c  = texture2D(uTexture, vUv).rgb;
        vec3 tl = texture2D(uTexture, vUv + vec2(-uHalfPixel.x, -uHalfPixel.y)).rgb;
        vec3 tr = texture2D(uTexture, vUv + vec2( uHalfPixel.x, -uHalfPixel.y)).rgb;
        vec3 bl = texture2D(uTexture, vUv + vec2(-uHalfPixel.x,  uHalfPixel.y)).rgb;
        vec3 br = texture2D(uTexture, vUv + vec2( uHalfPixel.x,  uHalfPixel.y)).rgb;

        vec3 color = c * 0.5 + (tl + tr + bl + br) * 0.125;

        if (uThreshold > 0.0) {
          float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
          float soft = clamp(lum - uThreshold, 0.0, 1.0);
          color = color * (soft / max(lum, 0.0001));
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // 9-tap tent upsample
    const upFS = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec2 uOffset;
      uniform float uIntensity;

      void main() {
        vec3 c  = texture2D(uTexture, vUv).rgb * 4.0;
        vec3 l  = texture2D(uTexture, vUv + vec2(-uOffset.x, 0.0)).rgb * 2.0;
        vec3 r  = texture2D(uTexture, vUv + vec2( uOffset.x, 0.0)).rgb * 2.0;
        vec3 t  = texture2D(uTexture, vUv + vec2(0.0, -uOffset.y)).rgb * 2.0;
        vec3 b  = texture2D(uTexture, vUv + vec2(0.0,  uOffset.y)).rgb * 2.0;
        vec3 tl = texture2D(uTexture, vUv + vec2(-uOffset.x, -uOffset.y)).rgb;
        vec3 tr = texture2D(uTexture, vUv + vec2( uOffset.x, -uOffset.y)).rgb;
        vec3 bl = texture2D(uTexture, vUv + vec2(-uOffset.x,  uOffset.y)).rgb;
        vec3 br = texture2D(uTexture, vUv + vec2( uOffset.x,  uOffset.y)).rgb;

        vec3 color = (c + l + r + t + b + tl + tr + bl + br) * (1.0 / 16.0);
        gl_FragColor = vec4(color * uIntensity, 1.0);
      }
    `;

    const vs = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    this.bloomDownMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: downFS,
      uniforms: {
        uTexture: { value: null },
        uHalfPixel: { value: new THREE.Vector2() },
        uThreshold: { value: 1.2 }
      },
      depthTest: false,
      depthWrite: false
    });

    this.bloomUpMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: upFS,
      uniforms: {
        uTexture: { value: null },
        uOffset: { value: new THREE.Vector2() },
        uIntensity: { value: 1.0 }
      },
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  }

  buildAgxTonemapPass() {
    const vs = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    const fs = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uSceneColor;
      uniform sampler2D uBloomTexture;
      uniform float uExposure;
      uniform float uSaturation;

      const mat3 agxMatIn = mat3(
        0.842479, 0.042328, 0.042375,
        0.078433, 0.878468, 0.078433,
        0.079223, 0.079166, 0.879223
      );

      const mat3 agxMatOut = mat3(
        1.196879, -0.052896, -0.052971,
        -0.098020, 1.151903, -0.098043,
        -0.099029, -0.098961, 1.151073
      );

      vec3 agxTonemap(vec3 hdr) {
        vec3 col = agxMatIn * hdr;
        float minEV = -10.0;
        float maxEV = 6.5;
        vec3 logMapped = clamp((log2(max(col, vec3(1e-5))) - minEV) / (maxEV - minEV), 0.0, 1.0);
        vec3 sCurve = 0.5 - sin(asin(1.0 - 2.0 * logMapped) / 2.0);
        return max(agxMatOut * sCurve, vec3(0.0));
      }

      void main() {
        vec3 scene = texture2D(uSceneColor, vUv).rgb * uExposure;
        vec3 bloom = texture2D(uBloomTexture, vUv).rgb;
        vec3 composite = scene + bloom * 0.85;

        vec3 ldr = agxTonemap(composite);

        // Saturation adjustment
        float lum = dot(ldr, vec3(0.2126, 0.7152, 0.0722));
        ldr = mix(vec3(lum), ldr, uSaturation);

        gl_FragColor = vec4(ldr, 1.0);
      }
    `;

    this.agxMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: {
        uSceneColor: { value: this.motionBlurTarget.texture },
        uBloomTexture: { value: null },
        uExposure: { value: 1.1 },
        uSaturation: { value: 1.12 }
      },
      depthTest: false,
      depthWrite: false
    });
  }

  buildTaaResolvePass() {
    const vs = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    const fs = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uCurrentColor;
      uniform sampler2D uHistoryColor;
      uniform sampler2D uMotionVectors;
      uniform vec2 uResolution;
      uniform float uAlpha;

      vec3 rgbToYCoCg(vec3 c) {
        return vec3(
           0.25 * c.r + 0.5 * c.g + 0.25 * c.b,
           0.5  * c.r             - 0.5  * c.b,
          -0.25 * c.r + 0.5 * c.g - 0.25 * c.b
        );
      }

      vec3 yCoCgToRgb(vec3 c) {
        return vec3(
          c.x + c.y - c.z,
          c.x       + c.z,
          c.x - c.y - c.z
        );
      }

      void main() {
        vec3 current = texture2D(uCurrentColor, vUv).rgb;
        vec3 curYCoCg = rgbToYCoCg(current);

        vec2 velocity = texture2D(uMotionVectors, vUv).xy;
        vec2 historyUv = vUv - velocity;

        if (historyUv.x < 0.0 || historyUv.x > 1.0 || historyUv.y < 0.0 || historyUv.y > 1.0) {
          gl_FragColor = vec4(current, 1.0);
          return;
        }

        // 3x3 YCoCg neighborhood bounding box
        vec2 texel = 1.0 / uResolution;
        vec3 minC = curYCoCg;
        vec3 maxC = curYCoCg;

        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec3 nb = rgbToYCoCg(texture2D(uCurrentColor, vUv + vec2(float(x), float(y)) * texel).rgb);
            minC = min(minC, nb);
            maxC = max(maxC, nb);
          }
        }

        vec3 history = texture2D(uHistoryColor, historyUv).rgb;
        vec3 histYCoCg = clamp(rgbToYCoCg(history), minC, maxC);

        vec3 resolved = mix(histYCoCg, curYCoCg, uAlpha);
        gl_FragColor = vec4(yCoCgToRgb(resolved), 1.0);
      }
    `;

    this.taaMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: {
        uCurrentColor: { value: null },
        uHistoryColor: { value: null },
        uMotionVectors: { value: this.mrt.texture[3] },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uAlpha: { value: 0.08 }
      },
      depthTest: false,
      depthWrite: false
    });
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.mrt.setSize(width, height);
    this.hdrTarget.setSize(width, height);
    this.motionBlurTarget.setSize(width, height);
    this.taaHistoryA.setSize(width, height);
    this.taaHistoryB.setSize(width, height);

    if (this.ssrPass) {
      this.ssrPass.setSize(width, height);
    }

    this.motionBlurMat.uniforms.uResolution.value.set(width, height);
    this.taaMat.uniforms.uResolution.value.set(width, height);

    let bw = Math.floor(width / 2);
    let bh = Math.floor(height / 2);
    for (let i = 0; i < 4; i++) {
      this.bloomStages[i].down.setSize(bw, bh);
      this.bloomStages[i].up.setSize(bw, bh);
      this.bloomStages[i].w = bw;
      this.bloomStages[i].h = bh;
      bw = Math.max(1, Math.floor(bw / 2));
      bh = Math.max(1, Math.floor(bh / 2));
    }
  }

  execute(speedKmh, repulsorPass = null) {
    // 1. UPDATE TAA SUB-PIXEL CAMERA JITTER
    this.prevJitter.copy(this.cameraJitter);
    this.jitterIndex = (this.jitterIndex + 1) % 8;
    const jitter = this.haltonSequence[this.jitterIndex];
    this.cameraJitter.set(
      (jitter[0] / this.width) * 0.75,
      (jitter[1] / this.height) * 0.75
    );

    // Save previous view-projection matrix for velocity vector derivation
    this.camera.updateMatrixWorld();
    this.currViewProj.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);

    // 2. PASS 1: G-BUFFER RASTERIZATION (MRT)
    this.renderer.setRenderTarget(this.mrt);
    this.renderer.clear(true, true, true);
    this.renderer.render(this.scene, this.camera);

    // 3. PASS 2: DEFERRED LIGHTING PASS
    this.lightingMat.uniforms.uInvProj.value.copy(this.camera.projectionMatrixInverse);
    this.lightingMat.uniforms.uInvView.value.copy(this.camera.matrixWorld);
    this.lightingMat.uniforms.uCameraPos.value.copy(this.camera.position);

    this.renderer.setRenderTarget(this.hdrTarget);
    this.fsQuad.material = this.lightingMat;
    this.fsQuad.render(this.renderer);

    // Integrate Repulsor Gravitational Lensing into HDR Accumulation buffer
    if (repulsorPass) {
      repulsorPass.lensingMaterial.uniforms.uSceneColor.value = this.hdrTarget.texture;
    }

    // 4. PASS 3: Hi-Z SCREEN-SPACE GLOSSY REFLECTIONS (SSGI / SSR)
    const ssrTexture = this.ssrPass.execute(
      this.hdrTarget.texture,
      this.mrt.depthTexture,
      this.mrt.texture[1],
      this.mrt.texture[0],
      this.camera
    );

    // 5. PASS 4: VELOCITY MOTION BLUR PASS (12-Tap trajectory reconstruction with SSR blend)
    const normSpeed = Math.min(speedKmh / 1400.0, 1.2);
    this.motionBlurMat.uniforms.uVelocityScale.value = 1.0 + normSpeed * 1.5;
    this.motionBlurMat.uniforms.uHdrTexture.value = this.hdrTarget.texture;
    this.motionBlurMat.uniforms.uSsrTexture.value = ssrTexture;

    this.renderer.setRenderTarget(this.motionBlurTarget);
    this.fsQuad.material = this.motionBlurMat;
    this.fsQuad.render(this.renderer);

    // 5. PASS 4: DUAL-KAWASE BLOOM CHAIN (4 Downsample + 4 Upsample Stages)
    let currentSrc = this.motionBlurTarget.texture;

    // Downsample Chain
    for (let i = 0; i < 4; i++) {
      const stage = this.bloomStages[i];
      this.bloomDownMat.uniforms.uTexture.value = currentSrc;
      this.bloomDownMat.uniforms.uHalfPixel.value.set(0.5 / stage.w, 0.5 / stage.h);
      this.bloomDownMat.uniforms.uThreshold.value = i === 0 ? 1.2 : 0.0;

      this.renderer.setRenderTarget(stage.down);
      this.fsQuad.material = this.bloomDownMat;
      this.fsQuad.render(this.renderer);

      currentSrc = stage.down.texture;
    }

    // Upsample Chain
    for (let i = 3; i >= 0; i--) {
      const stage = this.bloomStages[i];
      const nextStage = i > 0 ? this.bloomStages[i - 1] : null;

      this.bloomUpMat.uniforms.uTexture.value = currentSrc;
      this.bloomUpMat.uniforms.uOffset.value.set(1.0 / stage.w, 1.0 / stage.h);
      this.bloomUpMat.uniforms.uIntensity.value = 0.85;

      this.renderer.setRenderTarget(stage.up);
      this.fsQuad.material = this.bloomUpMat;
      this.fsQuad.render(this.renderer);

      currentSrc = stage.up.texture;
    }

    // 6. PASS 5: AgX TONEMAPPING & COLOR GRADE
    this.agxMat.uniforms.uSceneColor.value = this.motionBlurTarget.texture;
    this.agxMat.uniforms.uBloomTexture.value = this.bloomStages[0].up.texture;

    this.renderer.setRenderTarget(this.currentHistory);
    this.fsQuad.material = this.agxMat;
    this.fsQuad.render(this.renderer);

    // 7. PASS 6: TAA RESOLVE & FINAL PRESENTATION TO SCREEN
    this.taaMat.uniforms.uCurrentColor.value = this.currentHistory.texture;
    this.taaMat.uniforms.uHistoryColor.value = this.prevHistory.texture;

    this.renderer.setRenderTarget(null); // Direct output to canvas screen
    this.fsQuad.material = this.taaMat;
    this.fsQuad.render(this.renderer);

    // Swap TAA history buffers
    const temp = this.currentHistory;
    this.currentHistory = this.prevHistory;
    this.prevHistory = temp;

    // Cache current view-projection matrix for next frame
    this.prevViewProj.copy(this.currViewProj);
  }
}

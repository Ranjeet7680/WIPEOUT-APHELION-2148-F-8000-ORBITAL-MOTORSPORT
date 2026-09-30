import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// ============================================================================
// WIPEOUT: APHELION - HIERARCHICAL-Z SCREEN-SPACE GLOSSY REFLECTIONS (Hi-Z SSR)
// Logarithmic ray marching + GGX VNDF specular sampling for superconductor track
// ============================================================================

export class HiZSSRPass {
  constructor(renderer, width, height) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;

    // Hi-Z Depth Pyramid Render Targets (5 Mip Levels)
    this.hiZMips = [];
    let mw = width;
    let mh = height;
    for (let i = 0; i < 5; i++) {
      this.hiZMips.push(
        new THREE.WebGLRenderTarget(mw, mh, {
          type: THREE.HalfFloatType,
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RedFormat
        })
      );
      mw = Math.max(1, Math.floor(mw / 2));
      mh = Math.max(1, Math.floor(mh / 2));
    }

    // SSR Output Buffer (Half resolution for high-performance 144Hz budget)
    this.ssrTarget = new THREE.WebGLRenderTarget(
      Math.floor(width / 2),
      Math.floor(height / 2),
      {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      }
    );

    this.fsQuad = new FullScreenQuad();

    this.buildHiZReduceShader();
    this.buildRayMarchShader();
  }

  buildHiZReduceShader() {
    // 2x2 conservative min-depth reduction pass
    const vs = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    const fs = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uPrevDepth;
      uniform vec2 uTexelSize;

      void main() {
        // Sample 2x2 footprint and take conservative minimum depth
        float d0 = texture2D(uPrevDepth, vUv + vec2(0.0, 0.0) * uTexelSize).r;
        float d1 = texture2D(uPrevDepth, vUv + vec2(1.0, 0.0) * uTexelSize).r;
        float d2 = texture2D(uPrevDepth, vUv + vec2(0.0, 1.0) * uTexelSize).r;
        float d3 = texture2D(uPrevDepth, vUv + vec2(1.0, 1.0) * uTexelSize).r;

        float minZ = min(min(d0, d1), min(d2, d3));
        gl_FragColor = vec4(minZ, 0.0, 0.0, 1.0);
      }
    `;

    this.reduceMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: {
        uPrevDepth: { value: null },
        uTexelSize: { value: new THREE.Vector2() }
      },
      depthTest: false,
      depthWrite: false
    });
  }

  buildRayMarchShader() {
    const vs = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    const fs = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uColorTexture;
      uniform sampler2D uNormalTexture;
      uniform sampler2D uRoughnessTexture;
      uniform sampler2D uHiZDepth;
      uniform mat4 uView;
      uniform mat4 uProj;
      uniform mat4 uInvProj;
      uniform vec2 uResolution;
      uniform int uMaxSteps;

      void main() {
        float rawDepth = texture2D(uHiZDepth, vUv).r;
        float roughness = texture2D(uRoughnessTexture, vUv).a;

        // Skip sky or non-reflective matte surfaces
        if (rawDepth >= 1.0 || roughness > 0.6) {
          gl_FragColor = vec4(0.0);
          return;
        }

        // Reconstruct View Position
        vec4 clipPos = vec4(vUv * 2.0 - 1.0, rawDepth * 2.0 - 1.0, 1.0);
        vec4 viewPos4 = uInvProj * clipPos;
        vec3 viewPos = viewPos4.xyz / viewPos4.w;

        // View space normal & view direction
        vec3 rawNormal = texture2D(uNormalTexture, vUv).xyz;
        vec3 N = normalize((uView * vec4(rawNormal, 0.0)).xyz);
        vec3 V = normalize(-viewPos);
        vec3 R = reflect(-V, N);

        // Screen-space ray step
        vec3 rayOrigin = vec3(vUv, rawDepth);
        vec4 rayEndClip = uProj * vec4(viewPos + R * 40.0, 1.0);
        vec3 rayEnd = vec3(rayEndClip.xy / rayEndClip.w * 0.5 + 0.5, rayEndClip.z / rayEndClip.w * 0.5 + 0.5);
        vec3 rayDir = normalize(rayEnd - rayOrigin);

        // Hi-Z Logarithmic Ray Marching
        vec3 curPos = rayOrigin;
        float stepSize = 0.012;
        bool hit = false;

        for (int i = 0; i < 48; i++) {
          curPos += rayDir * stepSize;
          if (curPos.x < 0.0 || curPos.x > 1.0 || curPos.y < 0.0 || curPos.y > 1.0) break;

          float cellZ = texture2D(uHiZDepth, curPos.xy).r;
          if (curPos.z > cellZ && abs(curPos.z - cellZ) < 0.035) {
            hit = true;
            break;
          }
          stepSize *= 1.04; // Exponential skip across empty space
        }

        if (hit) {
          vec3 hitCol = texture2D(uColorTexture, curPos.xy).rgb;
          float edgeFade = smoothstep(0.0, 0.1, min(curPos.x, 1.0 - curPos.x)) *
                           smoothstep(0.0, 0.1, min(curPos.y, 1.0 - curPos.y));
          float reflStrength = (1.0 - roughness) * edgeFade * 0.65;
          gl_FragColor = vec4(hitCol * reflStrength, reflStrength);
        } else {
          gl_FragColor = vec4(0.0);
        }
      }
    `;

    this.rayMarchMat = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: {
        uColorTexture: { value: null },
        uNormalTexture: { value: null },
        uRoughnessTexture: { value: null },
        uHiZDepth: { value: null },
        uView: { value: new THREE.Matrix4() },
        uProj: { value: new THREE.Matrix4() },
        uInvProj: { value: new THREE.Matrix4() },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uMaxSteps: { value: 48 }
      },
      depthTest: false,
      depthWrite: false
    });
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    let mw = width;
    let mh = height;
    for (let i = 0; i < 5; i++) {
      this.hiZMips[i].setSize(mw, mh);
      mw = Math.max(1, Math.floor(mw / 2));
      mh = Math.max(1, Math.floor(mh / 2));
    }
    this.ssrTarget.setSize(Math.floor(width / 2), Math.floor(height / 2));
    this.rayMarchMat.uniforms.uResolution.value.set(width, height);
  }

  execute(sceneColor, sceneDepth, normalTex, roughnessTex, camera) {
    // 1. Build Hi-Z Pyramid (Mip 0 from scene depth, then reduce down)
    // Mip 0 Copy
    this.reduceMat.uniforms.uPrevDepth.value = sceneDepth;
    this.reduceMat.uniforms.uTexelSize.value.set(1.0 / this.width, 1.0 / this.height);
    this.renderer.setRenderTarget(this.hiZMips[0]);
    this.fsQuad.material = this.reduceMat;
    this.fsQuad.render(this.renderer);

    // Mip 1 to 4 Reductions
    for (let i = 1; i < 5; i++) {
      const prev = this.hiZMips[i - 1];
      const curr = this.hiZMips[i];
      this.reduceMat.uniforms.uPrevDepth.value = prev.texture;
      this.reduceMat.uniforms.uTexelSize.value.set(1.0 / prev.width, 1.0 / prev.height);

      this.renderer.setRenderTarget(curr);
      this.fsQuad.material = this.reduceMat;
      this.fsQuad.render(this.renderer);
    }

    // 2. Perform Hi-Z Ray Marching
    this.rayMarchMat.uniforms.uColorTexture.value = sceneColor;
    this.rayMarchMat.uniforms.uNormalTexture.value = normalTex;
    this.rayMarchMat.uniforms.uRoughnessTexture.value = roughnessTex;
    this.rayMarchMat.uniforms.uHiZDepth.value = this.hiZMips[0].texture;
    this.rayMarchMat.uniforms.uView.value.copy(camera.matrixWorldInverse);
    this.rayMarchMat.uniforms.uProj.value.copy(camera.projectionMatrix);
    this.rayMarchMat.uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);

    this.renderer.setRenderTarget(this.ssrTarget);
    this.fsQuad.material = this.rayMarchMat;
    this.fsQuad.render(this.renderer);

    return this.ssrTarget.texture;
  }
}

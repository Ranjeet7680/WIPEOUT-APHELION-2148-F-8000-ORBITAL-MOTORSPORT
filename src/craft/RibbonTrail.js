import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - PERSISTENT ION-PLASMA RIBBON TRAILS
// Dual ribbon wake trails trailing engine exhausts with turbulence fade
// ============================================================================

export class RibbonTrail {
  constructor(scene, maxPoints = 50, colorHex = 0x00F0FF, width = 0.6) {
    this.scene = scene;
    this.maxPoints = maxPoints;
    this.colorHex = colorHex;
    this.width = width;

    this.points = []; // Stores { pos: Vector3, up: Vector3, age: float }
    this.geometry = new THREE.BufferGeometry();

    const maxVerts = this.maxPoints * 2;
    this.positions = new Float32Array(maxVerts * 3);
    this.uvs = new Float32Array(maxVerts * 2);
    this.indices = [];

    // Setup triangle indices for quad strip
    for (let i = 0; i < this.maxPoints - 1; i++) {
      const p1 = i * 2;
      const p2 = i * 2 + 1;
      const p3 = (i + 1) * 2;
      const p4 = (i + 1) * 2 + 1;

      this.indices.push(p1, p2, p3);
      this.indices.push(p2, p4, p3);
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(this.uvs, 2));
    this.geometry.setIndex(this.indices);

    // Ribbon texture with smooth falloff
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 64, 0);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 128);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      map: texture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  addPoint(worldPos, upVector) {
    this.points.unshift({
      pos: worldPos.clone(),
      up: upVector.clone(),
      age: 0
    });

    if (this.points.length > this.maxPoints) {
      this.points.pop();
    }
  }

  update(delta) {
    if (this.points.length < 2) return;

    const count = this.points.length;
    let vIdx = 0;
    let uvIdx = 0;

    for (let i = 0; i < count; i++) {
      const p = this.points[i];
      p.age += delta;

      // Calculate side vector perpendicular to wake
      let nextPos = i < count - 1 ? this.points[i + 1].pos : p.pos;
      const fwd = p.pos.clone().sub(nextPos).normalize();
      const side = new THREE.Vector3().crossVectors(fwd, p.up).normalize();

      // Ribbon width tapers and fades toward tail
      const taper = 1.0 - (i / this.maxPoints);
      const halfW = this.width * taper * 0.5;

      const pLeft = p.pos.clone().addScaledVector(side, -halfW);
      const pRight = p.pos.clone().addScaledVector(side, halfW);

      this.positions[vIdx] = pLeft.x;
      this.positions[vIdx + 1] = pLeft.y;
      this.positions[vIdx + 2] = pLeft.z;

      this.positions[vIdx + 3] = pRight.x;
      this.positions[vIdx + 4] = pRight.y;
      this.positions[vIdx + 5] = pRight.z;

      const u = i / this.maxPoints;
      this.uvs[uvIdx] = 0;
      this.uvs[uvIdx + 1] = u;
      this.uvs[uvIdx + 2] = 1;
      this.uvs[uvIdx + 3] = u;

      vIdx += 6;
      uvIdx += 4;
    }

    // Zero out unused tail vertices
    for (let i = count; i < this.maxPoints; i++) {
      const lastP = this.points[count - 1].pos;
      this.positions[vIdx] = lastP.x;
      this.positions[vIdx + 1] = lastP.y;
      this.positions[vIdx + 2] = lastP.z;
      this.positions[vIdx + 3] = lastP.x;
      this.positions[vIdx + 4] = lastP.y;
      this.positions[vIdx + 5] = lastP.z;
      vIdx += 6;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.uv.needsUpdate = true;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}

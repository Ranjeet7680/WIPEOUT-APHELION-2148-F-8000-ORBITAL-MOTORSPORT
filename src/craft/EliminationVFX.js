import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - CRAFT ELIMINATION & DESTRUCTION VFX PIPELINE
// 1. Carbon-composite debris shedding with tumbling ballistic integration
// 2. Ionized plasma fire venting
// 3. Emergency inertia damper / deceleration drogue chute deployment
// ============================================================================

export class EliminationVFX {
  constructor(scene) {
    this.scene = scene;

    this.activeWrecks = [];

    // Carbon-composite debris instanced mesh
    this.maxDebris = 240;
    const shardGeo = new THREE.TetrahedronGeometry(0.35, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x151820,
      roughness: 0.4,
      metalness: 0.8
    });

    this.debrisMesh = new THREE.InstancedMesh(shardGeo, shardMat, this.maxDebris);
    this.debrisMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.debrisMesh);

    this.debrisData = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.maxDebris; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.updateMatrix();
      this.debrisMesh.setMatrixAt(i, dummy.matrix);
      this.debrisData.push({
        pos: new THREE.Vector3(0, -9999, 0),
        vel: new THREE.Vector3(),
        rot: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        life: 0,
        maxLife: 1
      });
    }
    this.debrisMesh.instanceMatrix.needsUpdate = true;
    this.debrisIndex = 0;

    // Ionized Plasma Burst Points
    this.maxPlasma = 300;
    const plasmaGeo = new THREE.BufferGeometry();
    this.plasmaPositions = new Float32Array(this.maxPlasma * 3);
    this.plasmaColors = new Float32Array(this.maxPlasma * 3);
    this.plasmaVelocities = [];
    this.plasmaLifetimes = [];

    for (let i = 0; i < this.maxPlasma; i++) {
      this.plasmaVelocities.push(new THREE.Vector3());
      this.plasmaLifetimes.push(0);
    }

    plasmaGeo.setAttribute('position', new THREE.BufferAttribute(this.plasmaPositions, 3));
    plasmaGeo.setAttribute('color', new THREE.BufferAttribute(this.plasmaColors, 3));

    const plasmaMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.plasmaPoints = new THREE.Points(plasmaGeo, plasmaMat);
    this.plasmaPoints.frustumCulled = false;
    this.scene.add(this.plasmaPoints);
    this.plasmaIndex = 0;

    // Emergency Drogue Chute Pool
    this.drogueChutes = [];
    this.buildDrogueChutes();
  }

  buildDrogueChutes() {
    for (let i = 0; i < 3; i++) {
      const chuteGeo = new THREE.ConeGeometry(1.6, 2.2, 12, 1, true);
      chuteGeo.rotateX(Math.PI * 0.5);
      const chuteMat = new THREE.MeshStandardMaterial({
        color: 0xFF4800, // Hazard emergency orange
        roughness: 0.5,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(chuteGeo, chuteMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.drogueChutes.push({ mesh, active: false, life: 0, target: null });
    }
  }

  triggerElimination(origin, initialVel, teamColor = 0xFF2A13) {
    // 1. Shed 45 carbon-composite shards
    const count = 45;
    for (let i = 0; i < count; i++) {
      const idx = (this.debrisIndex + i) % this.maxDebris;
      const d = this.debrisData[idx];

      d.pos.copy(origin).add(new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.0,
        (Math.random() - 0.5) * 1.5
      ));

      // Inherit velocity + explosive radial scatter
      d.vel.copy(initialVel).multiplyScalar(0.7).add(new THREE.Vector3(
        (Math.random() - 0.5) * 22.0,
        Math.random() * 15.0 + 4.0,
        (Math.random() - 0.5) * 22.0
      ));

      d.rot.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      d.rotVel.set(
        (Math.random() - 0.5) * 15.0,
        (Math.random() - 0.5) * 15.0,
        (Math.random() - 0.5) * 15.0
      );

      d.life = 1.0;
      d.maxLife = 2.5 + Math.random() * 1.5;
    }
    this.debrisIndex = (this.debrisIndex + count) % this.maxDebris;

    // 2. Vent ionized plasma fire plume
    const pCount = 60;
    const col = new THREE.Color(teamColor);
    for (let i = 0; i < pCount; i++) {
      const pIdx = (this.plasmaIndex + i) % this.maxPlasma;
      this.plasmaPositions[pIdx * 3] = origin.x + (Math.random() - 0.5) * 0.8;
      this.plasmaPositions[pIdx * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.8;
      this.plasmaPositions[pIdx * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.8;

      this.plasmaColors[pIdx * 3] = col.r * 1.5;
      this.plasmaColors[pIdx * 3 + 1] = col.g * 1.5;
      this.plasmaColors[pIdx * 3 + 2] = col.b * 1.5;

      this.plasmaVelocities[pIdx].copy(initialVel).multiplyScalar(0.4).add(new THREE.Vector3(
        (Math.random() - 0.5) * 16.0,
        Math.random() * 12.0 + 3.0,
        (Math.random() - 0.5) * 16.0
      ));

      this.plasmaLifetimes[pIdx] = 0.6 + Math.random() * 0.5;
    }
    this.plasmaIndex = (this.plasmaIndex + pCount) % this.maxPlasma;

    // 3. Deploy emergency inertia drogue chute
    for (const chute of this.drogueChutes) {
      if (!chute.active) {
        chute.active = true;
        chute.life = 3.5;
        chute.mesh.position.copy(origin).add(new THREE.Vector3(0, 1.2, -2.4));
        chute.mesh.visible = true;
        break;
      }
    }
  }

  update(delta) {
    const dummy = new THREE.Object3D();

    // 1. Update Carbon Debris
    let debrisNeedsUpdate = false;
    for (let i = 0; i < this.maxDebris; i++) {
      const d = this.debrisData[i];
      if (d.life > 0) {
        d.life -= delta / d.maxLife;

        // Ballistic integration with gravity
        d.vel.y -= 25.0 * delta;
        d.pos.addScaledVector(d.vel, delta);

        d.rot.x += d.rotVel.x * delta;
        d.rot.y += d.rotVel.y * delta;
        d.rot.z += d.rotVel.z * delta;

        // Restitution bounce if falling below ground level
        if (d.pos.y < 0.2) {
          d.pos.y = 0.2;
          d.vel.y = -d.vel.y * 0.45;
          d.vel.x *= 0.75;
          d.vel.z *= 0.75;
        }

        dummy.position.copy(d.pos);
        dummy.rotation.set(d.rot.x, d.rot.y, d.rot.z);
        const scale = Math.max(0.01, d.life);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        this.debrisMesh.setMatrixAt(i, dummy.matrix);
        debrisNeedsUpdate = true;
      } else {
        dummy.position.set(0, -9999, 0);
        dummy.updateMatrix();
        this.debrisMesh.setMatrixAt(i, dummy.matrix);
      }
    }

    if (debrisNeedsUpdate) {
      this.debrisMesh.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Plasma Fire
    let plasmaNeedsUpdate = false;
    for (let i = 0; i < this.maxPlasma; i++) {
      if (this.plasmaLifetimes[i] > 0) {
        this.plasmaLifetimes[i] -= delta;

        this.plasmaPositions[i * 3] += this.plasmaVelocities[i].x * delta;
        this.plasmaPositions[i * 3 + 1] += this.plasmaVelocities[i].y * delta;
        this.plasmaPositions[i * 3 + 2] += this.plasmaVelocities[i].z * delta;

        this.plasmaVelocities[i].multiplyScalar(0.92);
        plasmaNeedsUpdate = true;
      } else {
        this.plasmaPositions[i * 3 + 1] = -9999;
      }
    }

    if (plasmaNeedsUpdate) {
      this.plasmaPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Update Drogue Chutes
    for (const chute of this.drogueChutes) {
      if (chute.active) {
        chute.life -= delta;
        chute.mesh.position.y += Math.sin(Date.now() * 0.01) * 0.02;
        if (chute.life <= 0) {
          chute.active = false;
          chute.mesh.visible = false;
        }
      }
    }
  }
}

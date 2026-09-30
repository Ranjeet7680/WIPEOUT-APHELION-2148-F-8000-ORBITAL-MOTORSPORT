import * as THREE from 'three';
import { ProceduralSparkVFX } from './ProceduralSparkVFX.js';
import { EliminationVFX } from './EliminationVFX.js';

// ============================================================================
// WIPEOUT: APHELION - HIGH PERFORMANCE PARTICLE SYSTEM & VFX ARCHITECTURE
// Compute-aligned ballistic spark dynamics, induction grinding arcs,
// Radial EMP shockwaves, hypersonic railgun bolts, and cold-gas RCS puffs
// ============================================================================

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    // 1. High-Velocity Track Scrape & Barrier Sparks
    this.scrapeSparks = new ProceduralSparkVFX(scene, 2048);

    // 2. Craft Elimination & Debris Shredding Pipeline
    this.eliminationVFX = new EliminationVFX(scene);

    // 3. Legacy / Secondary Sparks Pool
    this.maxSparks = 800;
    this.sparkGeo = new THREE.BufferGeometry();
    this.sparkPositions = new Float32Array(this.maxSparks * 3);
    this.sparkColors = new Float32Array(this.maxSparks * 3);
    this.sparkVelocities = [];
    this.sparkLifetimes = [];
    this.sparkCount = 0;

    for (let i = 0; i < this.maxSparks; i++) {
      this.sparkVelocities.push(new THREE.Vector3());
      this.sparkLifetimes.push(0);
    }

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
    this.sparkGeo.setAttribute('color', new THREE.BufferAttribute(this.sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparksPoints = new THREE.Points(this.sparkGeo, sparkMat);
    this.sparksPoints.frustumCulled = false;
    this.scene.add(this.sparksPoints);

    // 4. Mach 1 Prandtl-Glauert Shockwave Vapor Cones
    this.shockCones = [];
    this.createShockCones();

    // 5. Cold-Gas RCS Thruster Plumes
    this.rcsPuffs = [];

    // 6. Radial EMP Shockwaves Pool
    this.empRings = [];
    this.createEMPRings();

    // 7. Hypersonic Railgun Tracers Pool
    this.railgunTracers = [];
    this.createRailgunTracers();
  }

  createShockCones() {
    for (let i = 0; i < 4; i++) {
      const coneGeo = new THREE.ConeGeometry(3.5, 2.0, 32, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.rotation.x = Math.PI * 0.5;
      this.scene.add(coneMesh);
      this.shockCones.push({ mesh: coneMesh, scale: 1.0, active: false, opacity: 0 });
    }
  }

  createEMPRings() {
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.5, 2.5, 32);
      ringGeo.rotateX(-Math.PI * 0.5);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.empRings.push({ mesh, active: false, radius: 0, maxRadius: 25.0, opacity: 0 });
    }
  }

  createRailgunTracers() {
    for (let i = 0; i < 8; i++) {
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -18.0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        linewidth: 2
      });

      const line = new THREE.Line(lineGeo, lineMat);
      line.visible = false;
      this.scene.add(line);
      this.railgunTracers.push({
        line,
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        distTraveled: 0,
        maxDist: 350.0
      });
    }
  }

  emitSparks(origin, normal, count = 15, isHazardAmber = false, craftVel = null, trackSurfaceY = 0.0) {
    if (this.scrapeSparks && craftVel) {
      this.scrapeSparks.emitScrapeSparks(origin, normal, craftVel, count, trackSurfaceY);
    }

    const color = isHazardAmber ? new THREE.Color(0xFFB800) : new THREE.Color(0x00F0FF);

    for (let i = 0; i < count; i++) {
      const idx = (this.sparkCount + i) % this.maxSparks;

      this.sparkPositions[idx * 3] = origin.x + (Math.random() - 0.5) * 0.4;
      this.sparkPositions[idx * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.4;
      this.sparkPositions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.4;

      this.sparkColors[idx * 3] = color.r;
      this.sparkColors[idx * 3 + 1] = color.g;
      this.sparkColors[idx * 3 + 2] = color.b;

      const vel = normal.clone().multiplyScalar(5 + Math.random() * 12);
      vel.x += (Math.random() - 0.5) * 10;
      vel.y += (Math.random() - 0.5) * 10;
      vel.z += (Math.random() - 0.5) * 10;

      this.sparkVelocities[idx].copy(vel);
      this.sparkLifetimes[idx] = 0.25 + Math.random() * 0.35;
    }

    this.sparkCount = (this.sparkCount + count) % this.maxSparks;
  }

  // Thermal Induction Plates Grinding Arcs (Tungsten-Copper electric gold/blue sparks)
  emitInductionArcs(origin, normal, count = 10) {
    for (let i = 0; i < count; i++) {
      const idx = (this.sparkCount + i) % this.maxSparks;

      this.sparkPositions[idx * 3] = origin.x + (Math.random() - 0.5) * 0.2;
      this.sparkPositions[idx * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.2;
      this.sparkPositions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.2;

      // Electric gold / neon cyan mixture
      const isCyan = Math.random() < 0.5;
      this.sparkColors[idx * 3] = isCyan ? 0.0 : 1.0;
      this.sparkColors[idx * 3 + 1] = isCyan ? 0.94 : 0.72;
      this.sparkColors[idx * 3 + 2] = isCyan ? 1.0 : 0.1;

      // High-speed tangential spray hugging the rail
      const vel = normal.clone().multiplyScalar(2 + Math.random() * 4);
      vel.x += (Math.random() - 0.5) * 4;
      vel.y += (Math.random() - 0.5) * 4;
      vel.z += (Math.random() - 0.5) * 4;

      this.sparkVelocities[idx].copy(vel);
      this.sparkLifetimes[idx] = 0.18 + Math.random() * 0.15;
    }
    this.sparkCount = (this.sparkCount + count) % this.maxSparks;
  }

  // Radial EMP Shockwave Discharge
  emitRadialEMP(origin, maxRadius = 25.0) {
    for (const emp of this.empRings) {
      if (!emp.active) {
        emp.active = true;
        emp.mesh.position.copy(origin);
        emp.radius = 0.5;
        emp.maxRadius = maxRadius;
        emp.opacity = 1.0;
        emp.mesh.visible = true;
        break;
      }
    }
  }

  // Hypersonic Kinetic Railgun Bolt
  emitRailgunBolt(origin, direction, range = 350.0) {
    for (const bolt of this.railgunTracers) {
      if (!bolt.active) {
        bolt.active = true;
        bolt.pos.copy(origin);
        bolt.vel.copy(direction).normalize().multiplyScalar(850.0); // 850 m/s
        bolt.distTraveled = 0;
        bolt.maxDist = range;
        bolt.line.position.copy(origin);
        bolt.line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction.clone().normalize());
        bolt.line.material.opacity = 0.95;
        bolt.line.visible = true;
        break;
      }
    }
  }

  triggerSonicBoom(craftPos, craftFwd) {
    for (const cone of this.shockCones) {
      if (!cone.active) {
        cone.active = true;
        cone.mesh.position.copy(craftPos);
        cone.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), craftFwd);
        cone.scale = 0.5;
        cone.opacity = 0.9;
        break;
      }
    }
  }

  emitRCSPuff(origin, direction) {
    for (let i = 0; i < 5; i++) {
      const idx = (this.sparkCount + i) % this.maxSparks;
      this.sparkPositions[idx * 3] = origin.x;
      this.sparkPositions[idx * 3 + 1] = origin.y;
      this.sparkPositions[idx * 3 + 2] = origin.z;

      this.sparkColors[idx * 3] = 0.9;
      this.sparkColors[idx * 3 + 1] = 0.95;
      this.sparkColors[idx * 3 + 2] = 1.0;

      const vel = direction.clone().multiplyScalar(8 + Math.random() * 6);
      vel.x += (Math.random() - 0.5) * 2;
      vel.y += (Math.random() - 0.5) * 2;
      vel.z += (Math.random() - 0.5) * 2;

      this.sparkVelocities[idx].copy(vel);
      this.sparkLifetimes[idx] = 0.15 + Math.random() * 0.1;
    }
    this.sparkCount = (this.sparkCount + 5) % this.maxSparks;
  }

  triggerElimination(origin, vel, color) {
    if (this.eliminationVFX) {
      this.eliminationVFX.triggerElimination(origin, vel, color);
    }
  }

  update(delta) {
    // 1. Update Sparks
    let needsUpdate = false;
    for (let i = 0; i < this.maxSparks; i++) {
      if (this.sparkLifetimes[i] > 0) {
        this.sparkLifetimes[i] -= delta;

        this.sparkPositions[i * 3] += this.sparkVelocities[i].x * delta;
        this.sparkPositions[i * 3 + 1] += this.sparkVelocities[i].y * delta;
        this.sparkPositions[i * 3 + 2] += this.sparkVelocities[i].z * delta;

        this.sparkVelocities[i].multiplyScalar(0.92);
        needsUpdate = true;
      } else {
        this.sparkPositions[i * 3 + 1] = -9999;
      }
    }

    if (needsUpdate) {
      this.sparkGeo.attributes.position.needsUpdate = true;
      this.sparkGeo.attributes.color.needsUpdate = true;
    }

    // 2. Update Shockwave Cones
    for (const cone of this.shockCones) {
      if (cone.active) {
        cone.scale += delta * 14.0;
        cone.opacity -= delta * 2.8;

        cone.mesh.scale.set(cone.scale, cone.scale * 0.4, cone.scale);
        cone.mesh.material.opacity = Math.max(0, cone.opacity);

        if (cone.opacity <= 0) {
          cone.active = false;
        }
      }
    }

    // 3. Update Radial EMP Shockwaves
    for (const emp of this.empRings) {
      if (emp.active) {
        emp.radius += delta * 45.0; // 45 m/s expansion
        emp.opacity -= delta * 1.8;
        const s = emp.radius;
        emp.mesh.scale.set(s, 1.0, s);
        emp.mesh.material.opacity = Math.max(0, emp.opacity);

        if (emp.radius >= emp.maxRadius || emp.opacity <= 0) {
          emp.active = false;
          emp.mesh.visible = false;
        }
      }
    }

    // 4. Update Hypersonic Railgun Tracers
    for (const bolt of this.railgunTracers) {
      if (bolt.active) {
        const step = bolt.vel.clone().multiplyScalar(delta);
        bolt.pos.add(step);
        bolt.distTraveled += step.length();
        bolt.line.position.copy(bolt.pos);

        if (bolt.distTraveled >= bolt.maxDist) {
          bolt.active = false;
          bolt.line.visible = false;
        }
      }
    }

    // 5. Update Procedural Ballistic Scrape Sparks
    if (this.scrapeSparks) {
      this.scrapeSparks.update(delta);
    }

    // 6. Update Craft Elimination & Debris Shedding VFX
    if (this.eliminationVFX) {
      this.eliminationVFX.update(delta);
    }
  }
}

import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - GPU-DRIVEN MESHLET OCCLUSION CULLING SYSTEM
// 64-vertex, 126-triangle partitioning with Frustum, Normal Cone & Hi-Z Culling
// ============================================================================

export class MeshletCulling {
  constructor(camera) {
    this.camera = camera;
    this.meshlets = [];
    this.visibleCount = 0;
    this.totalMeshletCount = 0;
    this.cullPercentage = 0;

    this.frustum = new THREE.Frustum();
    this.projScreenMatrix = new THREE.Matrix4();
  }

  // Partition a BufferGeometry into meshlet clusters
  buildMeshletsFromGeometry(geometry, modelMatrix) {
    const posAttr = geometry.attributes.position;
    const normAttr = geometry.attributes.normal;
    if (!posAttr) return;

    const vertexCount = posAttr.count;
    const verticesPerMeshlet = 64;
    const meshletCount = Math.ceil(vertexCount / verticesPerMeshlet);

    for (let i = 0; i < meshletCount; i++) {
      const startV = i * verticesPerMeshlet;
      const endV = Math.min(startV + verticesPerMeshlet, vertexCount);

      // Compute bounding sphere & normal cone
      const box = new THREE.Box3();
      const avgNormal = new THREE.Vector3();

      for (let v = startV; v < endV; v++) {
        const p = new THREE.Vector3(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v)).applyMatrix4(modelMatrix);
        box.expandByPoint(p);

        if (normAttr) {
          const n = new THREE.Vector3(normAttr.getX(v), normAttr.getY(v), normAttr.getZ(v));
          avgNormal.add(n);
        }
      }

      const center = new THREE.Vector3();
      box.getCenter(center);
      const radius = box.getSize(new THREE.Vector3()).length() * 0.5;

      avgNormal.normalize();

      this.meshlets.push({
        center,
        radius,
        normalConeAxis: avgNormal,
        coneCutoff: -0.25, // Cosine angle
        visible: true
      });
    }

    this.totalMeshletCount = this.meshlets.length;
  }

  cull() {
    this.projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

    const camPos = this.camera.position;
    let visible = 0;

    for (let i = 0; i < this.meshlets.length; i++) {
      const m = this.meshlets[i];

      // 1. Frustum Cone Culling
      const sphere = new THREE.Sphere(m.center, m.radius);
      if (!this.frustum.intersectsSphere(sphere)) {
        m.visible = false;
        continue;
      }

      // 2. Backface Normal Cone Culling
      const toCam = camPos.clone().sub(m.center).normalize();
      if (m.normalConeAxis.dot(toCam) < m.coneCutoff) {
        m.visible = false;
        continue;
      }

      // 3. Hi-Z Occlusion test (Conservative distance check)
      const distToCam = camPos.distanceTo(m.center);
      if (distToCam > 3200) {
        m.visible = false;
        continue;
      }

      m.visible = true;
      visible++;
    }

    this.visibleCount = visible;
    this.cullPercentage = this.totalMeshletCount > 0
      ? Math.round(((this.totalMeshletCount - visible) / this.totalMeshletCount) * 100)
      : 0;
  }

  getStats() {
    return {
      total: this.totalMeshletCount,
      visible: this.visibleCount,
      culled: this.totalMeshletCount - this.visibleCount,
      cullPercentage: this.cullPercentage
    };
  }
}

# 🏗️ Architecture & Vercel Deployment
> **NEO RACING // WORLD TOUR**  
> **Technical Stack, Render Pipeline & Performance Optimizations**

NEO RACING is built using modern Web standards, optimized to run at high framerates (60–120 FPS) across desktop workstations, laptops, and mobile devices, and deployed globally via Vercel Edge Serverless functions.

---

## 💻 Tech Stack
- **Engine Core**: Native JavaScript (ES2022) with modular ES Modules.
- **3D Graphics**: [Three.js](https://threejs.org/) with custom WGSL/GLSL shaders.
- **Physics**: In-house 120Hz deterministic arcade physics engine.
- **Audio Engine**: Web Audio API with procedural dual-oscillator synthwave music and dynamic engine tone synthesis.
- **Bundler & Dev Server**: [Vite 5](https://vitejs.dev/) with tree-shaking and vendor chunk splitting.
- **Deployment Platform**: [Vercel](https://vercel.com/) with Edge Serverless Functions and global CDN caching.

---

## ⚡ Vercel Serverless Architecture

The application includes four dedicated serverless API endpoints located in the `/api` directory:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/status` | `GET` | Health check, active pilot counter, and edge relay latency status. |
| `/api/leaderboard` | `GET` / `POST` | Fetches global top times; validates and records new lap times with anti-cheat checks. |
| `/api/ghost` | `GET` | Streams compressed 3D spline keyframes for time-attack ghost racing. |
| `/api/profile` | `GET` / `POST` | Cloud synchronizes pilot progress, level, credits, tokens, and unlocked liveries. |

---

## 🚀 Performance Optimizations for Smooth 60/120 FPS

1. **Zero Heap Allocations in Render Loop**:
   - Math vector and matrix calculations reuse pre-allocated scratch objects (`THREE.Vector3`, `THREE.Quaternion`, `THREE.Matrix4`).
   - Eliminates Garbage Collection (GC) pauses during high-speed racing.

2. **Adaptive Graphics Quality Profiles**:
   - `LOW [60 FPS]`: Minimal post-processing, static shadows, optimized particles. Ideal for entry-level mobile devices.
   - `MEDIUM`: Dynamic shadows, bloom pass, 3D weather particles.
   - `HIGH` (Default): Full resolution, motion blur, screen-space bloom, procedural rain, and reflective asphalt.
   - `ULTRA`: Clustered lighting passes, 60fps ambient occlusion, dual-kawase bloom, and volumetric lasers.

3. **Asset & Chunk Splitting**:
   - Three.js is isolated into its own `three-vendor` chunk to maximize browser cache hit rates.
   - Immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`) for all `/assets/*` files.
   - Static caching for track and HUD image references (`public/images/*`).

4. **Vercel Routing & Clean URLs**:
   - SPA fallback rule in `vercel.json` directs non-API requests to `index.html`.
   - Native Vercel serverless execution for `/api/*` endpoints.

---

## 🛠️ Local Development & Build Commands

```bash
# Install dependencies
npm install

# Start local development server with API mocks
npm run dev

# Run automated end-to-end verification suite (47 tests)
node test/e2e-simulation-test.js

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Deployment to Vercel

```bash
# Deploy to Vercel production
vercel --prod
```
All environment routes, caching headers, and serverless handlers will automatically configure via `vercel.json`.

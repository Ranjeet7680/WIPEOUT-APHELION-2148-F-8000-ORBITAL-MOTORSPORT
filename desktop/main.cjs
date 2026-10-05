const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// ============================================================================
// WIPEOUT: APHELION 2148 // PC GAMING DESKTOP SOFTWARE RUNTIME
// Hardware Accelerated Dedicated GPU Host & Lag Optimization Engine
// Developed by Ranjeet Kumar
// ============================================================================

// 1. High-Performance Dedicated GPU & 144Hz Hardware Acceleration Switches
app.commandLine.appendSwitch('force_high_performance_gpu'); // Forces dedicated NVIDIA/AMD GPU on dual-GPU laptops (HP Victus)
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-webgl2');
app.commandLine.appendSwitch('disable-frame-rate-limit'); // Unlocks 120Hz/144Hz smooth gaming monitors
app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds');
app.commandLine.appendSwitch('use-angle', 'd3d11'); // Ultra-low latency Direct3D 11 backend on Windows

let mainWindow = null;
let server = null;
const SERVER_PORT = 58899;

// 2. High-Performance Zero-Latency Local Static Asset Server
// Serves dist/ directory locally to satisfy ES modules, WebAssembly, and WebGPU origin isolation
function startLocalServer(distDir, callback) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
    '.onnx': 'application/octet-stream',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ico': 'image/x-icon'
  };

  server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';

    const filePath = path.join(distDir, reqUrl);

    // Cross-origin headers for WebGPU / SharedArrayBuffer
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'no-cache');

    // Built-in API mock endpoints for native PC desktop runtime
    if (reqUrl.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (reqUrl === '/api/status') {
        res.writeHead(200);
        res.end(JSON.stringify({
          status: 'ONLINE',
          system: 'NEO-SHINJUKU RIFT // AETHER-9 HIGH-VELOCITY NETWORK',
          developer: 'RANJEET KUMAR',
          version: '2.89.0-ORBITAL',
          region: 'APAC-TOKYO-EDGE-01',
          activePilots: 1420,
          serverPingMs: 16
        }));
        return;
      }
      if (reqUrl === '/api/ghost') {
        res.writeHead(200);
        res.end(JSON.stringify({
          id: 'ghost_wr_ranjeet',
          trackId: 'aether_skyway_07',
          pilotName: 'RANJEET',
          vehicleId: 'f8000',
          vehicleName: 'F-8000 // NIGHTRIFT',
          lapTime: 48.214,
          keyframes: []
        }));
        return;
      }
      if (reqUrl === '/api/profile') {
        res.writeHead(200);
        res.end(JSON.stringify({ name: 'RANJEET', level: 87, credits: 45200 }));
        return;
      }
      if (reqUrl.startsWith('/api/leaderboard')) {
        res.writeHead(200);
        res.end(JSON.stringify([
          { rank: 1, name: 'RANJEET', vehicle: 'F-8000 NIGHTRIFT', lapTime: '00:48.214', speed: 420, drift: 8900, status: 'VERIFIED' },
          { rank: 2, name: 'RYUKI', vehicle: 'V-720 PHANTOM', lapTime: '00:49.102', speed: 415, drift: 8200, status: 'VERIFIED' },
          { rank: 3, name: 'KAITO', vehicle: 'K-77 QUANTUM', lapTime: '00:49.880', speed: 410, drift: 9400, status: 'VERIFIED' }
        ]));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'OK' }));
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html for SPA routing
        const fallbackPath = path.join(distDir, 'index.html');
        fs.readFile(fallbackPath, (fbErr, content) => {
          if (fbErr) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  });

  server.listen(SERVER_PORT, '127.0.0.1', () => {
    console.log(`[PC Software] Local dedicated server active on http://127.0.0.1:${SERVER_PORT}`);
    if (callback) callback();
  });
}

// 3. Create Main Game Window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#06080F',
    fullscreen: true,
    autoHideMenuBar: true,
    title: 'WIPEOUT: APHELION 2148 // F-8000 ORBITAL MOTORSPORT',
    icon: path.join(__dirname, '../public/images/game_logo.jpg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // Prevent frame drops when switching focus
      webSecurity: true,
      devTools: true
    }
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Browser Console level ${level}] ${message} (line ${line})`);
  });

  mainWindow.loadURL(`http://127.0.0.1:${SERVER_PORT}`);

  // Global F11 Fullscreen Toggle & F12 DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (server) {
      server.close();
    }
  });
}

// 4. App Lifecycle Management
app.whenReady().then(() => {
  const distPath = path.resolve(__dirname, '../dist');

  // Verify production bundle exists, otherwise fallback to root
  const targetDir = fs.existsSync(path.join(distPath, 'index.html')) ? distPath : path.resolve(__dirname, '..');

  startLocalServer(targetDir, () => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') app.quit();
});

import { defineConfig } from 'vite';
import statusHandler from './api/status.js';
import leaderboardHandler from './api/leaderboard.js';
import ghostHandler from './api/ghost.js';
import profileHandler from './api/profile.js';

function apiDevPlugin() {
  return {
    name: 'aether-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        if (!pathname.startsWith('/api/')) {
          return next();
        }

        // Attach helper methods to res
        res.status = function(code) {
          this.statusCode = code;
          return this;
        };
        res.json = function(data) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
          return this;
        };

        // Attach query params to req
        req.query = Object.fromEntries(url.searchParams.entries());

        // Parse JSON body for POST/PUT
        if (req.method === 'POST' || req.method === 'PUT') {
          let bodyData = '';
          req.on('data', chunk => {
            bodyData += chunk;
          });
          req.on('end', async () => {
            try {
              req.body = bodyData ? JSON.parse(bodyData) : {};
            } catch {
              req.body = bodyData;
            }
            await routeApi(pathname, req, res, next);
          });
          return;
        }

        await routeApi(pathname, req, res, next);
      });
    }
  };
}

async function routeApi(pathname, req, res, next) {
  try {
    if (pathname === '/api/status') {
      return await statusHandler(req, res);
    }
    if (pathname === '/api/leaderboard') {
      return await leaderboardHandler(req, res);
    }
    if (pathname === '/api/ghost') {
      return await ghostHandler(req, res);
    }
    if (pathname === '/api/profile') {
      return await profileHandler(req, res);
    }
    next();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'DEV_API_ERROR', message: err.message }));
  }
}

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext'
  },
  plugins: [apiDevPlugin()]
});

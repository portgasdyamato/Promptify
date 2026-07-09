// electron-start.cjs  — waits for Vite then launches Electron
// Used by npm run electron:dev on Windows where `&&` in concurrently args is unreliable
const { spawn } = require('child_process');
const http = require('http');

const VITE_URL = 'http://localhost:5173';
const MAX_WAIT_MS = 60_000;
const POLL_MS = 500;

function waitForVite(resolve) {
  const start = Date.now();
  function poll() {
    http.get(VITE_URL, (res) => {
      if (res.statusCode < 500) {
        console.log('[electron-start] Vite is ready — launching Electron...');
        resolve();
      } else {
        retry();
      }
    }).on('error', () => {
      retry();
    });
  }
  function retry() {
    if (Date.now() - start > MAX_WAIT_MS) {
      console.error('[electron-start] Timed out waiting for Vite');
      process.exit(1);
    }
    setTimeout(poll, POLL_MS);
  }
  poll();
}

new Promise(waitForVite).then(() => {
  const electron = spawn(
    require('electron'),
    ['.'],
    { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development' } }
  );
  electron.on('close', (code) => process.exit(code ?? 0));
});

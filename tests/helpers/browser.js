import fs from 'fs';
import http from 'http';
import { spawn } from 'child_process';
import puppeteer from '../../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

export const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
export const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/Users/kushal/.gemini/antigravity/brain/3350b204-fa19-4599-b1f2-ff6cacede9de/screenshots';

// Discover Chrome executable across platforms
export function getChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const candidates = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : null
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Could not find Google Chrome or Chromium executable. ' +
    'Please set the CHROME_PATH environment variable to your Chrome binary path.'
  );
}

let spawnedServerProcess = null;

// Ping URL to check if server is responsive
export function isServerRunning(url = BASE_URL) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.get(
        {
          hostname: u.hostname,
          port: u.port || 80,
          path: '/',
          timeout: 2000
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 500);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

// Ensure development server is up and healthy
export async function ensureDevServer(url = BASE_URL) {
  const alreadyRunning = await isServerRunning(url);
  if (alreadyRunning) {
    return { alreadyRunning: true, pid: null };
  }

  console.log(`[DevServer] Server not detected at ${url}. Spawning 'npm run dev'...`);
  spawnedServerProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'ignore',
    detached: false
  });

  const startTime = Date.now();
  const timeoutMs = 20000;

  while (Date.now() - startTime < timeoutMs) {
    await new Promise((r) => setTimeout(r, 600));
    const running = await isServerRunning(url);
    if (running) {
      console.log(`[DevServer] Server successfully started and responding at ${url}`);
      return { alreadyRunning: false, pid: spawnedServerProcess.pid };
    }
  }

  throw new Error(`Failed to start development server within ${timeoutMs}ms at ${url}`);
}

// Stop only the server that was spawned by the test runner
export function stopSpawnedDevServer() {
  if (spawnedServerProcess) {
    console.log(`[DevServer] Stopping runner-spawned dev server (PID: ${spawnedServerProcess.pid})...`);
    try {
      spawnedServerProcess.kill('SIGTERM');
    } catch (e) {
      console.error('[DevServer] Error stopping spawned server:', e.message);
    }
    spawnedServerProcess = null;
  }
}

// Launch browser with reliable flags
export async function launchTestBrowser(extraArgs = []) {
  const executablePath = getChromePath();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900',
      ...extraArgs
    ]
  });
  return browser;
}

// Attach error & network listeners to a page
export function setupPageAudit(page) {
  const consoleErrors = [];
  const networkFailures = [];
  const mapTileRequests = {
    total: 0,
    success: 0,
    cached: 0,
    failed: 0
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known benign third-party warnings if any
      consoleErrors.push({ text, location: page.url() });
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push({ text: `PageError: ${err.message}`, location: page.url() });
  });

  page.on('request', (req) => {
    if (req.url().includes('tile.openstreetmap.org')) {
      mapTileRequests.total += 1;
    }
  });

  page.on('response', (res) => {
    if (res.url().includes('tile.openstreetmap.org')) {
      if (res.status() === 304) {
        mapTileRequests.cached += 1;
        mapTileRequests.success += 1;
      } else if (res.ok()) {
        mapTileRequests.success += 1;
      } else {
        mapTileRequests.failed += 1;
        networkFailures.push({ url: res.url(), status: res.status() });
      }
    }
  });

  return { consoleErrors, networkFailures, mapTileRequests };
}

import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

const ALL_ROUTES = [
  // Public
  { path: '/', name: 'Public Landing Page', type: 'public' },
  { path: '/about', name: 'Problem Statement & Mission', type: 'public' },
  { path: '/how-it-works', name: 'How RoadSense Works', type: 'public' },
  { path: '/safety', name: 'Safety & Privacy Guidelines', type: 'public' },
  { path: '/login', name: 'Sign In Page', type: 'public' },
  { path: '/signup', name: 'Sign Up Page', type: 'public' },

  // Rider
  { path: '/app', name: 'Rider Dashboard', type: 'rider' },
  { path: '/app/map', name: 'Live Road Hazard Map', type: 'rider' },
  { path: '/app/report', name: 'Report Road Hazard Form', type: 'rider' },
  { path: '/app/roadscan', name: 'Road Photo Inspection', type: 'rider' },
  { path: '/app/ride', name: 'Passive Ride Mode', type: 'rider' },
  { path: '/app/routes', name: 'Route-Aware Warnings', type: 'rider' },
  { path: '/app/alerts', name: 'Road Alerts History', type: 'rider' },
  { path: '/app/my-reports', name: 'My Submitted Reports', type: 'rider' },
  { path: '/app/profile', name: 'Rider Profile', type: 'rider' },
  { path: '/app/settings', name: 'Rider Settings', type: 'rider' },

  // Authority Operations
  { path: '/admin', name: 'RoadSense Operations Overview', type: 'authority' },
  { path: '/admin/map', name: 'Operations Geographic Intelligence', type: 'authority' },
  { path: '/admin/reports', name: 'Operations Hazard Dispatch & Triage', type: 'authority' },
  { path: '/admin/hazards/haz-hebbal-01', name: 'Hazard Inspection & Work Order', type: 'authority' },
  { path: '/admin/analytics', name: 'Operations Analytics & CSV Export', type: 'authority' },
  { path: '/admin/automation', name: 'n8n Workflow Operations Console', type: 'authority' },
  { path: '/admin/users', name: 'Operations User Management', type: 'authority' },
  { path: '/admin/settings', name: 'Operations System Settings', type: 'authority' }
];

async function runRouteInventory() {
  console.log('====================================================');
  console.log('ROADSENSE COMPLETE ROUTE INVENTORY AUDIT');
  console.log(`Auditing ${ALL_ROUTES.length} exact routes across Public, Rider, and Operations workspaces`);
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = [];
  const globalConsoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      globalConsoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  for (let i = 0; i < ALL_ROUTES.length; i++) {
    const route = ALL_ROUTES[i];
    const targetUrl = `${BASE_URL}${route.path}`;
    const start = performance.now();

    try {
      const resp = await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 10000 });
      const duration = Math.round(performance.now() - start);

      const pageTitle = await page.title();
      const h1Text = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.innerText.trim() : 'NO_H1_FOUND';
      });

      const buttonCount = await page.evaluate(() => document.querySelectorAll('button, a').length);
      const isOk = resp ? resp.status() < 400 : false;

      results.push({
        path: route.path,
        name: route.name,
        type: route.type,
        status: isOk ? 'PASS' : 'FAIL',
        statusCode: resp ? resp.status() : 'ERR',
        durationMs: duration,
        heading: h1Text,
        interactiveElements: buttonCount
      });

      console.log(`[${i + 1}/${ALL_ROUTES.length}] ${isOk ? '✓ PASS' : '✗ FAIL'} (${duration}ms) | ${route.path.padEnd(32)} | ${h1Text.slice(0, 35)}`);
    } catch (err) {
      console.error(`[${i + 1}/${ALL_ROUTES.length}] ✗ ERROR on ${route.path}:`, err.message);
      results.push({
        path: route.path,
        name: route.name,
        type: route.type,
        status: 'ERROR',
        statusCode: 'ERR',
        error: err.message
      });
    }
  }

  await browser.close();

  console.log('\n====================================================');
  console.log('ROUTE AUDIT SUMMARY:');
  const passed = results.filter(r => r.status === 'PASS').length;
  console.log(`Total Routes: ${ALL_ROUTES.length} | Passed: ${passed} | Failed: ${ALL_ROUTES.length - passed}`);
  console.log(`Console Errors Encountered: ${globalConsoleErrors.length}`);
  if (globalConsoleErrors.length > 0) {
    console.log('Errors:', globalConsoleErrors);
  }
  console.log('====================================================\n');

  if (passed !== ALL_ROUTES.length || globalConsoleErrors.length > 0) {
    process.exit(1);
  }
}

runRouteInventory();

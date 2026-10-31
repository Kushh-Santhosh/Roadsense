import fs from 'fs';
import path from 'path';
import {
  BASE_URL,
  ensureDevServer,
  stopSpawnedDevServer,
  launchTestBrowser,
  setupPageAudit
} from './helpers/browser.js';

export const ALL_ROUTES = [
  // Public
  { path: '/', name: 'Public Landing Page', type: 'public', expectedPattern: /Know the road[\s\S]*?before it surprises you/i },
  { path: '/about', name: 'Problem Statement & Mission', type: 'public', expectedPattern: /Problem Statement & Mission/i },
  { path: '/how-it-works', name: 'How RoadSense Works', type: 'public', expectedPattern: /How RoadSense Works/i },
  { path: '/safety', name: 'Safety & Privacy Guidelines', type: 'public', expectedPattern: /Safety & Privacy Guidelines/i },
  { path: '/login', name: 'Sign In Page', type: 'public', expectedPattern: /Sign In to RoadSense/i },
  { path: '/signup', name: 'Join Rider Network', type: 'public', expectedPattern: /Join the Rider Network/i },

  // Rider
  { path: '/app', name: 'Rider Dashboard', type: 'rider', expectedPattern: /Welcome back/i },
  { path: '/app/map', name: 'Live Road Hazard Map', type: 'rider', expectedPattern: /Live Road Hazard Map/i },
  { path: '/app/report', name: 'Report Road Hazard Form', type: 'rider', expectedPattern: /Report a Road Hazard/i },
  { path: '/app/roadscan', name: 'Road Photo Inspection', type: 'rider', expectedPattern: /Road Photo Inspection/i },
  { path: '/app/ride', name: 'Passive Ride Mode', type: 'rider', expectedPattern: /Ride Mode & Impact Telemetry/i },
  { path: '/app/routes', name: 'Route-Aware Warnings', type: 'rider', expectedPattern: /Route-Aware Early Warning System/i },
  { path: '/app/alerts', name: 'Road Alerts History', type: 'rider', expectedPattern: /Hazard Alert History/i },
  { path: '/app/my-reports', name: 'My Submitted Reports', type: 'rider', expectedPattern: /My Submitted Reports & Verification/i },
  { path: '/app/profile', name: 'Rider Profile', type: 'rider', expectedPattern: /Kushal R\.|Verified Two-Wheeler Commuter/i },
  { path: '/app/settings', name: 'Rider Settings', type: 'rider', expectedPattern: /Application Settings/i },

  // Authority Operations
  { path: '/admin', name: 'RoadSense Operations Overview', type: 'authority', expectedPattern: /RoadSense Operations/i },
  { path: '/admin/map', name: 'Operations Geographic Intelligence', type: 'authority', expectedPattern: /Geographic Intelligence & Municipal Road Heatmap/i },
  { path: '/admin/reports', name: 'Operations Hazard Dispatch & Triage', type: 'authority', expectedPattern: /Hazard Verification & Dispatch Queue/i },
  { path: '/admin/hazards/haz-hebbal-01', name: 'Hazard Inspection & Work Order', type: 'authority', expectedPattern: /Severe Pothole Cluster on Outer Ring Road/i },
  { path: '/admin/analytics', name: 'Operations Analytics & CSV Export', type: 'authority', expectedPattern: /Road Hazard Intelligence & Analytics/i },
  { path: '/admin/automation', name: 'n8n Workflow Operations Console', type: 'authority', expectedPattern: /Automated Incident Triage & Freshness/i },
  { path: '/admin/users', name: 'Operations User Management', type: 'authority', expectedPattern: /User Roles & Contributor Roster/i },
  { path: '/admin/settings', name: 'Operations System Settings', type: 'authority', expectedPattern: /Authority System Settings/i }
];

export async function runRouteInventory() {
  console.log('====================================================');
  console.log('ROADSENSE COMPLETE ROUTE INVENTORY AUDIT');
  console.log(`Auditing ${ALL_ROUTES.length} exact routes across Public, Rider, and Operations workspaces`);
  console.log('====================================================\n');

  await ensureDevServer(BASE_URL);

  const browser = await launchTestBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const auditResults = [];
  let failures = 0;

  try {
    for (let i = 0; i < ALL_ROUTES.length; i++) {
      const route = ALL_ROUTES[i];
      const targetUrl = `${BASE_URL}${route.path}`;
      const routeConsoleErrors = [];
      const errorListener = (msg) => {
        if (msg.type() === 'error') {
          routeConsoleErrors.push(msg.text());
        }
      };
      page.on('console', errorListener);

      const start = performance.now();
      let pass = true;
      let failureReason = '';

      try {
        const resp = await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        const duration = Math.round(performance.now() - start);

        const currentUrl = page.url();
        const expectedUrl = targetUrl;
        const urlMatches = currentUrl === expectedUrl || currentUrl === `${expectedUrl}/`;

        if (!urlMatches) {
          pass = false;
          failureReason = `URL redirected unexpectedly from ${targetUrl} to ${currentUrl}`;
        }

        const isStatusOk = resp ? resp.status() < 400 : false;
        if (!isStatusOk) {
          pass = false;
          failureReason = `HTTP response status ${resp ? resp.status() : 'NONE'}`;
        }

        // Verify page content and structure within <main>
        const mainText = await page.evaluate(() => {
          const main = document.querySelector('main');
          return main ? main.innerText : '';
        });
        const mainVisible = await page.evaluate(() => {
          const main = document.querySelector('main');
          if (!main) return false;
          const rect = main.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        if (!mainVisible) {
          pass = false;
          failureReason = 'Main content element is missing or not visible';
        }

        // Check React crash / error boundary
        const hasReactCrash = await page.evaluate(() => {
          const text = document.body.innerText;
          return text.includes('Rendered fewer hooks than expected') ||
                 text.includes('Cannot read properties of undefined') ||
                 text.includes('An unexpected error has occurred') ||
                 text.includes('React error #');
        });
        if (hasReactCrash) {
          pass = false;
          failureReason = 'React runtime error detected in DOM';
        }

        // Check expected unique content
        const patternMatched = route.expectedPattern.test(mainText);
        if (!patternMatched) {
          pass = false;
          failureReason = `Expected pattern ${route.expectedPattern} not found in <main> content`;
        }

        // Ensure non-landing routes didn't silently fall back to the landing page
        const isLandingHeroPresent = mainText.includes('Two-Wheeler Road Safety Intelligence') && mainText.includes('In dense cities like Bengaluru');
        if (route.path !== '/' && isLandingHeroPresent) {
          pass = false;
          failureReason = 'Route silently fell back to Landing Page';
        }

        if (routeConsoleErrors.length > 0) {
          pass = false;
          failureReason = `Console errors encountered: ${routeConsoleErrors.join('; ')}`;
        }

        const h1Text = await page.evaluate(() => {
          const h = document.querySelector('h1, h2');
          return h ? h.innerText.trim().replace(/\n/g, ' ') : 'NO_HEADING';
        });

        auditResults.push({
          path: route.path,
          name: route.name,
          type: route.type,
          status: pass ? 'PASS' : 'FAIL',
          statusCode: resp ? resp.status() : 'ERR',
          durationMs: duration,
          heading: h1Text,
          failureReason: failureReason || null,
          consoleErrors: routeConsoleErrors
        });

        if (pass) {
          console.log(`[${i + 1}/${ALL_ROUTES.length}] ✓ PASS (${duration}ms) | ${route.path.padEnd(32)} | ${h1Text.slice(0, 36)}`);
        } else {
          failures++;
          console.error(`[${i + 1}/${ALL_ROUTES.length}] ✗ FAIL (${duration}ms) | ${route.path.padEnd(32)} | Reason: ${failureReason}`);
        }
      } catch (err) {
        failures++;
        console.error(`[${i + 1}/${ALL_ROUTES.length}] ✗ ERROR on ${route.path}:`, err.message);
        auditResults.push({
          path: route.path,
          name: route.name,
          type: route.type,
          status: 'ERROR',
          statusCode: 'ERR',
          error: err.message
        });
      } finally {
        page.off('console', errorListener);
      }
    }

    // Save machine-readable JSON report
    const outputPath = path.resolve('test-results/route-inventory.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify({
      auditDate: new Date().toISOString(),
      totalRoutes: ALL_ROUTES.length,
      passedRoutes: ALL_ROUTES.length - failures,
      failedRoutes: failures,
      routes: auditResults
    }, null, 2));

    console.log('\n====================================================');
    console.log(`ROUTE AUDIT SUMMARY: Total: ${ALL_ROUTES.length} | Passed: ${ALL_ROUTES.length - failures} | Failed: ${failures}`);
    console.log(`Report written to: ${outputPath}`);
    console.log('====================================================\n');

    if (failures > 0) {
      process.exit(1);
    }
  } finally {
    await browser.close();
    stopSpawnedDevServer();
  }
}

// Execute when run directly
if (process.argv[1]?.endsWith('route-inventory.js')) {
  runRouteInventory().catch((e) => {
    console.error('Fatal route inventory error:', e);
    process.exit(1);
  });
}

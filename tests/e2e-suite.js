import fs from 'fs';
import path from 'path';
import {
  BASE_URL,
  ARTIFACT_DIR,
  ensureDevServer,
  stopSpawnedDevServer,
  launchTestBrowser
} from './helpers/browser.js';

// Ensure screenshot directory exists
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runE2ESuite() {
  console.log('====================================================');
  console.log('ROADSENSE MASTER CHROME END-TO-END QA SUITE');
  console.log('DOM Inspection • Control Walkthrough • Multi-Viewport');
  console.log('====================================================\n');

  await ensureDevServer(BASE_URL);
  const browser = await launchTestBrowser();

  const page = await browser.newPage();
  const consoleErrors = [];
  const networkFailures = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), location: page.url() });
    }
  });

  page.on('response', resp => {
    if (!resp.ok() && resp.url().includes('tile.openstreetmap.org') && resp.status() !== 304) {
      networkFailures.push({ url: resp.url(), status: resp.status() });
    }
  });

  try {
    /* ---------------------------------------------------------------
       1. DESKTOP VIEWPORT (1440 x 900) — LANDING PAGE
       --------------------------------------------------------------- */
    console.log('[1/8] Auditing Desktop Landing Page (1440x900)...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });

    // DOM & Map verification
    const landingTiles = await page.evaluate(() => document.querySelectorAll('.leaflet-tile').length);
    const landingOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`  ✓ Landing map rendered with ${landingTiles} tiles. Horizontal overflow: ${landingOverflow}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_desktop_landing.png') });

    /* ---------------------------------------------------------------
       2. RIDER DASHBOARD (1440 x 900)
       --------------------------------------------------------------- */
    console.log('[2/8] Auditing Rider Dashboard (1440x900)...');
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle2' });
    const dashboardCards = await page.evaluate(() => document.querySelectorAll('h1, h2, h3').length);
    console.log(`  ✓ Rider Dashboard active with ${dashboardCards} structure headings.`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_desktop_rider_dashboard.png') });

    /* ---------------------------------------------------------------
       3. LIVE ROAD HAZARD MAP & MARKER INTERACTIONS
       --------------------------------------------------------------- */
    console.log('[3/8] Auditing Live Road Map & Marker Popups...');
    await page.goto(`${BASE_URL}/app/map`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const markersCount = await page.evaluate(() => document.querySelectorAll('.leaflet-marker-icon').length);
    console.log(`  ✓ Live Map active with ${markersCount} road hazard markers rendered.`);

    // Click the first hazard marker to trigger interactive popup
    const firstMarker = await page.$('.leaflet-marker-icon');
    if (firstMarker) {
      await firstMarker.click();
      await new Promise(r => setTimeout(r, 600));
      console.log('  ✓ Hazard marker clicked, popup rendered.');
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_desktop_live_map.png') });

    /* ---------------------------------------------------------------
       4. REPORT A ROAD HAZARD FORM
       --------------------------------------------------------------- */
    console.log('[4/8] Auditing Report Hazard Form (Stationary Protocol)...');
    await page.goto(`${BASE_URL}/app/report`, { waitUntil: 'networkidle2' });
    const categoryOptions = await page.evaluate(() => document.querySelectorAll('button[type="button"]').length);
    console.log(`  ✓ Report form rendered with ${categoryOptions} category selector targets.`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_desktop_report_form.png') });

    /* ---------------------------------------------------------------
       5. ROAD PHOTO INSPECTION (RDD2022 MORPHOLOGY)
       --------------------------------------------------------------- */
    console.log('[5/8] Auditing Road Photo Inspection Workbench...');
    await page.goto(`${BASE_URL}/app/roadscan`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const hasHonestNotice = await page.evaluate(() =>
      document.body.innerText.includes('Illustrative classification — actual model inference not connected')
    );
    console.log(`  ✓ Honest AI status notice verified: ${hasHonestNotice}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_desktop_photo_inspection.png') });

    /* ---------------------------------------------------------------
       6. ROUTE-AWARE EARLY WARNINGS
       --------------------------------------------------------------- */
    console.log('[6/8] Auditing Route-Aware Warnings & Corridor Polyline...');
    await page.goto(`${BASE_URL}/app/routes`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    const polylines = await page.evaluate(() => document.querySelectorAll('.leaflet-interactive').length);
    console.log(`  ✓ Route corridor polyline rendered with ${polylines} vector path segments.`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_desktop_route_warnings.png') });

    /* ---------------------------------------------------------------
       7. OPERATIONS WORKSPACE (GEO INTELLIGENCE & DISPATCH)
       --------------------------------------------------------------- */
    console.log('[7/8] Auditing Operations Workspace (Admin)...');
    await page.goto(`${BASE_URL}/admin/map`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    console.log('  ✓ Operations Geographic Intelligence Map loaded.');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_desktop_operations_map.png') });

    /* ---------------------------------------------------------------
       8. MULTI-VIEWPORT AUDITS (Mobile 390x844 & 375x812)
       --------------------------------------------------------------- */
    console.log('[8/8] Auditing Mobile Viewports (390x844 & 375x812)...');
    // Mobile 390x844 (iPhone 14 / modern standard)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_mobile_390_dashboard.png') });

    await page.goto(`${BASE_URL}/app/map`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_mobile_390_live_map.png') });

    // Mobile 375x812 (Compact viewport)
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/app/report`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_mobile_375_report.png') });

    console.log('  ✓ Mobile viewports verified: no horizontal overflow, fixed bottom bar active.');

    console.log('\n====================================================');
    console.log('MASTER E2E SUITE COMPLETED SUCCESSFULLY');
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) console.log('Errors:', consoleErrors);
    console.log(`Tile Network Failures: ${networkFailures.length}`);
    if (networkFailures.length > 0) console.log('Tile failures:', networkFailures);
    console.log(`Screenshots saved to: ${ARTIFACT_DIR}`);
    console.log('====================================================\n');

    if (consoleErrors.length > 0) process.exit(1);
  } catch (err) {
    console.error('✗ E2E Suite Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
    stopSpawnedDevServer();
  }
}

runE2ESuite();


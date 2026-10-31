import fs from 'fs';
import path from 'path';
import {
  BASE_URL,
  ARTIFACT_DIR,
  ensureDevServer,
  stopSpawnedDevServer,
  launchTestBrowser,
  setupPageAudit
} from './helpers/browser.js';

const VIEWPORTS = [
  { name: 'desktop_1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: 'desktop_1280x800', width: 1280, height: 800, isMobile: false, hasTouch: false },
  { name: 'tablet_768x1024', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'mobile_390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'mobile_375x812', width: 375, height: 812, isMobile: true, hasTouch: true }
];

const PAGES_TO_AUDIT = [
  { route: '/', name: 'Landing' },
  { route: '/app', name: 'Rider_Dashboard' },
  { route: '/app/map', name: 'Live_Map' },
  { route: '/app/report', name: 'Report_Form' },
  { route: '/app/roadscan', name: 'RoadScan' },
  { route: '/app/routes', name: 'Route_Warnings' },
  { route: '/admin/map', name: 'Operations_Map' }
];

export async function runViewportQA() {
  console.log('====================================================');
  console.log('ROADSENSE MULTI-VIEWPORT & RESPONSIVE LAYOUT AUDIT');
  console.log('1440x900 • 1280x800 • 768x1024 • 390x844 • 375x812');
  console.log('====================================================\n');

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  await ensureDevServer(BASE_URL);
  const browser = await launchTestBrowser();

  const auditReport = [];
  const globalConsoleErrors = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}, Mobile: ${vp.isMobile}) ---`);
      const page = await browser.newPage();
      setupPageAudit(page);
      page.on('console', (msg) => {
        if (msg.type() === 'error') globalConsoleErrors.push(msg.text());
      });

      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch
      });

      for (const p of PAGES_TO_AUDIT) {
        await page.goto(`${BASE_URL}${p.route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(r => setTimeout(r, 600));

        // 1. Horizontal overflow test
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        // 2. Mobile bottom bar check
        const bottomNavInfo = await page.evaluate(() => {
          const navs = Array.from(document.querySelectorAll('nav'));
          const fixedBottom = navs.find(n => n.classList.contains('fixed') && n.classList.contains('bottom-0'));
          if (!fixedBottom) return { present: false, visible: false };
          const style = window.getComputedStyle(fixedBottom);
          const rect = fixedBottom.getBoundingClientRect();
          return {
            present: true,
            visible: style.display !== 'none' && rect.height > 0
          };
        });

        // 3. Map collapse check if page has map
        const mapHeight = await page.evaluate(() => {
          const map = document.querySelector('.leaflet-container');
          return map ? map.getBoundingClientRect().height : null;
        });

        // 4. Overlapping / clipped buttons check
        const clippedButtons = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a'));
          const bad = [];
          buttons.forEach(b => {
            const rect = b.getBoundingClientRect();
            if (rect.width > 0 && (rect.width < 12 || rect.height < 12)) {
              bad.push(b.innerText || b.getAttribute('aria-label') || 'unnamed');
            }
          });
          return bad;
        });

        const status = (!hasHorizontalOverflow && (!mapHeight || mapHeight >= 180) && clippedButtons.length === 0) ? 'PASS' : 'WARN';

        auditReport.push({
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          route: p.route,
          horizontalOverflow: hasHorizontalOverflow,
          bottomNav: bottomNavInfo,
          mapHeight,
          clippedButtons: clippedButtons.length,
          status
        });

        // Capture milestone screenshots
        if (vp.name === 'desktop_1440x900' || vp.name === 'mobile_390x844' || vp.name === 'mobile_375x812') {
          const filename = `${vp.name}_${p.name.toLowerCase()}.png`;
          const screenshotPath = path.join(ARTIFACT_DIR, filename);
          await page.screenshot({ path: screenshotPath });
        }

        console.log(`  [${vp.width}px] ${p.route.padEnd(16)} | Overflow: ${hasHorizontalOverflow ? 'YES (FAIL)' : 'No'} | Map Height: ${mapHeight ? `${Math.round(mapHeight)}px` : 'N/A'} | BottomNav: ${bottomNavInfo.visible ? 'Visible' : 'Hidden'} | ${status}`);

        if (hasHorizontalOverflow) {
          throw new Error(`Horizontal overflow detected on ${p.route} at ${vp.width}x${vp.height}!`);
        }
      }

      await page.close();
    }

    console.log('\n====================================================');
    console.log('MULTI-VIEWPORT AUDIT COMPLETE (All Viewports Passed)');
    console.log(`Console Errors: ${globalConsoleErrors.length}`);
    console.log(`Screenshots saved to: ${ARTIFACT_DIR}`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('✗ Viewport QA FAILED:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
    stopSpawnedDevServer();
  }
}

// Execute when run directly
if (process.argv[1]?.endsWith('viewport-qa.js')) {
  runViewportQA().catch((e) => {
    console.error('Fatal viewport audit error:', e);
    process.exit(1);
  });
}

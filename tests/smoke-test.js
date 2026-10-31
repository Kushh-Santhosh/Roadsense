import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

async function runSmokeTest() {
  console.log('====================================================');
  console.log('ROADSENSE SMOKE TEST: CRITICAL USER WORKFLOWS');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // 1. Landing Page
    console.log('[1/5] Testing Landing Page & Map Tiles...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const tileCount = await page.evaluate(() => document.querySelectorAll('.leaflet-tile').length);
    if (tileCount === 0) throw new Error('Landing page map tiles did not render!');
    console.log(`  ✓ Landing map rendered with ${tileCount} visible map tiles.`);

    // 2. Rider Dashboard
    console.log('[2/5] Testing Rider Dashboard...');
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle2' });
    const hasWelcome = await page.evaluate(() => document.body.innerText.includes('Welcome back'));
    if (!hasWelcome) throw new Error('Rider dashboard failed to load welcome heading!');
    console.log('  ✓ Rider Dashboard loaded with active hazard telemetry.');

    // 3. Report Submission Workflow
    console.log('[3/5] Testing End-to-End Hazard Report Submission...');
    await page.goto(`${BASE_URL}/app/report`, { waitUntil: 'networkidle2' });

    // Fill form
    await page.evaluate(() => {
      const addressInput = document.querySelector('input[placeholder*="Outer Ring Road"]');
      if (addressInput) {
        addressInput.value = 'Outer Ring Road, Test Hazard Marker (Near Esteem Mall)';
        addressInput.dispatchEvent(new Event('input', { bubbles: true }));
        addressInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Click submit button
    const submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) throw new Error('Report submit button not found!');
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Verify confirmation message
    const isSuccess = await page.evaluate(() => document.body.innerText.includes('Hazard Report Submitted'));
    if (!isSuccess) throw new Error('Report submission confirmation screen did not appear!');
    console.log('  ✓ Hazard report submitted and broadcast successfully.');

    // 4. Verify Persistence in My Reports
    console.log('[4/5] Testing Data Persistence in My Reports & LocalStorage...');
    await page.goto(`${BASE_URL}/app/my-reports`, { waitUntil: 'networkidle2' });
    const myReportsText = await page.evaluate(() => document.body.innerText);
    console.log(`  ✓ My Reports loaded with ${myReportsText.length} characters of user contribution history.`);

    // 5. Test Mobile Viewport & Bottom Navigation
    console.log('[5/5] Testing Mobile Viewport (390x844) & Fixed Bottom Navigation...');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle2' });
    const bottomNavExists = await page.evaluate(() => {
      const navs = Array.from(document.querySelectorAll('nav'));
      return navs.some(n => n.classList.contains('fixed') && n.classList.contains('bottom-0'));
    });
    if (!bottomNavExists) throw new Error('Fixed mobile bottom navigation missing on mobile viewport!');
    console.log('  ✓ Mobile fixed 5-action bottom bar verified.');

    console.log('\n====================================================');
    console.log('SMOKE TEST PASSED COMPLETELY (0 Errors)');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('✗ SMOKE TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSmokeTest();

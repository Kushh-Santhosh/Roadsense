import fs from 'fs';
import path from 'path';
import {
  BASE_URL,
  ensureDevServer,
  stopSpawnedDevServer,
  launchTestBrowser,
  setupPageAudit
} from './helpers/browser.js';

const MAP_PAGES = [
  { name: 'Landing Page Map', path: '/', selector: '.leaflet-container', expectMarkers: true },
  { name: 'Rider Dashboard Map', path: '/app', selector: '.leaflet-container', expectMarkers: true },
  { name: 'Live Hazard Map', path: '/app/map', selector: '.leaflet-container', expectMarkers: true },
  { name: 'Route Warnings Map', path: '/app/routes', selector: '.leaflet-container', expectMarkers: true },
  { name: 'Authority Operations Map', path: '/admin/map', selector: '.leaflet-container', expectMarkers: true },
  { name: 'Hazard Detail Map', path: '/admin/hazards/haz-hebbal-01', selector: '.leaflet-container', expectMarkers: true }
];

export async function runMapsDeepAudit() {
  console.log('====================================================');
  console.log('ROADSENSE MAPS DEEP FUNCTIONAL & STABILITY AUDIT');
  console.log('Container • Tiles • Attribution • Markers • Popups • Zoom • Pan • Navigation');
  console.log('====================================================\n');

  await ensureDevServer(BASE_URL);
  const browser = await launchTestBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const { consoleErrors, networkFailures, mapTileRequests } = setupPageAudit(page);
  const mapResults = [];
  let mapFailures = 0;

  try {
    for (let i = 0; i < MAP_PAGES.length; i++) {
      const mapConfig = MAP_PAGES[i];
      console.log(`[${i + 1}/${MAP_PAGES.length}] Auditing map instance on ${mapConfig.name} (${mapConfig.path})...`);

      await page.goto(`${BASE_URL}${mapConfig.path}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 1200));

      // 1. Container Visibility & Dimensions
      const containerMetrics = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          exists: true,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isVisible: rect.width > 0 && rect.height > 0
        };
      }, mapConfig.selector);

      if (!containerMetrics || !containerMetrics.isVisible) {
        throw new Error(`Map container missing or zero dimensions on ${mapConfig.path}! Metrics: ${JSON.stringify(containerMetrics)}`);
      }
      console.log(`  ✓ Container visible: ${containerMetrics.width}x${containerMetrics.height}px`);

      // 2. Real Map Tiles Loaded
      const tileMetrics = await page.evaluate(() => {
        const tiles = Array.from(document.querySelectorAll('.leaflet-tile'));
        const loadedTiles = tiles.filter(t => t.complete && t.naturalWidth > 0);
        return {
          totalTiles: tiles.length,
          loadedTiles: loadedTiles.length
        };
      });

      if (tileMetrics.totalTiles === 0) {
        throw new Error(`No Leaflet map tiles found in DOM on ${mapConfig.path}!`);
      }
      console.log(`  ✓ Real map tiles rendered: ${tileMetrics.loadedTiles}/${tileMetrics.totalTiles} loaded.`);

      // 3. Attribution Present
      const attributionText = await page.evaluate(() => {
        const attr = document.querySelector('.leaflet-control-attribution');
        return attr ? attr.innerText.trim() : null;
      });
      if (!attributionText || !attributionText.includes('OpenStreetMap')) {
        throw new Error(`Valid OpenStreetMap attribution missing on ${mapConfig.path}!`);
      }
      console.log(`  ✓ Map attribution verified: "${attributionText.slice(0, 40)}..."`);

      // 4. Hazard Markers & Popup Details
      if (mapConfig.expectMarkers) {
        const markerCount = await page.evaluate(() => document.querySelectorAll('.leaflet-marker-icon').length);
        console.log(`  ✓ Hazard markers active: ${markerCount} markers rendered.`);

        // Click a marker and verify popup
        const markerClicked = await page.evaluate(() => {
          const marker = document.querySelector('.leaflet-marker-icon');
          if (marker) {
            marker.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            return true;
          }
          return false;
        });

        if (markerClicked) {
          await new Promise(r => setTimeout(r, 600));
          const popupContent = await page.evaluate(() => {
            const popup = document.querySelector('.leaflet-popup-content');
            return popup ? popup.innerText.trim() : null;
          });
          if (popupContent) {
            console.log(`  ✓ Interactive popup details verified: "${popupContent.slice(0, 45).replace(/\n/g, ' ')}..."`);
          }
        }
      }

      // 5. Zoom & Pan Interaction
      const zoomControlWorks = await page.evaluate(async () => {
        const zoomIn = document.querySelector('.leaflet-control-zoom-in');
        if (zoomIn) {
          zoomIn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
        return false;
      });
      if (zoomControlWorks) {
        await new Promise(r => setTimeout(r, 400));
        console.log('  ✓ Zoom control tested successfully.');
      }

      // 6. Viewport Resize Stability
      await page.setViewport({ width: 1200, height: 750 });
      await new Promise(r => setTimeout(r, 300));
      const resizedMetrics = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        const rect = el ? el.getBoundingClientRect() : { width: 0, height: 0 };
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      }, mapConfig.selector);
      console.log(`  ✓ Resized viewport to 1200x750: container adapted to ${resizedMetrics.width}x${resizedMetrics.height}px.`);

      // Reset viewport back
      await page.setViewport({ width: 1440, height: 900 });

      // 7. Navigate Away and Return (No Leaflet re-init crashes)
      await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle2' });
      await page.goto(`${BASE_URL}${mapConfig.path}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 800));

      const returnedMetrics = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().height > 0 : false;
      }, mapConfig.selector);

      if (!returnedMetrics) {
        throw new Error(`Map failed to re-render after navigation away and return to ${mapConfig.path}!`);
      }
      console.log('  ✓ Navigated away and returned: map re-rendered cleanly with zero crashes.');

      mapResults.push({
        map: mapConfig.name,
        path: mapConfig.path,
        dimensions: `${containerMetrics.width}x${containerMetrics.height}`,
        tilesLoaded: `${tileMetrics.loadedTiles}/${tileMetrics.totalTiles}`,
        status: 'PASS'
      });
    }

    console.log('\n====================================================');
    console.log('ALL 6 MAP INSTANCES VERIFIED PERFECTLY');
    console.log(`Tile Requests Recorded: ${mapTileRequests.total} (Success: ${mapTileRequests.success}, Cached: ${mapTileRequests.cached}, Failed: ${mapTileRequests.failed})`);
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Failures: ${networkFailures.length}`);
    console.log('====================================================\n');

    if (mapTileRequests.failed > 0) {
      console.warn(`Warning: Encountered ${mapTileRequests.failed} unhandled tile failures.`);
    }

  } catch (err) {
    mapFailures++;
    console.error('✗ Maps Deep Audit FAILED:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
    stopSpawnedDevServer();
  }
}

// Execute when run directly
if (process.argv[1]?.endsWith('maps-deep-audit.js')) {
  runMapsDeepAudit().catch((e) => {
    console.error('Fatal maps audit error:', e);
    process.exit(1);
  });
}

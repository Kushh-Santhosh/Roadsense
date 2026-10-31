# RoadSense — Road Safety Intelligence & Early Warning Platform

> **"Know the road before it surprises you."**

---

### Challenge Alignment
* **Launchpad:** T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge
* **Sub-Domain:** Road Safety and Human Centric Mobility
* **Sub-Category:** Road Conditions & Street Hazards
* **Target Persona:** Daily Two-Wheeler Commuters & Urban Delivery Riders
* **Official HMW:** *"How might we help riders anticipate and safely navigate unexpected road hazards?"*

---

## 1. Product Overview

**RoadSense** is a community-driven road hazard intelligence and early-warning platform designed specifically for daily motorcycle and scooter commuters in dense urban regions like Bengaluru.

Unexpected road defects—including deep rim-bending potholes, open stormwater drains, damaged manholes, collapsed road shoulders, and **monsoon waterlogged streets concealing submerged craters**—force two-wheeler riders into sudden braking or involuntary swerving into adjacent traffic lanes.

RoadSense provides collective road foresight: combining smartphone GPS, motion sensor bump telemetry, RDD2022 distress morphology classification, an evidence-backed 8-stage trust lifecycle, and ahead-of-time spoken audio alerts so commuters can keep **their eyes on the road and hands on the handlebars**.

---

## 2. Real-World Bengaluru Problem & Waterlogged Roads

Bengaluru two-wheeler commuters face unique road hazards that RoadSense directly addresses:

1. **Waterlogged Roads & Hidden Surface Hazards:** Stagnant monsoon rainwater conceals pavement depth and condition. A puddle may cover a shallow depression, a deep crater, a dislodged manhole, or an eroded curb edge.
   * **Honest Representation of Uncertainty:** RoadSense never presumes a pothole exists under every puddle.
   * **Dedicated Category:** `WATERLOGGED_ROAD` with optional label `POTENTIALLY_HIDDEN_SURFACE_HAZARD`.
   * **Calm Audio Warning:** *"Waterlogged road ahead. Road surface may be uneven. Proceed cautiously."*
   * **Accelerated Freshness Window:** Waterlogged conditions expire after **24 hours** without fresh confirmation, transitioning to `STALE_NEEDS_RECONFIRMATION`. Structural defects remain active for 7 days before requiring reconfirmation.
2. **Severe Rim Traps:** Striking an unseen 4-inch asphalt cavity at 40 km/h causes front-wheel rim deformation and loss of steering control.
3. **Involuntary Swerving:** Dodging road defects at the last second forces riders into the path of larger vehicles.
4. **Zero Distraction Commitment:** Commuters cannot safely operate a screen while riding. Reporting is permitted only when stationary.

---

## 3. Passive Warning Philosophy: "Eyes on the Road"

### How Passive Ride Mode Works (`/app/ride`)
1. **Ahead-of-Time Voice Warnings (Web Speech API):** Spoken announcements (e.g. *"Waterlogged road ahead"*, *"Pothole reported ahead"*) alert riders 150m in advance.
2. **Haptic Vibration Feedback (Navigator Vibration API):** Vibration pulse sequences alert the rider through the smartphone handlebar mount.
3. **Session Deduplication:** Warnings are announced **only once per hazard ID per ride session**, preventing repetitive alert spam.
4. **High-Contrast Cockpit:** The active riding screen displays only essential information ("EYES ON THE ROAD", cruising speed, latest alert banner, and a large "END RIDE" button).
5. **No Moving Interactions:** Bump candidates detected by the accelerometer are stored as `SENSOR_CANDIDATE` and presented for optional confirmation **strictly after the rider has come to a complete stop and ended the ride**.

---

## 4. Evidence-Backed Hazard Trust Lifecycle

RoadSense tracks hazards through an 8-stage verification lifecycle with transparent evidence weighting:

* `NEWLY_REPORTED`: Initial stationary rider report logged with GPS coordinates.
* `UNDER_REVIEW`: Triaged by community or operations queue.
* `COMMUNITY_CORROBORATED`: Confirmed by independent commuter votes on the Live Map.
* `RECENTLY_CONFIRMED`: Fresh rider signal received within the active freshness window.
* `DISPUTED`: Conflicting commuter votes recorded.
* `STALE_NEEDS_RECONFIRMATION`: Exceeded confirmation interval (24h for waterlogged, 7d for potholes). **Preserved with full history — never assumed safe or resolved automatically.**
* `RESOLUTION_SUBMITTED`: Municipal work order completed with contractor repair notes.
* `CONFIRMED_RESOLVED`: Commuter verification confirms repair is durable and road is level.

---

## 5. Honest Technical Status & Disclaimers

### Road Photo Inspection (`/app/roadscan`)
* **Status:** Illustrative classification — actual model inference not connected.
* **Distress Samples:** The benchmark SVG assets in `public/samples/` are illustrative vector diagrams demonstrating the international RDD2022 taxonomy classes (D40 Pothole, D20 Alligator Cracks, D00 Longitudinal Cracks, D10 Transverse Cracks). They are not road photographs.
* **Heuristic Processing:** Client-side luminance and gradient calculations execute locally with measured elapsed execution time (no fabricated sleep delays or artificial confidence percentages).
* **Human-in-the-Loop:** User review and confirmation is mandatory before attaching distress tags to a report.

### RoadSense Operations (`/admin/*`)
* **Status:** Demonstration workspace — no official BBMP integration.
* Provides a mock municipal operations interface for incident triage, duplicate report clustering, work order tracking, and dataset export.

---

## 6. Exact Route Inventory

### Public Marketing Routes
* `/` — Product Landing Page with embedded working Bengaluru Leaflet map.
* `/about` — Hackathon problem statement alignment and mission.
* `/how-it-works` — 4-stage lifecycle: Detect ➔ Verify ➔ Warn ➔ Resolve.
* `/safety` — Stationary-first reporting policy and zero-distraction riding rules.
* `/login` — Sign in and demo role selection.
* `/signup` — Commuter network registration.

### Rider Application Shell
* `/app` — Rider Dashboard with active region telemetry and nearby hazard map.
* `/app/map` — Full-page Live Road Hazard Map with unclashed controls and incident sheet.
* `/app/report` — Stationary 5-step hazard reporting form with photo upload and GPS.
* `/app/roadscan` — RDD2022 Road Photo Inspection workbench.
* `/app/ride` — Passive Ride Mode with audio alerts and post-ride candidate review.
* `/app/routes` — Corridor hazard anticipation along commuter transit paths.
* `/app/alerts` — Real-time notification and hazard alert history.
* `/app/my-reports` — Commuter contribution record and repair tracking.
* `/app/profile` — Rider profile and demonstration account switcher.
* `/app/settings` — Notification preferences and lookahead distance settings.

### Authority Operations Workspace
* `/admin` — Operations overview and active hazard triage KPIs.
* `/admin/map` — Municipal Geographic Intelligence heatmap.
* `/admin/reports` — Verification queue and bulk duplicate report merging.
* `/admin/hazards/:id` — Hazard inspection worksheet and contractor repair sign-off.
* `/admin/analytics` — Ward condition breakdown and CSV dataset export.
* `/admin/automation` — n8n workflow management and on-demand freshness cron execution.
* `/admin/users` — Contributor roster and authority roles.
* `/admin/settings` — Dispatch thresholds and municipal SLA configuration.

---

## 7. Repeatable Automated Testing

The project includes three automated testing scripts executed against Google Chrome using `puppeteer-core`:

```bash
# 1. Audit all 24 registered routes (checks HTTP 200, headings, 0 console errors)
npm run test:routes

# 2. Fast smoke test (checks landing tiles, dashboard, report submission, persistence, mobile bar)
npm run test:smoke

# 3. Master Chrome E2E Suite (multi-viewport testing, DOM inspection, screenshot captures)
npm run test:e2e

# 4. Production build check (TypeScript strict mode + Vite bundler)
npm run build
```

---

## 8. n8n Automation Workflows

Pre-configured workflow JSON files are committed in `n8n/workflows/`:
1. `roadsense_new_hazard_report_processor.json`: Ingests citizen reports, runs duplicate clustering, and dispatches high-risk alerts.
2. `roadsense_hazard_freshness_reconfirmation.json`: Scheduled 2:00 AM cron evaluating hazard age and flagging stale records.
3. `roadsense_resolution_followup.json`: Municipal repair follow-up workflow.

To stream to a live instance, set `VITE_N8N_WEBHOOK_URL` in `.env`. When unset, all workflow actions run seamlessly in local browser simulation mode.

---

## 9. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/Kushh-Santhosh/Roadsense.git
cd Roadsense

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Open in browser: http://localhost:5173/
```

---

## License

Developed as an innovative prototype for the T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge.  
Map cartography © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors under ODbL.

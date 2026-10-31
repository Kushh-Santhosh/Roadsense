# RoadSense — AI Road Hazard Detection, Reporting & Early Warning Platform

> **"Know the road before it surprises you."**

---

### Hackathon Challenge Alignment
* **Launchpad:** T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge
* **Sub-Domain:** Road Safety and Human Centric Mobility
* **Sub-Category:** Road Conditions & Street Hazards
* **Target Persona:** Daily Two-Wheeler Commuters & Urban Delivery Riders
* **Official HMW:** *"How might we help riders anticipate and safely navigate unexpected road hazards?"*

---

## 1. Product Overview

**RoadSense** is an AI-assisted, community-driven road hazard intelligence and early-warning platform designed specifically for daily motorcycle and scooter riders.

In dense urban environments like Bengaluru, unexpected road defects—including deep potholes, fractured asphalt, damaged stormwater drain covers, unbarricaded construction, and **monsoon waterlogged streets concealing submerged craters**—force two-wheeler riders into sudden braking or dangerous swerves into adjacent traffic lanes.

RoadSense delivers collective foresight: combining smartphone GPS, high-frequency motion sensor telemetry, RDD2022 computer vision analysis, an evidence-backed 8-stage trust system, and passive voice warnings so riders can keep their **eyes on the road and hands on the handlebars**.

---

## 2. Real-World Bengaluru Problem & Waterlogged Roads

Two-wheelers account for over 70% of urban vehicular traffic in India. Bengaluru riders face distinctive challenges that RoadSense addresses directly:

1. **Waterlogged Roads & Hidden Surface Hazards:** Stagnant monsoon rainwater conceals road depth and condition. A puddle may cover a shallow depression, a deep crater, a dislodged manhole, or an eroded curb edge.
   * **Honest Representation of Uncertainty:** RoadSense never presumes a pothole exists under every puddle.
   * **Dedicated Category:** `WATERLOGGED_ROAD` with optional label `POTENTIALLY_HIDDEN_SURFACE_HAZARD`.
   * **Calm Rider Warning:** *"Waterlogged road ahead. Road surface may be uneven. Proceed cautiously."*
   * **Accelerated Freshness Window:** Waterlogged conditions expire after **24 hours** without fresh confirmation, whereas physical structural defects remain active for 7 days before requiring reconfirmation.
2. **Pothole Impacts & Skids:** Striking an unseen 4-inch asphalt cavity at 40 km/h causes front-wheel rim deformation, handlebar jarring, and loss of steering control.
3. **Involuntary Swerving:** Veering to dodge sudden road defects forces riders into the path of larger vehicles.
4. **Rider Attention Budget:** A rider cannot look at a screen or tap buttons while riding. Early warnings must be **passive, audible, and haptic**.

---

## 3. Passive Warning Philosophy: "Eyes on the Road"

A core architectural principle of RoadSense: **The rider should not have to look at the phone while moving.**

### How Passive Ride Mode Works (`/app/ride`)
1. **Calm Voice Warnings (Web Speech API):** Audible, concise announcements (e.g. *"Waterlogged road ahead"*, *"Pothole reported ahead"*), pre-tested with clear browser speech synthesis.
2. **Haptic Vibration Feedback (Navigator Vibration API):** Distinct vibration pulse sequences alert the rider through the smartphone handlebar mount or jacket pocket.
3. **Session-Based Deduplication:** Warnings are announced **only once per hazard ID per ride session**, preventing repetitive spam.
4. **Adjustable Lookahead Distance:** Configurable alert radius (75m, 120m, 180m, 250m) tailored for urban traffic vs. arterial bypass speeds.
5. **High-Contrast Active Cockpit:** The moving screen displays only essential telemetry ("EYES ON THE ROAD", cruising speed, latest alert banner, and a large "END RIDE" button).
6. **No Moving Interactions:** Bump candidates detected by the accelerometer are stored as `SENSOR_CANDIDATE` and presented for optional confirmation **strictly after the rider has come to a complete stop and ended the ride**.

---

## 4. Evidence-Backed Road Hazard Trust System

RoadSense replaces arbitrary confidence percentages with an evidence breakdown and an immutable audit timeline:

### The 8 Canonical Verification Stages
```
  [NEWLY_REPORTED] ────► [UNDER_REVIEW] ────► [COMMUNITY_CORROBORATED] ────► [RECENTLY_CONFIRMED]
         │                                               │
         ▼                                               ▼
     [DISPUTED]                             [STALE_NEEDS_RECONFIRMATION]
                                                         │
                                                         ▼
                                            [RESOLUTION_SUBMITTED]
                                                         │
                                                         ▼
                                            [CONFIRMED_RESOLVED]
```

1. `NEWLY_REPORTED`: Single initial citizen report with GPS and photo.
2. `UNDER_REVIEW`: Awaiting initial corridor corroboration or municipal review.
3. `COMMUNITY_CORROBORATED`: Confirmed by multiple independent unique riders.
4. `RECENTLY_CONFIRMED`: Corroborated within the freshness window (last 24h for water, last 7 days for potholes).
5. `DISPUTED`: Marked incorrect or disputed by riders/inspectors.
6. `STALE_NEEDS_RECONFIRMATION`: Hazard has exceeded its freshness window without recent confirmation.
7. `RESOLUTION_SUBMITTED`: Municipal maintenance crew has submitted completion remarks and proof URL.
8. `CONFIRMED_RESOLVED`: Verified patched and audited; marker turns green.

### Distinct Evidence Breakdown
Each hazard card and detail view displays:
* **AI Suggestion:** Class (D40/D20/D00/D10) and computer vision inference confidence.
* **Independent Rider Confirmations:** Strict unique user deduplication (repeat votes by the same rider are rejected).
* **Photo Proof Indicator:** Validated photographic evidence.
* **Sensor Acceleration Peaks:** Count of accelerometer vertical jerk candidates recorded near this coordinate.
* **Last Confirmed Timestamp:** Relative age since the last confirmation.
* **Trust Journey Timeline:** Chronological, immutable history of every status transition, citizen report, and authority sign-off.

---

## 5. n8n Cloud Pro Automation Integration (v2.45.7)

RoadSense includes three production-ready n8n workflow exports in `n8n/workflows/`:

| Workflow File | Trigger Mode | Purpose & Behavior |
|---------------|--------------|---------------------|
| `roadsense_new_hazard_report_processor.json` | Webhook (`POST`) | Ingests citizen reports, validates GPS payload, enforces idempotency (`eventId`), tags waterlogged road hazards, and sets canonical status to `NEWLY_REPORTED`. |
| `roadsense_hazard_freshness_reconfirmation.json` | Schedule (`0 2 * * *`) | Daily 2:00 AM cron evaluating hazard age. Flags waterlogged roads older than 24h and potholes older than 7 days as `STALE_NEEDS_RECONFIRMATION`. |
| `roadsense_resolution_followup.json` | Authority Action | Audits contractor repairs, validates post-repair photo proof URLs and remarks, upgrades status to `CONFIRMED_RESOLVED`, and logs immutable audit trail. |

### Integration Architecture
* **Sandboxed by Default:** The prototype runs completely offline with simulated executions and a manual "Run Freshness Cron" trigger at `/admin/automation`.
* **Live n8n Cloud Pro Ready:** Supply `VITE_N8N_WEBHOOK_URL` and `VITE_N8N_API_KEY` in `.env` to stream live events directly to your n8n instance.
* **Execution Telemetry:** All workflow executions (webhook and schedule) are recorded with duration in milliseconds, payload summaries, and status badges in the **Authority Automation Console** (`/admin/automation`).

---

## 6. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROADSENSE PLATFORM                              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
┌───────────────┐           ┌─────────────────┐           ┌───────────────────┐
│  RIDER SUITE  │           │   AI & SENSOR   │           │   AUTHORITY HUB   │
│               │           │    TELEMETRY    │           │                   │
│ • Live OSM Map│           │ • RDD2022 Vision│           │ • Heatmap GIS     │
│ • 20s Fast Rep│           │ • MobileNetV3   │           │ • Queue Triage    │
│ • Voice Alerts│           │ • DeviceMotion  │           │ • n8n Automation  │
│ • My Reports  │           │ • Jerk Analyzer │           │ • Audit Logs      │
│ • Ride Cockpit│           │ • Candidate Q   │           │ • CSV Export      │
└───────┬───────┘           └────────┬────────┘           └─────────┬─────────┘
        │                            │                              │
        └────────────────────────────┼──────────────────────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │    PERSISTENT DATA LAYER    │
                      │  • Schema v2 Storage Engine │
                      │  • 8-Stage Trust Timeline   │
                      │  • Haversine Spatial Cluster│
                      │  • Freshness Expiry Monitor │
                      └──────────────┬──────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    n8n AUTOMATION ENGINE    │
                      │  • Report Ingestion Hook    │
                      │  • 2:00 AM Freshness Cron   │
                      │  • Repair Resolution Audit  │
                      └─────────────────────────────┘
```

---

## 7. Technology Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling & Design System:** Tailwind CSS (Custom automotive mobility palette: Deep Navy `#142536`, Warm White `#F8FAFC`, Road Orange `#F28C28`, Hazard Red `#D94B45`)
* **Geospatial Mapping:** Leaflet 1.9, React-Leaflet, OpenStreetMap raster tiles
* **Audio & Haptics:** Web Speech API (`speechSynthesis`) and Browser Vibration API (`navigator.vibrate`)
* **Routing & Corridors:** Open Source Routing Machine (OSRM) driving API with corridor buffer analysis (strictly advisory early-warning language)
* **AI Computer Vision:** Client-side HTML5 Canvas pixel gradient & luminance variance analyzer aligned with RDD2022 taxonomy
* **Sensor Detection:** Browser `DeviceMotion` 3-axis accelerometer and Geolocation APIs
* **Automation:** n8n Cloud Pro workflow specifications (v2.45.7) with execution logger
* **Database & Persistence:** Schema v2 LocalStorage persistent engine with automatic migration from v1, plus full Supabase PostgreSQL schema (`supabase/migrations/`)

---

## 8. Installation & Local Development

### Prerequisites
* Node.js v18+ (tested on Node v26.4.0)
* npm v9+

### Steps
```bash
# Clone or enter repository directory
cd "climate hackathon"

# Install dependencies
npm install

# Run Vite development server
npm run dev

# Run production build & verify TypeScript compilation
npm run build
```

Open your browser at `http://localhost:5173/`.

---

## 9. Environment Configuration

Create a `.env` file in the root directory (see `.env.example`):

```bash
# n8n Cloud Pro Webhook (Optional - falls back to local execution logger)
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/roadsense-reports
VITE_N8N_API_KEY=your-n8n-api-key

# Supabase Configuration (Optional - falls back to persistent storage schema v2)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Map Tile Provider (OpenStreetMap raster tiles)
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors

# Routing Provider
VITE_OSRM_ROUTER_URL=https://router.project-osrm.org/route/v1/driving/
```

---

## 10. Complete Evaluator Demonstration Script

Follow this step-by-step walkthrough to inspect all key features:

### Step 1: Landing Page (`/`)
* Inspect the **T-Hub × MBRDI** problem alignment, the core lifecycle (`DETECT → VERIFY → WARN → RESOLVE`), and interactive Bengaluru preview.

### Step 2: Rider Dashboard (`/app`)
* Observe live incidents across Bengaluru (Hebbal, Indiranagar, Whitefield, KR Puram underpass, Marathahalli).
* Check the **Waterlogged Road warning banner** highlighting submerged hazard risks.

### Step 3: Live Hazard Map (`/app/map`)
* Filter by **"🌊 Waterlogged Road"** or **"🔴 Critical Hazard"**.
* Click the **KR Puram Railway Underpass** pin: see the `WaterlogHazardWarningPill` ("Road surface depth and condition cannot be seen; proceed cautiously"), independent confirmations, and photo proof.
* Click **"Locate Me"** to trigger live browser GPS telemetry.

### Step 4: Report a Hazard in 20s (`/app/report`)
* Notice the prominent safety reminder: *"Pull over and stop safely before filing a report."*
* Select **"Waterlogged Road"**: notice the uncertainty checkbox automatically selected.
* Upload a photo or select an RDD2022 sample to trigger AI damage classification.
* Submit the report: watch it log in storage, update community trust (+30 points), and trigger n8n report ingestion.

### Step 5: Distraction-Free Ride Mode (`/app/ride`)
* Review the lookahead distance slider (120m default).
* Test the Web Speech voice preview ("Voice Preview: Road hazard ahead").
* Click **"Demo Simulation"** (Bengaluru Outer Ring Road, 20s ride):
  * Watch the cockpit enter **distraction-free mode ("EYES ON THE ROAD")**.
  * Listen to the passive voice alerts as the bike approaches KR Puram underpass waterlogging and Hebbal potholes.
  * Feel/see the haptic vibration trigger.
  * Notice the accelerometer bump spike flagged as a `SENSOR_CANDIDATE`.
  * After the ride stops, inspect the candidate event review queue and warning history.

### Step 6: Corridor Early-Warning Route (`/app/routes`)
* Select the **"Hebbal to Indiranagar"** arterial route.
* See the OSRM route line with corridor hazards sorted by distance.
* Notice the sequential countdown banner to the next upcoming hazard (e.g. *Next hazard in 1.2 km: Waterlogged Road*).
* Verify strictly advisory language (never "100% safe route").

### Step 7: Authority Operations Center (`/admin`)
* Switch portal to **Authority Mode**.
* View live KPIs: total reports, active hazards, critical count, crowd-verified consensus, resolved count, and average verification time (2.4 hrs).

### Step 8: Triage Queue & Duplicate Merging (`/admin/reports`)
* Filter by any of the **8 canonical verification statuses** or by **Waterlogged Road**.
* Check multiple nearby reports and click **"Merge Selected as Duplicates"**.
* Open **"Inspect"** on any hazard (`/admin/hazards/:id`):
  * View the full **Hazard Trust Timeline** and evidence breakdown.
  * Update canonical stage (e.g. from `UNDER_REVIEW` to `COMMUNITY_CORROBORATED` or `CONFIRMED_RESOLVED`).
  * Add contractor repair notes and photo proof URL.

### Step 9: n8n Cloud Pro Automation Console (`/admin/automation`)
* Inspect the 3 production workflows with their JSON export paths.
* Click **"Run Freshness Cron"**: watch it evaluate active hazards on-demand, flag stale records, and append a live execution log row.
* Click **"Test Report Webhook"** to simulate an automated report triage dispatch.

### Step 10: Analytics & CSV Dataset Export (`/admin/analytics`)
* Inspect locality distribution charts, severity breakdown, and ward resolution statistics.
* Click **"Export Incident Dataset (CSV)"** to download the complete road hazard database.

---

## 11. Connected Vehicle & OEM Roadmap (MBRDI Vision)

RoadSense is architected for bidirectional automotive integration:
1. **Two-Wheeler Companion Apps:** Pairing with smartphone companion apps (Ather, TVS SmartXonnect, Royal Enfield Tripper) to display turn-by-turn hazard icons on instrument clusters.
2. **Helmet Intercoms:** Low-latency Bluetooth audio announcements (Sena, Cardo) alerting riders 150m before critical pavement hazards.
3. **Commercial Delivery Fleets:** Equipping Swiggy, Zomato, and Porter delivery fleets with passive cameras to update road condition heatmaps daily.
4. **OEM Connected Cars (MBRDI Vision):** Integration into connected car head units (e.g. Mercedes-Benz MBUX Road Surface Information system) for bidirectional hazard exchange between two-wheelers and passenger vehicles.
5. **Municipal Work Orders:** Open API integration with BBMP / Smart Cities platforms for automated contractor work order generation and repair SLA verification.

---

## License

Developed as an innovative prototype for the **T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge**.  
Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors under ODbL.

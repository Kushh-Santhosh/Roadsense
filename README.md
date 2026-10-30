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

**RoadSense** is a community-driven, AI-assisted road safety intelligence platform designed specifically for daily motorcycle and scooter riders. 

In urban environments like Bengaluru, unexpected road defects—including deep potholes, cracked asphalt, missing or sunken stormwater drain covers, and unmarked excavation trenches—force two-wheeler riders into sudden braking or dangerous swerves into adjacent traffic lanes. 

RoadSense delivers collective foresight: combining smartphone GPS, high-frequency motion sensor telemetry, RDD2022 computer vision analysis, community verification, and corridor-based routing to warn riders of critical hazards before they reach them.

---

## 2. Problem Statement & Reality for Riders

Two-wheelers account for over 70% of urban vehicular traffic in India. Unlike passenger cars with four-wheel stability and enclosed cockpits:
1. **Pothole Impacts & Skids:** Striking an unseen 4-inch asphalt depression at 40 km/h causes front-wheel rim deformation, sudden handlebar jarring, and loss of steering control.
2. **Involuntary Swerving:** Attempting to avoid a sudden road defect forces riders to veer sharply into buses, trucks, or cars.
3. **Hidden Waterlogged Craters:** Stagnant monsoon rainwater conceals hazardous depressions, making them invisible after dusk.
4. **Delayed Municipal Triage:** Road maintenance departments lack localized, high-resolution condition telemetry, resulting in repair delays.

---

## 3. Solution Architecture

RoadSense consists of three unified experiences operating on a synchronized data layer:

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
│ • Voice Alerts│           │ • DeviceMotion  │           │ • Audit Logs      │
│ • My Reports  │           │ • Jerk Analyzer │           │ • CSV Export      │
└───────┬───────┘           └────────┬────────┘           └─────────┬─────────┘
        │                            │                              │
        └────────────────────────────┼──────────────────────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │    PERSISTENT DATA LAYER    │
                      │  • Supabase PostgreSQL / RLS│
                      │  • LocalStorage Seed Fallback│
                      │  • Spatial Haversine Cluster │
                      │  • Dynamic Confidence Engine│
                      └─────────────────────────────┘
```

1. **Rider Application:** Intuitive mobile-first portal featuring interactive OpenStreetMap tracking, 20-second fast hazard reporting, community upvoting, and historical status tracking.
2. **RoadScan AI & Sensor Telemetry:** Automated road distress analysis using RDD2022 benchmark computer vision and real-time DeviceMotion accelerometer spike detection.
3. **Authority Operations Center:** Municipal dispatch triage, duplicate incident clustering, repair sign-off worksheets, locality incident density analytics, and dataset CSV export.

---

## 4. Technology Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling & Design System:** Tailwind CSS (Custom automotive mobility palette: Deep Navy `#142536`, Warm White `#F8FAFC`, Road Orange `#F28C28`, Hazard Red `#D94B45`)
* **Geospatial Mapping:** Leaflet 1.9, React-Leaflet, OpenStreetMap raster tiles
* **Routing & Corridors:** Open Source Routing Machine (OSRM) driving API with corridor buffer analysis
* **AI Computer Vision:** Client-side HTML5 Canvas pixel gradient & luminance variance analyzer aligned with RDD2022 taxonomy (MobileNetV3 ONNX pipeline architecture)
* **Sensor Detection:** Browser `DeviceMotion` 3-axis accelerometer and Geolocation APIs
* **Analytics & Visualizations:** Recharts (Responsive bar, pie, and line charts)
* **Icons:** Lucide React
* **Backend & Database:** Supabase (PostgreSQL 15+, Row Level Security, Storage, Realtime) with automatic zero-configuration localStorage persistent seed fallback

---

## 5. Installation & Local Development

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

## 6. Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```bash
# Supabase Configuration (Optional - falls back to persistent local storage with full functionality)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Map Tile Provider (OpenStreetMap raster tiles)
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors

# Routing Provider
VITE_OSRM_ROUTER_URL=https://router.project-osrm.org/route/v1/driving/

# Environment Mode
VITE_APP_ENV=development
VITE_DEMO_MODE=true
```

---

## 7. Database Setup (Supabase)

To link an external Supabase instance:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in the Supabase Dashboard.
3. Run the complete migration script provided at:
   `supabase/migrations/20261031_roadsense_init.sql`
4. This creates all 12 tables (`profiles`, `hazards`, `hazard_reports`, `hazard_confirmations`, `hazard_media`, `ride_sessions`, `sensor_events`, `route_alerts`, `notifications`, `admin_assignments`, `resolution_records`, `audit_logs`) and configures Row Level Security (RLS) policies.

---

## 8. AI Model Integration & Research References

RoadSense was designed after inspecting real-world road damage datasets and architectures:
* **RDD2022 Road Damage Dataset:** [Sekilab/RoadDamageDetector](https://github.com/sekilab/RoadDamageDetector) & [556-wangbiao/rddc](https://github.com/556-wangbiao/rddc)
* **Indian Road Hazard Detection:** [VivekVagale/road-hazard](https://github.com/VivekVagale/road-hazard)

### Supported RDD2022 Distress Classes:
| Class Code | Damage Description | Automotive Risk Level | Repair Method |
|------------|--------------------|-----------------------|---------------|
| **D40** | Pothole / Structural Depression | 🔴 Critical Hazard | Bituminous hot-mix / cold patch |
| **D20** | Alligator Cracking (Fatigue Failure) | 🟠 High-Risk | Mill 40mm wearing layer & overlay |
| **D00** | Longitudinal Crack (Wheelpath) | 🟠 High-Risk | Seal with rubberized bitumen |
| **D10** | Transverse Crack (Cross-Carriageway) | 🟡 Moderate | Clean & route elastomer sealant |

The **RoadScan AI** page (`/app/roadscan`) includes 4 preloaded RDD2022 benchmark test samples, rendering bounding boxes `[ymin, xmin, ymax, xmax]`, latency in milliseconds, and model confidence scores.

---

## 9. Smartphone Sensor-Based Bump Detection & Limitations

### How Ride Mode Operates
1. Calibrates device vertical baseline gravity ($g \approx 9.81\text{ m/s}^2$).
2. Reads 3-axis accelerometer values ($X, Y, Z$) and calculates deviation $\Delta Z = |Z - 9.81|$.
3. Applies a speed filter ($v \ge 12\text{ km/h}$) to suppress false positives caused by handling or braking when stationary.
4. If $\Delta Z > 12.0\text{ m/s}^2$, flags a candidate bump event with GPS coordinates.

### Technical Limitations & Honesty:
* **No Automatic Publishing:** A sudden acceleration event is **not** definitive proof of a pothole (e.g. speed bumps, bridge joints, curb hops). Sensor events are kept in an *unreviewed candidate queue* for rider review after stopping.
* **Hardware Variance:** Sensor fidelity depends on phone mounting rigidity (handlebar clamp vs. pocket).
* **Browser Sandbox:** Background accelerometer capture is constrained by browser security policies when the screen is locked.
* **Demonstration Simulation Mode:** To evaluate without a physical motorbike, the app includes a **1-click simulated ride on Bengaluru Outer Ring Road** with live speed and bump spikes!

---

## 10. Demonstration Guide for Evaluators & Judges

### Step-by-Step Test Script:
1. **Landing Page (`/`):** Inspect value proposition, HMW problem alignment, and interactive OSM preview.
2. **Rider Dashboard (`/app`):** View live Bengaluru incidents across Hebbal, Indiranagar, Whitefield, KR Puram, and Electronic City.
3. **Live Road Hazard Map (`/app/map`):** Test severity filters (Critical 🔴, High 🟠, Moderate 🟡, Resolved 🟢), search localities, and test the "Locate Me" GPS button.
4. **Report a Hazard in 20s (`/app/report`):** Upload an image or capture a photo, watch GPS auto-populate, select from 11 categories, and submit.
5. **RoadScan AI Inspector (`/app/roadscan`):** Click the 4 RDD2022 benchmark samples to watch real-time bounding box detection, or upload a custom image.
6. **Ride Mode (`/app/ride`):** Click **"Demo Simulation"** to watch live speedometer climbing to 46 km/h, hit simulated pothole bumps, and review candidate events.
7. **Route Warnings (`/app/routes`):** Select the "Hebbal to Indiranagar" corridor. See hazards filtered within 80m of the polyline and listen to spoken Web Speech voice alerts.
8. **Authority Dashboard (`/admin`):** Switch portal to Authority Mode, view live KPIs, check the heatmap (`/admin/map`), triage queue (`/admin/reports`), merge duplicates, and inspect `/admin/analytics` to export the complete incident dataset as a CSV file.

---

## 11. Known Limitations

* **GPS Accuracy:** Urban canyoning between high-rise buildings can introduce $\pm 10\text{m}$ coordinate drift.
* **Ambient Lighting:** Vision-based pothole detection accuracy decreases in nighttime images without supplemental motorcycle headlights.
* **Browser Geolocation Battery:** High-frequency GPS tracking consumes device battery over prolonged rides.

---

## 12. Future Connected Vehicle Integration Roadmap

RoadSense is architected for eventual integration into automotive OEM ecosystems:

1. **Two-Wheeler Companion Apps:** Pairing with smartphone companion apps (Ather, TVS SmartXonnect, Royal Enfield Tripper) to display turn-by-turn hazard icons on instrument clusters.
2. **Helmet Intercoms:** Low-latency Bluetooth audio announcements (Sena, Cardo) alerting riders 150m before critical pavement hazards.
3. **Commercial Fleet Telematics:** Equipping Swiggy, Zomato, and Porter delivery fleets with passive cameras to update road condition heatmaps daily.
4. **OEM Connected Cars (MBRDI Vision):** Integration into connected car head units (e.g. Mercedes-Benz MBUX Road Surface Information system) for bidirectional hazard exchange between two-wheelers and passenger vehicles.
5. **Municipal Work Orders:** Open API integration with BBMP / Smart Cities mission platforms for automated contractor work order generation and repair SLA verification.

---

## License

Developed as an innovative prototype for the **T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge**.  
Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors under ODbL.

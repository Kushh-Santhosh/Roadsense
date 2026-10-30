import React from 'react';
import { Camera, Activity, Navigation, Users, CheckCircle2, Shield, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-warm-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            System Workflow & Algorithms
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-navy tracking-tight">
            How RoadSense Works
          </h1>
          <p className="text-base text-brand-slate max-w-2xl mx-auto leading-relaxed">
            A step-by-step breakdown of how smartphone sensors, community verification, AI vision, and route warnings operate together.
          </p>
        </div>

        {/* Step 1 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-subtle flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange/15 text-brand-orange flex items-center justify-center flex-shrink-0 text-xl font-black">
            01
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-brand-navy">Fast 20-Second Hazard Reporting</h3>
            <p className="text-xs text-brand-slate leading-relaxed">
              When a rider pulls over safely, they can capture or upload a road damage photograph. RoadSense automatically acquires high-accuracy GPS coordinates, matches the location against 11 supported hazard categories (potholes, road cracks, open manholes, damaged grates, waterlogging, etc.), and uploads the incident to the community network.
            </p>
            <div className="text-[11px] text-brand-navy font-semibold bg-brand-warm-white p-3 rounded-xl border border-brand-neutral-grey">
              Duplicate Detection: If another report exists within a 60-meter radius describing the same hazard, RoadSense groups the reports under a single parent record to prevent map clutter.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-subtle flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 text-xl font-black">
            02
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-brand-navy">RoadScan AI Image Analysis</h3>
            <p className="text-xs text-brand-slate leading-relaxed">
              Built on the open-source Road Damage Dataset (RDD2022) standard. The vision pipeline inspects asphalt luminance variance, surface shadow depressions, and fissure orientation to classify damage into standard categories:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-brand-navy font-semibold pt-1">
              <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">D40: Pothole</div>
              <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">D20: Alligator Cracks</div>
              <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">D00: Longitudinal Crack</div>
              <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">D10: Transverse Crack</div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-subtle flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 text-xl font-black">
            03
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-brand-navy">Sensor-Based Bump Telemetry</h3>
            <p className="text-xs text-brand-slate leading-relaxed">
              During active Ride Mode, the browser reads high-frequency 3-axis accelerometer data (`devicemotion`). A sudden vertical jerk spike (|Z - 9.81| &gt; 12 m/s²) occurring above cruising speed (15 km/h) flags a candidate impact event. Candidates are saved locally and presented for the rider to review after they stop.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-subtle flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-xl font-black">
            04
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-brand-navy">Route Corridor Early Warning Engine</h3>
            <p className="text-xs text-brand-slate leading-relaxed">
              Using OSRM routing geometry, RoadSense calculates an 80-meter spatial corridor around the planned commute. Every verified hazard inside the corridor is ordered by kilometer distance, alerting the rider with visual warnings and optional speech synthesis so they never get surprised by a crater around a blind curve.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/app/map"
            className="px-6 py-3 rounded-2xl bg-brand-orange text-white font-bold text-xs hover:bg-brand-orange-hover shadow-subtle transition-all"
          >
            Explore the Live Application
          </Link>
        </div>
      </div>
    </div>
  );
};

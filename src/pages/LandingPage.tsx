import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeafletMap } from '../components/LeafletMap';
import { StorageService } from '../services/storageService';
import { Hazard } from '../types';
import {
  MapPin,
  AlertTriangle,
  ArrowRight,
  Shield,
  Eye,
  CheckCircle2,
  Volume2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);

  useEffect(() => {
    setHazards(StorageService.getHazards());
  }, []);

  return (
    <div className="min-h-screen bg-brand-warm-white font-sans text-brand-navy">
      {/* 1. Hero Section */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 bg-white border-b border-brand-neutral-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Context Sub-Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-brand-slate text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-orange" />
              <span>Two-Wheeler Road Safety Intelligence</span>
            </div>

            {/* Core Product Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight">
              Know the road <br className="hidden sm:inline" />
              <span className="text-brand-orange">before it surprises you.</span>
            </h1>

            {/* Problem Statement for Riders */}
            <p className="text-sm sm:text-base text-brand-slate leading-relaxed max-w-2xl mx-auto font-normal">
              In dense cities like Bengaluru, unexpected potholes, open drains, and monsoon waterlogged streets force daily two-wheeler riders into sudden braking and dangerous swerves. RoadSense provides collective road foresight so riders can anticipate hazards before reaching them.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/app"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
              >
                <span>Explore RoadSense</span>
                <ArrowRight className="w-4 h-4 text-brand-orange" />
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-brand-neutral-grey hover:bg-slate-50 text-brand-navy font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>How It Works</span>
              </Link>
            </div>
          </div>

          {/* 2. Embedded Working Bengaluru Demonstration Map */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl overflow-hidden border border-brand-neutral-grey shadow-card bg-white">
            <div className="p-3.5 bg-brand-navy text-white text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Bengaluru Road Hazard Intelligence Grid (Live Preview)</span>
              </div>
              <Link
                to="/app/map"
                className="text-brand-orange hover:underline text-xs flex items-center gap-1 font-bold"
              >
                <span>Open Full Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-80 sm:h-[440px] w-full flex flex-col">
              <LeafletMap
                hazards={hazards}
                center={[12.9716, 77.5946]}
                zoom={12}
                height="100%"
                showFilters={false}
              />
            </div>

            <div className="p-3 bg-brand-warm-white border-t border-brand-neutral-grey flex flex-col sm:flex-row sm:items-center justify-between text-xs text-brand-slate gap-2">
              <div>
                Displaying <strong>{hazards.length} demonstration road hazards</strong> across Outer Ring Road, Hebbal, Indiranagar, and Whitefield.
              </div>
              <Link to="/app/report" className="text-brand-orange hover:underline font-bold">
                + Report a hazard at your location &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4-Stage Lifecycle: Detect -> Verify -> Warn -> Resolve */}
      <section className="py-16 bg-brand-warm-white border-b border-brand-neutral-grey">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Hazard Lifecycle
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              How collective road intelligence operates
            </h3>
            <p className="text-xs sm:text-sm text-brand-slate">
              From an initial rider report or sensor detection to timely commuter warnings and municipal resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Stage 1 */}
            <div className="bg-white p-5 rounded-2xl border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="text-xs font-black text-brand-orange uppercase tracking-wider">
                01 • Detect
              </div>
              <h4 className="font-bold text-sm text-brand-navy">Rider Reports & Sensor Jolts</h4>
              <p className="text-xs text-brand-slate leading-relaxed">
                Riders capture stationary photos or passive motion sensors register significant vertical impacts along common commuting routes.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="bg-white p-5 rounded-2xl border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="text-xs font-black text-brand-orange uppercase tracking-wider">
                02 • Verify
              </div>
              <h4 className="font-bold text-sm text-brand-navy">Community Corroboration</h4>
              <p className="text-xs text-brand-slate leading-relaxed">
                Subsequent riders confirm hazard presence with one-tap votes. Stale reports decay after 24 hours (waterlogged) or 7 days (asphalt).
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-white p-5 rounded-2xl border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="text-xs font-black text-brand-orange uppercase tracking-wider">
                03 • Warn
              </div>
              <h4 className="font-bold text-sm text-brand-navy">Ahead-of-Time Audio Alerts</h4>
              <p className="text-xs text-brand-slate leading-relaxed">
                Calm voice announcements alert riders 150m ahead of verified craters, allowing safe deceleration without abrupt lane changes.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="bg-white p-5 rounded-2xl border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="text-xs font-black text-brand-orange uppercase tracking-wider">
                04 • Resolve
              </div>
              <h4 className="font-bold text-sm text-brand-navy">Audited Work Order Closure</h4>
              <p className="text-xs text-brand-slate leading-relaxed">
                Municipal maintenance crews mark repairs complete with contractor notes. The status shifts to Confirmed Resolved after community validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Practical Bengaluru Road Conditions */}
      <section className="py-16 bg-white border-b border-brand-neutral-grey">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Real-World Focus
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Built for Bengaluru street conditions
            </h3>
            <p className="text-xs sm:text-sm text-brand-slate">
              Designed around the everyday risks faced by motorcycle and scooter commuters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey space-y-2">
              <div className="font-bold text-sm text-brand-navy flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                Waterlogged Roads
              </div>
              <p className="text-brand-slate leading-relaxed">
                Monsoon puddles conceal road depths. RoadSense warns: <em>"Waterlogged road ahead. Road surface may be uneven. Proceed cautiously."</em> without assuming an unverified pothole exists beneath every puddle.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey space-y-2">
              <div className="font-bold text-sm text-brand-navy flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                Severe Rim Traps
              </div>
              <p className="text-brand-slate leading-relaxed">
                Sudden 4-inch asphalt craters cause front-wheel rim deformation and loss of steering control at 40 km/h. Early warnings prevent sudden swerves into adjacent traffic lanes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey space-y-2">
              <div className="font-bold text-sm text-brand-navy flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Open Drains & Utility Trenches
              </div>
              <p className="text-brand-slate leading-relaxed">
                Damaged stormwater grates and unfinished fiber optic road cuts are accurately categorized and merged to eliminate duplicate reports along active corridors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Safety, Privacy & Zero Distraction Commitment */}
      <section className="py-14 bg-brand-warm-white border-b border-brand-neutral-grey">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Safety-First Philosophy
          </div>
          <h3 className="text-2xl font-bold text-brand-navy">
            Zero Distracted Riding
          </h3>
          <p className="text-xs sm:text-sm text-brand-slate leading-relaxed max-w-2xl mx-auto">
            Operating a phone while riding is illegal and dangerous. RoadSense enforces a stationary-only reporting policy. Passive Ride Mode operates entirely in the background, speaking calm alerts without requiring the rider to tap or look at a screen.
          </p>
          <div className="pt-2">
            <Link
              to="/safety"
              className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
            >
              <span>Read our Safety & Privacy Guidelines</span> &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Honest Demonstration Disclaimer */}
      <section className="py-8 bg-slate-100 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-brand-slate space-y-1">
          <div className="font-bold text-brand-navy">
            Demonstration Prototype • T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge
          </div>
          <p className="text-[11px]">
            Data shown represents synthetic Bengaluru corridor incident records for prototype evaluation. No official municipal integration is implied.
          </p>
        </div>
      </section>
    </div>
  );
};

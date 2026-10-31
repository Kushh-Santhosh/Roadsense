import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeafletMap } from '../components/LeafletMap';
import { StorageService } from '../services/storageService';
import { Hazard } from '../types';
import {
  Shield,
  Activity,
  Camera,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Compass,
  Users,
  Building2,
  Bike,
  Sparkles,
  Zap,
  Award,
  ChevronRight,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);

  useEffect(() => {
    setHazards(StorageService.getHazards());
  }, []);

  return (
    <div className="min-h-screen bg-brand-warm-white font-sans text-brand-navy overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-brand-soft-blue/60 via-brand-warm-white to-brand-warm-white border-b border-brand-neutral-grey/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Hackathon Alignment Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-xs font-bold tracking-wide uppercase shadow-subtle">
              <Award className="w-4 h-4 text-brand-orange" />
              <span>T-Hub Climate Tech Launchpad &bull; MBRDI Mobility Challenge</span>
            </div>

            {/* Official Tagline Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy tracking-tight leading-tight">
              Know the road <br className="hidden sm:inline" />
              <span className="text-brand-orange underline decoration-brand-orange/30">before it surprises you.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-brand-slate leading-relaxed max-w-2xl mx-auto font-normal">
              Real-time road intelligence, powered by people, location and AI. Detect hazards, share warnings and help make every journey safer for daily two-wheeler riders.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/app/map"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-extrabold text-sm sm:text-base shadow-elevated transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5 text-brand-orange" />
                <span>Explore Live Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/app/report"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm sm:text-base shadow-md shadow-brand-orange/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Report a Hazard (20s)</span>
              </Link>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-brand-slate font-medium flex-wrap">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>OpenStreetMap Native</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>RDD2022 Vision Model</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Zero Distracted Riding</span>
              </div>
            </div>
          </div>

          {/* Interactive Map Hero Preview Card */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-modal border-4 border-white bg-white">
            <div className="p-3 bg-brand-navy text-white text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Bengaluru Road Intelligence Grid (Interactive Preview)</span>
              </div>
              <Link to="/app/map" className="text-brand-orange hover:underline flex items-center gap-1">
                Open Fullscreen <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="h-80 sm:h-[440px] w-full flex flex-col">
              <LeafletMap
                hazards={hazards}
                center={[12.9719, 77.6412]}
                zoom={12}
                height="100%"
                showFilters={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem Statement Alignment */}
      <section className="py-20 bg-white border-b border-brand-neutral-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              The Reality for Two-Wheeler Commuters
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              &ldquo;How might we help riders anticipate and safely navigate unexpected road hazards?&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-brand-slate leading-relaxed">
              In urban India, potholes, uneven road surfaces, open drains, damaged manhole covers, and unbarricaded roadworks force two-wheeler riders to brake violently or swerve into oncoming traffic. RoadSense provides the collective foresight needed to prevent sudden swerving before it happens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-warm-white p-6 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-brand-navy">Unexpected Swerving</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Riders hitting potholes at 40 km/h face severe wheel rim deformation and involuntary swerves into adjacent heavy vehicular lanes.
              </p>
            </div>

            <div className="bg-brand-warm-white p-6 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-brand-navy">Hidden Waterlogged Craters</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Monsoon puddles conceal 8-inch road depressions. Without community warnings, two-wheeler tyres drop directly into invisible cavities.
              </p>
            </div>

            <div className="bg-brand-warm-white p-6 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-brand-navy">Crowd Verification Power</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Thousands of riders traverse the same corridors daily. By aggregating independent confirmations, road intelligence stays fresh within hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Core Pillars of RoadSense */}
      <section className="py-20 bg-brand-warm-white border-b border-brand-neutral-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Integrated Technology Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              How RoadSense Protects Every Mile
            </h2>
            <p className="text-sm text-brand-slate">
              Combining smartphone sensors, computer vision, spatial clustering, and authority triage into a single connected platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-white p-6 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-brand-navy">1. Fast 20s Reporting</h3>
                <p className="text-xs text-brand-slate leading-relaxed">
                  Stop-first reporting with automatic GPS geotagging, 11 road hazard categories, and photograph attachment in under 20 seconds.
                </p>
              </div>
              <Link to="/app/report" className="text-xs font-bold text-brand-orange flex items-center gap-1 hover:underline pt-2">
                Report a Hazard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-brand-navy">2. RoadScan AI Vision</h3>
                <p className="text-xs text-brand-slate leading-relaxed">
                  Client-side computer vision inspired by RDD2022 dataset benchmarks, identifying potholes (D40) and alligator cracks (D20) with bounding boxes.
                </p>
              </div>
              <Link to="/app/roadscan" className="text-xs font-bold text-purple-700 flex items-center gap-1 hover:underline pt-2">
                Launch RoadScan AI <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-brand-navy">3. Sensor Impact Telemetry</h3>
                <p className="text-xs text-brand-slate leading-relaxed">
                  Ride Mode reads vertical accelerometer jerk spikes to flag candidate bump events while moving, prompting review after stopping safely.
                </p>
              </div>
              <Link to="/app/ride" className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline pt-2">
                Explore Ride Mode <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white p-6 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-brand-navy">4. Early Warning Routing</h3>
                <p className="text-xs text-brand-slate leading-relaxed">
                  Corridor spatial analysis scans an 80-meter buffer along your route, delivering spoken voice alerts before you reach critical road craters.
                </p>
              </div>
              <Link to="/app/routes" className="text-xs font-bold text-blue-700 flex items-center gap-1 hover:underline pt-2">
                Plan Safe Route <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Connected Mobility Long-Term Vision */}
      <section className="py-20 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Future Connected Mobility Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              From Citizen Smartphone to Connected Vehicle Fleet
            </h2>
            <p className="text-sm sm:text-base text-brand-slate-light leading-relaxed">
              RoadSense begins as an accessible software prototype today, designed to evolve into an automotive road intelligence layer for future OEMs and mobility operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-brand-slate-light">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-2">
              <span className="font-bold text-brand-orange uppercase text-[10px]">Phase 1 (Today)</span>
              <h4 className="text-white font-bold text-base">Community & Smartphone</h4>
              <p>Rider crowdsourced reports, GPS tagging, and client-side RDD2022 AI vision inspection.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-2">
              <span className="font-bold text-brand-orange uppercase text-[10px]">Phase 2</span>
              <h4 className="text-white font-bold text-base">Two-Wheeler Companion Apps</h4>
              <p>Integration with scooter Bluetooth dashes, helmet intercoms, and companion navigation apps.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-2">
              <span className="font-bold text-brand-orange uppercase text-[10px]">Phase 3</span>
              <h4 className="text-white font-bold text-base">Fleet Dashcam Telematics</h4>
              <p>Commercial delivery bikes and vehicle-mounted cameras contributing passive road damage scans.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-2">
              <span className="font-bold text-brand-orange uppercase text-[10px]">Phase 4 (Long-Term)</span>
              <h4 className="text-white font-bold text-base">OEM Connected Vehicle Layer</h4>
              <p>Automotive road condition APIs for Mercedes-Benz and commercial fleets, with municipal maintenance integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Footer Banner */}
      <section className="py-16 bg-brand-warm-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-black text-brand-navy tracking-tight">
            Ready to experience RoadSense?
          </h2>
          <p className="text-sm text-brand-slate max-w-xl mx-auto">
            Try the rider dashboard, test AI vision detection with RDD2022 benchmark images, or explore the authority maintenance dispatch portal.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app"
              className="px-6 py-3 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all hover:scale-105"
            >
              Open Rider Application
            </Link>
            <Link
              to="/admin"
              className="px-6 py-3 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm shadow-subtle transition-all hover:scale-105"
            >
              Authority & Fleet Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};


import React from 'react';
import { Shield, AlertTriangle, Lock, EyeOff, CheckCircle2, PhoneOff, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SafetyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-warm-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Rider Protection & Privacy First
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-navy tracking-tight">
            Safety & Privacy Guidelines
          </h1>
          <p className="text-base text-brand-slate max-w-2xl mx-auto leading-relaxed">
            Our strict commitment to zero distracted riding, privacy preservation, and ethical road intelligence.
          </p>
        </div>

        {/* 1. Rider Safety Protocol */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-card space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center flex-shrink-0">
              <PhoneOff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Stop-First Operating Rule</h2>
              <p className="text-xs text-brand-slate">Never operate a phone while your vehicle is in motion</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-brand-slate leading-relaxed border-t border-brand-neutral-grey pt-4">
            <p>
              Operating a smartphone while riding a two-wheeler is illegal and extremely dangerous. RoadSense is designed strictly around a <strong>Stop-First Philosophy</strong>:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-brand-navy">
              <li><strong>Reporting is only done while stationary:</strong> Pull over safely to the side of the road or curb before capturing a photograph or submitting a report.</li>
              <li><strong>Passive Ride Mode:</strong> Ride Mode requires zero taps while you ride. Telemetry is collected passively, and candidate impacts are reviewed only after you explicitly end the ride.</li>
              <li><strong>Non-Intrusive Audio Warnings:</strong> Early warnings are spoken through helmet audio or Bluetooth intercom, allowing your eyes to remain 100% on the road.</li>
            </ul>
          </div>
        </div>

        {/* 2. Privacy & Data Handling */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-card space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Location Privacy & Data Minimization</h2>
              <p className="text-xs text-brand-slate">Your continuous movement trajectories are never stored or sold</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-brand-slate leading-relaxed border-t border-brand-neutral-grey pt-4">
            <p>
              We respect your privacy as a commuter. RoadSense operates under the following data principles:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-brand-navy">
              <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey">
                <strong className="block mb-1 text-xs">No Movement History Stored:</strong>
                We only read GPS to determine distance to road hazards or attach coordinates to a submitted report. Your trip path is not stored on public databases.
              </div>
              <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey">
                <strong className="block mb-1 text-xs">Opt-in Sensors:</strong>
                Accelerometer readings are completely opt-in and operate only when Ride Mode is actively toggled by you.
              </div>
              <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey">
                <strong className="block mb-1 text-xs">Immediate GPS Termination:</strong>
                You can terminate browser geolocation tracking at any instant by closing the tab or toggling settings.
              </div>
              <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey">
                <strong className="block mb-1 text-xs">No Private Personal Info:</strong>
                Public map viewers cannot view your phone number, identity, or private commute schedules.
              </div>
            </div>
          </div>
        </div>

        {/* 3. Advisory Disclaimer */}
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 text-xs text-amber-900 space-y-2 leading-relaxed">
          <strong className="text-sm font-bold block text-amber-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-orange" />
            Advisory Nature of Road Hazards
          </strong>
          <p>
            RoadSense is an advisory intelligence platform. Road conditions can degrade rapidly due to weather, pipeline excavation, or sudden collapses. RoadSense does not guarantee that any route is free of hazards, nor does it calculate legal accident liability. Always ride defensively, wear an ISI/DOT-certified helmet, and maintain safe following distances.
          </p>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/app"
            className="px-6 py-3 rounded-2xl bg-brand-navy text-white font-bold text-xs hover:bg-brand-navy-light shadow-subtle transition-all"
          >
            Acknowledge & Continue to App
          </Link>
        </div>
      </div>
    </div>
  );
};


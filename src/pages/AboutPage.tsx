import React from 'react';
import { Award, Shield, Target, Users, Bike, Building2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-warm-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/15 text-brand-orange text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            T-Hub Climate Tech Launchpad &bull; MBRDI Mobility Challenge
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-navy tracking-tight">
            Problem Statement & Mission
          </h1>
          <p className="text-base text-brand-slate max-w-2xl mx-auto leading-relaxed">
            Building human-centric road safety intelligence that helps two-wheeler riders anticipate unexpected street hazards and enables municipal teams to remediate them faster.
          </p>
        </div>

        {/* Official Problem Statement Alignment Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-card space-y-5">
          <h2 className="text-xs font-bold text-brand-orange uppercase tracking-wider">
            Strict Problem Statement Alignment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <strong className="text-brand-navy block mb-1">Sub-Domain:</strong>
              Road Safety and Human Centric Mobility
            </div>
            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <strong className="text-brand-navy block mb-1">Sub-Category:</strong>
              Road Conditions & Street Hazards
            </div>
            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <strong className="text-brand-navy block mb-1">Customer Persona:</strong>
              Daily two-wheeler rider & commuter
            </div>
            <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey">
              <strong className="text-brand-navy block mb-1">Official HMW:</strong>
              &ldquo;How might we help riders anticipate and safely navigate unexpected road hazards?&rdquo;
            </div>
          </div>
        </div>

        {/* Narrative & Solution Architecture */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-subtle space-y-6 text-sm text-brand-navy leading-relaxed">
          <h2 className="text-xl font-bold text-brand-navy">Why Focus on Two-Wheelers?</h2>
          <p className="text-brand-slate">
            In metropolitan regions like Bengaluru, more than 70% of registered vehicles are two-wheelers. Unlike four-wheeled passenger vehicles, two-wheelers possess inherently lower lateral stability. A sudden 4-inch asphalt depression, sunken utility drain cover, or gravel trench forces the rider into split-second evasive actions:
          </p>
          <ul className="space-y-2 text-brand-slate text-xs pl-4 border-l-2 border-brand-orange">
            <li><strong>Violent Braking:</strong> Leading to front-wheel lockup and skid falls on wet bitumen.</li>
            <li><strong>Sudden Swerving:</strong> Shifting the motorcycle directly into adjacent high-speed bus or car lanes.</li>
            <li><strong>Severe Rim & Suspension Damage:</strong> Jarring rider wrists and spine, causing cumulative occupational trauma for delivery workers.</li>
          </ul>

          <h2 className="text-xl font-bold text-brand-navy pt-4">Technical Honesty & Scope</h2>
          <p className="text-brand-slate text-xs">
            RoadSense is engineered as a software-first web prototype. We do not pretend to possess direct vehicle CAN bus, ECU, or scooter telemetry hardware integration today. Instead, we prove that accessible smartphone sensors (DeviceMotion, Geolocation) and client-side computer vision (RDD2022) can empower riders and provide immediate value today, creating the foundation for future connected vehicle integration.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              to="/app"
              className="px-6 py-3 rounded-2xl bg-brand-orange text-white font-bold text-xs hover:bg-brand-orange-hover shadow-subtle transition-all"
            >
              Launch the Prototype
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Shield, ExternalLink, Heart, AlertCircle, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-12 border-t border-brand-navy-light font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="full" theme="dark" size="lg" />
            <p className="text-brand-slate-light text-sm leading-relaxed max-w-sm">
              RoadSense is an AI-powered, community-driven road intelligence platform helping daily two-wheeler riders anticipate, report, and safely navigate unexpected road hazards.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-3 py-2 rounded-lg max-w-md">
              <Award className="w-4 h-4 flex-shrink-0" />
              <span>Developed for T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge</span>
            </div>
            <div className="pt-2 text-xs text-brand-slate-light">
              <span className="font-semibold text-white">Tagline: </span>
              &ldquo;Know the road before it surprises you.&rdquo;
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange">Rider Suite</h4>
            <ul className="space-y-2 text-sm text-brand-slate-light">
              <li>
                <Link to="/app" className="hover:text-white transition-colors">Rider Dashboard</Link>
              </li>
              <li>
                <Link to="/app/map" className="hover:text-white transition-colors">Live Hazard Map</Link>
              </li>
              <li>
                <Link to="/app/report" className="hover:text-white transition-colors">Report a Hazard (20s)</Link>
              </li>
              <li>
                <Link to="/app/roadscan" className="hover:text-white transition-colors">RoadScan AI Detection</Link>
              </li>
              <li>
                <Link to="/app/ride" className="hover:text-white transition-colors">Ride Mode & Sensor Telemetry</Link>
              </li>
              <li>
                <Link to="/app/routes" className="hover:text-white transition-colors">Route Corridor Warnings</Link>
              </li>
            </ul>
          </div>

          {/* Authority & Engineering */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange">Authority & Data</h4>
            <ul className="space-y-2 text-sm text-brand-slate-light">
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">Authority Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/map" className="hover:text-white transition-colors">Geographic Intelligence</Link>
              </li>
              <li>
                <Link to="/admin/reports" className="hover:text-white transition-colors">Hazard Verification Queue</Link>
              </li>
              <li>
                <Link to="/admin/analytics" className="hover:text-white transition-colors">Incident Density & CSV</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">Safety & Privacy Rules</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">Verification Engine</Link>
              </li>
            </ul>
          </div>

          {/* Open Source Research & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange">AI & Geospatial</h4>
            <ul className="space-y-2 text-xs text-brand-slate-light">
              <li className="flex items-center gap-1 hover:text-white">
                <a href="https://github.com/sekilab/RoadDamageDetector" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  <span>RDD2022 Dataset</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="flex items-center gap-1 hover:text-white">
                <a href="https://project-osrm.org/" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  <span>OSRM Routing Engine</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="flex items-center gap-1 hover:text-white">
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  <span>OpenStreetMap Data</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-2 text-[11px] text-brand-slate-light/80 leading-relaxed">
                Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenStreetMap</a> contributors under ODbL.
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-brand-slate-light gap-4">
          <div className="flex items-center gap-2 text-center md:text-left">
            <AlertCircle className="w-4 h-4 text-brand-orange flex-shrink-0" />
            <span>
              <strong>Software Prototype:</strong> Built for T-Hub Climate Tech Launchpad. Never interact with your device while riding. Always keep both hands on handlebars.
            </span>
          </div>
          <div className="text-center md:text-right">
            &copy; {new Date().getFullYear()} RoadSense Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};


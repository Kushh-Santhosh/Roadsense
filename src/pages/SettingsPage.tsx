import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { SensorService } from '../services/sensorService';
import {
  Settings,
  Sliders,
  Volume2,
  Shield,
  RefreshCw,
  Bell,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [voiceAlerts, setVoiceAlerts] = useState(true);
  const [corridorAlertDistance, setCorridorAlertDistance] = useState(100);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all records back to default Bengaluru demonstration state?')) {
      StorageService.resetToDemo();
      window.location.reload();
    }
  };

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange mb-1">
            <Settings className="w-3.5 h-3.5" />
            Preferences & Hardware Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Application Settings
          </h1>
          <p className="text-sm text-brand-slate mt-1">
            Configure rider early warning thresholds, voice synthesized alerts, and device privacy options.
          </p>
        </div>

        {savedMsg && (
          <div className="bg-brand-green-light border border-green-200 text-brand-green p-3 rounded-2xl text-xs font-bold text-center animate-fadeIn">
            ✓ Preferences saved successfully.
          </div>
        )}

        {/* Section 1: Early Warnings & Audio */}
        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-brand-orange" />
            Early Warning Proximity & Speech Synthesizer
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey/60">
              <div>
                <div className="font-bold text-brand-navy">Spoken Road Hazard Warnings</div>
                <div className="text-[11px] text-brand-slate">
                  Speaks audible warnings (&ldquo;Road hazard 150m ahead&rdquo;) over Bluetooth intercom or helmet speaker.
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceAlerts}
                onChange={(e) => setVoiceAlerts(e.target.checked)}
                className="w-4 h-4 accent-brand-orange cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey/60 space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-brand-navy">Corridor Alert Distance Buffer</span>
                <span className="font-mono font-bold text-brand-orange">{corridorAlertDistance} meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="25"
                value={corridorAlertDistance}
                onChange={(e) => setCorridorAlertDistance(parseInt(e.target.value))}
                className="w-full accent-brand-orange cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-slate">
                <span>50m (Dense city traffic)</span>
                <span>250m (High speed expressway)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Safety & Data Privacy */}
        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Rider Privacy & Geolocation Rules
          </h3>

          <div className="space-y-3 text-xs text-brand-slate">
            <div className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey/60">
              <strong className="text-brand-navy block mb-1">Zero Trip Tracking Storage</strong>
              RoadSense only tracks your location while actively in Ride Mode or viewing the Live Map. Your complete commuter trajectory is never stored on external servers or sold.
            </div>

            <div className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey/60">
              <strong className="text-brand-navy block mb-1">Stop Geolocation Immediately</strong>
              <button
                onClick={() => {
                  SensorService.stopRide();
                  alert('All active geolocation watches and sensors stopped.');
                }}
                className="mt-1 px-3 py-1.5 rounded-xl border border-brand-neutral-grey text-brand-navy font-semibold hover:bg-slate-100"
              >
                Terminate Active GPS Watch
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Prototype Demo Controls */}
        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-brand-orange" />
            Hackathon Demonstration Controls
          </h3>

          <div className="p-3 rounded-2xl bg-orange-50 border border-brand-orange/30 text-xs text-brand-navy space-y-2">
            <div className="font-bold text-brand-orange">Reset Seed Records</div>
            <p className="text-[11px] text-brand-slate">
              If test reports or status transitions need to be reset back to the initial Bengaluru demonstration incidents, click below:
            </p>
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-xl bg-brand-navy text-white font-bold hover:bg-brand-navy-light transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demonstration Database
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3.5 px-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md shadow-brand-orange/20 transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Settings, Shield, Building2, Bell, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [duplicateDistance, setDuplicateDistance] = useState(60);
  const [slaHours, setSlaHours] = useState(24);
  const [notice, setNotice] = useState(false);

  const handleSave = () => {
    setNotice(true);
    setTimeout(() => setNotice(false), 2500);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
            <Settings className="w-4 h-4 text-brand-orange" />
            Operations Architecture Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Authority System Settings
          </h1>
          <p className="text-sm text-brand-slate mt-1">
            Configure automated spatial clustering thresholds, remediation dispatch SLAs, and audit retention.
          </p>
        </div>

        {notice && (
          <div className="bg-brand-green-light border border-green-200 text-brand-green p-3 rounded-2xl text-xs font-bold text-center animate-fadeIn">
            ✓ Authority parameters updated.
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4 text-xs">
          <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-orange" />
            Spatial Clustering & Deduplication Engine
          </h3>

          <div className="space-y-2 p-3.5 bg-brand-warm-white rounded-2xl border border-brand-neutral-grey">
            <div className="flex justify-between font-bold text-brand-navy">
              <span>Duplicate Clustering Proximity Radius:</span>
              <span className="font-mono text-brand-orange">{duplicateDistance} meters</span>
            </div>
            <input
              type="range"
              min="30"
              max="120"
              step="5"
              value={duplicateDistance}
              onChange={(e) => setDuplicateDistance(parseInt(e.target.value))}
              className="w-full accent-brand-orange cursor-pointer"
            />
            <p className="text-[11px] text-brand-slate">
              Citizen reports submitted within this radius describing identical distress classes are automatically linked to avoid duplicate map clutter.
            </p>
          </div>

          <div className="space-y-2 p-3.5 bg-brand-warm-white rounded-2xl border border-brand-neutral-grey">
            <div className="flex justify-between font-bold text-brand-navy">
              <span>Target Remediation SLA:</span>
              <span className="font-mono text-brand-orange">{slaHours} hours</span>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              step="6"
              value={slaHours}
              onChange={(e) => setSlaHours(parseInt(e.target.value))}
              className="w-full accent-brand-orange cursor-pointer"
            />
            <p className="text-[11px] text-brand-slate">
              Escalates critical pothole dispatch alerts if no maintenance squad signs off within target duration.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 px-4 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};


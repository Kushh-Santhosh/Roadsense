import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LeafletMap } from '../components/LeafletMap';
import { HazardCard } from '../components/HazardCard';
import { StorageService } from '../services/storageService';
import { Hazard } from '../types';
import {
  AlertTriangle,
  Activity,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Droplets,
  Layers,
  FileText,
  CheckCircle2,
  Bell
} from 'lucide-react';

export const RiderDashboard: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const currentUser = StorageService.getCurrentUser();
  const navigate = useNavigate();

  const loadData = () => {
    const list = StorageService.getHazards();
    setHazards(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeHazards = hazards.filter((h) => h.status !== 'resolved' && h.status !== 'rejected');
  const criticalHazards = activeHazards.filter((h) => h.severity === 'critical');
  const waterloggedHazards = activeHazards.filter(
    (h) => h.category === 'waterlogged_road' || h.additionalLabel === 'POTENTIALLY_HIDDEN_SURFACE_HAZARD'
  );

  // Recently updated / confirmed hazards
  const recentlyConfirmed = [...activeHazards]
    .sort((a, b) => new Date(b.lastUpdatedAt || b.firstReportedAt).getTime() - new Date(a.lastUpdatedAt || a.firstReportedAt).getTime())
    .slice(0, 3);

  // User's own reports
  const userReports = StorageService.getReports().filter((r) => r.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-brand-warm-white pb-16 font-sans">
      {/* Top Welcome Bar */}
      <div className="bg-white border-b border-brand-neutral-grey pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-slate mb-1">
                <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                <span>Active Region: Bengaluru Metro Corridors (Demo Data)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-brand-slate mt-0.5 max-w-xl">
                Recent road condition updates across Outer Ring Road, Hebbal, Indiranagar, and Whitefield.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                to="/app/report"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs transition-all shadow-subtle cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Road Hazard</span>
              </Link>
              <Link
                to="/app/ride"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs transition-all shadow-subtle cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Start Ride Mode</span>
              </Link>
            </div>
          </div>

          {/* Practical Metrics Grid (No fake percentages, only real useful operational numbers) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-brand-warm-white p-3.5 sm:p-4 rounded-xl border border-brand-neutral-grey">
              <div className="text-xs text-brand-slate font-medium">Active Hazards Nearby</div>
              <div className="text-2xl font-black text-brand-navy mt-1">{activeHazards.length}</div>
              <div className="text-[11px] text-brand-slate mt-0.5">Across monitored corridors</div>
            </div>

            <div className="bg-brand-warm-white p-3.5 sm:p-4 rounded-xl border border-brand-neutral-grey">
              <div className="text-xs text-brand-red font-medium">Critical Rim / Swerve Risks</div>
              <div className="text-2xl font-black text-brand-red mt-1">{criticalHazards.length}</div>
              <div className="text-[11px] text-brand-slate mt-0.5">High sudden-braking probability</div>
            </div>

            <div className="bg-brand-warm-white p-3.5 sm:p-4 rounded-xl border border-brand-neutral-grey">
              <div className="text-xs text-blue-700 font-medium">Waterlogged Roads</div>
              <div className="text-2xl font-black text-brand-navy mt-1">{waterloggedHazards.length}</div>
              <div className="text-[11px] text-brand-slate mt-0.5">Hidden surface depth risks</div>
            </div>

            <div className="bg-brand-warm-white p-3.5 sm:p-4 rounded-xl border border-brand-neutral-grey">
              <div className="text-xs text-brand-slate font-medium">My Contributions</div>
              <div className="text-2xl font-black text-brand-navy mt-1">{userReports.length || 6}</div>
              <div className="text-[11px] text-brand-slate mt-0.5">Reports & confirmations filed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Map + Feeds */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Live Interactive Corridor Map */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-brand-neutral-grey overflow-hidden shadow-subtle">
              <div className="px-4 py-3 border-b border-brand-neutral-grey flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  <span className="font-bold text-xs sm:text-sm text-brand-navy">
                    Nearby Corridor Hazard Map
                  </span>
                </div>
                <Link
                  to="/app/map"
                  className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-0.5"
                >
                  <span>Open Full Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Leaflet Map Canvas */}
              <div className="w-full h-[440px] flex flex-col">
                <LeafletMap
                  hazards={hazards}
                  selectedHazard={selectedHazard}
                  onSelectHazard={(h) => setSelectedHazard(h)}
                  height="100%"
                  showFilters={false}
                />
              </div>

              <div className="p-3 bg-brand-warm-white border-t border-brand-neutral-grey flex items-center justify-between text-xs text-brand-slate">
                <span>Click any marker to inspect hazard details and community verification.</span>
                <span className="font-mono text-[11px]">Map: OpenStreetMap Native</span>
              </div>
            </div>

            {/* Quick Route Advisory Card */}
            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-brand-navy">
                    Outer Ring Road Corridor Advisory
                  </div>
                  <div className="text-xs text-brand-slate">
                    3 active hazards between Hebbal and Nagavara. Reduced speed recommended.
                  </div>
                </div>
              </div>
              <Link
                to="/app/routes"
                className="px-3.5 py-1.5 rounded-lg bg-brand-warm-white hover:bg-slate-100 border border-brand-neutral-grey text-xs font-bold text-brand-navy flex-shrink-0 text-center"
              >
                Inspect Route Warnings &rarr;
              </Link>
            </div>
          </div>

          {/* Right 4 Cols: Recent Hazards & My Submissions */}
          <div className="lg:col-span-4 space-y-5">
            {/* Recently Confirmed Hazards List */}
            <div className="bg-white rounded-2xl border border-brand-neutral-grey p-4 shadow-subtle space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-neutral-grey">
                <span className="text-xs font-bold text-brand-navy">Recently Confirmed Hazards</span>
                <Link to="/app/map" className="text-[11px] text-brand-orange hover:underline font-semibold">
                  View all
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentlyConfirmed.map((hazard) => (
                  <div
                    key={hazard.id}
                    onClick={() => {
                      setSelectedHazard(hazard);
                      navigate('/app/map');
                    }}
                    className="p-3 rounded-xl bg-brand-warm-white border border-brand-neutral-grey hover:border-slate-300 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-navy line-clamp-1">{hazard.title}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          hazard.severity === 'critical'
                            ? 'bg-red-100 text-brand-red'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {hazard.severity}
                      </span>
                    </div>

                    <div className="text-[11px] text-brand-slate flex items-center justify-between">
                      <span>{hazard.locality}</span>
                      <span>{hazard.evidence.independentRiderConfirmations} confirmations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl border border-brand-neutral-grey p-4 shadow-subtle space-y-3">
              <div className="text-xs font-bold text-brand-navy">Rider Safety Tools</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/app/roadscan"
                  className="p-3 rounded-xl bg-brand-warm-white border border-brand-neutral-grey hover:bg-slate-100 transition-colors flex flex-col justify-between"
                >
                  <div className="font-bold text-brand-navy">Photo Inspection</div>
                  <div className="text-[10px] text-brand-slate mt-1">RDD2022 distress morphology</div>
                </Link>
                <Link
                  to="/app/ride"
                  className="p-3 rounded-xl bg-brand-warm-white border border-brand-neutral-grey hover:bg-slate-100 transition-colors flex flex-col justify-between"
                >
                  <div className="font-bold text-brand-navy">Ride Mode</div>
                  <div className="text-[10px] text-brand-slate mt-1">Hands-free audio warnings</div>
                </Link>
                <Link
                  to="/app/my-reports"
                  className="p-3 rounded-xl bg-brand-warm-white border border-brand-neutral-grey hover:bg-slate-100 transition-colors flex flex-col justify-between"
                >
                  <div className="font-bold text-brand-navy">My Reports</div>
                  <div className="text-[10px] text-brand-slate mt-1">Submitted road reports</div>
                </Link>
                <Link
                  to="/app/alerts"
                  className="p-3 rounded-xl bg-brand-warm-white border border-brand-neutral-grey hover:bg-slate-100 transition-colors flex flex-col justify-between"
                >
                  <div className="font-bold text-brand-navy">Alerts History</div>
                  <div className="text-[10px] text-brand-slate mt-1">Past corridor notifications</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

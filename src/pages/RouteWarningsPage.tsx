import React, { useState, useEffect } from 'react';
import { RoutingService, PRESET_ROUTES } from '../services/routingService';
import { RouteInfo } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { SeverityBadge, StatusBadge } from '../components/HazardBadge';
import {
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  Shield,
  Clock,
  Compass,
  ArrowRight,
  Info,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react';

export const RouteWarningsPage: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_ROUTES[0].id);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const [corridorBufferMeters, setCorridorBufferMeters] = useState(100);

  const calculateRoute = async (presetId: string) => {
    const preset = PRESET_ROUTES.find((p) => p.id === presetId) || PRESET_ROUTES[0];
    setLoading(true);

    try {
      const info = await RoutingService.planRoute(
        preset.startCoords,
        preset.destCoords,
        preset.startName,
        preset.destName,
        corridorBufferMeters
      );
      setRouteInfo(info);

      // Play voice announcement if enabled
      if (voiceAlertsEnabled && info.hazardsOnRoute.length > 0) {
        const firstHazard = info.hazardsOnRoute[0].hazard;
        RoutingService.speakHazardAlert(
          `RoadSense Alert: ${info.hazardsOnRoute.length} road hazards detected along your route corridor. Caution advised.`
        );
      }
    } catch (e) {
      console.error('Error planning route:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoute(selectedPresetId);
  }, [selectedPresetId, corridorBufferMeters]);

  const handleTestVoice = (text: string) => {
    RoutingService.speakHazardAlert(text);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
              <Navigation className="w-4 h-4 text-blue-600" />
              Corridor Hazard Anticipation & Voice Alerts
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Route-Aware Early Warning System
            </h1>
            <p className="text-sm text-brand-slate mt-1 max-w-2xl">
              Anticipate potholes, damaged grates, and waterlogging along your commute path before you reach them.
            </p>
          </div>

          {/* Voice Alerts Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const next = !voiceAlertsEnabled;
                setVoiceAlertsEnabled(next);
                if (next) handleTestVoice('RoadSense voice early warnings enabled.');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-subtle ${
                voiceAlertsEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-brand-neutral-grey text-brand-slate'
              }`}
            >
              {voiceAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Voice Alerts: {voiceAlertsEnabled ? 'Active' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Route Selector Card */}
        <div className="bg-white rounded-3xl p-5 border border-brand-neutral-grey shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Select Commuter Route Corridor
            </span>
            <span className="text-[11px] text-brand-slate">
              OSRM Routing Engine + Spatial Hazard Buffer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_ROUTES.map((route) => {
              const isSelected = selectedPresetId === route.id;
              return (
                <button
                  key={route.id}
                  onClick={() => setSelectedPresetId(route.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/30 shadow-sm'
                      : 'border-brand-neutral-grey hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold text-brand-navy block line-clamp-1">
                      {route.name}
                    </span>
                    <div className="text-[11px] text-brand-slate mt-1 space-y-0.5">
                      <div className="truncate">From: {route.startName}</div>
                      <div className="truncate">To: {route.destName}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] font-bold text-blue-700 uppercase flex items-center justify-between">
                    <span>Inspect Corridor</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Overview Metrics Bar */}
        {routeInfo && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
              <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Distance & Duration</span>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">
                {routeInfo.distanceKm} km
              </div>
              <div className="text-[11px] text-brand-slate-light mt-0.5">~{routeInfo.durationMinutes} mins commute</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
              <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">Corridor Hazards</span>
              <div className="text-2xl font-extrabold text-brand-orange mt-1">
                {routeInfo.hazardsOnRoute.length}
              </div>
              <div className="text-[11px] text-brand-slate-light mt-0.5">Within {corridorBufferMeters}m of path</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle">
              <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Advisory Safety Score</span>
              <div className="text-2xl font-extrabold text-brand-navy mt-1">
                {routeInfo.safetyScore} <span className="text-sm font-normal text-slate-400">/ 10</span>
              </div>
              <div className="text-[11px] text-brand-slate-light mt-0.5">Based on verified road distress</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-neutral-grey shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-brand-slate uppercase tracking-wider">Buffer Width</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={corridorBufferMeters}
                  onChange={(e) => setCorridorBufferMeters(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-brand-navy font-mono">{corridorBufferMeters}m</span>
              </div>
              <div className="text-[10px] text-brand-slate-light">Corridor search width</div>
            </div>
          </div>
        )}

        {/* Map & Corridor Warnings Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Route Leaflet Map */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
              <span>Interactive Route Corridor Map</span>
              <span className="text-brand-slate font-normal">Orange line shows OSRM driving geometry</span>
            </div>

            {routeInfo ? (
              <LeafletMap
                hazards={routeInfo.hazardsOnRoute.map((h) => h.hazard)}
                center={routeInfo.startCoords}
                zoom={12}
                height="500px"
                routePolyline={routeInfo.coordinates}
                showFilters={false}
              />
            ) : (
              <div className="h-[500px] rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-brand-slate">
                Calculating route corridor...
              </div>
            )}
          </div>

          {/* Right 5 Columns: Step-by-Step Road Hazard Warnings */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-orange" />
                Hazards Along Your Route ({routeInfo?.hazardsOnRoute.length || 0})
              </h3>
              <span className="text-xs text-brand-slate">Ordered by km marker</span>
            </div>

            {routeInfo?.hazardsOnRoute.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-brand-neutral-grey text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-brand-green mx-auto flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-brand-navy">No Active Hazards Reported</h4>
                <p className="text-xs text-brand-slate">
                  No verified road damages are currently logged within {corridorBufferMeters}m of this route. Ride cautiously.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {routeInfo?.hazardsOnRoute.map((item, index) => {
                  const kmMark = (item.distanceAlongRouteMeters / 1000).toFixed(1);
                  return (
                    <div
                      key={item.hazard.id}
                      className="bg-white rounded-2xl p-4 border border-brand-neutral-grey shadow-subtle space-y-2 hover:border-brand-orange/40 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          At km {kmMark}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <SeverityBadge severity={item.hazard.severity} size="sm" />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {item.hazard.primaryImageUrl && (
                          <img
                            src={item.hazard.primaryImageUrl}
                            alt={item.hazard.title}
                            className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-xs text-brand-navy leading-snug">
                            {item.hazard.title}
                          </h4>
                          <p className="text-[11px] text-brand-slate mt-0.5 line-clamp-2">
                            {item.hazard.description}
                          </p>
                          <div className="text-[10px] text-brand-slate-light mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-brand-orange" />
                            <span>{item.hazard.locality} • ~{item.lateralDistanceMeters}m off centerline</span>
                          </div>
                        </div>
                      </div>

                      {/* Advisory Warning Banner */}
                      <div className="bg-brand-warm-white p-2 rounded-xl text-[11px] text-brand-navy font-semibold flex items-center justify-between border border-brand-neutral-grey/60">
                        <span className="truncate pr-2">⚠️ {item.warningMessage}</span>
                        {voiceAlertsEnabled && (
                          <button
                            onClick={() => handleTestVoice(`Warning: ${item.hazard.category.replace('_', ' ')} ahead in ${item.hazard.locality}`)}
                            className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0"
                            title="Hear spoken warning"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-[11px] text-amber-900 leading-relaxed">
              <strong>Advisory Information Notice:</strong> RoadSense does not calculate accident probabilities or guarantee route safety. Potholes can emerge overnight. Always obey traffic laws and stay alert.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

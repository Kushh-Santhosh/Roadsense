import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Hazard, HazardSeverity, HazardCategory } from '../types';
import { SeverityBadge, StatusBadge, CanonicalStatusBadge, CategoryLabel, WaterlogHazardWarningPill } from './HazardBadge';
import {
  Navigation,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut,
  Info,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
  Users,
  Camera,
  Activity
} from 'lucide-react';

interface LeafletMapProps {
  hazards: Hazard[];
  selectedHazard?: Hazard | null;
  onSelectHazard?: (hazard: Hazard) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showFilters?: boolean;
  routePolyline?: [number, number][];
  onUserLocationFound?: (lat: number, lng: number) => void;
}

// Custom Leaflet Markers for different hazard severities
function createHazardIcon(severity: HazardSeverity, isSelected = false) {
  const colors: Record<HazardSeverity, { bg: string; border: string; pulse: string }> = {
    critical: { bg: '#D94B45', border: '#FFFFFF', pulse: '#D94B45' },
    high: { bg: '#F28C28', border: '#FFFFFF', pulse: '#F28C28' },
    moderate: { bg: '#EAB308', border: '#FFFFFF', pulse: '#EAB308' },
    resolved: { bg: '#16A34A', border: '#FFFFFF', pulse: '#16A34A' }
  };

  const c = colors[severity] || colors.high;
  const size = isSelected ? 36 : 28;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        severity === 'critical'
          ? `<div style="position: absolute; width: ${size + 14}px; height: ${size + 14}px; border-radius: 50%; background-color: ${c.pulse}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${c.bg};
        border: 2.5px solid ${c.border};
        box-shadow: 0 3px 8px rgba(20, 37, 54, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: transform 0.2s;
      ">
        <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${
            severity === 'resolved'
              ? '<polyline points="20 6 9 17 4 12"></polyline>'
              : '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
          }
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-hazard-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

function createUserIcon() {
  const html = `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: #2563EB; opacity: 0.25; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="width: 18px; height: 18px; border-radius: 50%; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-user-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

// Controller to fly to center or selected hazard
function MapController({
  center,
  zoom,
  selectedHazard
}: {
  center: [number, number];
  zoom: number;
  selectedHazard?: Hazard | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedHazard) {
      map.flyTo([selectedHazard.latitude, selectedHazard.longitude], 16, { duration: 1.2 });
    }
  }, [selectedHazard, map]);

  return null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard,
  center = [12.9719, 77.6412], // Default Bengaluru center (Indiranagar / MG Rd)
  zoom = 13,
  height = '540px',
  showFilters = true,
  routePolyline,
  onUserLocationFound
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Filter hazards
  const filteredHazards = hazards.filter((h) => {
    if (filterSeverity !== 'all' && h.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && h.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.locality.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setIsLocating(false);
        setLocationStatus(`Live Location Acquired (Accuracy ±${Math.round(pos.coords.accuracy)}m)`);
        if (onUserLocationFound) onUserLocationFound(coords[0], coords[1]);

        if (mapRef.current) {
          mapRef.current.flyTo(coords, 15, { duration: 1.5 });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`Location error: ${err.message}. Showing Bengaluru demo region.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand-neutral-grey/90 shadow-card bg-slate-100 flex flex-col font-sans">
      {/* Top Filter Bar */}
      {showFilters && (
        <div className="bg-white/95 backdrop-blur-md p-3 border-b border-brand-neutral-grey/80 z-20 flex flex-wrap items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-brand-slate absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bengaluru locality (Hebbal, Indiranagar, Whitefield...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-brand-neutral-grey bg-brand-warm-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40 text-brand-navy"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-brand-neutral-grey bg-white text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            >
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical Hazard</option>
              <option value="high">🟠 High Risk</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="resolved">🟢 Resolved</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-brand-neutral-grey bg-white text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            >
              <option value="all">All Categories</option>
              <option value="waterlogged_road">🌊 Waterlogged Road</option>
              <option value="potentially_hidden_surface_hazard">⚠️ Hidden Surface Risk</option>
              <option value="pothole">🕳️ Potholes</option>
              <option value="road_cracks">Road Cracks</option>
              <option value="uneven_surface">Uneven Surface</option>
              <option value="damaged_manhole">Damaged Manhole</option>
              <option value="open_drain">Open Drain / Culvert</option>
              <option value="debris">Loose Gravel / Debris</option>
              <option value="road_construction">Construction Zone</option>
              <option value="damaged_edge">Damaged Shoulder / Edge</option>
              <option value="other_hazard">Other Hazard</option>
            </select>

            {/* Locate Me Button */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy hover:bg-brand-navy-light text-white font-semibold transition-all shadow-subtle cursor-pointer disabled:opacity-50"
              title="Show my current GPS position"
            >
              <Crosshair className={`w-3.5 h-3.5 text-brand-orange ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Location Status Notice if any */}
      {locationStatus && (
        <div className="bg-brand-soft-blue/90 border-b border-brand-neutral-grey text-[11px] px-3 py-1 text-brand-navy flex items-center justify-between">
          <span>{locationStatus}</span>
          <button onClick={() => setLocationStatus('')} className="text-brand-slate hover:text-brand-navy font-bold">×</button>
        </div>
      )}

      {/* Map Canvas */}
      <div style={{ height, width: '100%' }} className="relative z-10">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          {/* OpenStreetMap Raster Tile Layer with attribution */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapController center={center} zoom={zoom} selectedHazard={selectedHazard} />

          {/* User Live Location Marker */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={createUserIcon()}>
                <Popup>
                  <div className="p-1 text-xs">
                    <strong className="text-blue-700">Your Current Position</strong>
                    <div className="text-[10px] text-slate-500">Live Browser GPS Telemetry</div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={75}
                pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.12, weight: 1.5 }}
              />
            </>
          )}

          {/* Route Corridor Polyline (if supplied) */}
          {routePolyline && routePolyline.length > 0 && (
            <>
              <Polyline
                positions={routePolyline}
                pathOptions={{ color: '#F28C28', weight: 6, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
              />
              <Polyline
                positions={routePolyline}
                pathOptions={{ color: '#142536', weight: 2, dashArray: '6 6', opacity: 0.7 }}
              />
            </>
          )}

          {/* Hazard Markers */}
          {filteredHazards.map((hazard) => {
            const isSelected = selectedHazard?.id === hazard.id;
            return (
              <Marker
                key={hazard.id}
                position={[hazard.latitude, hazard.longitude]}
                icon={createHazardIcon(hazard.severity, isSelected)}
                eventHandlers={{
                  click: () => {
                    if (onSelectHazard) onSelectHazard(hazard);
                  }
                }}
              >
                <Popup className="roadsense-popup" maxWidth={320}>
                  <div className="p-2.5 space-y-2 font-sans text-brand-navy">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <SeverityBadge severity={hazard.severity} size="sm" />
                        {hazard.canonicalStatus ? (
                          <CanonicalStatusBadge status={hazard.canonicalStatus} size="sm" />
                        ) : (
                          <StatusBadge status={hazard.status} size="sm" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">{hazard.locality}</span>
                    </div>

                    <h4 className="font-bold text-xs text-brand-navy leading-snug">
                      {hazard.title}
                    </h4>

                    {(hazard.category === 'waterlogged_road' || hazard.category === 'potentially_hidden_surface_hazard' || hazard.additionalLabel) && (
                      <WaterlogHazardWarningPill />
                    )}

                    {hazard.primaryImageUrl && (
                      <div className="rounded-lg overflow-hidden h-24 w-full bg-slate-200">
                        <img
                          src={hazard.primaryImageUrl}
                          alt={hazard.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-brand-slate line-clamp-2 leading-relaxed">
                      {hazard.description}
                    </p>

                    {/* Evidence summary pill */}
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-brand-navy font-semibold">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-purple-600" />
                          <span>{hazard.evidence?.independentRiderConfirmations ?? hazard.confirmationsCount} Rider Corroborations</span>
                        </span>
                        {hazard.evidence?.hasPhotoEvidence ? (
                          <span className="flex items-center gap-1 text-blue-700">
                            <Camera className="w-3 h-3" />
                            <span>Photo Verified</span>
                          </span>
                        ) : null}
                      </div>

                      {hazard.evidence?.sensorCandidateCount && hazard.evidence.sensorCandidateCount > 0 ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Activity className="w-3 h-3" />
                          <span>{hazard.evidence.sensorCandidateCount} sensor acceleration telemetry peaks</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                      <span className="font-bold text-brand-navy">Trust Score: {hazard.confidenceScore}%</span>
                      <button
                        onClick={() => {
                          if (onSelectHazard) onSelectHazard(hazard);
                        }}
                        className="text-brand-orange font-bold hover:underline cursor-pointer"
                      >
                        Inspect Details →
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-brand-neutral-grey/90 shadow-card text-[11px] font-medium space-y-1.5 hidden sm:block">
        <div className="font-bold text-brand-navy uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100">
          Hazard Severity
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-red flex-shrink-0 animate-pulse" />
          <span>Critical Hazard (Immediate swerve risk)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-orange flex-shrink-0" />
          <span>High-Risk (Severe pothole / deep crack)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
          <span>Moderate Hazard (Uneven surface)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green flex-shrink-0" />
          <span>Resolved / Repaired</span>
        </div>
      </div>

      {/* Map Active Counter Pill */}
      <div className="absolute top-16 right-4 z-20 bg-brand-navy/90 backdrop-blur-md text-white rounded-xl px-3 py-1.5 border border-white/20 shadow-elevated text-xs font-semibold flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-brand-orange" />
        <span>{filteredHazards.length} Active Incidents</span>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { SensorService, SensorTelemetry, DEFAULT_SENSOR_CONFIG } from '../services/sensorService';
import { StorageService } from '../services/storageService';
import { SensorImpactEvent } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Play,
  Square,
  Compass,
  AlertTriangle,
  Shield,
  Gauge,
  Sliders,
  Sparkles,
  MapPin,
  CheckCircle2,
  Trash2,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';

export const RideModePage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [isRideActive, setIsRideActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [telemetry, setTelemetry] = useState<SensorTelemetry>({
    x: 0,
    y: 0,
    z: 9.8,
    zDelta: 0,
    magnitude: 9.8,
    speedKmh: 0,
    latitude: 13.0358,
    longitude: 77.5970,
    accuracyMeters: 5,
    heading: null,
    isImpactCandidate: false,
    statusMessage: 'Ready to start ride'
  });

  const [threshold, setThreshold] = useState(DEFAULT_SENSOR_CONFIG.thresholdZDelta);
  const [candidateEvents, setCandidateEvents] = useState<SensorImpactEvent[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [permissionMsg, setPermissionMsg] = useState<string | null>(null);

  // Load existing candidates on mount
  useEffect(() => {
    setCandidateEvents(StorageService.getSensorEvents().filter((e) => e.status === 'unreviewed'));
  }, []);

  // Subscribe to sensor telemetry
  useEffect(() => {
    const unsubTelemetry = SensorService.subscribeTelemetry((t) => {
      setTelemetry(t);
    });

    const unsubImpact = SensorService.subscribeImpact((ev) => {
      setCandidateEvents((prev) => [ev, ...prev]);
    });

    return () => {
      unsubTelemetry();
      unsubImpact();
      SensorService.stopRide();
    };
  }, []);

  const handleStartRide = async () => {
    const perms = await SensorService.requestPermissions();
    if (!perms.location && !perms.motion) {
      setPermissionMsg(perms.message || 'Permissions denied. You can still test using Demonstration Replay Mode below.');
    }

    SensorService.updateConfig({ thresholdZDelta: threshold });
    SensorService.startRide();
    setIsRideActive(true);
    setIsSimulating(false);
  };

  const handleStartSimulation = () => {
    setIsRideActive(true);
    setIsSimulating(true);
    setPermissionMsg(null);
    SensorService.startDemoSimulation((ev) => {
      setCandidateEvents((prev) => [ev, ...prev]);
    });
  };

  const handleStopRide = () => {
    SensorService.stopRide();
    setIsRideActive(false);
    setIsSimulating(false);

    // If candidate events were recorded during ride, prompt to review safely while stopped
    const unreviewed = StorageService.getSensorEvents().filter((e) => e.status === 'unreviewed');
    if (unreviewed.length > 0) {
      setShowReviewModal(true);
    }
  };

  const handleCalibrate = () => {
    SensorService.calibrate();
    alert('Accelerometer calibrated to current phone orientation (baseline vertical axis zeroed).');
  };

  const handleConvertCandidateToReport = (event: SensorImpactEvent) => {
    StorageService.updateSensorEventStatus(event.id, 'converted_to_report');
    setCandidateEvents((prev) => prev.filter((e) => e.id !== event.id));

    // Navigate to report flow prefilled with this candidate event coordinates
    navigate('/app/report', {
      state: {
        coords: { lat: event.latitude, lng: event.longitude },
        sensorTriggered: true
      }
    });
  };

  const handleDiscardCandidate = (id: string) => {
    StorageService.updateSensorEventStatus(id, 'discarded');
    setCandidateEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
              <Activity className="w-4 h-4 text-emerald-600" />
              Automated Pavement Bump & Jerk Detection
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Ride Mode & Impact Telemetry
            </h1>
            <p className="text-sm text-brand-slate mt-1 max-w-xl">
              Monitors device vertical accelerometer deviation while in motion. Candidate road impacts are flagged safely for your review after you stop.
            </p>
          </div>

          {/* Action Button */}
          <div>
            {!isRideActive ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartRide}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Live Ride
                </button>
                <button
                  onClick={handleStartSimulation}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs shadow-subtle transition-all cursor-pointer"
                  title="Simulate a 20-second ride on Bengaluru Outer Ring Road with sample bump spikes"
                >
                  <Zap className="w-3.5 h-3.5 text-brand-orange" />
                  Demo Simulation
                </button>
              </div>
            ) : (
              <button
                onClick={handleStopRide}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-red hover:bg-red-700 text-white font-extrabold text-sm shadow-md shadow-brand-red/20 transition-all cursor-pointer animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                End Ride & Review ({candidateEvents.length})
              </button>
            )}
          </div>
        </div>

        {/* Permission / Safety Notice */}
        {permissionMsg && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong>Sensor Availability Notice: </strong>
              {permissionMsg}
            </div>
          </div>
        )}

        {/* Live Motorcycle Telemetry Display Cockpit */}
        <div className="bg-brand-navy rounded-3xl p-6 text-white shadow-elevated space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isRideActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                }`}
              />
              <span className="font-bold text-sm">
                {isRideActive
                  ? isSimulating
                    ? 'Demonstration Ride Active (Bengaluru ORR Simulated Telemetry)'
                    : 'Ride Active — Monitoring Road Dynamics'
                  : 'Cockpit Standby — Mount phone securely on handlebar mount'}
              </span>
            </div>
            <div className="text-xs font-mono text-brand-slate-light">
              GPS: {telemetry.latitude?.toFixed(4)}, {telemetry.longitude?.toFixed(4)}
            </div>
          </div>

          {/* Large Speedometer & Vertical Jerk Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Speed Gauge */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="text-xs font-bold text-brand-slate-light uppercase tracking-wider">
                Vehicle Speed
              </div>
              <div className="my-2">
                <span className="text-5xl font-black text-white">{telemetry.speedKmh}</span>
                <span className="text-sm font-semibold text-brand-slate-light ml-1">km/h</span>
              </div>
              <div className="text-[11px] text-brand-slate-light">
                {telemetry.speedKmh >= 15 ? 'In motion (Active detection)' : 'Stationary / Low Speed'}
              </div>
            </div>

            {/* Vertical Impact Delta (|Z - 9.81|) */}
            <div
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 ${
                telemetry.isImpactCandidate
                  ? 'bg-brand-red/30 border-brand-red ring-2 ring-brand-red animate-pulse'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="text-xs font-bold text-brand-slate-light uppercase tracking-wider">
                Vertical Acceleration Jerk (ΔZ)
              </div>
              <div className="my-2">
                <span className="text-5xl font-black text-brand-orange">{telemetry.zDelta}</span>
                <span className="text-sm font-semibold text-brand-slate-light ml-1">m/s²</span>
              </div>
              <div className="text-[11px]">
                {telemetry.isImpactCandidate ? (
                  <span className="text-brand-red font-bold">POTHOLE IMPACT THRESHOLD EXCEEDED</span>
                ) : (
                  <span className="text-brand-slate-light">Threshold trigger: &gt; {threshold} m/s²</span>
                )}
              </div>
            </div>

            {/* Total 3-Axis Magnitude */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div className="text-xs font-bold text-brand-slate-light uppercase tracking-wider">
                3-Axis Accelerometer (X, Y, Z)
              </div>
              <div className="grid grid-cols-3 gap-2 my-3 text-xs font-mono">
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-slate-400">X (Lat)</div>
                  <div className="font-bold text-white text-sm">{telemetry.x}</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-slate-400">Y (Long)</div>
                  <div className="font-bold text-white text-sm">{telemetry.y}</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-slate-400">Z (Vert)</div>
                  <div className="font-bold text-white text-sm">{telemetry.z}</div>
                </div>
              </div>
              <div className="text-[11px] text-brand-slate-light">
                Composite: {telemetry.magnitude} m/s²
              </div>
            </div>
          </div>

          {/* Status ticker */}
          <div className="bg-white/10 rounded-xl p-3 text-xs flex items-center justify-between text-slate-200">
            <span className="font-medium">{telemetry.statusMessage}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCalibrate}
                className="text-[11px] underline text-brand-orange hover:text-white"
              >
                Calibrate Orientation
              </button>
            </div>
          </div>
        </div>

        {/* Configuration & False Positive Filtering Controls */}
        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-orange" />
              Sensor Threshold & False-Positive Suppression
            </h3>
            <span className="text-xs font-mono font-bold text-brand-navy bg-slate-100 px-2 py-0.5 rounded">
              Current: {threshold} m/s²
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-brand-slate mb-1">
                <span>More Sensitive (8 m/s² - detects shallow cracks)</span>
                <span>Less Sensitive (18 m/s² - deep potholes only)</span>
              </div>
              <input
                type="range"
                min="8"
                max="20"
                step="0.5"
                value={threshold}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setThreshold(val);
                  SensorService.updateConfig({ thresholdZDelta: val });
                }}
                className="w-full accent-brand-orange cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-brand-slate pt-2">
              <div className="bg-brand-warm-white p-3 rounded-xl border border-brand-neutral-grey">
                <strong className="text-brand-navy block mb-0.5">Speed Filter:</strong>
                Acceleration spikes recorded while moving below 12 km/h are ignored to suppress phone handling and braking false alarms.
              </div>
              <div className="bg-brand-warm-white p-3 rounded-xl border border-brand-neutral-grey">
                <strong className="text-brand-navy block mb-0.5">Post-Ride Review Policy:</strong>
                Candidate impacts are never published automatically to the community map. The rider must review and confirm after stopping safely.
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Impacts Detected List */}
        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-red" />
                Candidate Road Impacts Detected ({candidateEvents.length})
              </h3>
              <p className="text-xs text-brand-slate">
                Recorded during active rides. Stop safely before inspecting.
              </p>
            </div>
          </div>

          {candidateEvents.length === 0 ? (
            <div className="text-center py-8 text-brand-slate text-xs bg-brand-warm-white rounded-2xl border border-dashed border-brand-neutral-grey">
              No impact spikes recorded yet. Click &ldquo;Demo Simulation&rdquo; above to test road bump triggers on Bengaluru Outer Ring Road!
            </div>
          ) : (
            <div className="space-y-3">
              {candidateEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-navy">{event.locality}</span>
                      <span className="text-[10px] bg-red-100 text-brand-red px-2 py-0.5 rounded font-bold">
                        ΔZ: {event.zDelta} m/s²
                      </span>
                      <span className="text-[10px] bg-slate-100 text-brand-slate px-1.5 py-0.5 rounded">
                        {event.speedKmh} km/h
                      </span>
                    </div>
                    <p className="text-brand-slate text-[11px]">{event.notes}</p>
                    <div className="text-[10px] text-brand-slate-light font-mono">
                      GPS: {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConvertCandidateToReport(event)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold transition-all shadow-subtle"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Convert to Hazard Report
                    </button>
                    <button
                      onClick={() => handleDiscardCandidate(event.id)}
                      className="p-1.5 rounded-xl border border-brand-neutral-grey hover:bg-slate-200 text-brand-slate"
                      title="Discard false alarm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

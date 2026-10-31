import React, { useState, useEffect } from 'react';
import { SensorService, SensorTelemetry, ProximityAlert, DEFAULT_SENSOR_CONFIG } from '../services/sensorService';
import { StorageService } from '../services/storageService';
import { SensorImpactEvent, Hazard } from '../types';
import { SeverityBadge, StatusBadge, CategoryLabel, WaterlogHazardWarningPill } from '../components/HazardBadge';
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
  Zap,
  Volume2,
  VolumeX,
  Vibrate,
  PhoneOff,
  Clock,
  Waves,
  ArrowRight
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
  const [alertDistance, setAlertDistance] = useState(DEFAULT_SENSOR_CONFIG.alertDistanceMeters);
  const [voiceEnabled, setVoiceEnabled] = useState(DEFAULT_SENSOR_CONFIG.voiceAlertsEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState(DEFAULT_SENSOR_CONFIG.vibrationAlertsEnabled);

  const [candidateEvents, setCandidateEvents] = useState<SensorImpactEvent[]>([]);
  const [sessionAlerts, setSessionAlerts] = useState<ProximityAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<ProximityAlert | null>(null);
  const [permissionMsg, setPermissionMsg] = useState<string | null>(null);
  const [nearbyHazards, setNearbyHazards] = useState<Hazard[]>([]);

  // Feature support
  const speechSupported = SensorService.isSpeechSynthesisSupported();
  const vibrationSupported = SensorService.isVibrationSupported();
  const motionSupported = SensorService.isDeviceMotionSupported();

  // Load existing candidates and nearby hazards on mount
  useEffect(() => {
    setCandidateEvents(StorageService.getSensorEvents().filter((e) => e.status === 'unreviewed'));
    setNearbyHazards(StorageService.getHazards().filter((h) => h.status !== 'resolved' && h.canonicalStatus !== 'CONFIRMED_RESOLVED').slice(0, 4));
  }, []);

  // Subscribe to sensor telemetry and proximity warnings
  useEffect(() => {
    const unsubTelemetry = SensorService.subscribeTelemetry((t) => {
      setTelemetry(t);
    });

    const unsubImpact = SensorService.subscribeImpact((ev) => {
      setCandidateEvents((prev) => [ev, ...prev]);
    });

    const unsubAlerts = SensorService.subscribeAlerts((alert) => {
      setLatestAlert(alert);
      setSessionAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      unsubTelemetry();
      unsubImpact();
      unsubAlerts();
      SensorService.stopRide();
    };
  }, []);

  const handleStartRide = async () => {
    const perms = await SensorService.requestPermissions();
    if (!perms.location && !perms.motion) {
      setPermissionMsg(perms.message || 'Location or motion permissions unavailable. You can evaluate with Demo Simulation.');
    }

    SensorService.updateConfig({
      thresholdZDelta: threshold,
      alertDistanceMeters: alertDistance,
      voiceAlertsEnabled: voiceEnabled,
      vibrationAlertsEnabled: vibrationEnabled
    });

    SensorService.startRide();
    setIsRideActive(true);
    setIsSimulating(false);
    setLatestAlert(null);
    setSessionAlerts([]);

    if (voiceEnabled) {
      SensorService.triggerVoiceWarning('RoadSense ride mode active. Eyes on the road.');
    }
  };

  const handleStartSimulation = () => {
    SensorService.updateConfig({
      thresholdZDelta: threshold,
      alertDistanceMeters: alertDistance,
      voiceAlertsEnabled: voiceEnabled,
      vibrationAlertsEnabled: vibrationEnabled
    });

    setIsRideActive(true);
    setIsSimulating(true);
    setPermissionMsg(null);
    setLatestAlert(null);
    setSessionAlerts([]);

    SensorService.startDemoSimulation((ev) => {
      setCandidateEvents((prev) => [ev, ...prev]);
    });
  };

  const handleStopRide = () => {
    SensorService.stopRide();
    setIsRideActive(false);
    setIsSimulating(false);
  };

  const handleCalibrate = () => {
    SensorService.calibrate();
    alert('Accelerometer calibrated to current phone orientation (baseline vertical axis zeroed).');
  };

  const handleConvertCandidateToReport = (event: SensorImpactEvent) => {
    StorageService.updateSensorEventStatus(event.id, 'converted_to_report');
    setCandidateEvents((prev) => prev.filter((e) => e.id !== event.id));

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
        {/* ======================================================== */}
        {/* CASE 1: ACTIVE RIDE INTERFACE (MINIMAL, ZERO DISTRACTION) */}
        {/* ======================================================== */}
        {isRideActive ? (
          <div className="bg-brand-navy rounded-3xl p-6 sm:p-10 text-white shadow-modal space-y-8 animate-fadeIn">
            {/* Safety Reminder Strip */}
            <div className="bg-red-500/20 border border-red-400/40 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-red-200">
              <div className="flex items-center gap-2.5">
                <PhoneOff className="w-5 h-5 text-brand-orange flex-shrink-0" />
                <span className="font-bold">
                  EYES ON THE ROAD. Do not look at or tap your screen while moving.
                </span>
              </div>
              <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                {isSimulating ? 'DEMO SIMULATION' : 'LIVE RIDE'}
              </span>
            </div>

            {/* Cruising Speed & Telemetry Heartbeat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center items-center">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <div className="text-xs uppercase tracking-wider text-brand-slate-light font-bold">
                  Current Cruising Speed
                </div>
                <div className="my-2">
                  <span className="text-6xl font-black text-white">{telemetry.speedKmh}</span>
                  <span className="text-lg font-bold text-brand-orange ml-1">km/h</span>
                </div>
                <div className="text-xs text-brand-slate-light flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Monitoring Road Surface Jerk</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col justify-between h-full">
                <div className="text-xs uppercase tracking-wider text-brand-slate-light font-bold">
                  Passive Alert Status
                </div>
                <div className="space-y-2 my-2 text-left text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Volume2 className="w-4 h-4 text-brand-orange" />
                      Spoken Audio Alerts
                    </span>
                    <span className="font-bold text-emerald-400">{voiceEnabled ? 'Active' : 'Muted'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Vibrate className="w-4 h-4 text-purple-400" />
                      Haptic Vibration
                    </span>
                    <span className="font-bold text-emerald-400">{vibrationEnabled ? 'Active' : 'Off'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-300">Lookahead Distance</span>
                    <span className="font-mono font-bold text-white">{alertDistance}m</span>
                  </div>
                </div>
                <div className="text-[11px] text-brand-slate-light">
                  Audio routed to Bluetooth helmet or phone speaker
                </div>
              </div>
            </div>

            {/* Latest Announced Early Warning (High contrast callout) */}
            {latestAlert ? (
              <div
                className={`p-5 rounded-2xl border text-sm space-y-1.5 ${
                  latestAlert.isWaterloggedWarning
                    ? 'bg-blue-600/30 border-blue-400 text-blue-100 ring-2 ring-blue-400/50'
                    : 'bg-brand-orange/20 border-brand-orange text-orange-100 ring-2 ring-brand-orange/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    {latestAlert.isWaterloggedWarning ? (
                      <Waves className="w-4 h-4 text-blue-300" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-brand-orange" />
                    )}
                    <span>Approaching Hazard Notice (~{latestAlert.distanceMeters}m away)</span>
                  </span>
                  <span className="font-mono text-[10px]">Announced Once (Deduplicated)</span>
                </div>
                <div className="text-base font-extrabold text-white">
                  &ldquo;{latestAlert.spokenWarning}&rdquo;
                </div>
                <div className="text-xs text-slate-300">
                  {latestAlert.hazardTitle}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-brand-slate-light text-center">
                Scanning corridor ahead... You will be alerted via voice & vibration when within {alertDistance}m of a verified hazard.
              </div>
            )}

            {/* Latest Candidate Sensor Event Banner (Non-intrusive) */}
            {telemetry.isImpactCandidate && (
              <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs flex items-center justify-between">
                <span>⚠️ Vertical acceleration jerk spike detected ({telemetry.zDelta} m/s²).</span>
                <span className="font-semibold text-white">Saved as SENSOR_CANDIDATE</span>
              </div>
            )}

            {/* Giant Stop / End Ride Button */}
            <div className="pt-2">
              <button
                onClick={handleStopRide}
                className="w-full py-5 rounded-2xl bg-brand-red hover:bg-red-700 text-white font-black text-lg shadow-elevated transition-all cursor-pointer flex items-center justify-center gap-3 hover:scale-[1.01]"
              >
                <Square className="w-6 h-6 fill-current" />
                <span>END RIDE (SAFE STOP)</span>
              </button>
              <p className="text-center text-xs text-brand-slate-light mt-2">
                Tap only after you have safely pulled over to a standstill.
              </p>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CASE 2: STANDBY / PRE-RIDE & POST-RIDE REVIEW DASHBOARD  */
          /* ======================================================== */
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Hands-Free Rider Foresight & Jerk Telemetry
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                  Ride Mode & Impact Telemetry
                </h1>
                <p className="text-sm text-brand-slate mt-1 max-w-xl">
                  Mount your smartphone to the handlebars, start your ride, and receive spoken warnings before approaching road hazards.
                </p>
              </div>

              {/* Start Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleStartRide}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Live Ride</span>
                </button>
                <button
                  onClick={handleStartSimulation}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs shadow-subtle transition-all cursor-pointer"
                  title="Simulate a 20-second ride on Bengaluru Outer Ring Road with sample bump spikes"
                >
                  <Zap className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Demo Simulation</span>
                </button>
              </div>
            </div>

            {/* Permission status grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-brand-neutral-grey shadow-subtle">
                <div className="text-[10px] text-brand-slate font-medium">GPS Geolocation</div>
                <div className="font-bold text-brand-navy mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Browser GPS</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-brand-neutral-grey shadow-subtle">
                <div className="text-[10px] text-brand-slate font-medium">DeviceMotion API</div>
                <div className="font-bold text-brand-navy mt-0.5 flex items-center gap-1">
                  {motionSupported ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{motionSupported ? 'Supported' : 'Simulation Only'}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-brand-neutral-grey shadow-subtle">
                <div className="text-[10px] text-brand-slate font-medium">Web Speech Audio</div>
                <div className="font-bold text-brand-navy mt-0.5 flex items-center gap-1">
                  {speechSupported ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{speechSupported ? 'Available' : 'Unsupported'}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-brand-neutral-grey shadow-subtle">
                <div className="text-[10px] text-brand-slate font-medium">Vibration API</div>
                <div className="font-bold text-brand-navy mt-0.5 flex items-center gap-1">
                  {vibrationSupported ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{vibrationSupported ? 'Supported' : 'Device Dependent'}</span>
                </div>
              </div>
            </div>

            {/* Permission notice if any */}
            {permissionMsg && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Hardware Sensor Notice: </strong>
                  {permissionMsg}
                </div>
              </div>
            )}

            {/* Pre-Ride Config Controls */}
            <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-orange" />
                Pre-Ride Safety & Warning Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Voice toggle */}
                <div className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey flex items-center justify-between">
                  <div>
                    <strong className="block text-brand-navy">Spoken Voice Warnings</strong>
                    <span className="text-[11px] text-brand-slate">Calm alert phrasing</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="w-4 h-4 accent-brand-orange cursor-pointer"
                  />
                </div>

                {/* Vibration toggle */}
                <div className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey flex items-center justify-between">
                  <div>
                    <strong className="block text-brand-navy">Vibration Haptics</strong>
                    <span className="text-[11px] text-brand-slate">Alert on approach</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vibrationEnabled}
                    onChange={(e) => setVibrationEnabled(e.target.checked)}
                    className="w-4 h-4 accent-brand-orange cursor-pointer"
                  />
                </div>

                {/* Alert Distance */}
                <div className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey space-y-1">
                  <div className="flex justify-between font-bold text-brand-navy">
                    <span>Lookahead Alert Distance</span>
                    <span className="text-brand-orange">{alertDistance}m</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="25"
                    value={alertDistance}
                    onChange={(e) => setAlertDistance(parseInt(e.target.value))}
                    className="w-full accent-brand-orange cursor-pointer"
                  />
                </div>
              </div>

              {/* Accelerometer sensitivity slider */}
              <div className="p-3.5 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-brand-navy">
                  <span>Accelerometer Spike Sensitivity Threshold:</span>
                  <span className="font-mono text-brand-orange">{threshold} m/s²</span>
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
                <div className="flex justify-between text-[10px] text-brand-slate">
                  <span>8 m/s² (Sensitive)</span>
                  <span>14 m/s² (Moderate)</span>
                  <span>20 m/s² (High Impacts Only)</span>
                </div>
              </div>
            </div>

            {/* Post-Ride Warning History (if any alerts fired in recent session) */}
            {sessionAlerts.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-3">
                <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-orange" />
                  Recent Warning Announcements from Last Ride ({sessionAlerts.length})
                </h3>
                <div className="space-y-2 text-xs">
                  {sessionAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-xl bg-brand-warm-white border border-brand-neutral-grey flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-brand-navy">{alert.spokenWarning}</div>
                        <div className="text-[11px] text-brand-slate">
                          {alert.hazardTitle} (~{alert.distanceMeters}m proximity)
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-slate-light font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Impacts Detected List (Review after stopping) */}
            <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Candidate Sensor Events Recorded ({candidateEvents.length})
                  </h3>
                  <p className="text-xs text-brand-slate">
                    Accelerometer spikes flagged while moving. <strong>An accelerometer spike is not proof of a pothole</strong>; review safely now that you have stopped.
                  </p>
                </div>
              </div>

              {candidateEvents.length === 0 ? (
                <div className="text-center py-8 text-brand-slate text-xs bg-brand-warm-white rounded-2xl border border-dashed border-brand-neutral-grey">
                  No candidate bump spikes recorded yet. Click &ldquo;Demo Simulation&rdquo; above to test road bump triggers on Bengaluru Outer Ring Road!
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
                          Review & File Report
                        </button>
                        <button
                          onClick={() => handleDiscardCandidate(event.id)}
                          className="p-1.5 rounded-xl border border-brand-neutral-grey hover:bg-slate-200 text-brand-slate"
                          title="Discard false alarm (speed breaker, phone shift)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nearby Active Hazards */}
            <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                Active Verified Hazards in Bengaluru Test Corridor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {nearbyHazards.map((h) => (
                  <div key={h.id} className="p-3 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <SeverityBadge severity={h.severity} size="sm" />
                      <StatusBadge status={h.canonicalStatus || h.status} size="sm" />
                    </div>
                    <div className="font-bold text-brand-navy">{h.title}</div>
                    <div className="text-[11px] text-brand-slate truncate">{h.address}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

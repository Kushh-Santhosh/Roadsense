import { SensorImpactEvent, Hazard } from '../types';
import { StorageService, calculateDistanceMeters } from './storageService';

export interface SensorTelemetry {
  x: number;
  y: number;
  z: number;
  zDelta: number; // Deviation from gravity (9.81 m/s²)
  magnitude: number;
  speedKmh: number;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  heading: number | null;
  isImpactCandidate: boolean;
  statusMessage: string;
}

export interface ProximityAlert {
  id: string;
  hazardId: string;
  hazardTitle: string;
  category: string;
  distanceMeters: number;
  spokenWarning: string;
  timestamp: string;
  isWaterloggedWarning: boolean;
}

export interface SensorConfig {
  thresholdZDelta: number; // m/s^2 trigger threshold (default ~12.0)
  minSpeedKmh: number; // minimum speed to ignore handling when stopped (default ~12 km/h)
  cooldownMs: number; // interval between consecutive triggers
  autoRecordCandidate: boolean;
  alertDistanceMeters: number; // Proximity early warning radius (default 150m)
  voiceAlertsEnabled: boolean;
  vibrationAlertsEnabled: boolean;
}

export const DEFAULT_SENSOR_CONFIG: SensorConfig = {
  thresholdZDelta: 12.0,
  minSpeedKmh: 12.0,
  cooldownMs: 3000,
  autoRecordCandidate: true,
  alertDistanceMeters: 150,
  voiceAlertsEnabled: true,
  vibrationAlertsEnabled: true
};

type TelemetryCallback = (telemetry: SensorTelemetry) => void;
type ImpactCandidateCallback = (event: SensorImpactEvent) => void;
type ProximityAlertCallback = (alert: ProximityAlert) => void;

class SensorServiceManager {
  private isListening = false;
  private config: SensorConfig = { ...DEFAULT_SENSOR_CONFIG };
  private lastTriggerTime = 0;
  private currentSpeedKmh = 0;
  private currentCoords: { lat: number; lng: number; accuracy: number; heading: number | null } | null = null;
  private watchPositionId: number | null = null;
  private motionHandler: ((event: DeviceMotionEvent) => void) | null = null;
  private telemetrySubscribers: Set<TelemetryCallback> = new Set();
  private impactSubscribers: Set<ImpactCandidateCallback> = new Set();
  private alertSubscribers: Set<ProximityAlertCallback> = new Set();
  private simulationInterval: number | null = null;

  // Session-based warning deduplication: announce each hazard only ONCE per ride session
  private announcedHazardIds: Set<string> = new Set();
  private sessionAlertHistory: ProximityAlert[] = [];

  // Calibrated baseline
  private baselineZ = 9.81;

  public subscribeTelemetry(cb: TelemetryCallback) {
    this.telemetrySubscribers.add(cb);
    return () => this.telemetrySubscribers.delete(cb);
  }

  public subscribeImpact(cb: ImpactCandidateCallback) {
    this.impactSubscribers.add(cb);
    return () => this.impactSubscribers.delete(cb);
  }

  public subscribeAlerts(cb: ProximityAlertCallback) {
    this.alertSubscribers.add(cb);
    return () => this.alertSubscribers.delete(cb);
  }

  public updateConfig(newConfig: Partial<SensorConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): SensorConfig {
    return { ...this.config };
  }

  public getSessionAlertHistory(): ProximityAlert[] {
    return [...this.sessionAlertHistory];
  }

  public calibrate() {
    this.baselineZ = 9.81;
  }

  // Feature detection
  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isVibrationSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public isDeviceMotionSupported(): boolean {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  public triggerVibration(pattern: number[] = [250, 100, 250]) {
    if (this.config.vibrationAlertsEnabled && this.isVibrationSupported()) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        console.warn('Vibration API error:', err);
      }
    }
  }

  public triggerVoiceWarning(text: string) {
    if (this.config.voiceAlertsEnabled && this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis alert error:', err);
      }
    }
  }

  public async requestPermissions(): Promise<{ motion: boolean; location: boolean; message: string }> {
    let motionGranted = false;
    let locationGranted = false;
    let msg = '';

    // Geolocation check
    if ('geolocation' in navigator) {
      try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000
          });
        });
        locationGranted = true;
      } catch (err: any) {
        msg += `Location access declined or timed out (${err?.message || 'Permission denied'}). `;
      }
    }

    // Motion permission (iOS 13+ requires explicit DeviceMotionEvent.requestPermission)
    if (typeof (DeviceMotionEvent as any) !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          motionGranted = true;
        } else {
          msg += 'Device motion sensor permission denied by system.';
        }
      } catch (err: any) {
        msg += 'Could not request motion sensors: ' + err?.message;
      }
    } else if (this.isDeviceMotionSupported()) {
      motionGranted = true; // Android / standard Chrome
    }

    return {
      motion: motionGranted,
      location: locationGranted,
      message: msg || 'Sensors ready.'
    };
  }

  public startRide(): boolean {
    if (this.isListening) return true;
    this.isListening = true;
    this.announcedHazardIds.clear();
    this.sessionAlertHistory = [];

    // Start geolocation tracking
    if ('geolocation' in navigator) {
      this.watchPositionId = navigator.geolocation.watchPosition(
        (pos) => {
          const speed = pos.coords.speed ? pos.coords.speed * 3.6 : 0;
          this.currentSpeedKmh = Math.max(0, Math.round(speed));
          this.currentCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading
          };

          // Check proximity to active hazards
          this.checkProximityToHazards(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }

    // Start accelerometer listener
    if ('DeviceMotionEvent' in window) {
      this.motionHandler = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity || event.acceleration;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 9.81;

        const zDelta = Math.abs(z - this.baselineZ);
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        const now = Date.now();
        const isCooldown = now - this.lastTriggerTime < this.config.cooldownMs;
        const isSpeedValid = this.currentSpeedKmh >= this.config.minSpeedKmh;

        // Heuristic: sudden vertical spike above threshold while vehicle is in motion
        const isImpact = zDelta >= this.config.thresholdZDelta && !isCooldown && isSpeedValid;

        const telemetry: SensorTelemetry = {
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          z: Math.round(z * 10) / 10,
          zDelta: Math.round(zDelta * 10) / 10,
          magnitude: Math.round(magnitude * 10) / 10,
          speedKmh: this.currentSpeedKmh,
          latitude: this.currentCoords?.lat || null,
          longitude: this.currentCoords?.lng || null,
          accuracyMeters: this.currentCoords?.accuracy || null,
          heading: this.currentCoords?.heading || null,
          isImpactCandidate: isImpact,
          statusMessage: isImpact
            ? '⚠️ Vertical impact spike detected (Candidate stored for post-ride review)'
            : 'Monitoring road surface...'
        };

        this.notifyTelemetry(telemetry);

        if (isImpact && this.config.autoRecordCandidate) {
          this.lastTriggerTime = now;
          this.recordCandidate(zDelta, magnitude);
          // Haptic tick if supported
          this.triggerVibration([100]);
        }
      };

      window.addEventListener('devicemotion', this.motionHandler);
    }

    return true;
  }

  public stopRide() {
    this.isListening = false;
    if (this.watchPositionId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchPositionId);
      this.watchPositionId = null;
    }
    if (this.motionHandler) {
      window.removeEventListener('devicemotion', this.motionHandler);
      this.motionHandler = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  // Check proximity to active road hazards and announce warnings ONCE
  private checkProximityToHazards(userLat: number, userLng: number) {
    const hazards = StorageService.getHazards().filter(
      (h) => h.canonicalStatus !== 'CONFIRMED_RESOLVED' && h.status !== 'resolved' && h.status !== 'rejected'
    );

    for (const h of hazards) {
      if (this.announcedHazardIds.has(h.id)) continue;

      const dist = calculateDistanceMeters(userLat, userLng, h.latitude, h.longitude);

      if (dist <= this.config.alertDistanceMeters) {
        // Mark as announced in this ride session to prevent repeated annoying alerts
        this.announcedHazardIds.add(h.id);

        const isWaterlog =
          h.category === 'waterlogged_road' ||
          h.category === 'waterlogging' ||
          h.additionalLabel === 'POTENTIALLY_HIDDEN_SURFACE_HAZARD';

        let spokenWarning = '';
        if (isWaterlog) {
          spokenWarning = 'Waterlogged road ahead. Road surface may be uneven. Proceed cautiously.';
        } else if (h.category === 'pothole') {
          spokenWarning = `Caution. Pothole reported approximately ${Math.round(dist)} metres ahead.`;
        } else if (h.category === 'road_construction') {
          spokenWarning = 'Road construction and loose gravel reported ahead.';
        } else if (h.category === 'open_drain' || h.category === 'damaged_manhole') {
          spokenWarning = 'Damaged drainage cover reported ahead.';
        } else {
          spokenWarning = `Road hazard reported ahead near ${h.locality}.`;
        }

        const alert: ProximityAlert = {
          id: 'alert-' + Date.now(),
          hazardId: h.id,
          hazardTitle: h.title,
          category: h.category,
          distanceMeters: Math.round(dist),
          spokenWarning,
          timestamp: new Date().toISOString(),
          isWaterloggedWarning: isWaterlog
        };

        this.sessionAlertHistory.unshift(alert);

        // Execute calm voice warning and haptic vibration
        this.triggerVoiceWarning(spokenWarning);
        this.triggerVibration([300, 150, 300]);

        // Notify subscribers
        this.alertSubscribers.forEach((cb) => cb(alert));
      }
    }
  }

  private recordCandidate(zDelta: number, magnitude: number) {
    const lat = this.currentCoords?.lat || 13.0359;
    const lng = this.currentCoords?.lng || 77.5969;
    const candidateScore = Math.min(96, Math.round(55 + (zDelta / 20) * 40));

    // Stored as SENSOR_CANDIDATE, NEVER auto-published as a verified pothole
    const candidate = StorageService.recordSensorEvent({
      latitude: lat,
      longitude: lng,
      locality: 'Current Ride Corridor',
      zDelta: Math.round(zDelta * 10) / 10,
      magnitude: Math.round(magnitude * 10) / 10,
      speedKmh: this.currentSpeedKmh || 38,
      candidateScore,
      notes: `Sensor Candidate: vertical jerk ${zDelta.toFixed(1)} m/s² detected at ${Math.round(this.currentSpeedKmh || 38)} km/h. Unverified sensor event.`
    });

    this.impactSubscribers.forEach((cb) => cb(candidate));
  }

  private notifyTelemetry(t: SensorTelemetry) {
    this.telemetrySubscribers.forEach((cb) => cb(t));
  }

  /**
   * Replay demonstration mode:
   * Simulates a 20-second motorcycle ride through Bengaluru Outer Ring Road with road vibration telemetry,
   * passing Hebbal pothole and KR Puram waterlogging, triggering voice warnings, vibration, and bump detection.
   */
  public startDemoSimulation(onBumpTriggered?: (ev: SensorImpactEvent) => void) {
    this.stopRide();
    this.isListening = true;
    this.announcedHazardIds.clear();
    this.sessionAlertHistory = [];

    let tick = 0;
    // Approaching Hebbal pothole cluster at 13.0358, 77.5970
    const startLat = 13.0370;
    const startLng = 77.5970;

    this.simulationInterval = window.setInterval(() => {
      tick++;
      const speed = Math.min(48, 22 + tick * 1.5);
      this.currentSpeedKmh = Math.round(speed);

      // Travel south along corridor toward Hebbal flyover ramp
      const currentLat = startLat - (tick * 0.00012);
      const currentLng = startLng;

      // Check proximity warnings along simulated trajectory
      this.checkProximityToHazards(currentLat, currentLng);

      // Normal vibration jitter
      let zDelta = 1.2 + (Math.sin(tick) * 1.4);
      let isBump = false;

      // At tick 9, simulate physical impact with Hebbal pothole
      if (tick === 9) {
        zDelta = 16.4;
        isBump = true;
      }

      const telemetry: SensorTelemetry = {
        x: Number((Math.sin(tick * 0.5) * 1.1).toFixed(1)),
        y: Number((Math.cos(tick * 0.3) * 0.7).toFixed(1)),
        z: Number((9.81 + zDelta).toFixed(1)),
        zDelta: Number(zDelta.toFixed(1)),
        magnitude: Number((9.81 + zDelta + Math.random()).toFixed(1)),
        speedKmh: this.currentSpeedKmh,
        latitude: currentLat,
        longitude: currentLng,
        accuracyMeters: 5,
        heading: 180,
        isImpactCandidate: isBump,
        statusMessage: isBump
          ? '⚠️ SIMULATED IMPACT DETECTED (Candidate stored — Review safely after stopping)'
          : `Cruising at ${this.currentSpeedKmh} km/h (Active corridor monitoring)`
      };

      this.notifyTelemetry(telemetry);

      if (isBump) {
        this.triggerVibration([300, 100, 300]);
        const candidate = StorageService.recordSensorEvent({
          latitude: currentLat,
          longitude: currentLng,
          locality: 'Hebbal Flyover Descent, ORR',
          zDelta: Number(zDelta.toFixed(1)),
          magnitude: Number(telemetry.magnitude.toFixed(1)),
          speedKmh: this.currentSpeedKmh,
          candidateScore: 88,
          notes: `Simulated impact detected at ${this.currentSpeedKmh} km/h. Vertical delta: ${zDelta.toFixed(1)} m/s². Unverified candidate.`
        });
        if (onBumpTriggered) onBumpTriggered(candidate);
        this.impactSubscribers.forEach((cb) => cb(candidate));
      }

      if (tick > 25) {
        this.stopRide();
      }
    }, 800);
  }
}

export const SensorService = new SensorServiceManager();

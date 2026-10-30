import { SensorImpactEvent } from '../types';
import { StorageService } from './storageService';

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

export interface SensorConfig {
  thresholdZDelta: number; // m/s^2 trigger threshold (default ~12.5)
  minSpeedKmh: number; // minimum speed to ignore handling when stopped (default ~15 km/h)
  cooldownMs: number; // interval between consecutive triggers
  autoRecordCandidate: boolean;
}

export const DEFAULT_SENSOR_CONFIG: SensorConfig = {
  thresholdZDelta: 12.0,
  minSpeedKmh: 12.0,
  cooldownMs: 3000,
  autoRecordCandidate: true
};

type TelemetryCallback = (telemetry: SensorTelemetry) => void;
type ImpactCandidateCallback = (event: SensorImpactEvent) => void;

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
  private simulationInterval: number | null = null;

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

  public updateConfig(newConfig: Partial<SensorConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): SensorConfig {
    return { ...this.config };
  }

  public calibrate() {
    this.baselineZ = 9.81;
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
    } else if ('DeviceMotionEvent' in window) {
      motionGranted = true; // Android / standard desktop Chrome
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
            ? 'Sudden vertical impact spike detected!'
            : 'Monitoring road surface...'
        };

        this.notifyTelemetry(telemetry);

        if (isImpact && this.config.autoRecordCandidate) {
          this.lastTriggerTime = now;
          this.recordCandidate(zDelta, magnitude);
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

  private recordCandidate(zDelta: number, magnitude: number) {
    const lat = this.currentCoords?.lat || 13.0359;
    const lng = this.currentCoords?.lng || 77.5969;
    const candidateScore = Math.min(96, Math.round(55 + (zDelta / 20) * 40));

    const candidate = StorageService.recordSensorEvent({
      latitude: lat,
      longitude: lng,
      locality: 'Current Ride Corridor',
      zDelta: Math.round(zDelta * 10) / 10,
      magnitude: Math.round(magnitude * 10) / 10,
      speedKmh: this.currentSpeedKmh || 38,
      candidateScore,
      notes: `Triggered at ${Math.round(this.currentSpeedKmh || 38)} km/h. Vertical jerk: ${zDelta.toFixed(1)} m/s²`
    });

    this.impactSubscribers.forEach((cb) => cb(candidate));
  }

  private notifyTelemetry(t: SensorTelemetry) {
    this.telemetrySubscribers.forEach((cb) => cb(t));
  }

  /**
   * Replay demonstration mode:
   * Simulates a 20-second motorcycle ride through Bengaluru Outer Ring Road with road vibration telemetry,
   * climbing from 25 km/h to 46 km/h, hitting a sharp pothole bump with high vertical acceleration, and triggering a candidate impact.
   */
  public startDemoSimulation(onBumpTriggered?: (ev: SensorImpactEvent) => void) {
    this.stopRide();
    this.isListening = true;

    let tick = 0;
    const baseLat = 13.0358;
    const baseLng = 77.5970;

    this.simulationInterval = window.setInterval(() => {
      tick++;
      const speed = Math.min(48, 24 + tick * 1.5);
      this.currentSpeedKmh = Math.round(speed);

      // Normal vibration jitter
      let zDelta = 1.2 + (Math.sin(tick) * 1.4);
      let isBump = false;

      // At tick 8 and tick 18, simulate sharp pothole impact
      if (tick === 8 || tick === 18) {
        zDelta = 15.6 + Math.random() * 3.5;
        isBump = true;
      }

      const currentLat = baseLat + (tick * 0.0001);
      const currentLng = baseLng + (tick * 0.00008);

      const telemetry: SensorTelemetry = {
        x: Number((Math.sin(tick * 0.5) * 1.2).toFixed(1)),
        y: Number((Math.cos(tick * 0.3) * 0.8).toFixed(1)),
        z: Number((9.81 + zDelta).toFixed(1)),
        zDelta: Number(zDelta.toFixed(1)),
        magnitude: Number((9.81 + zDelta + Math.random()).toFixed(1)),
        speedKmh: this.currentSpeedKmh,
        latitude: currentLat,
        longitude: currentLng,
        accuracyMeters: 6,
        heading: 45,
        isImpactCandidate: isBump,
        statusMessage: isBump
          ? '⚠️ POTHOLE IMPACT SPIKE DETECTED (16.2 m/s²)'
          : 'Cruising at ' + this.currentSpeedKmh + ' km/h — road surface normal'
      };

      this.notifyTelemetry(telemetry);

      if (isBump) {
        const candidate = StorageService.recordSensorEvent({
          latitude: currentLat,
          longitude: currentLng,
          locality: 'Hebbal Flyover Descent, ORR',
          zDelta: Number(zDelta.toFixed(1)),
          magnitude: Number(telemetry.magnitude.toFixed(1)),
          speedKmh: this.currentSpeedKmh,
          candidateScore: 88,
          notes: `Simulated impact detected at ${this.currentSpeedKmh} km/h. Vertical delta: ${zDelta.toFixed(1)} m/s²`
        });
        if (onBumpTriggered) onBumpTriggered(candidate);
        this.impactSubscribers.forEach((cb) => cb(candidate));
      }

      if (tick > 30) {
        this.stopRide();
      }
    }, 600);
  }
}

export const SensorService = new SensorServiceManager();

import { Hazard, RouteInfo } from '../types';
import { calculateDistanceMeters, StorageService } from './storageService';

export interface RouteCorridorHazard {
  hazard: Hazard;
  distanceAlongRouteMeters: number;
  lateralDistanceMeters: number;
  warningMessage: string;
  isWaterloggedWarning: boolean;
}

// Distance from point P to line segment AB in meters
function distanceToSegmentMeters(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (l2 === 0) return calculateDistanceMeters(px, py, ax, ay);

  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * (bx - ax);
  const projY = ay + t * (by - ay);

  return calculateDistanceMeters(px, py, projX, projY);
}

export const PRESET_ROUTES = [
  {
    id: 'hebbal-to-indiranagar',
    name: 'Hebbal Flyover to Indiranagar (via Outer Ring Road & Old Madras Rd)',
    startName: 'Hebbal Bus Terminus',
    destName: 'Indiranagar 100ft Road Metro',
    startCoords: [13.0358, 77.5970] as [number, number],
    destCoords: [12.9719, 77.6412] as [number, number]
  },
  {
    id: 'indiranagar-to-whitefield',
    name: 'Indiranagar to ITPL Whitefield (via Marathahalli ORR)',
    startName: 'Indiranagar 100ft Road',
    destName: 'ITPL Main Gate, Whitefield',
    startCoords: [12.9719, 77.6412] as [number, number],
    destCoords: [12.9856, 77.7289] as [number, number]
  },
  {
    id: 'yelahanka-to-hebbal',
    name: 'Yelahanka New Town to Hebbal Junction (NH 44 Airport Corridor)',
    startName: 'Yelahanka Major Sandeep Unnikrishnan Rd',
    destName: 'Hebbal Esteem Mall',
    startCoords: [13.1007, 77.5963] as [number, number],
    destCoords: [13.0358, 77.5970] as [number, number]
  },
  {
    id: 'koramangala-to-ecity',
    name: 'Koramangala to Electronic City (Hosur Elevated Expressway)',
    startName: 'Koramangala Sony World Junction',
    destName: 'Electronic City Toll Plaza Phase 1',
    startCoords: [12.9352, 77.6245] as [number, number],
    destCoords: [12.8452, 77.6601] as [number, number]
  }
];

export const RoutingService = {
  /**
   * Fetches real driving route from Open Source Routing Machine (OSRM).
   * Falls back gracefully to interpolated road coordinates if offline or rate-limited.
   */
  async planRoute(
    start: [number, number],
    destination: [number, number],
    startName: string,
    destinationName: string,
    corridorBufferMeters = 80
  ): Promise<RouteInfo> {
    let coordinates: [number, number][] = [];
    let distanceKm = 0;
    let durationMinutes = 0;

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(osrmUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          distanceKm = Number((route.distance / 1000).toFixed(1));
          durationMinutes = Math.round(route.duration / 60);
        }
      }
    } catch {
      // Graceful fallback
    }

    if (coordinates.length === 0) {
      coordinates = this.generateFallbackPolyline(start, destination);
      const directDistM = calculateDistanceMeters(start[0], start[1], destination[0], destination[1]);
      distanceKm = Number(((directDistM * 1.3) / 1000).toFixed(1));
      durationMinutes = Math.round((distanceKm / 35) * 60);
    }

    // Corridor Hazard Analysis
    const allHazards = StorageService.getHazards().filter(
      (h) => h.canonicalStatus !== 'CONFIRMED_RESOLVED' && h.status !== 'resolved' && h.status !== 'rejected'
    );

    const hazardsOnRoute: RouteCorridorHazard[] = [];

    allHazards.forEach((hazard) => {
      let minDistanceMeters = Infinity;
      let closestSegmentIndex = 0;

      for (let i = 0; i < coordinates.length - 1; i++) {
        const segStart = coordinates[i];
        const segEnd = coordinates[i + 1];
        const dist = distanceToSegmentMeters(
          hazard.latitude,
          hazard.longitude,
          segStart[0],
          segStart[1],
          segEnd[0],
          segEnd[1]
        );

        if (dist < minDistanceMeters) {
          minDistanceMeters = dist;
          closestSegmentIndex = i;
        }
      }

      // Check if hazard falls within corridor buffer
      if (minDistanceMeters <= corridorBufferMeters) {
        let distAlongRoute = 0;
        for (let j = 0; j < closestSegmentIndex; j++) {
          distAlongRoute += calculateDistanceMeters(
            coordinates[j][0],
            coordinates[j][1],
            coordinates[j + 1][0],
            coordinates[j + 1][1]
          );
        }

        const distanceMetersRounded = Math.round(minDistanceMeters);
        const isWaterlog =
          hazard.category === 'waterlogged_road' ||
          hazard.category === 'waterlogging' ||
          hazard.additionalLabel === 'POTENTIALLY_HIDDEN_SURFACE_HAZARD';

        let warning = '';
        if (isWaterlog) {
          warning = 'Waterlogged road ahead. Road surface may be uneven. Proceed cautiously.';
        } else if (hazard.severity === 'critical') {
          warning = `Critical ${hazard.category.replace('_', ' ')} detected ~${distanceMetersRounded}m from route in ${hazard.locality}`;
        } else {
          warning = `${hazard.category.replace('_', ' ')} reported near route corridor (${hazard.locality})`;
        }

        hazardsOnRoute.push({
          hazard,
          distanceAlongRouteMeters: Math.round(distAlongRoute),
          lateralDistanceMeters: distanceMetersRounded,
          warningMessage: warning,
          isWaterloggedWarning: isWaterlog
        });
      }
    });

    // Sort hazards in order of appearance along route
    hazardsOnRoute.sort((a, b) => a.distanceAlongRouteMeters - b.distanceAlongRouteMeters);

    // Compute simple safety score 1-10
    const criticalCount = hazardsOnRoute.filter((h) => h.hazard.severity === 'critical').length;
    const highCount = hazardsOnRoute.filter((h) => h.hazard.severity === 'high').length;
    const moderateCount = hazardsOnRoute.filter((h) => h.hazard.severity === 'moderate').length;

    let safetyScore = 10 - criticalCount * 2.5 - highCount * 1.5 - moderateCount * 0.5;
    safetyScore = Math.max(1, Math.min(10, Math.round(safetyScore * 10) / 10));

    // Strictly advisory language: never claim 100% safe
    const safetySummary =
      hazardsOnRoute.length > 0
        ? `Known reports indicate ${hazardsOnRoute.length} road ${
            hazardsOnRoute.length === 1 ? 'hazard' : 'hazards'
          } along this route corridor. Exercise caution.`
        : 'Fewer currently reported hazards on this route corridor. Road conditions change continuously; remain alert.';

    return {
      startName,
      destinationName,
      startCoords: start,
      destCoords: destination,
      distanceKm,
      durationMinutes,
      coordinates,
      hazardsOnRoute,
      safetyScore,
      safetySummary
    };
  },

  generateFallbackPolyline(start: [number, number], end: [number, number]): [number, number][] {
    const points: [number, number][] = [start];
    const steps = 14;
    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;
      const lateralJitter = Math.sin(ratio * Math.PI) * 0.004;
      const lat = start[0] + (end[0] - start[0]) * ratio + lateralJitter * 0.4;
      const lng = start[1] + (end[1] - start[1]) * ratio + lateralJitter;
      points.push([lat, lng]);
    }
    points.push(end);
    return points;
  },

  speakHazardAlert(text: string) {
    if ('speechSynthesis' in window) {
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
};

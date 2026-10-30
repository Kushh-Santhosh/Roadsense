export type HazardCategory =
  | 'pothole'
  | 'road_cracks'
  | 'uneven_surface'
  | 'open_manhole'
  | 'damaged_manhole'
  | 'waterlogging'
  | 'road_construction'
  | 'fallen_tree_debris'
  | 'exposed_utility'
  | 'damaged_edge'
  | 'other';

export type HazardSeverity = 'critical' | 'high' | 'moderate' | 'resolved';

export type VerificationStatus =
  | 'submitted'
  | 'under_verification'
  | 'community_confirmed'
  | 'forwarded_review'
  | 'resolved'
  | 'rejected';

export interface HazardReport {
  id: string;
  hazardId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  timestamp: string;
  imageUrl: string;
  category: HazardCategory;
  aiClassification?: {
    detectedCategory: string;
    confidence: number;
    boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1
    damageType: string;
  };
  userConfirmedCategory: HazardCategory;
  severity: HazardSeverity;
  confidenceScore: number; // 0 to 100
  verificationStatus: VerificationStatus;
  description?: string;
  sensorTriggered?: boolean;
  upvotes: number;
  downvotes: number;
  isDemo?: boolean;
}

export interface HazardConfirmation {
  id: string;
  hazardId: string;
  userId: string;
  userName: string;
  timestamp: string;
  status: 'still_present' | 'no_longer_present' | 'duplicate' | 'incorrect';
  updatedImageUrl?: string;
  comment?: string;
}

export interface Hazard {
  id: string;
  title: string;
  description: string;
  category: HazardCategory;
  severity: HazardSeverity;
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  status: VerificationStatus;
  confidenceScore: number; // 0 to 100
  reportsCount: number;
  confirmationsCount: number;
  stillPresentVotes: number;
  noLongerPresentVotes: number;
  primaryImageUrl: string;
  firstReportedAt: string;
  lastUpdatedAt: string;
  aiDetected: boolean;
  sensorDetected: boolean;
  reports: HazardReport[];
  confirmations: HazardConfirmation[];
  assignedTeam?: string;
  internalNotes?: string;
  resolvedAt?: string;
  resolutionRemarks?: string;
  resolutionEvidenceUrl?: string;
  isDemo?: boolean;
}

export interface SensorImpactEvent {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  locality: string;
  zDelta: number; // m/s^2 vertical jerk
  magnitude: number;
  speedKmh: number;
  candidateScore: number; // 0 to 100
  status: 'unreviewed' | 'converted_to_report' | 'discarded';
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'rider' | 'authority' | 'admin';
  avatar: string;
  points: number;
  trustScore: number; // 0 to 100
  reportsCount: number;
  confirmationsCount: number;
  joinedAt: string;
  phone?: string;
  locality?: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  lat: number;
  lng: number;
}

export interface RouteInfo {
  startName: string;
  destinationName: string;
  startCoords: [number, number];
  destCoords: [number, number];
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // polyline points [lat, lng]
  hazardsOnRoute: {
    hazard: Hazard;
    distanceAlongRouteMeters: number;
    lateralDistanceMeters: number;
    warningMessage: string;
  }[];
  safetyScore: number; // 1 to 10
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetId: string;
  targetType: 'hazard' | 'report' | 'user' | 'system';
  details: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'hazard_proximity' | 'report_confirmed' | 'hazard_resolved' | 'system';
  hazardId?: string;
  read: boolean;
  severity?: 'critical' | 'warning' | 'info';
}

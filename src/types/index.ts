export type HazardCategory =
  | 'pothole'
  | 'road_cracks'
  | 'uneven_surface'
  | 'waterlogged_road'
  | 'potentially_hidden_surface_hazard'
  | 'open_drain'
  | 'damaged_manhole'
  | 'road_construction'
  | 'loose_gravel_debris'
  | 'fallen_tree_obstruction'
  | 'damaged_edge'
  | 'other'
  // Backward compatibility aliases
  | 'waterlogging'
  | 'open_manhole'
  | 'fallen_tree_debris'
  | 'exposed_utility';

export type HazardSeverity = 'critical' | 'high' | 'moderate' | 'resolved';

export type CanonicalVerificationStatus =
  | 'NEWLY_REPORTED'
  | 'UNDER_REVIEW'
  | 'COMMUNITY_CORROBORATED'
  | 'RECENTLY_CONFIRMED'
  | 'DISPUTED'
  | 'STALE_NEEDS_RECONFIRMATION'
  | 'RESOLUTION_SUBMITTED'
  | 'CONFIRMED_RESOLVED';

export type VerificationStatus =
  | CanonicalVerificationStatus
  // Backward compatibility lowercase aliases
  | 'submitted'
  | 'under_verification'
  | 'community_confirmed'
  | 'forwarded_review'
  | 'resolved'
  | 'rejected';

export interface TrustTimelineEvent {
  id: string;
  stage: CanonicalVerificationStatus | string;
  timestamp: string;
  title: string;
  actor: string;
  details: string;
  evidenceType?: 'citizen_report' | 'community_vote' | 'ai_inference' | 'sensor_candidate' | 'authority_action' | 'n8n_automation';
}

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
  additionalLabel?: 'POTENTIALLY_HIDDEN_SURFACE_HAZARD' | string;
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

export interface HazardEvidence {
  aiSuggestion?: {
    category: string;
    damageType: string;
    confidence: number;
    isModelBacked: boolean;
  };
  independentRiderConfirmations: number;
  uniqueUserIdsConfirmed: string[];
  hasPhotoEvidence: boolean;
  lastConfirmedAt: string;
  sensorCandidateCount: number;
  isDisputed: boolean;
  staleReason?: string;
}

export interface Hazard {
  id: string;
  title: string;
  description: string;
  category: HazardCategory;
  additionalLabel?: 'POTENTIALLY_HIDDEN_SURFACE_HAZARD' | string;
  severity: HazardSeverity;
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  status: VerificationStatus;
  canonicalStatus: CanonicalVerificationStatus;
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
  evidence: HazardEvidence;
  reports: HazardReport[];
  confirmations: HazardConfirmation[];
  trustTimeline: TrustTimelineEvent[];
  assignedTeam?: string;
  internalNotes?: string;
  resolvedAt?: string;
  resolutionRemarks?: string;
  resolutionEvidenceUrl?: string;
  isDemo?: boolean;
  n8nProcessed?: boolean;
  lastN8nExecutionId?: string;
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
  categoryHint?: 'SENSOR_CANDIDATE';
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
    isWaterloggedWarning?: boolean;
  }[];
  safetyScore: number; // 1 to 10 (Advisory rating)
  safetySummary: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetId: string;
  targetType: 'hazard' | 'report' | 'user' | 'system' | 'n8n';
  details: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'hazard_proximity' | 'report_confirmed' | 'hazard_resolved' | 'system' | 'waterlog_warning';
  hazardId?: string;
  read: boolean;
  severity?: 'critical' | 'warning' | 'info';
}

export interface N8NWorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: string;
  finishedAt: string;
  status: 'success' | 'running' | 'error' | 'waiting';
  mode: 'webhook' | 'schedule' | 'manual';
  payloadSummary: string;
  executionTimeMs: number;
  errorDetails?: string;
}

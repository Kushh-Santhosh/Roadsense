import {
  Hazard,
  HazardReport,
  HazardConfirmation,
  SensorImpactEvent,
  UserProfile,
  AdminAuditLog,
  NotificationItem,
  HazardCategory,
  HazardSeverity,
  VerificationStatus,
  CanonicalVerificationStatus,
  TrustTimelineEvent
} from '../types';
import {
  INITIAL_HAZARDS,
  DEMO_USERS,
  INITIAL_SENSOR_EVENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/seedData';

const STORAGE_KEYS = {
  HAZARDS: 'roadsense_hazards_v2',
  USERS: 'roadsense_users_v2',
  CURRENT_USER_ID: 'roadsense_current_user_id_v2',
  SENSOR_EVENTS: 'roadsense_sensor_events_v2',
  AUDIT_LOGS: 'roadsense_audit_logs_v2',
  NOTIFICATIONS: 'roadsense_notifications_v2',
  SETTINGS: 'roadsense_settings_v2'
};

// Calculate Haversine distance in meters between two lat/lng points
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Convert any legacy status string to modern CanonicalVerificationStatus
export function toCanonicalStatus(status: VerificationStatus | string): CanonicalVerificationStatus {
  const map: Record<string, CanonicalVerificationStatus> = {
    NEWLY_REPORTED: 'NEWLY_REPORTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    COMMUNITY_CORROBORATED: 'COMMUNITY_CORROBORATED',
    RECENTLY_CONFIRMED: 'RECENTLY_CONFIRMED',
    DISPUTED: 'DISPUTED',
    STALE_NEEDS_RECONFIRMATION: 'STALE_NEEDS_RECONFIRMATION',
    RESOLUTION_SUBMITTED: 'RESOLUTION_SUBMITTED',
    CONFIRMED_RESOLVED: 'CONFIRMED_RESOLVED',
    // Legacy string mappings
    submitted: 'NEWLY_REPORTED',
    under_verification: 'UNDER_REVIEW',
    community_confirmed: 'COMMUNITY_CORROBORATED',
    forwarded_review: 'UNDER_REVIEW',
    resolved: 'CONFIRMED_RESOLVED',
    rejected: 'DISPUTED'
  };
  return map[status] || 'UNDER_REVIEW';
}

export const StorageService = {
  // Initialize storage with demo seed data if empty
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.HAZARDS)) {
      localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(INITIAL_HAZARDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-kushal');
    }
    if (!localStorage.getItem(STORAGE_KEYS.SENSOR_EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.SENSOR_EVENTS, JSON.stringify(INITIAL_SENSOR_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  },

  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(INITIAL_HAZARDS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-kushal');
    localStorage.setItem(STORAGE_KEYS.SENSOR_EVENTS, JSON.stringify(INITIAL_SENSOR_EVENTS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    return true;
  },

  // USERS
  getUsers(): UserProfile[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch {
      return DEMO_USERS;
    }
  },

  getCurrentUser(): UserProfile {
    this.init();
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return users.find((u) => u.id === currentId) || users[0];
  },

  setCurrentUser(userId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  // HAZARDS
  getHazards(): Hazard[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HAZARDS);
      const list: Hazard[] = data ? JSON.parse(data) : INITIAL_HAZARDS;
      // Auto upgrade backwards compatibility
      return list.map((h) => {
        if (!h.canonicalStatus) {
          h.canonicalStatus = toCanonicalStatus(h.status);
        }
        if (!h.evidence) {
          h.evidence = {
            independentRiderConfirmations: h.confirmationsCount || 0,
            uniqueUserIdsConfirmed: [],
            hasPhotoEvidence: !!h.primaryImageUrl,
            lastConfirmedAt: h.lastUpdatedAt || h.firstReportedAt,
            sensorCandidateCount: h.sensorDetected ? 1 : 0,
            isDisputed: h.noLongerPresentVotes > (h.stillPresentVotes || 0)
          };
        }
        if (!h.trustTimeline || h.trustTimeline.length === 0) {
          h.trustTimeline = [
            {
              id: 'tt-legacy-' + h.id,
              stage: h.canonicalStatus,
              timestamp: h.firstReportedAt,
              title: 'Hazard Record Active',
              actor: 'Community Commuter',
              details: h.description,
              evidenceType: 'citizen_report'
            }
          ];
        }
        return h;
      });
    } catch (e) {
      console.error('Error reading hazards', e);
      return INITIAL_HAZARDS;
    }
  },

  getHazardById(id: string): Hazard | undefined {
    const hazards = this.getHazards();
    return hazards.find((h) => h.id === id);
  },

  saveHazards(hazards: Hazard[]) {
    localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(hazards));
  },

  // Configurable duplicate detection: checks proximity (default 50m) and category alignment
  findPotentialDuplicate(
    lat: number,
    lng: number,
    category: HazardCategory,
    thresholdMeters = 50
  ): Hazard | null {
    const hazards = this.getHazards();
    for (const h of hazards) {
      if (h.canonicalStatus === 'CONFIRMED_RESOLVED' || h.status === 'resolved' || h.status === 'rejected') continue;
      const distance = calculateDistanceMeters(lat, lng, h.latitude, h.longitude);
      if (distance <= thresholdMeters) {
        // High likelihood if identical category or related pavement distress
        const pavementDistress = ['pothole', 'road_cracks', 'uneven_surface'];
        const waterlogDistress = ['waterlogged_road', 'potentially_hidden_surface_hazard', 'waterlogging'];
        
        const bothPavement = pavementDistress.includes(category) && pavementDistress.includes(h.category);
        const bothWaterlog = waterlogDistress.includes(category) && waterlogDistress.includes(h.category);

        if (h.category === category || bothPavement || bothWaterlog) {
          return h;
        }
      }
    }
    return null;
  },

  // Calculate dynamic confidence score (transparent evidence metric, not arbitrary percentage)
  calculateConfidence(hazard: Partial<Hazard>): number {
    let score = 50; // base score for a fresh submission
    const independentCount = hazard.evidence?.independentRiderConfirmations || hazard.confirmationsCount || 0;
    const stillPresent = hazard.stillPresentVotes || 0;
    const noLonger = hazard.noLongerPresentVotes || 0;

    // Independent rider corroboration boost (max +30)
    score += Math.min(independentCount * 6, 30);

    // AI model vision detection with RDD2022 confidence boost (+10)
    if (hazard.aiDetected) {
      score += 10;
    }

    // Accelerometer sensor candidate spike confirmation (+10)
    if (hazard.sensorDetected) {
      score += 10;
    }

    // Photographic proof present (+10)
    if (hazard.primaryImageUrl && hazard.primaryImageUrl.length > 0) {
      score += 10;
    }

    // Disputed / conflict penalty
    if (noLonger > 0 && stillPresent > 0) {
      const negativeRatio = noLonger / (stillPresent + noLonger);
      score -= Math.round(negativeRatio * 35);
    }

    return Math.max(20, Math.min(99, score));
  },

  // Submit a new hazard report
  createHazardReport(params: {
    latitude: number;
    longitude: number;
    address: string;
    locality: string;
    category: HazardCategory;
    additionalLabel?: 'POTENTIALLY_HIDDEN_SURFACE_HAZARD';
    severity: HazardSeverity;
    description: string;
    imageUrl: string;
    aiClassification?: HazardReport['aiClassification'];
    sensorTriggered?: boolean;
    duplicateThresholdMeters?: number;
  }): { hazard: Hazard; isDuplicateGrouped: boolean } {
    this.init();
    const currentUser = this.getCurrentUser();
    const hazards = this.getHazards();

    const threshold = params.duplicateThresholdMeters || 50;
    const existingDuplicate = this.findPotentialDuplicate(params.latitude, params.longitude, params.category, threshold);

    const reportId = 'rep-' + Date.now();
    const newReport: HazardReport = {
      id: reportId,
      hazardId: existingDuplicate ? existingDuplicate.id : '',
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address,
      locality: params.locality,
      timestamp: new Date().toISOString(),
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      category: params.category,
      additionalLabel: params.additionalLabel,
      aiClassification: params.aiClassification,
      userConfirmedCategory: params.category,
      severity: params.severity,
      confidenceScore: params.aiClassification ? Math.round(params.aiClassification.confidence * 100) : 70,
      verificationStatus: 'NEWLY_REPORTED',
      description: params.description,
      sensorTriggered: params.sensorTriggered,
      upvotes: 1,
      downvotes: 0,
      isDemo: false
    };

    let targetHazard: Hazard;
    let isDuplicateGrouped = false;

    if (existingDuplicate) {
      isDuplicateGrouped = true;
      newReport.hazardId = existingDuplicate.id;
      existingDuplicate.reports = [newReport, ...(existingDuplicate.reports || [])];
      existingDuplicate.reportsCount += 1;
      existingDuplicate.confirmationsCount += 1;
      existingDuplicate.stillPresentVotes += 1;
      existingDuplicate.lastUpdatedAt = new Date().toISOString();

      // Update evidence without double-counting same user
      if (!existingDuplicate.evidence) {
        existingDuplicate.evidence = {
          independentRiderConfirmations: 1,
          uniqueUserIdsConfirmed: [],
          hasPhotoEvidence: true,
          lastConfirmedAt: new Date().toISOString(),
          sensorCandidateCount: 0,
          isDisputed: false
        };
      }
      if (!existingDuplicate.evidence.uniqueUserIdsConfirmed.includes(currentUser.id)) {
        existingDuplicate.evidence.uniqueUserIdsConfirmed.push(currentUser.id);
        existingDuplicate.evidence.independentRiderConfirmations += 1;
      }
      existingDuplicate.evidence.lastConfirmedAt = new Date().toISOString();
      if (params.aiClassification) existingDuplicate.aiDetected = true;
      if (params.sensorTriggered) {
        existingDuplicate.sensorDetected = true;
        existingDuplicate.evidence.sensorCandidateCount += 1;
      }

      // Transition status based on evidence
      if (existingDuplicate.evidence.independentRiderConfirmations >= 2) {
        existingDuplicate.canonicalStatus = 'COMMUNITY_CORROBORATED';
        existingDuplicate.status = 'COMMUNITY_CORROBORATED';
      }

      existingDuplicate.confidenceScore = this.calculateConfidence(existingDuplicate);

      // Append Trust Timeline Event
      const timelineEvent: TrustTimelineEvent = {
        id: 'tt-' + Date.now(),
        stage: existingDuplicate.canonicalStatus,
        timestamp: new Date().toISOString(),
        title: 'Corroborating Report Filed by Nearby Rider',
        actor: `${currentUser.name} (${currentUser.role})`,
        details: `Corroborated incident within ${threshold}m radius with fresh photo evidence.`,
        evidenceType: 'citizen_report'
      };
      existingDuplicate.trustTimeline = [timelineEvent, ...(existingDuplicate.trustTimeline || [])];

      targetHazard = existingDuplicate;
      this.saveHazards(hazards);

      this.addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'REPORT_DUPLICATE_GROUPED',
        targetId: existingDuplicate.id,
        targetType: 'hazard',
        details: `Report ${reportId} auto-clustered into hazard ${existingDuplicate.id} within ${threshold}m.`
      });
    } else {
      const hazardId = 'haz-' + Date.now();
      newReport.hazardId = hazardId;

      const categoryLabels: Record<HazardCategory, string> = {
        pothole: 'Pothole on Carriageway',
        road_cracks: 'Severe Road Surface Cracks',
        uneven_surface: 'Uneven Road Surface / Bump',
        waterlogged_road: 'Waterlogged Road — Potentially Hidden Surface Hazard',
        potentially_hidden_surface_hazard: 'Potentially Hidden Surface Hazard',
        open_drain: 'Exposed Open Drain / Culvert',
        damaged_manhole: 'Damaged Drainage Cover',
        road_construction: 'Unbarricaded Road Construction',
        loose_gravel_debris: 'Loose Gravel or Debris on Pavement',
        fallen_tree_obstruction: 'Fallen Tree / Roadway Obstruction',
        damaged_edge: 'Damaged Road Shoulder / Edge',
        other: 'Reported Road Hazard',
        // aliases
        waterlogging: 'Waterlogged Road — Potentially Hidden Surface Hazard',
        open_manhole: 'Critical Open Manhole',
        fallen_tree_debris: 'Fallen Tree / Debris',
        exposed_utility: 'Exposed Utility Trench'
      };

      const title = params.additionalLabel === 'POTENTIALLY_HIDDEN_SURFACE_HAZARD'
        ? `Waterlogged Road — Potentially Hidden Surface Hazard in ${params.locality}`
        : `${categoryLabels[params.category] || 'Road Hazard'} in ${params.locality}`;

      const initialTimeline: TrustTimelineEvent[] = [
        {
          id: 'tt-' + Date.now(),
          stage: 'NEWLY_REPORTED',
          timestamp: new Date().toISOString(),
          title: 'Initial Citizen Incident Report',
          actor: `${currentUser.name} (${currentUser.role})`,
          details: params.description || `Reported ${params.category.replace('_', ' ')} with GPS coordinates.`,
          evidenceType: 'citizen_report'
        }
      ];

      if (params.aiClassification) {
        initialTimeline.unshift({
          id: 'tt-ai-' + Date.now(),
          stage: 'UNDER_REVIEW',
          timestamp: new Date().toISOString(),
          title: 'RoadScan AI Vision Classification Attached',
          actor: 'RoadScan AI (RDD2022 Classifier)',
          details: `Identified ${params.aiClassification.detectedCategory} (${Math.round(params.aiClassification.confidence * 100)}% confidence score). Human confirmation verified.`,
          evidenceType: 'ai_inference'
        });
      }

      const newHazard: Hazard = {
        id: hazardId,
        title,
        description: params.description || `Reported ${categoryLabels[params.category] || 'road hazard'} near ${params.address}.`,
        category: params.category,
        additionalLabel: params.additionalLabel,
        severity: params.severity,
        latitude: params.latitude,
        longitude: params.longitude,
        address: params.address,
        locality: params.locality,
        status: 'NEWLY_REPORTED',
        canonicalStatus: 'NEWLY_REPORTED',
        confidenceScore: params.aiClassification ? Math.round(params.aiClassification.confidence * 85) : 65,
        reportsCount: 1,
        confirmationsCount: 1,
        stillPresentVotes: 1,
        noLongerPresentVotes: 0,
        primaryImageUrl: newReport.imageUrl,
        firstReportedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        aiDetected: !!params.aiClassification,
        sensorDetected: !!params.sensorTriggered,
        evidence: {
          aiSuggestion: params.aiClassification ? {
            category: params.aiClassification.detectedCategory,
            damageType: params.aiClassification.damageType,
            confidence: params.aiClassification.confidence,
            isModelBacked: true
          } : undefined,
          independentRiderConfirmations: 1,
          uniqueUserIdsConfirmed: [currentUser.id],
          hasPhotoEvidence: !!params.imageUrl,
          lastConfirmedAt: new Date().toISOString(),
          sensorCandidateCount: params.sensorTriggered ? 1 : 0,
          isDisputed: false
        },
        reports: [newReport],
        confirmations: [],
        trustTimeline: initialTimeline,
        isDemo: false
      };

      newHazard.confidenceScore = this.calculateConfidence(newHazard);
      hazards.unshift(newHazard);
      targetHazard = newHazard;
      this.saveHazards(hazards);

      this.addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'HAZARD_CREATED',
        targetId: newHazard.id,
        targetType: 'hazard',
        details: `New hazard reported by ${currentUser.name} at ${params.address}`
      });
    }

    // Update user stats
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].reportsCount += 1;
      users[userIndex].points += 30;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    return { hazard: targetHazard, isDuplicateGrouped };
  },

  // Confirm or vote on a hazard (with evidence attribution & trust timeline)
  confirmHazard(
    hazardId: string,
    voteType: 'still_present' | 'no_longer_present' | 'duplicate' | 'incorrect',
    comment?: string,
    updatedImageUrl?: string
  ): Hazard | null {
    const hazards = this.getHazards();
    const hazard = hazards.find((h) => h.id === hazardId);
    if (!hazard) return null;

    const currentUser = this.getCurrentUser();
    const confirmation: HazardConfirmation = {
      id: 'conf-' + Date.now(),
      hazardId,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      status: voteType,
      comment,
      updatedImageUrl
    };

    if (!hazard.confirmations) hazard.confirmations = [];
    hazard.confirmations.unshift(confirmation);
    hazard.confirmationsCount += 1;

    if (!hazard.evidence) {
      hazard.evidence = {
        independentRiderConfirmations: 0,
        uniqueUserIdsConfirmed: [],
        hasPhotoEvidence: !!hazard.primaryImageUrl,
        lastConfirmedAt: new Date().toISOString(),
        sensorCandidateCount: 0,
        isDisputed: false
      };
    }

    // Check if new unique rider
    const isNewRider = !hazard.evidence.uniqueUserIdsConfirmed.includes(currentUser.id);
    if (isNewRider) {
      hazard.evidence.uniqueUserIdsConfirmed.push(currentUser.id);
    }

    if (voteType === 'still_present') {
      hazard.stillPresentVotes += 1;
      if (isNewRider) {
        hazard.evidence.independentRiderConfirmations += 1;
      }
      hazard.evidence.lastConfirmedAt = new Date().toISOString();
      hazard.lastUpdatedAt = new Date().toISOString();

      // State transitions
      if (hazard.evidence.independentRiderConfirmations >= 2) {
        hazard.canonicalStatus = 'COMMUNITY_CORROBORATED';
        hazard.status = 'COMMUNITY_CORROBORATED';
      } else {
        hazard.canonicalStatus = 'RECENTLY_CONFIRMED';
        hazard.status = 'RECENTLY_CONFIRMED';
      }

      // Add to trust timeline
      hazard.trustTimeline.unshift({
        id: 'tt-' + Date.now(),
        stage: hazard.canonicalStatus,
        timestamp: new Date().toISOString(),
        title: 'Rider Confirmed Hazard Still Present',
        actor: `${currentUser.name} (Rider)`,
        details: comment || 'Verified that hazard remains active on carriageway.',
        evidenceType: 'community_vote'
      });
    } else if (voteType === 'no_longer_present') {
      hazard.noLongerPresentVotes += 1;
      hazard.lastUpdatedAt = new Date().toISOString();

      if (hazard.noLongerPresentVotes >= 3 && hazard.noLongerPresentVotes > hazard.stillPresentVotes) {
        hazard.canonicalStatus = 'CONFIRMED_RESOLVED';
        hazard.status = 'CONFIRMED_RESOLVED';
        hazard.severity = 'resolved';
        hazard.resolvedAt = new Date().toISOString();
        hazard.resolutionRemarks = 'Community consensus indicated hazard is no longer present.';

        hazard.trustTimeline.unshift({
          id: 'tt-' + Date.now(),
          stage: 'CONFIRMED_RESOLVED',
          timestamp: new Date().toISOString(),
          title: 'Community Consensus Confirmed Resolved',
          actor: `${currentUser.name} and Community`,
          details: 'Multiple riders voted hazard is no longer present on road.',
          evidenceType: 'community_vote'
        });
      } else {
        hazard.canonicalStatus = 'DISPUTED';
        hazard.status = 'DISPUTED';
        hazard.evidence.isDisputed = true;

        hazard.trustTimeline.unshift({
          id: 'tt-' + Date.now(),
          stage: 'DISPUTED',
          timestamp: new Date().toISOString(),
          title: 'Conflicting Report Logged (Disputed)',
          actor: `${currentUser.name} (Rider)`,
          details: comment || 'Rider reported hazard may no longer be present. Marked for re-inspection.',
          evidenceType: 'community_vote'
        });
      }
    }

    hazard.confidenceScore = this.calculateConfidence(hazard);
    this.saveHazards(hazards);

    // Update user stats
    const users = this.getUsers();
    const uIdx = users.findIndex((u) => u.id === currentUser.id);
    if (uIdx !== -1) {
      users[uIdx].confirmationsCount += 1;
      users[uIdx].points += 15;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    this.addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'HAZARD_CONFIRMED',
      targetId: hazard.id,
      targetType: 'hazard',
      details: `${currentUser.name} voted '${voteType}' for hazard ${hazard.id}`
    });

    return hazard;
  },

  // Authority status updates & resolution sign-off
  updateHazardStatus(
    hazardId: string,
    status: VerificationStatus,
    resolutionData?: {
      assignedTeam?: string;
      internalNotes?: string;
      resolutionRemarks?: string;
      resolutionEvidenceUrl?: string;
    }
  ): Hazard | null {
    const hazards = this.getHazards();
    const hazard = hazards.find((h) => h.id === hazardId);
    if (!hazard) return null;

    const currentUser = this.getCurrentUser();
    const canonical = toCanonicalStatus(status);
    hazard.status = canonical;
    hazard.canonicalStatus = canonical;
    hazard.lastUpdatedAt = new Date().toISOString();

    if (canonical === 'CONFIRMED_RESOLVED' || status === 'resolved') {
      hazard.severity = 'resolved';
      hazard.resolvedAt = new Date().toISOString();
      if (resolutionData?.resolutionRemarks) {
        hazard.resolutionRemarks = resolutionData.resolutionRemarks;
      }
      if (resolutionData?.resolutionEvidenceUrl) {
        hazard.resolutionEvidenceUrl = resolutionData.resolutionEvidenceUrl;
      }
    }

    if (resolutionData?.assignedTeam) {
      hazard.assignedTeam = resolutionData.assignedTeam;
    }
    if (resolutionData?.internalNotes) {
      hazard.internalNotes = resolutionData.internalNotes;
    }

    // Add to trust timeline
    hazard.trustTimeline.unshift({
      id: 'tt-' + Date.now(),
      stage: canonical,
      timestamp: new Date().toISOString(),
      title: canonical === 'CONFIRMED_RESOLVED' ? 'Repairs Verified & Signed Off' : `Status Updated to ${canonical}`,
      actor: `${currentUser.name} (${currentUser.role})`,
      details: resolutionData?.resolutionRemarks || resolutionData?.internalNotes || `Authority transitioned stage to ${canonical}`,
      evidenceType: 'authority_action'
    });

    this.saveHazards(hazards);

    this.addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: canonical === 'CONFIRMED_RESOLVED' ? 'HAZARD_RESOLVED' : 'STATUS_UPDATED',
      targetId: hazard.id,
      targetType: 'hazard',
      details: `Authority ${currentUser.name} updated hazard ${hazard.id} to ${canonical}`
    });

    return hazard;
  },

  // Merge duplicate hazards manually from admin portal
  mergeHazards(primaryHazardId: string, duplicateHazardIds: string[]): Hazard | null {
    const hazards = this.getHazards();
    const primary = hazards.find((h) => h.id === primaryHazardId);
    if (!primary) return null;

    const duplicates = hazards.filter((h) => duplicateHazardIds.includes(h.id));
    for (const dup of duplicates) {
      if (dup.reports) {
        primary.reports = [...(primary.reports || []), ...dup.reports];
      }
      if (dup.confirmations) {
        primary.confirmations = [...(primary.confirmations || []), ...dup.confirmations];
      }
      primary.reportsCount += dup.reportsCount || 1;
      primary.confirmationsCount += dup.confirmationsCount || 0;
      primary.stillPresentVotes += dup.stillPresentVotes || 0;

      // Merge unique users confirmed
      if (dup.evidence?.uniqueUserIdsConfirmed) {
        dup.evidence.uniqueUserIdsConfirmed.forEach((uid) => {
          if (!primary.evidence.uniqueUserIdsConfirmed.includes(uid)) {
            primary.evidence.uniqueUserIdsConfirmed.push(uid);
            primary.evidence.independentRiderConfirmations += 1;
          }
        });
      }
    }

    primary.confidenceScore = this.calculateConfidence(primary);
    primary.lastUpdatedAt = new Date().toISOString();

    primary.trustTimeline.unshift({
      id: 'tt-merge-' + Date.now(),
      stage: primary.canonicalStatus,
      timestamp: new Date().toISOString(),
      title: 'Duplicate Incidents Clustered',
      actor: 'Authority Operations Lead',
      details: `Merged duplicate reports [${duplicateHazardIds.join(', ')}] into this record.`,
      evidenceType: 'authority_action'
    });

    // Remove duplicates from list
    const remaining = hazards.filter((h) => !duplicateHazardIds.includes(h.id));
    this.saveHazards(remaining);

    const currentUser = this.getCurrentUser();
    this.addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'HAZARDS_MERGED',
      targetId: primary.id,
      targetType: 'hazard',
      details: `Merged duplicate hazards [${duplicateHazardIds.join(', ')}] into ${primary.id}`
    });

    return primary;
  },

  // Freshness check: flags hazards older than revalidation window as STALE_NEEDS_RECONFIRMATION
  checkFreshness(): { checked: number; staleCount: number } {
    const hazards = this.getHazards();
    let staleCount = 0;
    const now = Date.now();

    hazards.forEach((h) => {
      if (h.canonicalStatus === 'CONFIRMED_RESOLVED' || h.status === 'resolved') return;

      const lastTime = new Date(h.evidence?.lastConfirmedAt || h.lastUpdatedAt || h.firstReportedAt).getTime();
      const ageHours = (now - lastTime) / (1000 * 60 * 60);

      // Waterlogged road becomes stale after 24 hours without confirmation
      // Other pavement defects become stale after 168 hours (7 days)
      const isWaterlog = h.category === 'waterlogged_road' || h.category === 'waterlogging';
      const thresholdHours = isWaterlog ? 24 : 168;

      if (ageHours > thresholdHours && h.canonicalStatus !== 'STALE_NEEDS_RECONFIRMATION') {
        h.canonicalStatus = 'STALE_NEEDS_RECONFIRMATION';
        h.status = 'STALE_NEEDS_RECONFIRMATION';
        h.evidence.staleReason = `No rider confirmation received in the last ${Math.round(ageHours)} hours (revalidation window: ${thresholdHours}h).`;

        h.trustTimeline.unshift({
          id: 'tt-stale-' + Date.now(),
          stage: 'STALE_NEEDS_RECONFIRMATION',
          timestamp: new Date().toISOString(),
          title: 'Marked Stale — Needs Rider Reconfirmation',
          actor: 'RoadSense Freshness Monitor (n8n Automation)',
          details: h.evidence.staleReason,
          evidenceType: 'n8n_automation'
        });

        staleCount++;
      }
    });

    if (staleCount > 0) {
      this.saveHazards(hazards);
      this.addAuditLog({
        actorId: 'n8n-freshness-job',
        actorName: 'n8n — Hazard Freshness Monitor',
        actorRole: 'Automated Scheduled Workflow',
        action: 'STALE_RECORDS_FLAGGED',
        targetId: 'system',
        targetType: 'n8n',
        details: `Identified and flagged ${staleCount} stale hazards needing commuter reconfirmation.`
      });
    }

    return { checked: hazards.length, staleCount };
  },

  // SENSOR IMPACT EVENTS
  getSensorEvents(): SensorImpactEvent[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SENSOR_EVENTS) || '[]');
    } catch {
      return INITIAL_SENSOR_EVENTS;
    }
  },

  recordSensorEvent(event: Omit<SensorImpactEvent, 'id' | 'timestamp' | 'status'>): SensorImpactEvent {
    this.init();
    const events = this.getSensorEvents();
    const newEvent: SensorImpactEvent = {
      ...event,
      id: 'sens-ev-' + Date.now(),
      timestamp: new Date().toISOString(),
      status: 'unreviewed',
      categoryHint: 'SENSOR_CANDIDATE'
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.SENSOR_EVENTS, JSON.stringify(events));
    return newEvent;
  },

  updateSensorEventStatus(id: string, status: SensorImpactEvent['status'], notes?: string): boolean {
    const events = this.getSensorEvents();
    const ev = events.find((e) => e.id === id);
    if (!ev) return false;
    ev.status = status;
    if (notes) ev.notes = notes;
    localStorage.setItem(STORAGE_KEYS.SENSOR_EVENTS, JSON.stringify(events));
    return true;
  },

  // AUDIT LOGS
  getAuditLogs(): AdminAuditLog[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  addAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
    this.init();
    const logs = this.getAuditLogs();
    const newLog: AdminAuditLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  // NOTIFICATIONS
  getNotifications(): NotificationItem[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }
};

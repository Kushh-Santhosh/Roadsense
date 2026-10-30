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
  VerificationStatus
} from '../types';
import {
  INITIAL_HAZARDS,
  DEMO_USERS,
  INITIAL_SENSOR_EVENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/seedData';

const STORAGE_KEYS = {
  HAZARDS: 'roadsense_hazards_v1',
  USERS: 'roadsense_users_v1',
  CURRENT_USER_ID: 'roadsense_current_user_id_v1',
  SENSOR_EVENTS: 'roadsense_sensor_events_v1',
  AUDIT_LOGS: 'roadsense_audit_logs_v1',
  NOTIFICATIONS: 'roadsense_notifications_v1',
  SETTINGS: 'roadsense_settings_v1'
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
      return data ? JSON.parse(data) : INITIAL_HAZARDS;
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

  // Find duplicates within 60 meters with identical or related category
  findPotentialDuplicate(lat: number, lng: number, category: HazardCategory, thresholdMeters = 60): Hazard | null {
    const hazards = this.getHazards();
    for (const h of hazards) {
      if (h.status === 'resolved' || h.status === 'rejected') continue;
      const distance = calculateDistanceMeters(lat, lng, h.latitude, h.longitude);
      if (distance <= thresholdMeters) {
        // High likelihood of duplicate if category matches or both are pavement distress
        const pavementDistress = ['pothole', 'road_cracks', 'uneven_surface'];
        const bothPavement = pavementDistress.includes(category) && pavementDistress.includes(h.category);
        if (h.category === category || bothPavement) {
          return h;
        }
      }
    }
    return null;
  },

  // Calculate dynamic confidence score
  calculateConfidence(hazard: Partial<Hazard>): number {
    let score = 50; // base score for a submission
    const reportsCount = hazard.reports?.length || 1;
    const confirmationsCount = hazard.confirmationsCount || 0;
    const stillPresent = hazard.stillPresentVotes || 0;
    const noLonger = hazard.noLongerPresentVotes || 0;

    // Confirmations boost
    score += Math.min(confirmationsCount * 4, 25);
    // Reports count boost
    score += Math.min((reportsCount - 1) * 6, 15);

    // AI detection confidence
    if (hazard.aiDetected) {
      score += 10;
    }

    // Sensor detection verification
    if (hazard.sensorDetected) {
      score += 10;
    }

    // Photo presence
    if (hazard.primaryImageUrl && hazard.primaryImageUrl.length > 0) {
      score += 10;
    }

    // Negative votes penalty
    if (noLonger > 0 && stillPresent > 0) {
      const negativeRatio = noLonger / (stillPresent + noLonger);
      score -= Math.round(negativeRatio * 35);
    }

    return Math.max(15, Math.min(99, score));
  },

  // Submit a new hazard report
  createHazardReport(params: {
    latitude: number;
    longitude: number;
    address: string;
    locality: string;
    category: HazardCategory;
    severity: HazardSeverity;
    description: string;
    imageUrl: string;
    aiClassification?: HazardReport['aiClassification'];
    sensorTriggered?: boolean;
  }): { hazard: Hazard; isDuplicateGrouped: boolean } {
    this.init();
    const currentUser = this.getCurrentUser();
    const hazards = this.getHazards();

    const existingDuplicate = this.findPotentialDuplicate(params.latitude, params.longitude, params.category, 65);

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
      aiClassification: params.aiClassification,
      userConfirmedCategory: params.category,
      severity: params.severity,
      confidenceScore: params.aiClassification ? Math.round(params.aiClassification.confidence * 100) : 70,
      verificationStatus: 'submitted',
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

      if (params.aiClassification) existingDuplicate.aiDetected = true;
      if (params.sensorTriggered) existingDuplicate.sensorDetected = true;

      // Update confidence
      existingDuplicate.confidenceScore = this.calculateConfidence(existingDuplicate);

      // Auto promote to community confirmed if 2+ reports
      if (existingDuplicate.reportsCount >= 2 && existingDuplicate.status === 'submitted') {
        existingDuplicate.status = 'community_confirmed';
      }

      targetHazard = existingDuplicate;
      this.saveHazards(hazards);

      this.addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'REPORT_DUPLICATE_GROUPED',
        targetId: existingDuplicate.id,
        targetType: 'hazard',
        details: `Report ${reportId} auto-clustered into existing hazard ${existingDuplicate.id} within 60m.`
      });
    } else {
      const hazardId = 'haz-' + Date.now();
      newReport.hazardId = hazardId;

      const categoryLabels: Record<HazardCategory, string> = {
        pothole: 'Pothole on Carriageway',
        road_cracks: 'Severe Road Surface Cracks',
        uneven_surface: 'Uneven Road Surface / Bump',
        open_manhole: 'Critical Open Manhole',
        damaged_manhole: 'Damaged Drainage Cover',
        waterlogging: 'Dangerous Waterlogged Section',
        road_construction: 'Unbarricaded Road Construction',
        fallen_tree_debris: 'Fallen Tree Branch / Debris',
        exposed_utility: 'Exposed Cable / Utility Trench',
        damaged_edge: 'Damaged Road Shoulder / Edge',
        other: 'Reported Road Hazard'
      };

      const newHazard: Hazard = {
        id: hazardId,
        title: `${categoryLabels[params.category]} in ${params.locality}`,
        description: params.description || `Reported ${categoryLabels[params.category]} near ${params.address}.`,
        category: params.category,
        severity: params.severity,
        latitude: params.latitude,
        longitude: params.longitude,
        address: params.address,
        locality: params.locality,
        status: 'submitted',
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
        reports: [newReport],
        confirmations: [],
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

  // Confirm or vote on a hazard
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

    if (voteType === 'still_present') {
      hazard.stillPresentVotes += 1;
    } else if (voteType === 'no_longer_present') {
      hazard.noLongerPresentVotes += 1;
    }

    hazard.lastUpdatedAt = new Date().toISOString();
    hazard.confidenceScore = this.calculateConfidence(hazard);

    // Dynamic verification status update
    if (hazard.stillPresentVotes >= 3 && hazard.status === 'submitted') {
      hazard.status = 'community_confirmed';
    } else if (hazard.noLongerPresentVotes >= 4 && hazard.noLongerPresentVotes > hazard.stillPresentVotes * 2) {
      hazard.status = 'resolved';
      hazard.severity = 'resolved';
      hazard.resolvedAt = new Date().toISOString();
      hazard.resolutionRemarks = 'Community consensus indicated hazard is no longer present.';
    }

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

  // Authority status updates & resolution
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
    hazard.status = status;
    hazard.lastUpdatedAt = new Date().toISOString();

    if (status === 'resolved') {
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

    this.saveHazards(hazards);

    this.addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: status === 'resolved' ? 'HAZARD_RESOLVED' : 'STATUS_UPDATED',
      targetId: hazard.id,
      targetType: 'hazard',
      details: `Authority ${currentUser.name} marked hazard ${hazard.id} as ${status}`
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
    }

    primary.confidenceScore = this.calculateConfidence(primary);
    primary.lastUpdatedAt = new Date().toISOString();

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
      status: 'unreviewed'
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
    // Keep max 200 logs
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

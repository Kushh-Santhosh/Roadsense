import { Hazard, UserProfile, SensorImpactEvent, AdminAuditLog, NotificationItem, CanonicalVerificationStatus } from '../types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-kushal',
    name: 'Kushal R. (Demo Rider)',
    email: 'kushal.demo@roadsense.mobility',
    role: 'rider',
    avatar: '',
    points: 480,
    trustScore: 94,
    reportsCount: 6,
    confirmationsCount: 22,
    joinedAt: '2026-08-14T09:30:00Z',
    locality: 'Indiranagar, Bengaluru'
  },
  {
    id: 'user-ananya',
    name: 'Ananya S. (Demo Rider)',
    email: 'ananya.demo@roadsense.mobility',
    role: 'rider',
    avatar: '',
    points: 720,
    trustScore: 98,
    reportsCount: 14,
    confirmationsCount: 38,
    joinedAt: '2026-05-10T14:20:00Z',
    locality: 'Whitefield, Bengaluru'
  },
  {
    id: 'user-arjun',
    name: 'Arjun M. (Demo Rider)',
    email: 'arjun.demo@roadsense.mobility',
    role: 'rider',
    avatar: '',
    points: 310,
    trustScore: 88,
    reportsCount: 4,
    confirmationsCount: 19,
    joinedAt: '2026-09-02T11:00:00Z',
    locality: 'Hebbal, Bengaluru'
  },
  {
    id: 'admin-officer',
    name: 'Municipal Operations (Demo Authority)',
    email: 'dispatch.demo@roadsense.internal',
    role: 'authority',
    avatar: '',
    points: 1540,
    trustScore: 100,
    reportsCount: 0,
    confirmationsCount: 142,
    joinedAt: '2026-01-15T08:00:00Z',
    locality: 'Bengaluru Central Urban Infrastructure'
  }
];

export const INITIAL_HAZARDS: Hazard[] = [
  {
    id: 'haz-hebbal-01',
    title: 'Severe Pothole Cluster on Outer Ring Road',
    description: 'Deep double pothole cluster right after the Hebbal flyover ramp. High risk for two-wheelers taking the left curve in low light.',
    category: 'pothole',
    severity: 'critical',
    latitude: 13.0358,
    longitude: 77.5970,
    address: 'Near Esteem Mall / Hebbal Flyover descending ramp, ORR',
    locality: 'Hebbal',
    status: 'COMMUNITY_CORROBORATED',
    canonicalStatus: 'COMMUNITY_CORROBORATED',
    confidenceScore: 94,
    reportsCount: 3,
    confirmationsCount: 18,
    stillPresentVotes: 17,
    noLongerPresentVotes: 1,
    primaryImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-27T08:15:00Z',
    lastUpdatedAt: '2026-10-31T05:30:00Z',
    aiDetected: true,
    sensorDetected: true,
    assignedTeam: 'North Zone Rapid Maintenance Squad',
    internalNotes: 'Flagged for urgent cold-mix patch. High-speed corridor with heavy motorcycle volume.',
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Pothole (D40)',
        damageType: 'Structural Pavement Depression',
        confidence: 0.94,
        isModelBacked: true
      },
      independentRiderConfirmations: 8,
      uniqueUserIdsConfirmed: ['user-arjun', 'user-kushal', 'user-ananya'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-31T05:30:00Z',
      sensorCandidateCount: 4,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-101',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-27T08:15:00Z',
        title: 'Initial Citizen Report Filed',
        actor: 'Arjun Mehta (Rider)',
        details: 'Submitted with geo-tagged photographic evidence via smartphone camera.',
        evidenceType: 'citizen_report'
      },
      {
        id: 'tt-102',
        stage: 'UNDER_REVIEW',
        timestamp: '2026-10-27T08:16:00Z',
        title: 'AI Vision Analysis Computed',
        actor: 'RoadScan AI Engine (RDD2022)',
        details: 'Identified Pothole (D40) with 94% model confidence and structural cavity bounding box.',
        evidenceType: 'ai_inference'
      },
      {
        id: 'tt-103',
        stage: 'COMMUNITY_CORROBORATED',
        timestamp: '2026-10-28T09:20:00Z',
        title: 'Corroborated by Independent Commuters',
        actor: '8 Verified Riders',
        details: 'Multiple riders voted still present. Sensor telemetry recorded vertical acceleration spikes.',
        evidenceType: 'community_vote'
      },
      {
        id: 'tt-104',
        stage: 'RECENTLY_CONFIRMED',
        timestamp: '2026-10-31T05:30:00Z',
        title: 'Recent Confirmation Logged',
        actor: 'Kushal Gowda (Rider)',
        details: 'Confirmed still active during morning commute.',
        evidenceType: 'community_vote'
      }
    ],
    reports: [
      {
        id: 'rep-heb-101',
        hazardId: 'haz-hebbal-01',
        userId: 'user-arjun',
        userName: 'Arjun Mehta',
        userAvatar: '',
        latitude: 13.0358,
        longitude: 77.5970,
        address: 'Near Esteem Mall / Hebbal Flyover descending ramp, ORR',
        locality: 'Hebbal',
        timestamp: '2026-10-27T08:15:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        category: 'pothole',
        aiClassification: {
          detectedCategory: 'Pothole (D40)',
          confidence: 0.94,
          boundingBox: [0.35, 0.22, 0.78, 0.68],
          damageType: 'Structural Pavement Depression'
        },
        userConfirmedCategory: 'pothole',
        severity: 'critical',
        confidenceScore: 94,
        verificationStatus: 'community_confirmed',
        description: 'Hit this pothole at 45km/h on my scooter. Rim jarred violently. Extremely dangerous at night.',
        sensorTriggered: true,
        upvotes: 21,
        downvotes: 0,
        isDemo: true
      }
    ],
    confirmations: [
      {
        id: 'conf-101',
        hazardId: 'haz-hebbal-01',
        userId: 'user-kushal',
        userName: 'Kushal Gowda',
        timestamp: '2026-10-28T09:20:00Z',
        status: 'still_present',
        comment: 'Still open. Saw a delivery rider swerve sharply into traffic to avoid it.'
      },
      {
        id: 'conf-102',
        hazardId: 'haz-hebbal-01',
        userId: 'user-ananya',
        userName: 'Ananya Sharma',
        timestamp: '2026-10-29T18:05:00Z',
        status: 'still_present',
        comment: 'Confirmed still present. Pothole has expanded after yesterday evening drizzle.'
      }
    ]
  },
  {
    id: 'haz-krpuram-04',
    title: 'Waterlogged Road — Potentially Hidden Surface Hazard',
    description: 'Stagnant rainwater submerges road carriageway under the railway bridge. Submerged road surface depth and condition cannot be seen. Risk of hidden depressions or loose gravel.',
    category: 'waterlogged_road',
    additionalLabel: 'POTENTIALLY_HIDDEN_SURFACE_HAZARD',
    severity: 'critical',
    latitude: 13.0012,
    longitude: 77.6834,
    address: 'Old Madras Road under KR Puram Railway Hanging Bridge',
    locality: 'KR Puram',
    status: 'RECENTLY_CONFIRMED',
    canonicalStatus: 'RECENTLY_CONFIRMED',
    confidenceScore: 95,
    reportsCount: 5,
    confirmationsCount: 24,
    stillPresentVotes: 23,
    noLongerPresentVotes: 1,
    primaryImageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-25T19:30:00Z',
    lastUpdatedAt: '2026-10-31T06:05:00Z',
    aiDetected: false,
    sensorDetected: true,
    assignedTeam: 'Stormwater & Underpass Taskforce',
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Waterlogged Carriageway',
        damageType: 'Obscured Sub-Surface Condition',
        confidence: 0.91,
        isModelBacked: false
      },
      independentRiderConfirmations: 12,
      uniqueUserIdsConfirmed: ['user-arjun', 'user-kushal', 'user-ananya'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-31T06:05:00Z',
      sensorCandidateCount: 5,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-401',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-25T19:30:00Z',
        title: 'Waterlogged Hazard Reported',
        actor: 'Arjun Mehta (Rider)',
        details: 'Reported persistent flood water under bridge. Surface depth unknown.',
        evidenceType: 'citizen_report'
      },
      {
        id: 'tt-402',
        stage: 'COMMUNITY_CORROBORATED',
        timestamp: '2026-10-27T11:00:00Z',
        title: 'Multiple Independent Confirmations',
        actor: '12 Commuters',
        details: 'Riders confirmed water level reaches 6-8 inches, completely hiding potholes and drains beneath.',
        evidenceType: 'community_vote'
      },
      {
        id: 'tt-403',
        stage: 'RECENTLY_CONFIRMED',
        timestamp: '2026-10-31T06:05:00Z',
        title: 'Confirmed by Morning Rider',
        actor: 'Ananya Sharma (Rider)',
        details: 'Water remains accumulated after overnight rain. Caution advised.',
        evidenceType: 'community_vote'
      }
    ],
    reports: [
      {
        id: 'rep-kr-401',
        hazardId: 'haz-krpuram-04',
        userId: 'user-arjun',
        userName: 'Arjun Mehta',
        latitude: 13.0012,
        longitude: 77.6834,
        address: 'Old Madras Road under KR Puram Railway Hanging Bridge',
        locality: 'KR Puram',
        timestamp: '2026-10-25T19:30:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        category: 'waterlogged_road',
        additionalLabel: 'POTENTIALLY_HIDDEN_SURFACE_HAZARD',
        userConfirmedCategory: 'waterlogged_road',
        severity: 'critical',
        confidenceScore: 95,
        verificationStatus: 'community_confirmed',
        description: 'Water does not drain away. Road surface underneath cannot be seen; sudden dips cause loss of steering control.',
        upvotes: 27,
        downvotes: 0,
        isDemo: true
      }
    ],
    confirmations: []
  },
  {
    id: 'haz-indira-02',
    title: 'Dislodged Storm Drain Grate on 100 Feet Road',
    description: 'Steel grill over drainage culvert is sunken 4 inches below tarmac. Wheel trap hazard for narrow two-wheeler tyres.',
    category: 'damaged_manhole',
    severity: 'critical',
    latitude: 12.9719,
    longitude: 77.6412,
    address: '100 Feet Road, opposite Metro Pillar 84, Indiranagar',
    locality: 'Indiranagar',
    status: 'UNDER_REVIEW',
    canonicalStatus: 'UNDER_REVIEW',
    confidenceScore: 91,
    reportsCount: 3,
    confirmationsCount: 14,
    stillPresentVotes: 13,
    noLongerPresentVotes: 1,
    primaryImageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-28T11:45:00Z',
    lastUpdatedAt: '2026-10-30T14:10:00Z',
    aiDetected: true,
    sensorDetected: false,
    assignedTeam: 'East Zone Road & Utility Cell',
    internalNotes: 'Inspection scheduled with BWSSB drainage engineering sub-division.',
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Damaged Utility Cover',
        damageType: 'Sunken Grate Depression',
        confidence: 0.89,
        isModelBacked: true
      },
      independentRiderConfirmations: 6,
      uniqueUserIdsConfirmed: ['user-kushal', 'user-arjun'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-30T14:10:00Z',
      sensorCandidateCount: 1,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-201',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-28T11:45:00Z',
        title: 'Initial Citizen Report',
        actor: 'Kushal Gowda (Rider)',
        details: 'Photo submitted showing loose steel grating sunken 4 inches below tarmac.',
        evidenceType: 'citizen_report'
      },
      {
        id: 'tt-202',
        stage: 'UNDER_REVIEW',
        timestamp: '2026-10-29T10:00:00Z',
        title: 'Authority Review Initiated',
        actor: 'R. K. Narayanan (Divisional Road Engineer)',
        details: 'Forwarded for joint inspection with BWSSB stormwater wing.',
        evidenceType: 'authority_action'
      }
    ],
    reports: [
      {
        id: 'rep-ind-201',
        hazardId: 'haz-indira-02',
        userId: 'user-kushal',
        userName: 'Kushal Gowda',
        userAvatar: '',
        latitude: 12.9719,
        longitude: 77.6412,
        address: '100 Feet Road, opposite Metro Pillar 84, Indiranagar',
        locality: 'Indiranagar',
        timestamp: '2026-10-28T11:45:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
        category: 'damaged_manhole',
        aiClassification: {
          detectedCategory: 'Damaged Utility Cover',
          confidence: 0.89,
          boundingBox: [0.28, 0.31, 0.72, 0.75],
          damageType: 'Sunken Grate Depression'
        },
        userConfirmedCategory: 'damaged_manhole',
        severity: 'critical',
        confidenceScore: 91,
        verificationStatus: 'forwarded_review',
        description: 'Metal bars are loose and tyre can easily get jammed. Extremely hazardous during rain.',
        upvotes: 14,
        downvotes: 0,
        isDemo: true
      }
    ],
    confirmations: []
  },
  {
    id: 'haz-whitefield-03',
    title: 'Extensive Alligator Cracks & Subsidence',
    description: 'Asphalt fatigue cracking across entire right lane leading into ITPL gate 3. Causes severe vibrations and sudden loss of balance.',
    category: 'road_cracks',
    severity: 'high',
    latitude: 12.9856,
    longitude: 77.7289,
    address: 'ITPL Main Road, Pattandur Agrahara, Whitefield',
    locality: 'Whitefield',
    status: 'COMMUNITY_CORROBORATED',
    canonicalStatus: 'COMMUNITY_CORROBORATED',
    confidenceScore: 87,
    reportsCount: 2,
    confirmationsCount: 11,
    stillPresentVotes: 11,
    noLongerPresentVotes: 0,
    primaryImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-26T16:20:00Z',
    lastUpdatedAt: '2026-10-30T10:15:00Z',
    aiDetected: true,
    sensorDetected: true,
    assignedTeam: 'Mahadevapura Pavement Unit',
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Alligator Cracking (D20)',
        damageType: 'Interconnected Fatigue Matrix',
        confidence: 0.92,
        isModelBacked: true
      },
      independentRiderConfirmations: 5,
      uniqueUserIdsConfirmed: ['user-ananya'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-30T10:15:00Z',
      sensorCandidateCount: 2,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-301',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-26T16:20:00Z',
        title: 'Initial Citizen Report',
        actor: 'Ananya Sharma (Rider)',
        details: 'Reported extensive alligator cracking near ITPL Gate 3.',
        evidenceType: 'citizen_report'
      },
      {
        id: 'tt-302',
        stage: 'COMMUNITY_CORROBORATED',
        timestamp: '2026-10-28T14:00:00Z',
        title: 'Corroborated by Tech Park Commuters',
        actor: '5 Independent Two-Wheeler Riders',
        details: 'Multiple riders confirmed loose gravel and vibration risk.',
        evidenceType: 'community_vote'
      }
    ],
    reports: [
      {
        id: 'rep-wh-301',
        hazardId: 'haz-whitefield-03',
        userId: 'user-ananya',
        userName: 'Ananya Sharma',
        userAvatar: '',
        latitude: 12.9856,
        longitude: 77.7289,
        address: 'ITPL Main Road, Pattandur Agrahara, Whitefield',
        locality: 'Whitefield',
        timestamp: '2026-10-26T16:20:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        category: 'road_cracks',
        aiClassification: {
          detectedCategory: 'Alligator Cracking (D20)',
          confidence: 0.92,
          boundingBox: [0.15, 0.18, 0.85, 0.88],
          damageType: 'Fatigue Pavement Failure'
        },
        userConfirmedCategory: 'road_cracks',
        severity: 'high',
        confidenceScore: 87,
        verificationStatus: 'community_confirmed',
        description: 'Large surface breakup. Loose gravel flies onto following riders.',
        sensorTriggered: true,
        upvotes: 18,
        downvotes: 1,
        isDemo: true
      }
    ],
    confirmations: []
  },
  {
    id: 'haz-marathahalli-05',
    title: 'Waterlogged Shoulder with Collapsed Drainage Edge',
    description: 'Road edge collapsed into roadside trench due to utility excavation. Surface water pools over edge, making trench drop-off invisible.',
    category: 'waterlogged_road',
    additionalLabel: 'POTENTIALLY_HIDDEN_SURFACE_HAZARD',
    severity: 'high',
    latitude: 12.9562,
    longitude: 77.7011,
    address: 'Service Road adjacent to Marathahalli Bridge, ORR Junction',
    locality: 'Marathahalli',
    status: 'UNDER_REVIEW',
    canonicalStatus: 'UNDER_REVIEW',
    confidenceScore: 78,
    reportsCount: 2,
    confirmationsCount: 6,
    stillPresentVotes: 6,
    noLongerPresentVotes: 0,
    primaryImageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-29T14:15:00Z',
    lastUpdatedAt: '2026-10-31T04:20:00Z',
    aiDetected: true,
    sensorDetected: false,
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Pavement Edge Damage',
        damageType: 'Edge Ravelling & Trench Collapse',
        confidence: 0.84,
        isModelBacked: true
      },
      independentRiderConfirmations: 3,
      uniqueUserIdsConfirmed: ['user-ananya'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-31T04:20:00Z',
      sensorCandidateCount: 0,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-501',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-29T14:15:00Z',
        title: 'Initial Hazard Reported',
        actor: 'Ananya Sharma (Rider)',
        details: 'Reported trench collapse with water pooling.',
        evidenceType: 'citizen_report'
      },
      {
        id: 'tt-502',
        stage: 'UNDER_REVIEW',
        timestamp: '2026-10-30T09:00:00Z',
        title: 'Scheduled for Barricading',
        actor: 'Mahadevapura Ward Engineering Squad',
        details: 'Temporary hazard signs requested for waterlogged shoulder.',
        evidenceType: 'authority_action'
      }
    ],
    reports: [
      {
        id: 'rep-mar-501',
        hazardId: 'haz-marathahalli-05',
        userId: 'user-ananya',
        userName: 'Ananya Sharma',
        latitude: 12.9562,
        longitude: 77.7011,
        address: 'Service Road adjacent to Marathahalli Bridge, ORR Junction',
        locality: 'Marathahalli',
        timestamp: '2026-10-29T14:15:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
        category: 'waterlogged_road',
        additionalLabel: 'POTENTIALLY_HIDDEN_SURFACE_HAZARD',
        aiClassification: {
          detectedCategory: 'Pavement Edge Damage',
          confidence: 0.84,
          boundingBox: [0.2, 0.45, 0.9, 0.95],
          damageType: 'Edge Ravelling & Trench Collapse'
        },
        userConfirmedCategory: 'waterlogged_road',
        severity: 'high',
        confidenceScore: 78,
        verificationStatus: 'under_verification',
        description: 'Trench was left unfilled after cable laying. Surface water hides the edge drop-off.',
        upvotes: 9,
        downvotes: 0,
        isDemo: true
      }
    ],
    confirmations: []
  },
  {
    id: 'haz-ecity-06',
    title: 'Uneven Surface / Expansion Gap Bump on Flyover Ramp',
    description: 'Pronounced height differential at bridge expansion joint. Causes high upward acceleration jerk when crossing above 35 km/h.',
    category: 'uneven_surface',
    severity: 'moderate',
    latitude: 12.8452,
    longitude: 77.6601,
    address: 'Electronics City Phase 1 Elevated Tollway Off-Ramp',
    locality: 'Electronic City',
    status: 'COMMUNITY_CORROBORATED',
    canonicalStatus: 'COMMUNITY_CORROBORATED',
    confidenceScore: 84,
    reportsCount: 3,
    confirmationsCount: 16,
    stillPresentVotes: 15,
    noLongerPresentVotes: 1,
    primaryImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-27T07:45:00Z',
    lastUpdatedAt: '2026-10-30T12:00:00Z',
    aiDetected: false,
    sensorDetected: true,
    assignedTeam: 'Elevated Expressway Authority Wing',
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Expansion Joint Heave',
        damageType: 'Bridge Deck Elevation Differential',
        confidence: 0.75,
        isModelBacked: false
      },
      independentRiderConfirmations: 7,
      uniqueUserIdsConfirmed: ['user-kushal'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-30T12:00:00Z',
      sensorCandidateCount: 8,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-601',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-27T07:45:00Z',
        title: 'Sensor Spike Flagged',
        actor: 'Kushal Gowda (Rider Mode)',
        details: 'Candidate accelerometer event detected (14.1 m/s² vertical jerk at 48 km/h).',
        evidenceType: 'sensor_candidate'
      },
      {
        id: 'tt-602',
        stage: 'COMMUNITY_CORROBORATED',
        timestamp: '2026-10-28T16:00:00Z',
        title: 'Corroborated by Electronic City Riders',
        actor: '7 Commuters',
        details: 'Confirmed noticeable bump requiring sharp deceleration.',
        evidenceType: 'community_vote'
      }
    ],
    reports: [
      {
        id: 'rep-ec-601',
        hazardId: 'haz-ecity-06',
        userId: 'user-kushal',
        userName: 'Kushal Gowda',
        latitude: 12.8452,
        longitude: 77.6601,
        address: 'Electronics City Phase 1 Elevated Tollway Off-Ramp',
        locality: 'Electronic City',
        timestamp: '2026-10-27T07:45:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        category: 'uneven_surface',
        userConfirmedCategory: 'uneven_surface',
        severity: 'moderate',
        confidenceScore: 84,
        verificationStatus: 'community_confirmed',
        description: 'Sensor detected sharp vertical impact (14.2 m/s²). Noticed several riders braking abruptly.',
        sensorTriggered: true,
        upvotes: 19,
        downvotes: 1,
        isDemo: true
      }
    ],
    confirmations: []
  },
  {
    id: 'haz-yelahanka-07',
    title: 'Longitudinal Trench from Water Pipeline Works',
    description: 'Long longitudinal cut across roadway filled with loose uncompacted gravel. Front wheel easily wobbles.',
    category: 'road_construction',
    severity: 'high',
    latitude: 13.1007,
    longitude: 77.5963,
    address: 'Major Sandeep Unnikrishnan Road, Yelahanka New Town',
    locality: 'Yelahanka',
    status: 'NEWLY_REPORTED',
    canonicalStatus: 'NEWLY_REPORTED',
    confidenceScore: 65,
    reportsCount: 1,
    confirmationsCount: 2,
    stillPresentVotes: 2,
    noLongerPresentVotes: 0,
    primaryImageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-31T05:10:00Z',
    lastUpdatedAt: '2026-10-31T05:10:00Z',
    aiDetected: true,
    sensorDetected: false,
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Longitudinal Cut (D00)',
        damageType: 'Trench Cut / Longitudinal Fissure',
        confidence: 0.88,
        isModelBacked: true
      },
      independentRiderConfirmations: 1,
      uniqueUserIdsConfirmed: ['user-arjun'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-31T05:10:00Z',
      sensorCandidateCount: 0,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-701',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-31T05:10:00Z',
        title: 'Citizen Report Filed',
        actor: 'Arjun Mehta (Rider)',
        details: 'Photo submitted showing un-asphalted trench with loose gravel.',
        evidenceType: 'citizen_report'
      }
    ],
    reports: [
      {
        id: 'rep-yel-701',
        hazardId: 'haz-yelahanka-07',
        userId: 'user-arjun',
        userName: 'Arjun Mehta',
        latitude: 13.1007,
        longitude: 77.5963,
        address: 'Major Sandeep Unnikrishnan Road, Yelahanka New Town',
        locality: 'Yelahanka',
        timestamp: '2026-10-31T05:10:00Z',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
        category: 'road_construction',
        aiClassification: {
          detectedCategory: 'Longitudinal Cut (D00)',
          confidence: 0.88,
          boundingBox: [0.1, 0.42, 0.95, 0.58],
          damageType: 'Trench Cut / Longitudinal Fissure'
        },
        userConfirmedCategory: 'road_construction',
        severity: 'high',
        confidenceScore: 65,
        verificationStatus: 'submitted',
        description: 'Contractor did not re-asphalt the trench. Gravel is loose.',
        upvotes: 3,
        downvotes: 0,
        isDemo: true
      }
    ],
    confirmations: []
  },
  {
    id: 'haz-resolved-08',
    title: 'Repaired Deep Sinkhole near CMH Road',
    description: 'Previously severe 1.2m pothole caused by pipe burst. Successfully patched and cold-milled by ward maintenance.',
    category: 'pothole',
    severity: 'resolved',
    latitude: 12.9782,
    longitude: 77.6385,
    address: 'Near CMH Hospital Junction, Indiranagar',
    locality: 'Indiranagar',
    status: 'CONFIRMED_RESOLVED',
    canonicalStatus: 'CONFIRMED_RESOLVED',
    confidenceScore: 98,
    reportsCount: 6,
    confirmationsCount: 31,
    stillPresentVotes: 1,
    noLongerPresentVotes: 30,
    primaryImageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    firstReportedAt: '2026-10-20T10:00:00Z',
    lastUpdatedAt: '2026-10-30T16:30:00Z',
    resolvedAt: '2026-10-30T16:30:00Z',
    resolutionRemarks: 'Bituminous hot-mix patching completed and rolling compaction verified by site engineer.',
    resolutionEvidenceUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    aiDetected: true,
    sensorDetected: true,
    assignedTeam: 'East Zone Rapid Maintenance Squad',
    isDemo: true,
    evidence: {
      aiSuggestion: {
        category: 'Repaired Bituminous Patch',
        damageType: 'Surface Restored',
        confidence: 0.96,
        isModelBacked: true
      },
      independentRiderConfirmations: 24,
      uniqueUserIdsConfirmed: ['user-kushal', 'user-arjun', 'user-ananya'],
      hasPhotoEvidence: true,
      lastConfirmedAt: '2026-10-30T16:30:00Z',
      sensorCandidateCount: 1,
      isDisputed: false
    },
    trustTimeline: [
      {
        id: 'tt-801',
        stage: 'NEWLY_REPORTED',
        timestamp: '2026-10-20T10:00:00Z',
        title: 'Deep Sinkhole Reported',
        actor: 'Citizen Rider',
        details: 'Severe cavity reported after heavy rain.',
        evidenceType: 'citizen_report'
      },
      {
        id: 'tt-802',
        stage: 'COMMUNITY_CORROBORATED',
        timestamp: '2026-10-22T08:00:00Z',
        title: 'Confirmed by Multiple Riders',
        actor: '24 Community Commuters',
        details: 'Strong corroboration logged across morning and evening peak traffic.',
        evidenceType: 'community_vote'
      },
      {
        id: 'tt-803',
        stage: 'RESOLUTION_SUBMITTED',
        timestamp: '2026-10-29T17:00:00Z',
        title: 'Patch Work Completed by Squad',
        actor: 'East Zone Rapid Maintenance Squad',
        details: 'Hot-mix bituminous patch poured and roller compacted.',
        evidenceType: 'authority_action'
      },
      {
        id: 'tt-804',
        stage: 'CONFIRMED_RESOLVED',
        timestamp: '2026-10-30T16:30:00Z',
        title: 'Rider Consensus Confirms Repaired',
        actor: 'R. K. Narayanan (Divisional Road Engineer)',
        details: 'Community consensus (30 votes "no longer present") and post-repair proof photo confirmed.',
        evidenceType: 'authority_action'
      }
    ],
    reports: [],
    confirmations: []
  }
];

export const INITIAL_SENSOR_EVENTS: SensorImpactEvent[] = [
  {
    id: 'sens-ev-01',
    timestamp: '2026-10-31T05:42:15Z',
    latitude: 13.0359,
    longitude: 77.5969,
    locality: 'Hebbal (ORR)',
    zDelta: 16.8, // high vertical jerk m/s^2
    magnitude: 21.4,
    speedKmh: 42,
    candidateScore: 92,
    status: 'unreviewed',
    notes: 'Severe vertical acceleration spike consistent with pothole impact at cruising speed.',
    categoryHint: 'SENSOR_CANDIDATE'
  },
  {
    id: 'sens-ev-02',
    timestamp: '2026-10-31T06:15:30Z',
    latitude: 12.9855,
    longitude: 77.7290,
    locality: 'Whitefield (ITPL Rd)',
    zDelta: 12.4,
    magnitude: 15.6,
    speedKmh: 36,
    candidateScore: 78,
    status: 'unreviewed',
    notes: 'Rhythmic vertical oscillation detected matching severe alligator pavement cracking.',
    categoryHint: 'SENSOR_CANDIDATE'
  },
  {
    id: 'sens-ev-03',
    timestamp: '2026-10-30T14:22:10Z',
    latitude: 12.8453,
    longitude: 77.6602,
    locality: 'Electronic City',
    zDelta: 14.1,
    magnitude: 18.2,
    speedKmh: 48,
    candidateScore: 84,
    status: 'converted_to_report',
    notes: 'Confirmed and linked to expansion joint hazard report.',
    categoryHint: 'SENSOR_CANDIDATE'
  }
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-10-30T16:30:00Z',
    actorId: 'admin-officer',
    actorName: 'R. K. Narayanan (Divisional Road Engineer)',
    actorRole: 'Authority Site Lead',
    action: 'HAZARD_RESOLVED',
    targetId: 'haz-resolved-08',
    targetType: 'hazard',
    details: 'Verified patch completion on CMH Road; status changed to CONFIRMED_RESOLVED with post-repair photographic proof.'
  },
  {
    id: 'log-02',
    timestamp: '2026-10-30T14:10:00Z',
    actorId: 'admin-officer',
    actorName: 'R. K. Narayanan (Divisional Road Engineer)',
    actorRole: 'Authority Site Lead',
    action: 'STATUS_UPDATED',
    targetId: 'haz-indira-02',
    targetType: 'hazard',
    details: 'Elevated status to UNDER_REVIEW. Assigned to East Zone Utility Cell for urgent grate replacement.'
  },
  {
    id: 'log-03',
    timestamp: '2026-10-31T06:00:00Z',
    actorId: 'n8n-automation',
    actorName: 'n8n — Hazard Freshness Monitor',
    actorRole: 'Automated Scheduled Workflow',
    action: 'FRESHNESS_CHECK_COMPLETED',
    targetId: 'haz-krpuram-04',
    targetType: 'n8n',
    details: 'Reconfirmation window checked for waterlogged roads (< 12 hrs). Marked RECENTLY_CONFIRMED.'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    timestamp: '10 minutes ago',
    title: 'Waterlogged Road Warning Ahead',
    message: 'Old Madras Road under KR Puram Railway Bridge has standing water. Road surface depth cannot be seen. Proceed cautiously.',
    type: 'waterlog_warning',
    hazardId: 'haz-krpuram-04',
    read: false,
    severity: 'critical'
  },
  {
    id: 'notif-02',
    timestamp: '45 minutes ago',
    title: 'Early Warning: Critical Pothole Ahead',
    message: 'Outer Ring Road near Hebbal flyover ramp has a severe pothole cluster reported 180m ahead.',
    type: 'hazard_proximity',
    hazardId: 'haz-hebbal-01',
    read: false,
    severity: 'critical'
  },
  {
    id: 'notif-03',
    timestamp: '2 hours ago',
    title: 'Community Verified Your Report',
    message: '14 fellow riders confirmed your report on 100 Feet Road dislodged grate. Trust score increased +15!',
    type: 'report_confirmed',
    hazardId: 'haz-indira-02',
    read: false,
    severity: 'info'
  }
];

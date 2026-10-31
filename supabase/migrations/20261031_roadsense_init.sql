-- ====================================================================
-- ROADSENSE DATABASE SCHEMA MIGRATION
-- Project: RoadSense AI Road Hazard Detection & Early Warning Platform
-- Alignment: T-Hub Climate Tech Launchpad & MBRDI Mobility Challenge
-- Target: Supabase (PostgreSQL 15+) with Row Level Security (RLS)
-- ====================================================================

-- Enable UUID and PostGIS extensions where available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User profiles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'rider' CHECK (role IN ('rider', 'authority', 'admin')),
  locality TEXT,
  points INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 80 CHECK (trust_score >= 0 AND trust_score <= 100),
  reports_count INTEGER DEFAULT 0,
  confirmations_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HAZARDS TABLE (Aggregated deduplicated road hazards)
CREATE TABLE IF NOT EXISTS public.hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'pothole', 'road_cracks', 'uneven_surface', 'open_manhole',
    'damaged_manhole', 'waterlogging', 'road_construction',
    'fallen_tree_debris', 'exposed_utility', 'damaged_edge', 'other'
  )),
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('critical', 'high', 'moderate', 'resolved')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  locality TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_verification', 'community_confirmed',
    'forwarded_review', 'resolved', 'rejected'
  )),
  confidence_score INTEGER DEFAULT 60 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  reports_count INTEGER DEFAULT 1,
  confirmations_count INTEGER DEFAULT 0,
  still_present_votes INTEGER DEFAULT 1,
  no_longer_present_votes INTEGER DEFAULT 0,
  primary_image_url TEXT,
  ai_detected BOOLEAN DEFAULT FALSE,
  sensor_detected BOOLEAN DEFAULT FALSE,
  assigned_team TEXT,
  internal_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_remarks TEXT,
  resolution_evidence_url TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index on hazards
CREATE INDEX IF NOT EXISTS idx_hazards_lat_lng ON public.hazards (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hazards_locality ON public.hazards (locality);
CREATE INDEX IF NOT EXISTS idx_hazards_status ON public.hazards (status);
CREATE INDEX IF NOT EXISTS idx_hazards_category ON public.hazards (category);

-- 3. HAZARD_REPORTS TABLE (Individual citizen/sensor incident reports)
CREATE TABLE IF NOT EXISTS public.hazard_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID REFERENCES public.hazards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  locality TEXT NOT NULL,
  category TEXT NOT NULL,
  user_confirmed_category TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence_score INTEGER DEFAULT 70,
  description TEXT,
  image_url TEXT NOT NULL,
  ai_classification JSONB,
  sensor_triggered BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 1,
  downvotes INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'submitted',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_hazard ON public.hazard_reports (hazard_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.hazard_reports (user_id);

-- 4. HAZARD_CONFIRMATIONS TABLE (Community crowd-verification votes)
CREATE TABLE IF NOT EXISTS public.hazard_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID REFERENCES public.hazards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('still_present', 'no_longer_present', 'duplicate', 'incorrect')),
  comment TEXT,
  updated_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confirmations_hazard ON public.hazard_confirmations (hazard_id);

-- 5. HAZARD_MEDIA TABLE (Audit photographs and multi-angle captures)
CREATE TABLE IF NOT EXISTS public.hazard_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID REFERENCES public.hazards(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image/jpeg',
  caption TEXT,
  is_resolution_proof BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RIDE_SESSIONS TABLE (Telemetry ride mode recording)
CREATE TABLE IF NOT EXISTS public.ride_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  distance_km NUMERIC(5,2) DEFAULT 0.0,
  duration_seconds INTEGER DEFAULT 0,
  impacts_detected_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- 7. SENSOR_EVENTS TABLE (Candidate accelerometer impact spikes)
CREATE TABLE IF NOT EXISTS public.sensor_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_session_id UUID REFERENCES public.ride_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  locality TEXT,
  z_delta NUMERIC(6,2) NOT NULL,
  magnitude NUMERIC(6,2) NOT NULL,
  speed_kmh NUMERIC(5,1) NOT NULL,
  candidate_score INTEGER DEFAULT 75,
  status TEXT DEFAULT 'unreviewed' CHECK (status IN ('unreviewed', 'converted_to_report', 'discarded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROUTE_ALERTS TABLE (Route corridor hazard warnings)
CREATE TABLE IF NOT EXISTS public.route_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_origin TEXT NOT NULL,
  route_destination TEXT NOT NULL,
  hazards_count INTEGER DEFAULT 0,
  safety_score NUMERIC(3,1) DEFAULT 8.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  hazard_id UUID REFERENCES public.hazards(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADMIN_ASSIGNMENTS TABLE (Municipal maintenance dispatch assignments)
CREATE TABLE IF NOT EXISTS public.admin_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID REFERENCES public.hazards(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_team TEXT NOT NULL,
  priority TEXT DEFAULT 'high',
  target_resolution_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RESOLUTION_RECORDS TABLE (Work completion signoff)
CREATE TABLE IF NOT EXISTS public.resolution_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID REFERENCES public.hazards(id) ON DELETE CASCADE,
  resolved_by UUID REFERENCES public.profiles(id),
  remarks TEXT NOT NULL,
  contractor_team TEXT,
  material_used TEXT,
  evidence_image_url TEXT,
  signed_off_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT_LOGS TABLE (Security, merge & verification trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can view hazards (Public safety map)
CREATE POLICY "Public hazards read policy" ON public.hazards
  FOR SELECT USING (true);

-- Authenticated riders can report hazards
CREATE POLICY "Rider can insert report" ON public.hazard_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Riders can view all community reports
CREATE POLICY "Public reports read policy" ON public.hazard_reports
  FOR SELECT USING (true);

-- Authority roles can update hazard status
CREATE POLICY "Authority update hazard" ON public.hazards
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('authority', 'admin'))
  );


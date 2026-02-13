
-- Network profiles table (seeded with presets)
CREATE TABLE public.network_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bandwidth TEXT,
  delay TEXT,
  loss TEXT,
  description TEXT
);

ALTER TABLE public.network_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Network profiles are readable by everyone"
  ON public.network_profiles FOR SELECT
  USING (true);

-- Tests table
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tests are readable by everyone"
  ON public.tests FOR SELECT USING (true);

CREATE POLICY "Tests can be inserted by anyone"
  ON public.tests FOR INSERT WITH CHECK (true);

CREATE POLICY "Tests can be updated by anyone"
  ON public.tests FOR UPDATE USING (true);

-- Participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  profile_id TEXT NOT NULL REFERENCES public.network_profiles(id),
  vnc_port INTEGER,
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants are readable by everyone"
  ON public.participants FOR SELECT USING (true);

CREATE POLICY "Participants can be inserted by anyone"
  ON public.participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants can be updated by anyone"
  ON public.participants FOR UPDATE USING (true);

-- Metrics table
CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  fps REAL,
  width INTEGER,
  height INTEGER,
  packets_lost INTEGER DEFAULT 0,
  freeze_count INTEGER DEFAULT 0,
  jitter REAL DEFAULT 0
);

ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Metrics are readable by everyone"
  ON public.metrics FOR SELECT USING (true);

CREATE POLICY "Metrics can be inserted by anyone"
  ON public.metrics FOR INSERT WITH CHECK (true);

-- Seed network profiles
INSERT INTO public.network_profiles (id, name, bandwidth, delay, loss, description) VALUES
  ('none', 'Good (No Throttle)', NULL, NULL, NULL, 'No network throttling'),
  ('wifi-good', 'WiFi Good', '10mbit', '20ms', '0.1%', 'Good home WiFi'),
  ('jio-4g-good', 'Jio 4G Good', '5mbit', '50ms', '0.5%', 'Urban Jio 4G'),
  ('jio-4g-poor', 'Jio 4G Poor', '1mbit', '100ms', '2%', 'Congested Jio 4G'),
  ('airtel-4g', 'Airtel 4G', '3mbit', '60ms', '1%', 'Typical Airtel'),
  ('3g', '3G', '384kbit', '200ms', '3%', '3G network'),
  ('2g', '2G/Edge', '64kbit', '500ms', '5%', 'Very slow network');

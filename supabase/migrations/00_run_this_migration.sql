-- =====================================================
-- CONSOLIDATED MIGRATION FOR JOURNAL REFACTORING
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create daily_logs table for health markers
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recorded_at DATE NOT NULL,
  mood TEXT CHECK (mood IN ('awful', 'bad', 'neutral', 'good', 'great')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  sleep_hours NUMERIC(4,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, recorded_at DESC);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own daily logs" ON public.daily_logs;
CREATE POLICY "Users manage own daily logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);

-- 2. Create workout_logs table for manual training journal entries
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recorded_at DATE NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('cardio', 'strength', 'flexibility', 'sports', 'other')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, recorded_at DESC);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own workout logs" ON public.workout_logs;
CREATE POLICY "Users manage own workout logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);

-- 3. Create progress_photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  label TEXT CHECK (label IN ('front', 'side', 'back', 'other')),
  recorded_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON public.progress_photos(user_id, recorded_at DESC);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own progress photos" ON public.progress_photos;
CREATE POLICY "Users manage own progress photos" ON public.progress_photos FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

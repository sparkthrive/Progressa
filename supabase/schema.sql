-- 1. USERS (Extend Supabase Auth)
-- Note: Supabase manages auth.users automatically. We create a public.users table for profiles.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXERCISES (System + Custom)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Null for system exercises
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  video_url TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROUTINES (Templates)
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROUTINE_EXERCISES (Join table)
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sys_order INTEGER NOT NULL,
  sets_target JSONB DEFAULT '[]'::jsonb
);

-- 5. WORKOUTS (Completed Sessions)
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'in_progress',
  notes TEXT
);

-- 6. WORKOUT_EXERCISES (Performance Log)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sys_order INTEGER NOT NULL,
  sets_data JSONB DEFAULT '[]'::jsonb
);

-- 7. USER_METRICS
CREATE TABLE IF NOT EXISTS public.user_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  body_fat_pct NUMERIC(4,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Users
DROP POLICY IF EXISTS "Users view own data" ON public.users;
CREATE POLICY "Users view own data" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own data" ON public.users;
CREATE POLICY "Users update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own data" ON public.users;
CREATE POLICY "Users insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercises
DROP POLICY IF EXISTS "View exercises" ON public.exercises;
CREATE POLICY "View exercises" ON public.exercises FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Create custom exercises" ON public.exercises;
CREATE POLICY "Create custom exercises" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Routines
DROP POLICY IF EXISTS "Manage routines" ON public.routines;
CREATE POLICY "Manage routines" ON public.routines FOR ALL USING (auth.uid() = user_id);

-- Routine Exercises (Cascade from Routine ownership ideally, but direct check is simpler for MVP)
DROP POLICY IF EXISTS "Manage routine exercises" ON public.routine_exercises;
CREATE POLICY "Manage routine exercises" ON public.routine_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.routines WHERE id = routine_exercises.routine_id AND user_id = auth.uid())
);

-- Workouts
DROP POLICY IF EXISTS "Manage workouts" ON public.workouts;
CREATE POLICY "Manage workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);

-- Workout Exercises
DROP POLICY IF EXISTS "Manage workout exercises" ON public.workout_exercises;
CREATE POLICY "Manage workout exercises" ON public.workout_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);

-- Metrics
DROP POLICY IF EXISTS "Manage metrics" ON public.user_metrics;
CREATE POLICY "Manage metrics" ON public.user_metrics FOR ALL USING (auth.uid() = user_id);

-- Create workout_logs table for manual training journal entries
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

-- Create index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, recorded_at DESC);

-- Enable RLS
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users manage own workout logs" ON public.workout_logs;
CREATE POLICY "Users manage own workout logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);

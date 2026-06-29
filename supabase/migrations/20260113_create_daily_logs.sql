-- Create daily_logs table for health markers
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, recorded_at DESC);

-- Enable RLS
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users manage own daily logs" ON public.daily_logs;
CREATE POLICY "Users manage own daily logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);

-- Create training_plans table
CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Optional: image_url for the plan cover
  image_url TEXT
);

-- RLS policies for training_plans
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can verify their own plans" ON public.training_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public plans" ON public.training_plans
  FOR SELECT USING (is_public = true);


-- Create training_plan_routines table (Template for the plan)
CREATE TABLE IF NOT EXISTS public.training_plan_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number > 0),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, week_number, day_of_week)
);

-- RLS policies for training_plan_routines
ALTER TABLE public.training_plan_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage routines in their plans" ON public.training_plan_routines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.training_plans
      WHERE id = training_plan_routines.plan_id
      AND user_id = auth.uid()
    )
  );
  
CREATE POLICY "Users can view public plan routines" ON public.training_plan_routines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_plans
      WHERE id = training_plan_routines.plan_id
      AND is_public = true
    )
  );


-- Create scheduled_routines table (The actual calendar events)
CREATE TABLE IF NOT EXISTS public.scheduled_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'skipped')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for scheduled_routines
ALTER TABLE public.scheduled_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own schedule" ON public.scheduled_routines
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_routines_user_date ON public.scheduled_routines(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_training_plans_user ON public.training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_routines_plan ON public.training_plan_routines(plan_id);

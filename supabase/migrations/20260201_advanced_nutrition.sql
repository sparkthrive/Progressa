-- 1. RECIPES
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  carbs NUMERIC(6,2) DEFAULT 0,
  fats NUMERIC(6,2) DEFAULT 0,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  prep_time_minutes INTEGER,
  image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEAL PLANS
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEAL PLAN ITEMS (Structure of the diet)
CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL, -- 1 to 30+
  meal_category TEXT NOT NULL, -- 'Desayuno', 'Comida', 'Cena', 'Snack', etc.
  meal_time TIME,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  custom_meal_name TEXT, -- If they don't use a recipe
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER ACTIVE MEAL PLAN (To track state)
CREATE TABLE IF NOT EXISTS public.user_active_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. NUTRITION LOGS (If not exists)
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recorded_at DATE DEFAULT CURRENT_DATE,
  calories INTEGER DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  carbs NUMERIC(6,2) DEFAULT 0,
  fats NUMERIC(6,2) DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  meal_images JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recorded_at)
);

-- RLS POLICIES
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Recipes
CREATE POLICY "Manage own recipes" ON public.recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "View public recipes" ON public.recipes
  FOR SELECT USING (is_public = true);

-- Meal Plans
CREATE POLICY "Manage own meal plans" ON public.meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- Meal Plan Items (Linked to plan ownership)
CREATE POLICY "Manage meal plan items" ON public.meal_plan_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.meal_plans WHERE id = meal_plan_items.meal_plan_id AND user_id = auth.uid())
  );

-- Active Plans
CREATE POLICY "Manage own active plan" ON public.user_active_plans
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition Logs
CREATE POLICY "Manage own nutrition logs" ON public.nutrition_logs
  FOR ALL USING (auth.uid() = user_id);

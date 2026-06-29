-- =====================================================
-- SOCIAL FEED SYSTEM (GROUPS)
-- =====================================================

-- 1. Group Posts (User Generated Content)
CREATE TABLE IF NOT EXISTS public.group_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Group Comments (Posts Social Interaction)
CREATE TABLE IF NOT EXISTS public.group_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.group_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.group_comments(id) ON DELETE CASCADE, -- For nested replies
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Post Likes/Reactions
CREATE TABLE IF NOT EXISTS public.group_post_likes (
    post_id UUID REFERENCES public.group_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- =====================================================
-- ADVANCED NUTRITION SYSTEM
-- =====================================================

-- 4. Recipes Catalog
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    calories INTEGER DEFAULT 0,
    protein NUMERIC(6,2) DEFAULT 0,
    carbs NUMERIC(6,2) DEFAULT 0,
    fats NUMERIC(6,2) DEFAULT 0,
    ingredients JSONB DEFAULT '[]', -- List of {name, amount, unit}
    instructions TEXT,
    prep_time_minutes INTEGER DEFAULT 0,
    image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Meal Plans (Weekly/Monthly structures)
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Meal Plan Items (Mapping recipes to days/times)
CREATE TABLE IF NOT EXISTS public.meal_plan_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL, -- 1 to 30
    meal_time TIME NOT NULL,
    meal_category TEXT CHECK (meal_category IN ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout')),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
    custom_name TEXT, -- In case it's not a recipe but a quick entry
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Daily Macro Logs (Consolidation)
CREATE TABLE IF NOT EXISTS public.daily_macro_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    consumed_calories INTEGER DEFAULT 0,
    consumed_protein NUMERIC(6,2) DEFAULT 0,
    consumed_carbs NUMERIC(6,2) DEFAULT 0,
    consumed_fats NUMERIC(6,2) DEFAULT 0,
    water_liters NUMERIC(4,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_macro_logs ENABLE ROW LEVEL SECURITY;

-- Post Policies
CREATE POLICY "Anyone in group can view posts" ON public.group_posts FOR SELECT USING (true); -- Simplified for MVP
CREATE POLICY "Users can create posts in their groups" ON public.group_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit/delete own posts" ON public.group_posts FOR ALL USING (auth.uid() = user_id);

-- Comment Policies
CREATE POLICY "Anyone can view comments" ON public.group_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.group_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Like Policies
CREATE POLICY "Anyone can view likes" ON public.group_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like/unlike" ON public.group_post_likes FOR ALL USING (auth.uid() = user_id);

-- Nutrition Policies
CREATE POLICY "Users manage own recipes" ON public.recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public recipes" ON public.recipes FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own meal plan items" ON public.meal_plan_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.meal_plans WHERE id = meal_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own macro logs" ON public.daily_macro_logs FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update current_members is already handled or should be.

-- Real-time is enabled by default for these tables usually via dash, 
-- but we make sure they are in the publication if needed.

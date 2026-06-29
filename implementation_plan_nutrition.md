# Implementation Plan - Advanced Nutrition & Meal Plans

## Goal Description
Build a comprehensive nutrition management system within **PROGRESSA**. The goal is to move beyond simple calorie tracking and enable users to manage professional **Meal Plans** (diets) with scheduled meals, detailed recipes (ingredients & preparation), and automated tracking.

**Functional Core:**
*   **Recipe Management**: CRUD for custom recipes including macros, ingredients list, and preparation steps.
*   **Meal Plan Builder (Total Flexibility)**: Interface to create plans with an unlimited number of meals per day, custom labels, and specific times.
*   **Dynamic Scheduling**: No fixed slots. Users can add "Comida 1", "Snack Post-Entreno", or any category they desire.
*   **Active Plan Support**: Users can activate a plan and see "What to eat next" on their dashboard.
*   **One-Click Logging**: Quickly log a planned meal to the daily nutrition log.
*   **Ingredient & Prep View**: Detailed view for each planned meal to facilitate cooking.

## Architecture & Tech Stack

### Technology Stack
*   **Frontend**: Next.js 14 (App Router), TypeScript.
*   **UI Components**: shadcn/ui (Dialogs, Forms, Cards), Lucide Icons.
*   **Forms**: React Hook Form + Zod for recipe/plan validation.
*   **Database**: Supabase (PostgreSQL).
*   **Optimization**: Concurrent data fetching for plan views.

### Folder Structure
```text
src/
├── app/dashboard/nutrition/
│   ├── recipes/            # Recipe catalog & editor
│   ├── plans/              # Meal plan builder & list
│   │   ├── [id]/           # Plan detail/editor
│   │   └── new/            # Create new plan
│   └── page.tsx            # Nutrition dashboard (Active plan view)
├── components/nutrition/
│   ├── RecipeCard.tsx      # Recipe preview
│   ├── RecipeEditor.tsx    # Complex form for ingredients/prep
│   ├── MealPlanBuilder.tsx # Grid for assigning recipes to days
│   ├── ActiveMealCard.tsx  # Dashboard widget for next meal
│   └── NutritionActions.ts # Server actions for CRUD
└── lib/validations/
    └── nutrition.ts        # Zod schemas for recipes/plans
```

### Supabase Integration Strategy
*   **Logic**: Use PostgreSQL `TIME` type for meal scheduling and `JSONB` for ingredient lists to maintain flexibility.
*   **RLS**: Secure recipes and plans so users only manage their own data, with support for future "Public Recipes".
*   **State**: Active plan tracking via a singleton table `user_active_plans` per user.

## Database Schema

```sql
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
  ingredients JSONB DEFAULT '[]'::jsonb, -- Array of {item: string, amount: string}
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEAL PLAN ITEMS
CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  meal_category TEXT NOT NULL, -- 'Desayuno', 'Comida', 'Cena', 'Snack'
  meal_time TIME,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVE PLAN TRACKING
CREATE TABLE IF NOT EXISTS public.user_active_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recipes" ON public.recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own plan items" ON public.meal_plan_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.meal_plans WHERE id = meal_plan_items.meal_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own active plan" ON public.user_active_plans FOR ALL USING (auth.uid() = user_id);
```

## 7-Day Implementation Plan

### Phase 1: Recipe Engine
**Day 1: Recipe CRUD & Schema**
1.  Apply Supabase migrations for `recipes`.
2.  Build `RecipeEditor` component with dynamic fields for ingredients.
3.  Implement image upload for recipes.
4.  Create `RecipeCard` and list view.

### Phase 2: Plan Builder
**Day 2: Plan Structure & Items**
1.  Apply migrations for `meal_plans` and `meal_plan_items`.
2.  Create the `MealPlanBuilder` UI (Weekly grid view).
3.  Implement "Assign Recipe to Slot" logic with time picker.

**Day 3: Advanced Builder Logic**
1.  Calculated macros per day in the builder.
2.  Copy/Paste day functionality for quick plan creation.
3.  Plan validation (Check for empty days).

### Phase 3: Active Nutrition
**Day 4: Activation & Dashboard Integration**
1.  Implement "Activate Plan" logic.
2.  Create `ActiveMealCard` for the main Nutrition dashboard.
3.  Logic to determine "Current Day" of the plan (Current Date - Start Date).

**Day 5: One-Click Logging & Details**
1.  "Register Meal" action: Transfer macros from `recipe` -> `nutrition_logs`.
2.  Detailed Recipe View modal (Ingredients & Preparation) accessible from the dashboard.

### Phase 4: Polish & Growth
**Day 6: Mobile Optimization & UX**
1.  Responsive adjustments for the builder on mobile.
2.  Empty states for recipes and plans.
3.  Loading skeletons and toast notifications.

**Day 7: Testing & Final Review**
1.  End-to-End testing: Create Recipe -> Create Plan -> Activate -> Log Meal.
2.  UI Polish: Gradients, transitions, and premium aesthetics.

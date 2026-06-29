# Implementation Plan: Calendar & Training Plans

This plan outlines the steps to implement a Calendar feature for scheduling routines and a Training Plans feature for grouping routines into long-term schedules.

## 1. Database Schema Updates

We need new tables to support scheduling and plans.

### 1.1 `training_plans`
Stores the high-level plan details.
- `id`: UUID (PK)
- `user_id`: UUID (FK to users)
- `name`: TEXT
- `description`: TEXT
- `duration_weeks`: INTEGER (e.g., 4, 8, 12)
- `is_public`: BOOLEAN (default false)
- `created_at`: TIMESTAMPTZ

### 1.2 `training_plan_routines`
Links routines to a plan, specifying when they occur within the plan.
- `id`: UUID (PK)
- `plan_id`: UUID (FK to training_plans)
- `routine_id`: UUID (FK to routines)
- `week_number`: INTEGER (1-based index)
- `day_of_week`: INTEGER (1-7, where 1=Monday or similar)
- `notes`: TEXT (optional instructions for that day)

### 1.3 `scheduled_routines`
Represents actual instances of a routine on a user's calendar.
- `id`: UUID (PK)
- `user_id`: UUID (FK to users)
- `routine_id`: UUID (FK to routines)
- `plan_id`: UUID (FK to training_plans, nullable - for loose routines)
- `scheduled_date`: DATE
- `status`: TEXT ('pending', 'completed', 'missed')
- `completed_at`: TIMESTAMPTZ
- `notes`: TEXT

## 2. Server Actions & API

### 2.1 Calendar Actions
- `getScheduledRoutines(start, end)`: Fetch events for calendar view.
- `scheduleRoutine(routineId, date)`: Add a routine to a specific date.
- `updateScheduledRoutineStatus(id, status)`: Mark as complete/missed.

### 2.2 Training Plan Actions
- `createTrainingPlan(data)`: Create a new plan.
- `addRoutineToPlan(planId, routineId, week, day)`: Build the plan structure.
- `assignPlanToCalendar(planId, startDate)`: Bulk create `scheduled_routines` based on the plan template starting from a given date.

## 3. Frontend Implementation

### 3.1 Calendar Component (`/dashboard/calendar`)
- Use a library like `react-day-picker` or build a custom grid.
- **Views**: Month, Week.
- **Interactions**:
    - Click date -> Add Routine Modal.
    - Click event -> View/Start Routine.
    - Drag & Drop (optional for now).

### 3.2 Training Plan Manager (`/dashboard/plans`)
- List of user's plans.
- **Plan Builder UI**:
    - Form for plan details.
    - Grid UI (Weeks x Days) to drop routines into slots.

### 3.3 Integration
- **Routine LIST**: Add "Schedule" button to `RoutineCard`.
- **Dashboard**: Show "Today's Workout" widget sourced from `scheduled_routines`.

## 4. Migration File
Create a new migration file `supabase/migrations/20260210_calendar_and_plans.sql`.

```sql
-- Create training_plans table
CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create training_plan_routines table
CREATE TABLE IF NOT EXISTS public.training_plan_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, week_number, day_of_week) -- Prevent two routines on same slot for now? Or allow multiple? Let's keep unique for MVP simplicity
);

-- Create scheduled_routines table
CREATE TABLE IF NOT EXISTS public.scheduled_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE SET NULL, -- Optional link to original plan
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'skipped')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scheduled_routines_user_date ON public.scheduled_routines(user_id, scheduled_date);
CREATE INDEX idx_training_plans_user ON public.training_plans(user_id);
```

**Next Steps**:
1. Create Migration.
2. Implement Calendar Page.
3. Implement Plan Builder.

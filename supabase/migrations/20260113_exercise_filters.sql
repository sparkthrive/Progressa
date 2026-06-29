-- =====================================================
-- EXERCISE LIBRARY ADVANCED FILTERS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add new filter columns to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS movement_type TEXT[],
ADD COLUMN IF NOT EXISTS equipment_required TEXT[],
ADD COLUMN IF NOT EXISTS exercise_goal TEXT[],
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('principiante', 'intermedio', 'avanzado')),
ADD COLUMN IF NOT EXISTS exercise_type TEXT CHECK (exercise_type IN ('compuesto', 'aislado', 'cardio', 'estiramiento')),
ADD COLUMN IF NOT EXISTS specific_body_part TEXT,
ADD COLUMN IF NOT EXISTS duration_per_set TEXT CHECK (duration_per_set IN ('corto', 'medio', 'largo')),
ADD COLUMN IF NOT EXISTS joint_impact TEXT CHECK (joint_impact IN ('bajo', 'medio', 'alto')),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT[],
ADD COLUMN IF NOT EXISTS discipline TEXT CHECK (discipline IN ('gym', 'calistenia', 'yoga', 'cardio', 'crossfit', 'pilates', 'running', 'ciclismo', 'boxeo', 'danza', 'rehabilitacion', 'home_workout')),
ADD COLUMN IF NOT EXISTS discipline_metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exercises_discipline ON public.exercises(discipline);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_movement_type ON public.exercises USING GIN(movement_type);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON public.exercises USING GIN(equipment_required);
CREATE INDEX IF NOT EXISTS idx_exercises_goals ON public.exercises USING GIN(exercise_goal);
CREATE INDEX IF NOT EXISTS idx_exercises_discipline_metadata ON public.exercises USING GIN(discipline_metadata);

-- Create exercise_favorites table
CREATE TABLE IF NOT EXISTS public.exercise_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_favorites_user ON public.exercise_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_favorites_exercise ON public.exercise_favorites(exercise_id);

-- Enable RLS
ALTER TABLE public.exercise_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
DROP POLICY IF EXISTS "Users manage own favorites" ON public.exercise_favorites;
CREATE POLICY "Users manage own favorites" ON public.exercise_favorites FOR ALL USING (auth.uid() = user_id);

-- Add equipment_available to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS equipment_available TEXT[] DEFAULT ARRAY[]::TEXT[];

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

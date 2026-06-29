-- Migration: Add measurement_type to exercises
-- Created at: 2026-02-01

ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS measurement_type TEXT DEFAULT 'reps' CHECK (measurement_type IN ('reps', 'time'));

-- Update existing exercises that should be time-based
UPDATE public.exercises 
SET measurement_type = 'time' 
WHERE name ILIKE '%plank%' 
OR name ILIKE '%plancha%' 
OR name ILIKE '%isométrico%'
OR name ILIKE '%burpee%'
OR name ILIKE '%correr%'
OR name ILIKE '%yoga%'
OR name ILIKE '%saludo al sol%'
OR name ILIKE '%perro boca abajo%'
OR name ILIKE '%box% jump%'
OR name ILIKE '%estiramiento%';

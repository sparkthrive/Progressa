-- 1. Add missing columns to exercises table matching the frontend types
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS discipline TEXT, -- 'gym', 'calistenia', 'yoga', etc.
ADD COLUMN IF NOT EXISTS equipment_required TEXT[], -- Array of equipment codes
ADD COLUMN IF NOT EXISTS movement_type TEXT[], -- Array of movement types
ADD COLUMN IF NOT EXISTS exercise_goal TEXT[], -- Array of goals
ADD COLUMN IF NOT EXISTS difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
ADD COLUMN IF NOT EXISTS exercise_type TEXT, -- 'compound', 'isolation', etc.
ADD COLUMN IF NOT EXISTS specific_body_part TEXT, -- more specific than muscle_group
ADD COLUMN IF NOT EXISTS duration_per_set TEXT, -- 'short', 'medium', 'long'
ADD COLUMN IF NOT EXISTS joint_impact TEXT, -- 'low', 'medium', 'high'
ADD COLUMN IF NOT EXISTS discipline_metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Clear existing entries to avoid contamination with missing data (Optional, but good for clean state)
-- DELETE FROM public.exercises WHERE user_id IS NULL; -- Only delete system exercises

-- 3. Insert Comprehensive Seed Data
INSERT INTO public.exercises (
    name, 
    muscle_group, 
    equipment, -- Legacy field, kept for compatibility
    equipment_required, 
    discipline, 
    movement_type, 
    exercise_goal, 
    difficulty_level, 
    exercise_type, 
    specific_body_part, 
    joint_impact,
    video_url
) VALUES 
-- PECHO (Chest)
(
    'Press de Banca con Barra', 
    'pecho', 
    'Barra', 
    ARRAY['barra', 'banco'], 
    'gym', 
    ARRAY['empuje'], 
    ARRAY['fuerza', 'hipertrofia'], 
    'intermedio', 
    'compuesto', 
    'Pectoral Mayor', 
    'medio',
    'https://www.youtube.com/watch?v=rT7DgCr-3pg'
),
(
    'Aperturas con Mancuernas', 
    'pecho', 
    'Mancuernas', 
    ARRAY['mancuernas', 'banco'], 
    'gym', 
    ARRAY['empuje'], 
    ARRAY['hipertrofia'], 
    'principiante', 
    'aislado', 
    'Pectoral Mayor', 
    'medio',
    'https://www.youtube.com/watch?v=eozdVDA78K0'
),
(
    'Flexiones (Push-ups)', 
    'pecho', 
    'Ninguno', 
    ARRAY['peso_corporal'], 
    'calistenia', 
    ARRAY['empuje'], 
    ARRAY['fuerza', 'resistencia'], 
    'principiante', 
    'compuesto', 
    'Pectoral', 
    'medio',
    'https://www.youtube.com/watch?v=IODxDxX7oi4'
),

-- ESPALDA (Back)
(
    'Dominadas (Pull-ups)', 
    'espalda', 
    'Barra', 
    ARRAY['peso_corporal', 'barra'], 
    'calistenia', 
    ARRAY['tiron'], 
    ARRAY['fuerza', 'hipertrofia'], 
    'intermedio', 
    'compuesto', 
    'Dorsal Ancho', 
    'medio',
    'https://www.youtube.com/watch?v=eGo4IYlbE5g'
),
(
    'Remo con Barra', 
    'espalda', 
    'Barra', 
    ARRAY['barra'], 
    'gym', 
    ARRAY['tiron'], 
    ARRAY['fuerza', 'hipertrofia'], 
    'intermedio', 
    'compuesto', 
    'Espalda Media', 
    'medio',
    'https://www.youtube.com/watch?v=G8l_8chR5BE'
),
(
    'Jalón al Pecho (Lat Pulldown)', 
    'espalda', 
    'Máquina', 
    ARRAY['maquinas', 'poleas'], 
    'gym', 
    ARRAY['tiron'], 
    ARRAY['hipertrofia'], 
    'principiante', 
    'compuesto', 
    'Dorsal Ancho', 
    'bajo',
    'https://www.youtube.com/watch?v=CAwf7n6Luuc'
),

-- PIERNAS (Legs)
(
    'Sentadilla con Barra (Squat)', 
    'piernas', 
    'Barra', 
    ARRAY['barra'], 
    'gym', 
    ARRAY['dominante_rodilla'], 
    ARRAY['fuerza', 'hipertrofia', 'potencia'], 
    'intermedio', 
    'compuesto', 
    'Cuádriceps', 
    'alto',
    'https://www.youtube.com/watch?v=MVMvh5l9P5w'
),
(
    'Peso Muerto Rumano', 
    'piernas', 
    'Barra', 
    ARRAY['barra'], 
    'gym', 
    ARRAY['dominante_cadera'], 
    ARRAY['fuerza', 'hipertrofia'], 
    'intermedio', 
    'compuesto', 
    'Isquiotibiales', 
    'medio',
    'https://www.youtube.com/watch?v=JCXUYuzwNrM'
),
(
    'Zancadas (Lunges)', 
    'piernas', 
    'Mancuernas', 
    ARRAY['mancuernas', 'peso_corporal'], 
    'gym', 
    ARRAY['dominante_rodilla'], 
    ARRAY['hipertrofia', 'resistencia'], 
    'principiante', 
    'compuesto', 
    'Cuádriceps/Glúteo', 
    'medio',
    'https://www.youtube.com/watch?v=L8fvybAfzz8'
),
(
    'Prensa de Piernas', 
    'piernas', 
    'Máquina', 
    ARRAY['maquinas'], 
    'gym', 
    ARRAY['dominante_rodilla'], 
    ARRAY['hipertrofia'], 
    'principiante', 
    'compuesto', 
    'Cuádriceps', 
    'bajo',
    'https://www.youtube.com/watch?v=IZxyjW7MPjq'
),

-- HOMBROS (Shoulders)
(
    'Press Militar con Mancuernas', 
    'hombros', 
    'Mancuernas', 
    ARRAY['mancuernas', 'banco'], 
    'gym', 
    ARRAY['empuje'], 
    ARRAY['hipertrofia', 'fuerza'], 
    'principiante', 
    'compuesto', 
    'Deltoides Anterior', 
    'medio',
    'https://www.youtube.com/watch?v=qEwK6Ys60pk'
),
(
    'Elevaciones Laterales', 
    'hombros', 
    'Mancuernas', 
    ARRAY['mancuernas'], 
    'gym', 
    ARRAY['empuje'], 
    ARRAY['hipertrofia'], 
    'principiante', 
    'aislado', 
    'Deltoides Lateral', 
    'bajo',
    'https://www.youtube.com/watch?v=3VcKaXpzqRo'
),

-- BRAZOS (Arms)
(
    'Curl de Bíceps con Barra', 
    'biceps', 
    'Barra', 
    ARRAY['barra'], 
    'gym', 
    ARRAY['tiron'], 
    ARRAY['hipertrofia'], 
    'principiante', 
    'aislado', 
    'Bíceps', 
    'bajo',
    'https://www.youtube.com/watch?v=kwG2ipFRgfo'
),
(
    'Extensiones de Tríceps en Polea', 
    'triceps', 
    'Polea', 
    ARRAY['poleas'], 
    'gym', 
    ARRAY['empuje'], 
    ARRAY['hipertrofia'], 
    'principiante', 
    'aislado', 
    'Tríceps', 
    'bajo',
    'https://www.youtube.com/watch?v=vB5OHsJ3EME'
),

-- CORE
(
    'Plancha Abdominal (Plank)', 
    'core', 
    'Ninguno', 
    ARRAY['peso_corporal'], 
    'calistenia', 
    ARRAY['estabilidad'], 
    ARRAY['resistencia', 'fuerza'], 
    'principiante', 
    'aislado', 
    'Abdominales', 
    'bajo',
    'https://www.youtube.com/watch?v=ASdvN_XEl_c'
),
(
    'Crunch Abdominal', 
    'core', 
    'Ninguno', 
    ARRAY['peso_corporal'], 
    'gym', 
    ARRAY['empuje'], -- Flexion
    ARRAY['hipertrofia'], 
    'principiante', 
    'aislado', 
    'Abdominales', 
    'bajo',
    'https://www.youtube.com/watch?v=Xyd_fa5zoEU'
),

-- CARDIO / CROSSFIT
(
    'Burpees', 
    'full_body', 
    'Ninguno', 
    ARRAY['peso_corporal'], 
    'crossfit', 
    ARRAY['cardio', 'empuje', 'dominante_rodilla'], 
    ARRAY['resistencia', 'potencia'], 
    'intermedio', 
    'compuesto', 
    'Full Body', 
    'alto',
    'https://www.youtube.com/watch?v=TU8QYXL8gEQ'
),
(
    'Saltos al Cajón (Box Jumps)', 
    'piernas', 
    'Cajón', 
    ARRAY['otros'], -- Box
    'crossfit', 
    ARRAY['dominante_rodilla', 'potencia'], 
    ARRAY['potencia'], 
    'intermedio', 
    'compuesto', 
    'Piernas', 
    'alto',
    'https://www.youtube.com/watch?v=kxvQkx8aahE'
),
(
    'Kettlebell Swing', 
    'piernas', 
    'Kettlebell', 
    ARRAY['kettlebell'], 
    'crossfit', 
    ARRAY['dominante_cadera', 'potencia'], 
    ARRAY['potencia', 'resistencia'], 
    'intermedio', 
    'compuesto', 
    'Cadena Posterior', 
    'medio',
    'https://www.youtube.com/watch?v=YSxHifyI6s8'
),

-- YOGA / MOBILITY
(
    'Saludo al Sol (Surya Namaskar)', 
    'full_body', 
    'Esterilla', 
    ARRAY['peso_corporal', 'otros'], 
    'yoga', 
    ARRAY['estabilidad', 'empuje'], 
    ARRAY['movilidad', 'calentamiento'], 
    'principiante', 
    'compuesto', 
    'Full Body', 
    'bajo',
    NULL
),
(
    'Perro Boca Abajo (Adho Mukha Svanasana)', 
    'full_body', 
    'Esterilla', 
    ARRAY['peso_corporal'], 
    'yoga', 
    ARRAY['estabilidad', 'empuje'], 
    ARRAY['movilidad', 'fuerza'], 
    'principiante', 
    'compuesto', 
    'Full Body', 
    'bajo',
    NULL
),
(
    'Gato-Vaca', 
    'espalda', 
    'Ninguno', 
    ARRAY['peso_corporal'], 
    'yoga', 
    ARRAY['movilidad'], 
    ARRAY['movilidad', 'calentamiento'], 
    'principiante', 
    'aislado', 
    'Columna', 
    'bajo',
    NULL
);

-- 4. Enable RLS or ensure permissions (Usually already set, but good to double check)
-- ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

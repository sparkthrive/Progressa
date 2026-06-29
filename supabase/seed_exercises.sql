-- Seed Exercises for Progressa App
-- Muscle Groups: Chest, Back, Quads, Hamstrings, Glutes, Shoulders, Biceps, Triceps, Abs

INSERT INTO public.exercises (name, muscle_group, equipment, is_custom) VALUES
-- Chest
('Press de Banca con Barra', 'Pecho', 'Barra', false),
('Press Inclinado con Mancuernas', 'Pecho', 'Mancuernas', false),
('Aperturas con Mancuernas', 'Pecho', 'Mancuernas', false),
('Fondos en Paralelas (Pecho)', 'Pecho', 'Peso Corporal', false),
('Cruce de Poleas', 'Pecho', 'Polea', false),
('Flexiones de Brazos', 'Pecho', 'Peso Corporal', false),

-- Back
('Dominadas', 'Espalda', 'Peso Corporal', false),
('Jalón al Pecho', 'Espalda', 'Polea', false),
('Remo con Barra', 'Espalda', 'Barra', false),
('Remo con Mancuerna a una Mano', 'Espalda', 'Mancuernas', false),
('Remo en Polea Baja', 'Espalda', 'Polea', false),
('Peso Muerto Convencional', 'Espalda', 'Barra', false),
('Hiperextensiones', 'Espalda', 'Banco', false),

-- Shoulders
('Press Militar con Barra', 'Hombros', 'Barra', false),
('Press de Hombros con Mancuernas', 'Hombros', 'Mancuernas', false),
('Elevaciones Laterales', 'Hombros', 'Mancuernas', false),
('Pájaro (Elevaciones Posteriores)', 'Hombros', 'Mancuernas', false),
('Face Pulls', 'Hombros', 'Polea', false),

-- Quads
('Sentadilla con Barra', 'Cuádriceps', 'Barra', false),
('Prensa de Piernas', 'Cuádriceps', 'Máquina', false),
('Extensiones de Cuádriceps', 'Cuádriceps', 'Máquina', false),
('Zancadas (Lunges)', 'Cuádriceps', 'Mancuernas', false),
('Sentadilla Búlgara', 'Cuádriceps', 'Mancuernas', false),

-- Hamstrings & Glutes
('Peso Muerto Rumano', 'Isquiotibiales', 'Barra', false),
('Curl de Pierna Acostado', 'Isquiotibiales', 'Máquina', false),
('Hip Thrust (Empuje de Cadera)', 'Glúteos', 'Barra', false),
('Curl de Pierna Sentado', 'Isquiotibiales', 'Máquina', false),

-- Biceps
('Curl de Biceps con Barra', 'Biceps', 'Barra', false),
('Curl de Biceps con Mancuernas', 'Biceps', 'Mancuernas', false),
('Curl Martillo', 'Biceps', 'Mancuernas', false),
('Curl en Predicador', 'Biceps', 'Barra EZ', false),

-- Triceps
('Press Francés', 'Triceps', 'Barra EZ', false),
('Extensión de Triceps en Polea Alta', 'Triceps', 'Polea', false),
('Fondos entre Bancos', 'Triceps', 'Peso Corporal', false),
('Press de Banca Agarre Cerrado', 'Triceps', 'Barra', false),
('Patada de Triceps', 'Triceps', 'Mancuerna', false),

-- Core
('Plancha Abdominal', 'Core', 'Peso Corporal', false),
('Crunch Abdominal', 'Core', 'Peso Corporal', false),
('Elevación de Piernas', 'Core', 'Peso Corporal', false),
('Rueda Abdominal', 'Core', 'Rueda', false),
('Twist Ruso', 'Core', 'Mancuerna', false);

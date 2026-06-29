// Exercise filter types and constants

export type Discipline =
    | 'gym'
    | 'calistenia'
    | 'yoga'
    | 'cardio'
    | 'crossfit'
    | 'pilates'
    | 'running'
    | 'ciclismo'
    | 'boxeo'
    | 'danza'
    | 'rehabilitacion'
    | 'home_workout'

export type MuscleGroup =
    | 'pecho'
    | 'espalda'
    | 'hombros'
    | 'biceps'
    | 'triceps'
    | 'piernas'
    | 'gluteos'
    | 'core'
    | 'full_body'

export type MovementType =
    | 'empuje'
    | 'tiron'
    | 'dominante_rodilla'
    | 'dominante_cadera'
    | 'rotacion'
    | 'estabilidad'
    | 'cardio'

export type Equipment =
    | 'peso_corporal'
    | 'mancuernas'
    | 'barra'
    | 'maquinas'
    | 'kettlebell'
    | 'bandas'
    | 'poleas'
    | 'banco'
    | 'trx'
    | 'otros'

export type ExerciseGoal =
    | 'fuerza'
    | 'hipertrofia'
    | 'potencia'
    | 'resistencia'
    | 'movilidad'
    | 'calentamiento'

export type DifficultyLevel = 'principiante' | 'intermedio' | 'avanzado'

export type ExerciseType = 'compuesto' | 'aislado' | 'cardio' | 'estiramiento'

export type DurationPerSet = 'corto' | 'medio' | 'largo'

export type JointImpact = 'bajo' | 'medio' | 'alto'

// Discipline-specific metadata types
export interface GymMetadata {
    tipo?: 'libre' | 'maquinas'
    plano_movimiento?: 'horizontal' | 'vertical'
}

export interface CalisteniaMetadata {
    nivel?: 'basico' | 'intermedio' | 'avanzado'
    equipamiento?: 'suelo' | 'barras' | 'paralelas'
}

export interface YogaMetadata {
    nivel?: 'principiante' | 'intermedio' | 'avanzado'
    tipo?: 'hatha' | 'vinyasa' | 'yin' | 'ashtanga'
    duracion?: '5min' | '15min' | '30min' | '60min'
}

export interface CardioMetadata {
    duracion?: '5min' | '10min' | '20min' | '30min'
    intensidad?: 'baja' | 'media' | 'alta'
}

export interface CrossFitMetadata {
    wod_type?: 'amrap' | 'emom' | 'for_time'
}

export interface CiclismoMetadata {
    subdisciplina?: 'ruta' | 'mtb' | 'virtual'
    // For Ruta
    tipo_sesion?: 'base' | 'intervalos' | 'threshold' | 'vo2max' | 'recuperacion'
    zona_potencia?: 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6'
    terreno?: 'plano' | 'ondulado' | 'colinas' | 'montana'
    // For MTB
    tipo_terreno?: 'climbs' | 'descensos' | 'flow' | 'tecnicos' | 'enduro'
    skills_focus?: 'basicas' | 'drops' | 'berms' | 'roots_rocks'
    // For Virtual
    plataforma?: 'zwift' | 'trainerroad' | 'peloton' | 'rouvy' | 'sufferfest'
    tipo_workout?: 'sweet_spot' | 'threshold' | 'vo2max' | 'sprint' | 'recovery'
    equipamiento_virtual?: 'rodillo_smart' | 'rodillo_basico' | 'bici_estatica'
    // Common
    duracion_ciclismo?: '<30min' | '30-60min' | '60-120min' | '120+min'
}

export type DisciplineMetadata =
    | GymMetadata
    | CalisteniaMetadata
    | YogaMetadata
    | CardioMetadata
    | CrossFitMetadata
    | CiclismoMetadata

export interface ExerciseFilters {
    disciplines?: Discipline[]
    muscleGroups?: MuscleGroup[]
    movementTypes?: MovementType[]
    equipment?: Equipment[]
    goals?: ExerciseGoal[]
    difficulty?: DifficultyLevel
    exerciseTypes?: ExerciseType[]
    specificBodyPart?: string
    durationPerSet?: DurationPerSet
    jointImpact?: JointImpact
    disciplineMetadata?: Partial<DisciplineMetadata>
    onlyMyEquipment?: boolean
    favoritesOnly?: boolean
    search?: string
}

export interface Exercise {
    id: string
    user_id?: string
    name: string
    muscle_group: string
    equipment?: string
    video_url?: string
    is_custom: boolean
    created_at: string
    // New fields
    movement_type?: MovementType[]
    equipment_required?: Equipment[]
    exercise_goal?: ExerciseGoal[]
    difficulty_level?: DifficultyLevel
    exercise_type?: ExerciseType
    specific_body_part?: string
    duration_per_set?: DurationPerSet
    joint_impact?: JointImpact
    description?: string
    instructions?: string[]
    discipline?: Discipline
    discipline_metadata?: DisciplineMetadata
}

// Filter option labels
export const DISCIPLINE_LABELS: Record<Discipline, string> = {
    gym: 'Gym / Pesas',
    calistenia: 'Calistenia',
    yoga: 'Yoga / Movilidad',
    cardio: 'Cardio / HIIT',
    crossfit: 'CrossFit / Funcional',
    pilates: 'Pilates / Core',
    running: 'Running / Outdoor',
    ciclismo: 'Ciclismo / Spinning',
    boxeo: 'Boxeo / Artes Marciales',
    danza: 'Danza / Zumba',
    rehabilitacion: 'Rehabilitación / Fisioterapia',
    home_workout: 'Entrenamiento en Casa'
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
    pecho: 'Pecho',
    espalda: 'Espalda',
    hombros: 'Hombros',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    piernas: 'Piernas',
    gluteos: 'Glúteos',
    core: 'Core / Abdominales',
    full_body: 'Full Body'
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
    empuje: 'Empuje (Push)',
    tiron: 'Tirón (Pull)',
    dominante_rodilla: 'Dominante de Rodilla',
    dominante_cadera: 'Dominante de Cadera',
    rotacion: 'Rotación',
    estabilidad: 'Estabilidad',
    cardio: 'Cardio'
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
    peso_corporal: 'Peso Corporal',
    mancuernas: 'Mancuernas',
    barra: 'Barra',
    maquinas: 'Máquinas',
    kettlebell: 'Kettlebell',
    bandas: 'Bandas Elásticas',
    poleas: 'Poleas',
    banco: 'Banco',
    trx: 'TRX',
    otros: 'Otros'
}

export const EXERCISE_GOAL_LABELS: Record<ExerciseGoal, string> = {
    fuerza: 'Fuerza',
    hipertrofia: 'Hipertrofia',
    potencia: 'Potencia',
    resistencia: 'Resistencia Muscular',
    movilidad: 'Movilidad / Estiramiento',
    calentamiento: 'Calentamiento'
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    principiante: 'Principiante',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado'
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
    compuesto: 'Compuesto (Multiarticular)',
    aislado: 'Aislado',
    cardio: 'Cardio',
    estiramiento: 'Estiramiento'
}

export const DURATION_LABELS: Record<DurationPerSet, string> = {
    corto: 'Corto (<30s)',
    medio: 'Medio (30-60s)',
    largo: 'Largo (>60s)'
}

export const JOINT_IMPACT_LABELS: Record<JointImpact, string> = {
    bajo: 'Bajo Impacto',
    medio: 'Impacto Medio',
    alto: 'Alto Impacto'
}

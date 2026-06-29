import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WorkoutSet {
    id: string
    weight: number
    reps: number
    isCompleted: boolean
}

export interface WorkoutExercise {
    exerciseId: string
    name: string
    sets: WorkoutSet[]
}

interface WorkoutState {
    isActive: boolean
    routineId?: string
    routineName?: string
    startTime?: Date
    exercises: WorkoutExercise[]

    // Actions
    startWorkout: (routine: { id: string; name: string; exercises: any[] }) => void
    updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void
    addSet: (exerciseIndex: number) => void
    removeSet: (exerciseIndex: number, setIndex: number) => void
    finishWorkout: () => void
    cancelWorkout: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set) => ({
            isActive: false,
            exercises: [],

            startWorkout: (routine) => {
                const initialExercises = routine.exercises.map((ex: any) => {
                    const targetSets = Array.isArray(ex.sets_target) ? ex.sets_target : []
                    return {
                        exerciseId: ex.exercise_id,
                        name: ex.exercise?.name || 'Desconocido',
                        sets: targetSets.length > 0
                            ? targetSets.map((s: any) => ({
                                id: Math.random().toString(36).substr(2, 9),
                                weight: s.weight || 0,
                                reps: s.reps || 10,
                                isCompleted: false,
                            }))
                            : Array.from({ length: 3 }).map(() => ({
                                id: Math.random().toString(36).substr(2, 9),
                                weight: 0,
                                reps: 10,
                                isCompleted: false,
                            })),
                    }
                })

                set({
                    isActive: true,
                    routineId: routine.id,
                    routineName: routine.name,
                    startTime: new Date(),
                    exercises: initialExercises,
                })
            },

            updateSet: (exIdx, setIdx, updates) => {
                set((state) => {
                    const newExercises = [...state.exercises]
                    newExercises[exIdx].sets[setIdx] = {
                        ...newExercises[exIdx].sets[setIdx],
                        ...updates,
                    }
                    return { exercises: newExercises }
                })
            },

            addSet: (exIdx) => {
                set((state) => {
                    const newExercises = [...state.exercises]
                    const lastSet = newExercises[exIdx].sets[newExercises[exIdx].sets.length - 1]
                    newExercises[exIdx].sets.push({
                        id: Math.random().toString(36).substr(2, 9),
                        weight: lastSet?.weight || 0,
                        reps: lastSet?.reps || 10,
                        isCompleted: false,
                    })
                    return { exercises: newExercises }
                })
            },

            removeSet: (exIdx, setIdx) => {
                set((state) => {
                    const newExercises = [...state.exercises]
                    if (newExercises[exIdx].sets.length > 1) {
                        newExercises[exIdx].sets.splice(setIdx, 1)
                    }
                    return { exercises: newExercises }
                })
            },

            finishWorkout: () => {
                set({ isActive: false, exercises: [], routineId: undefined, routineName: undefined, startTime: undefined })
            },

            cancelWorkout: () => {
                if (confirm('¿Estás seguro de que quieres cancelar el entrenamiento? Los datos no se guardarán.')) {
                    set({ isActive: false, exercises: [], routineId: undefined, routineName: undefined, startTime: undefined })
                }
            },
        }),
        {
            name: 'workout-storage',
        }
    )
)

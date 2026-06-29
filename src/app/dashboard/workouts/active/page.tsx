'use client'

import { useWorkoutStore } from '@/store/useWorkoutStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Check, Plus, Timer, Trash2, X, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { finalizeWorkoutWithData } from '../actions'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TimerDisplay } from '@/components/workouts/TimerDisplay'
import { toast } from 'sonner'

export default function ActiveWorkoutPage() {
    const router = useRouter()
    const params = useParams()
    const workoutId = params.id as string

    const {
        isActive,
        exercises,
        routineName,
        startWorkout,
        updateSet,
        addSet,
        removeSet,
        finishWorkout,
        cancelWorkout
    } = useWorkoutStore()

    const [activeTimer, setActiveTimer] = useState<{
        type: 'rest' | 'exercise',
        duration: number,
        label: string
    } | null>(null)

    useEffect(() => {
        if (!isActive && workoutId) {
            const loadActiveWorkout = async () => {
                const supabase = createClient()

                // Fetch the workout session
                const { data: workout } = await supabase
                    .from('workouts')
                    .select('*, routine:routines(*)')
                    .eq('id', workoutId)
                    .single()

                if (workout) {
                    // Start it in local store if not already active
                    startWorkout(workout.routine)
                }
            }
            loadActiveWorkout()
        }
    }, [workoutId, isActive, startWorkout])

    const handleFinish = async () => {
        if (!exercises.length) return

        try {
            await finalizeWorkoutWithData(workoutId, exercises, "Entrenamiento completado desde PROGRESSA Web.")
            finishWorkout()
        } catch (error: any) {
            // Handle Next.js redirect "error"
            if (error.digest?.startsWith('NEXT_REDIRECT')) {
                finishWorkout()
                return
            }
            console.error(error)
            alert('Error al finalizar el entrenamiento')
        }
    }

    const startRestTimer = (seconds: number = 60) => {
        setActiveTimer({
            type: 'rest',
            duration: seconds,
            label: 'Descanso'
        })
    }

    const startTopRestTimer = () => {
        // Find first incomplete set's rest time or default to 60
        const firstIncompleteEx = exercises.find(ex => ex.sets.some(s => !s.isCompleted))
        const restTime = firstIncompleteEx?.rest_seconds || 60
        startRestTimer(restTime)
    }

    const startExerciseTimer = (seconds: number, name: string) => {
        setActiveTimer({
            type: 'exercise',
            duration: seconds,
            label: name
        })
    }

    if (!isActive) return <div className="p-8 text-center">Cargando entrenamiento...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md py-4 z-10">
                <h1 className="text-2xl font-bold">{routineName || 'Entrenamiento Libre'}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={startTopRestTimer} className="rounded-xl border-dashed">
                        <Timer className="h-4 w-4 mr-1 text-blue-500" /> Descanso
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelWorkout} className="rounded-xl hover:bg-red-50 hover:text-red-500 text-neutral-400">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Global Timer Overlay */}
            {activeTimer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-xs relative">
                        <TimerDisplay
                            duration={activeTimer.duration}
                            label={activeTimer.label}
                            autoStart={true}
                            onComplete={() => {
                                toast.success('¡Tiempo completado!')
                                setTimeout(() => setActiveTimer(null), 1000)
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveTimer(null)}
                            className="absolute -top-12 right-0 text-white hover:bg-white/10 rounded-full"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            )}

            {exercises.map((ex, exIdx) => (
                <Card key={ex.exerciseId}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-primary">{ex.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                            <div className="col-span-1 text-center">SET</div>
                            <div className="col-span-4 text-center lowercase">PESO (KG)</div>
                            <div className="col-span-4 text-center lowercase">
                                {ex.measurement_type === 'time' ? (
                                    <span className="flex items-center justify-center gap-1 uppercase"><Timer className="h-3 w-3" /> Tiempo (s)</span>
                                ) : (
                                    'reps'
                                )}
                            </div>
                            <div className="col-span-3"></div>
                        </div>

                        {ex.sets.map((set, setIdx) => (
                            <div
                                key={set.id}
                                className={`grid grid-cols-12 gap-2 items-center rounded-lg p-1 transition-colors ${set.isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''
                                    }`}
                            >
                                <div className="col-span-1 text-center font-bold">{setIdx + 1}</div>
                                <div className="col-span-4">
                                    <Input
                                        type="number"
                                        value={set.weight || ''}
                                        onChange={(e) => updateSet(exIdx, setIdx, { weight: parseFloat(e.target.value) })}
                                        placeholder="0"
                                        className="text-center h-9"
                                    />
                                </div>
                                <div className="col-span-4 flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={set.reps || ''}
                                        onChange={(e) => updateSet(exIdx, setIdx, { reps: parseInt(e.target.value) })}
                                        placeholder={ex.measurement_type === 'time' ? "30" : "10"}
                                        className="text-center h-9"
                                    />
                                    {ex.measurement_type === 'time' && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 shrink-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => startExerciseTimer(set.reps, ex.name)}
                                        >
                                            <Play className="h-3 w-3 fill-current" />
                                        </Button>
                                    )}
                                </div>
                                <div className="col-span-3 flex justify-end gap-1">
                                    <Button
                                        size="icon"
                                        variant={set.isCompleted ? "default" : "outline"}
                                        className={`h-9 w-9 rounded-xl transition-all ${set.isCompleted ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20' : 'border-neutral-200'}`}
                                        onClick={() => {
                                            const newState = !set.isCompleted
                                            updateSet(exIdx, setIdx, { isCompleted: newState })
                                            if (newState) {
                                                // After completing a set, trigger rest timer
                                                startRestTimer(set.rest_seconds || ex.rest_seconds || 60)
                                            }
                                        }}
                                    >
                                        <Check className={`h-4 w-4 ${set.isCompleted ? 'scale-110' : 'text-neutral-300'}`} />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeSet(exIdx, setIdx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            className="w-full h-8 border-dashed"
                            onClick={() => addSet(exIdx)}
                        >
                            <Plus className="h-3 w-3 mr-1" /> Agregar Serie
                        </Button>
                    </CardContent>
                </Card>
            ))}

            <Button className="w-full py-6 text-lg font-bold shadow-lg" onClick={handleFinish}>
                Finalizar Entrenamiento
            </Button>
        </div>
    )
}

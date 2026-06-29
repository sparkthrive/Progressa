'use client'

import { useWorkoutStore } from '@/store/useWorkoutStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Check, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { completeWorkout } from '../actions'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
        try {
            await completeWorkout(workoutId, "Entrenamiento completado desde la web.")
            finishWorkout()
            router.push('/dashboard')
        } catch (error) {
            console.error(error)
            alert('Error al finalizar el entrenamiento')
        }
    }

    if (!isActive) return <div className="p-8 text-center">Cargando entrenamiento...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md py-4 z-10">
                <h1 className="text-2xl font-bold">{routineName || 'Entrenamiento Libre'}</h1>
                <Button variant="ghost" size="sm" onClick={cancelWorkout}>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
            </div>

            {exercises.map((ex, exIdx) => (
                <Card key={ex.exerciseId}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-primary">{ex.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                            <div className="col-span-1 text-center">SET</div>
                            <div className="col-span-4 text-center">PESO (KG)</div>
                            <div className="col-span-4 text-center">REPS</div>
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
                                <div className="col-span-4">
                                    <Input
                                        type="number"
                                        value={set.reps || ''}
                                        onChange={(e) => updateSet(exIdx, setIdx, { reps: parseInt(e.target.value) })}
                                        placeholder="10"
                                        className="text-center h-9"
                                    />
                                </div>
                                <div className="col-span-3 flex justify-end gap-1">
                                    <Button
                                        size="icon"
                                        variant={set.isCompleted ? "default" : "outline"}
                                        className={`h-9 w-9 ${set.isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                        onClick={() => updateSet(exIdx, setIdx, { isCompleted: !set.isCompleted })}
                                    >
                                        <Check className="h-4 w-4" />
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

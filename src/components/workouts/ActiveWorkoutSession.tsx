'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ChevronLeft,
    Play,
    Pause,
    CheckCircle2,
    Clock,
    Dumbbell,
    MoreHorizontal,
    Trash2,
    Plus,
    X,
    Trophy,
    Check,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { completeWorkout, updateWorkoutExercise } from '@/app/dashboard/workouts/actions'
import { useRouter } from 'next/navigation'

interface ActiveWorkoutSessionProps {
    workout: any
    exercises: any[]
}

export function ActiveWorkoutSession({ workout, exercises: initialExercises }: ActiveWorkoutSessionProps) {
    const router = useRouter()
    const [seconds, setSeconds] = useState(0)
    const [isActive, setIsActive] = useState(true)
    const [exercises, setExercises] = useState(initialExercises)
    const [isFinishing, setIsFinishing] = useState(false)
    const [notes, setNotes] = useState('')
    const [syncing, setSyncing] = useState<string[]>([])

    // Timer logic
    useEffect(() => {
        let interval: any = null
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isActive])

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleSetUpdate = (exerciseId: string, setIndex: number, field: string, value: string) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id === exerciseId) {
                const newSets = [...ex.sets_data]
                newSets[setIndex] = { ...newSets[setIndex], [field]: value }
                return { ...ex, sets_data: newSets }
            }
            return ex
        }))
    }

    const toggleSetComplete = async (exerciseId: string, setIndex: number) => {
        let updatedEx: any = null

        setExercises(prev => prev.map(ex => {
            if (ex.id === exerciseId) {
                const newSets = [...ex.sets_data]
                newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed }
                updatedEx = { ...ex, sets_data: newSets }
                return updatedEx
            }
            return ex
        }))

        if (updatedEx) {
            setSyncing(prev => [...prev, exerciseId])
            try {
                await updateWorkoutExercise(exerciseId, updatedEx.sets_data)
            } catch (error) {
                console.error('Failed to sync set:', error)
            } finally {
                setSyncing(prev => prev.filter(id => id !== exerciseId))
            }
        }
    }

    const handleFinish = async () => {
        setIsFinishing(true)
        try {
            await completeWorkout(workout.id, notes)
        } catch (error) {
            console.error(error)
            alert('Error al finalizar el entrenamiento')
            setIsFinishing(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-32">
            {/* Session Header */}
            <div className="sticky top-0 z-30 -mx-4 px-4 py-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <X className="h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sesión Activa</span>
                    <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${isActive ? 'text-green-500 animate-pulse' : 'text-neutral-400'}`} />
                        <span className="text-xl font-mono font-bold tracking-tight">
                            {formatTime(seconds)}
                        </span>
                    </div>
                </div>
                <Button
                    onClick={() => setIsFinishing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-500 rounded-full font-bold px-6 border-none shadow-lg shadow-green-200 dark:shadow-none"
                >
                    Finalizar
                </Button>
            </div>

            {/* Workout Info */}
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight">{workout.name}</h1>
                <p className="text-neutral-500 font-medium">Mantén el ritmo, cada repetición cuenta.</p>
            </div>

            {/* Exercises List */}
            <div className="space-y-8 mt-8">
                {exercises.map((exercise, exIdx) => (
                    <div key={exercise.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="h-8 w-8 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 flex items-center justify-center text-sm font-bold">
                                    {exIdx + 1}
                                </span>
                                {exercise.exercises.name}
                                {syncing.includes(exercise.id) && (
                                    <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
                                )}
                            </h2>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            {/* Header for sets */}
                            <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                <div className="col-span-2 text-center">Set</div>
                                <div className="col-span-4 text-center">Peso (kg)</div>
                                <div className="col-span-4 text-center">Reps</div>
                                <div className="col-span-2 text-center">Listo</div>
                            </div>

                            {exercise.sets_data.map((set: any, sIdx: number) => (
                                <div
                                    key={sIdx}
                                    className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl transition-all ${set.completed
                                            ? 'bg-green-50 dark:bg-green-950/20'
                                            : 'bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800'
                                        }`}
                                >
                                    <div className="col-span-2 text-center font-bold text-sm text-neutral-400">
                                        {sIdx + 1}
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            type="number"
                                            value={set.weight || ''}
                                            onChange={(e) => handleSetUpdate(exercise.id, sIdx, 'weight', e.target.value)}
                                            placeholder="--"
                                            className={`h-10 text-center font-bold text-lg border-none bg-white dark:bg-neutral-800 rounded-lg shadow-sm ${set.completed ? 'opacity-50' : ''
                                                }`}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            type="number"
                                            value={set.reps || ''}
                                            onChange={(e) => handleSetUpdate(exercise.id, sIdx, 'reps', e.target.value)}
                                            placeholder="--"
                                            className={`h-10 text-center font-bold text-lg border-none bg-white dark:bg-neutral-800 rounded-lg shadow-sm ${set.completed ? 'opacity-50' : ''
                                                }`}
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <Button
                                            size="icon"
                                            variant={set.completed ? 'default' : 'ghost'}
                                            onClick={() => toggleSetComplete(exercise.id, sIdx)}
                                            className={`h-10 w-10 rounded-lg transition-all ${set.completed
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                }`}
                                        >
                                            <Check className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="ghost"
                                className="mt-2 h-10 border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl font-bold gap-2"
                                onClick={() => {
                                    setExercises(prev => prev.map(ex => {
                                        if (ex.id === exercise.id) {
                                            return { ...ex, sets_data: [...ex.sets_data, { weight: '', reps: '', completed: false }] }
                                        }
                                        return ex
                                    }))
                                }}
                            >
                                <Plus className="h-4 w-4" /> Agregar Serie
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Finish Modal/Overlay */}
            {isFinishing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md" onClick={() => setIsFinishing(false)} />
                    <Card className="relative w-full max-w-md bg-white dark:bg-neutral-900 border-none shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <CardHeader className="text-center pb-2">
                            <div className="h-16 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-500">
                                <Trophy className="h-8 w-8 animate-bounce" />
                            </div>
                            <CardTitle className="text-2xl font-extrabold">¡Buen trabajo!</CardTitle>
                            <p className="text-neutral-500 text-sm mt-1">¿Cómo te sentiste hoy?</p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="space-y-3">
                                <textarea
                                    className="w-full min-h-[100px] bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 text-sm border-none focus:ring-2 ring-neutral-200 dark:ring-neutral-700 transition-all outline-none"
                                    placeholder="Notas sobre el entrenamiento (opcional)..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    className="flex-1 rounded-2xl font-bold py-6"
                                    onClick={() => setIsFinishing(false)}
                                >
                                    Continuar
                                </Button>
                                <Button
                                    className="flex-1 rounded-2xl font-bold py-6 bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900"
                                    onClick={handleFinish}
                                >
                                    Finalizar Sesión
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

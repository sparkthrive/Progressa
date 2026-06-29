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
    Loader2,
    Timer,
    AlertTriangle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { completeWorkout, updateWorkoutExercise, deleteWorkout } from '@/app/dashboard/workouts/actions'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/store/useWorkoutStore'
import { TimerDisplay } from '@/components/workouts/TimerDisplay'
import { toast } from 'sonner'

interface ActiveWorkoutSessionProps {
    workout: any
    exercises: any[]
}

export function ActiveWorkoutSession({ workout, exercises: initialExercises }: ActiveWorkoutSessionProps) {
    const router = useRouter()
    const { finishWorkout } = useWorkoutStore()
    const [seconds, setSeconds] = useState(0)
    const [isActive, setIsActive] = useState(true)
    const [exercises, setExercises] = useState(initialExercises)
    const [isFinishing, setIsFinishing] = useState(false)
    const [notes, setNotes] = useState('')
    const [syncing, setSyncing] = useState<string[]>([])
    const [holdProgress, setHoldProgress] = useState(0)
    const [isHolding, setIsHolding] = useState(false)
    const [activeTimer, setActiveTimer] = useState<{
        type: 'rest' | 'exercise',
        duration: number,
        label: string
    } | null>(null)
    const holdIntervalRef = useState<any>(null) // We can use state or ref. Let's use a standard ref logic.

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

    // Hold to cancel logic
    useEffect(() => {
        let holdTimer: any = null
        if (isHolding) {
            const startTime = Date.now()
            holdTimer = setInterval(() => {
                const elapsed = Date.now() - startTime
                const progress = Math.min((elapsed / 3000) * 100, 100)
                setHoldProgress(progress)

                if (progress >= 100) {
                    clearInterval(holdTimer)
                    // Actual abandonment logic
                    const cancelSession = async () => {
                        try {
                            await deleteWorkout(workout.id)
                            finishWorkout() // Clear local Zustand store
                            router.push('/dashboard')
                        } catch (err) {
                            console.error('Failed to cancel workout:', err)
                            alert('No se pudo cancelar el entrenamiento correctamente.')
                        }
                    }
                    cancelSession()
                }
            }, 50)
        } else {
            setHoldProgress(0)
            if (holdTimer) clearInterval(holdTimer)
        }
        return () => {
            if (holdTimer) clearInterval(holdTimer)
        }
    }, [isHolding, router])

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

    const handleRemoveSet = async (exerciseId: string, setIndex: number) => {
        let updatedEx: any = null

        setExercises(prev => prev.map(ex => {
            if (ex.id === exerciseId) {
                const newSets = ex.sets_data.filter((_: any, i: number) => i !== setIndex)
                updatedEx = { ...ex, sets_data: newSets }
                return updatedEx
            }
            return ex
        }))

        if (updatedEx) {
            setSyncing(prev => [...prev, exerciseId])
            try {
                await updateWorkoutExercise(updatedEx.id, updatedEx.sets_data)
            } catch (error) {
                console.error('Failed to sync set removal:', error)
            } finally {
                setSyncing(prev => prev.filter(id => id !== exerciseId))
            }
        }
    }

    const startRestTimer = (seconds: number = 60) => {
        setActiveTimer({
            type: 'rest',
            duration: seconds,
            label: 'Descanso'
        })
    }

    const startExerciseTimer = (seconds: number, name: string) => {
        setActiveTimer({
            type: 'exercise',
            duration: seconds,
            label: name
        })
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
            const isNowCompleted = updatedEx.sets_data[setIndex].completed

            setSyncing(prev => [...prev, exerciseId])
            try {
                await updateWorkoutExercise(exerciseId, updatedEx.sets_data)

                if (isNowCompleted) {
                    // Trigger rest timer - check set first, then exercise, then default
                    const restTime = updatedEx.sets_data[setIndex].rest_seconds || updatedEx.rest_seconds || 60
                    startRestTimer(restTime)
                }
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
            finishWorkout() // Clear local Zustand store
        } catch (error: any) {
            // Handle Next.js redirect "error"
            if (error.digest?.startsWith('NEXT_REDIRECT')) {
                finishWorkout()
                return
            }
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
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${isActive ? 'text-green-500 animate-pulse' : 'text-neutral-400'}`} />
                            <span className="text-xl font-mono font-bold tracking-tight">
                                {formatTime(seconds)}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startRestTimer(60)}
                            className="h-8 rounded-xl border-dashed gap-1.5 px-3 text-xs font-bold"
                        >
                            <Timer className="h-3 w-3 text-blue-500" /> Descanso
                        </Button>
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

            {/* Global Timer Overlay */}
            {activeTimer && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-xs relative">
                        <TimerDisplay
                            duration={activeTimer.duration}
                            label={activeTimer.label}
                            autoStart={false}
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
                                <div className="col-span-4 text-center flex items-center justify-center gap-1">
                                    {exercise.exercises.measurement_type === 'time' ? (
                                        <><Timer className="h-3 w-3" /> Tiempo (s)</>
                                    ) : (
                                        'Reps'
                                    )}
                                </div>
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
                                    <div className="col-span-4 flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={set.reps || ''}
                                            onChange={(e) => handleSetUpdate(exercise.id, sIdx, 'reps', e.target.value)}
                                            placeholder={exercise.exercises.measurement_type === 'time' ? "30" : "10"}
                                            className={`h-10 text-center font-bold text-lg border-none bg-white dark:bg-neutral-800 rounded-lg shadow-sm ${set.completed ? 'opacity-50' : ''
                                                }`}
                                        />
                                        {exercise.exercises.measurement_type === 'time' && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 shrink-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => startExerciseTimer(parseInt(set.reps) || 30, exercise.exercises.name)}
                                            >
                                                <Play className="h-3 w-3 fill-current" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex justify-center gap-1">
                                        <Button
                                            size="icon"
                                            variant={set.completed ? 'default' : 'ghost'}
                                            onClick={() => toggleSetComplete(exercise.id, sIdx)}
                                            className={`h-10 w-10 rounded-lg transition-all ${set.completed
                                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none'
                                                : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                }`}
                                        >
                                            <Check className="h-5 w-5" />
                                        </Button>
                                        {!set.completed && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 text-neutral-300 hover:text-red-500"
                                                onClick={() => handleRemoveSet(exercise.id, sIdx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
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

            {/* Hold to Cancel Button */}
            <div className="pt-12 flex flex-col items-center gap-4">
                <button
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className="group relative h-20 w-20 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 transition-transform active:scale-95 overflow-hidden"
                >
                    {/* Background Progress Fill */}
                    <div
                        className="absolute bottom-0 left-0 w-full bg-red-500/10 transition-all duration-75 ease-linear"
                        style={{ height: `${holdProgress}%` }}
                    />

                    {/* SVG Progress Ring */}
                    <svg className="absolute inset-0 h-full w-full -rotate-90">
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-red-500 transition-all duration-75 ease-linear"
                            style={{
                                strokeDasharray: 226,
                                strokeDashoffset: 226 - (226 * holdProgress) / 100,
                                opacity: isHolding ? 1 : 0
                            }}
                        />
                    </svg>

                    <div className={`relative z-10 transition-colors ${isHolding ? 'text-red-500' : 'text-neutral-400 group-hover:text-red-500'}`}>
                        <X className="h-8 w-8" />
                    </div>
                </button>
                <div className="text-center space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        {isHolding ? 'Mantén presionado...' : 'Mantén para cancelar'}
                    </p>
                    <p className="text-[10px] text-neutral-500 max-w-[200px]">
                        Tu progreso actual no se guardará si cancelas la sesión.
                    </p>
                </div>
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

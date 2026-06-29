'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dumbbell,
    Heart,
    Bike,
    Wind,
    Trophy,
    MoreHorizontal,
    Check,
    Loader2,
    Star,
    Clock,
    AlignLeft
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertWorkoutLog } from '@/app/dashboard/journal/actions'

interface WorkoutLogFormProps {
    date: string
    initialData?: {
        id?: string
        workout_type?: string
        duration_minutes?: number
        intensity?: number
        notes?: string
    }
}

const WORKOUT_TYPES = [
    { value: 'strength', icon: Dumbbell, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', label: 'Fuerza' },
    { value: 'cardio', icon: Heart, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', label: 'Cardio' },
    { value: 'flexibility', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'Flexibilidad' },
    { value: 'sports', icon: Trophy, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', label: 'Deportes' },
    { value: 'other', icon: MoreHorizontal, color: 'text-neutral-500', bg: 'bg-neutral-50 dark:bg-neutral-800', label: 'Otro' },
]

export function WorkoutLogForm({ date, initialData }: WorkoutLogFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [workoutType, setWorkoutType] = useState(initialData?.workout_type || '')
    const [duration, setDuration] = useState(initialData?.duration_minutes || 30)
    const [intensity, setIntensity] = useState(initialData?.intensity || 3)
    const [notes, setNotes] = useState(initialData?.notes || '')

    const handleSave = async () => {
        if (!workoutType) {
            alert('Por favor selecciona un tipo de entrenamiento')
            return
        }

        setIsPending(true)
        try {
            await upsertWorkoutLog({
                id: initialData?.id,
                recorded_at: date,
                workout_type: workoutType,
                duration_minutes: duration,
                intensity,
                notes
            })
            // Redirect happens in server action
        } catch (error) {
            console.error(error)
            alert('Error al guardar el registro de entrenamiento')
            setIsPending(false)
        }
    }

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-neutral-400" /> Registro de Entrenamiento
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Workout Type Selection */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tipo de Entrenamiento</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {WORKOUT_TYPES.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setWorkoutType(type.value)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${workoutType === type.value
                                        ? `${type.bg} ${type.color} ring-2 ring-current ring-offset-2 dark:ring-offset-neutral-900`
                                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-500'
                                    }`}
                            >
                                <type.icon className="h-6 w-6" />
                                <span className="text-[10px] font-bold">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Duración (minutos)
                    </Label>
                    <div className="flex items-center gap-4">
                        <Input
                            type="number"
                            step="5"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="h-12 text-center text-lg font-bold w-32 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none"
                        />
                        <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                                style={{ width: `${Math.min((duration / 120) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Intensity Rating */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Star className="h-4 w-4" /> Intensidad
                    </Label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                onClick={() => setIntensity(level)}
                                className={`h-12 flex-1 rounded-xl flex items-center justify-center transition-all ${intensity >= level
                                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'
                                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-300'
                                    }`}
                            >
                                <Star className={`h-6 w-6 ${intensity >= level ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                        <span>Ligero</span>
                        <span>Moderado</span>
                        <span>Intenso</span>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <AlignLeft className="h-4 w-4" /> Notas del Entrenamiento
                    </Label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ejercicios realizados, sensaciones, logros..."
                        className="w-full min-h-[120px] p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border-none focus:ring-2 ring-neutral-100 dark:ring-neutral-700 transition-all outline-none text-sm"
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isPending || !workoutType}
                    className="w-full h-14 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold text-lg gap-2 shadow-xl shadow-neutral-200 dark:shadow-none disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Check className="h-5 w-5" /> Guardar Registro
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

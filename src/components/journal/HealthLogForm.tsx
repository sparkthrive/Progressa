'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Smile,
    Meh,
    Frown,
    Zap,
    Moon,
    AlignLeft,
    Check,
    Loader2,
    Star,
    Activity
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertDailyLog } from '@/app/dashboard/journal/actions'
import { useRouter } from 'next/navigation'

interface HealthLogFormProps {
    date: string
    initialData?: {
        mood?: string
        energy_level?: number
        sleep_hours?: number
        notes?: string
    }
}

const MOODS = [
    { value: 'awful', icon: Frown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', label: 'Fatal' },
    { value: 'bad', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', label: 'Mal' },
    { value: 'neutral', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', label: 'Regular' },
    { value: 'good', icon: Smile, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'Bien' },
    { value: 'great', icon: Smile, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', label: 'Excelente' },
]

export function HealthLogForm({ date, initialData }: HealthLogFormProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [mood, setMood] = useState(initialData?.mood || '')
    const [energy, setEnergy] = useState(initialData?.energy_level || 3)
    const [sleep, setSleep] = useState(initialData?.sleep_hours || 7)
    const [notes, setNotes] = useState(initialData?.notes || '')

    const handleSave = async () => {
        setIsPending(true)
        try {
            await upsertDailyLog({
                recorded_at: date,
                mood,
                energy_level: energy,
                sleep_hours: Number(sleep),
                notes
            })
            router.refresh()
            // Optional: toast success
        } catch (error) {
            console.error(error)
            alert('Error al guardar el registro')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-neutral-400" /> Marcadores de Hoy
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Mood Selection */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400">¿Cómo te sientes?</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {MOODS.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setMood(m.value)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === m.value
                                    ? `${m.bg} ${m.color} ring-2 ring-current ring-offset-2 dark:ring-offset-neutral-900`
                                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-500'
                                    }`}
                            >
                                <m.icon className="h-6 w-6" />
                                <span className="text-[10px] font-bold">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Energy Rating */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Nivel de Energía
                    </Label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                onClick={() => setEnergy(level)}
                                className={`h-12 flex-1 rounded-xl flex items-center justify-center transition-all ${energy >= level
                                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400'
                                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-300'
                                    }`}
                            >
                                <Star className={`h-6 w-6 ${energy >= level ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sleep Hours */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Moon className="h-4 w-4" /> Horas de Sueño
                    </Label>
                    <div className="flex items-center gap-4">
                        <Input
                            type="number"
                            step="0.5"
                            value={sleep}
                            onChange={(e) => setSleep(Number(e.target.value))}
                            className="h-12 text-center text-lg font-bold w-32 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-none"
                        />
                        <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${(sleep / 12) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <AlignLeft className="h-4 w-4" /> Notas del Día
                    </Label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Escribe algo sobre tu día..."
                        className="w-full min-h-[120px] p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border-none focus:ring-2 ring-neutral-100 dark:ring-neutral-700 transition-all outline-none text-sm"
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full h-14 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold text-lg gap-2 shadow-xl shadow-neutral-200 dark:shadow-none"
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

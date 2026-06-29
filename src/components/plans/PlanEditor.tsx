'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTrainingPlan } from '@/app/dashboard/plans/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Routine {
    id: string
    name: string
}

interface PlanEditorProps {
    routines: Routine[]
}

const DAYS_OF_WEEK = [
    { id: 1, name: 'Día 1' },
    { id: 2, name: 'Día 2' },
    { id: 3, name: 'Día 3' },
    { id: 4, name: 'Día 4' },
    { id: 5, name: 'Día 5' },
    { id: 6, name: 'Día 6' },
    { id: 7, name: 'Día 7' },
]

export function PlanEditor({ routines }: PlanEditorProps) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [duration, setDuration] = useState(4)
    const [schedule, setSchedule] = useState<Record<string, string>>({}) // "week-day": routineId
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeWeek, setActiveWeek] = useState('1')

    const cleanScheduleForDuration = (newDuration: number) => {
        // Optional: remove entries for weeks > newDuration
        // For now, we just keep them but they won't be saved if we adhere to duration in logic
    }

    const handleDurationChange = (val: string) => {
        const d = parseInt(val)
        setDuration(d)
        cleanScheduleForDuration(d)
    }

    const setRoutineForSlot = (week: number, day: number, routineId: string) => {
        setSchedule(prev => ({
            ...prev,
            [`${week}-${day}`]: routineId
        }))
    }

    const clearSlot = (week: number, day: number) => {
        setSchedule(prev => {
            const next = { ...prev }
            delete next[`${week}-${day}`]
            return next
        })
    }

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Por favor ingresa un nombre para el plan")
            return
        }

        setIsSubmitting(true)
        try {
            await createTrainingPlan({
                name,
                description,
                duration_weeks: duration,
                is_public: false,
                schedule
            })
            toast.success("Plan creado exitosamente")
            // Redirect handled in action
        } catch (error) {
            toast.error("Error al crear el plan")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Plan</Label>
                            <Input
                                id="name"
                                placeholder="Ej. Hipertrofia 4 Semanas"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                placeholder="Objetivos y detalles..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duración</Label>
                            <Select value={duration.toString()} onValueChange={handleDurationChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona duración" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Semana</SelectItem>
                                    <SelectItem value="2">2 Semanas</SelectItem>
                                    <SelectItem value="4">4 Semanas</SelectItem>
                                    <SelectItem value="8">8 Semanas</SelectItem>
                                    <SelectItem value="12">12 Semanas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Plan
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Tabs value={activeWeek} onValueChange={setActiveWeek} className="w-full">
                    <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
                        <TabsList className="h-auto p-1 bg-transparent gap-2">
                            {Array.from({ length: duration }).map((_, i) => (
                                <TabsTrigger
                                    key={i + 1}
                                    value={(i + 1).toString()}
                                    className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white border px-4 py-2 rounded-full"
                                >
                                    Semana {i + 1}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {Array.from({ length: duration }).map((_, i) => {
                        const weekNum = i + 1
                        return (
                            <TabsContent key={weekNum} value={weekNum.toString()} className="mt-0">
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const key = `${weekNum}-${day.id}`
                                        const routineId = schedule[key]
                                        const routine = routines.find(r => r.id === routineId)

                                        return (
                                            <Card key={day.id} className={cn("overflow-hidden border-2", routineId ? "border-neutral-900 dark:border-neutral-100" : "border-transparent")}>
                                                <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 font-semibold text-sm flex justify-between items-center">
                                                    <span>{day.name}</span>
                                                    {routineId && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 hover:bg-red-100 hover:text-red-600 ml-2"
                                                            onClick={() => clearSlot(weekNum, day.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="p-4 min-h-[100px] flex flex-col justify-center">
                                                    {routineId ? (
                                                        <div className="text-center">
                                                            <div className="font-bold text-lg mb-1">{routine?.name}</div>
                                                            <div className="text-xs text-neutral-500">Programado</div>
                                                        </div>
                                                    ) : (
                                                        <Select onValueChange={(val) => setRoutineForSlot(weekNum, day.id, val)}>
                                                            <SelectTrigger className="w-full border-dashed">
                                                                <div className="flex items-center text-neutral-400 gap-2">
                                                                    <Plus className="h-4 w-4" />
                                                                    <span>Asignar Rutina</span>
                                                                </div>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {routines.map((r) => (
                                                                    <SelectItem key={r.id} value={r.id}>
                                                                        {r.name}
                                                                    </SelectItem>
                                                                ))}
                                                                <SelectItem value="rest" disabled>
                                                                    Descanso (Próximamente)
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </div>
        </div>
    )
}

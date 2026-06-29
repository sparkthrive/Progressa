"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Plus,
    Trash2,
    Calendar,
    Clock,
    ChevronLeft,
    Save,
    Search,
    UtensilsCrossed
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createMealPlan } from '@/app/dashboard/nutrition/actions'
import { toast } from 'sonner'

export function MealPlanBuilder() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration_days: 7,
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        try {
            const plan = await createMealPlan(formData)
            toast.success('¡Plan creado! Ahora añade las comidas.')
            router.push(`/dashboard/nutrition/plans/${plan.id}`)
        } catch (error) {
            toast.error('Error al crear el plan')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4">
                <h2 className="text-3xl font-black">Nuevo Plan de Alimentación</h2>
                <p className="text-neutral-500 font-medium">Define el nombre y la duración de tu nuevo plan maestro.</p>
            </div>

            <Card className="border-none bg-white dark:bg-neutral-900 rounded-[3rem] p-10 shadow-sm space-y-8">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Nombre del Plan</Label>
                        <Input
                            placeholder="Ej. Volumen Limpio 2024"
                            value={formData.name}
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                            className="h-14 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 focus:ring-2 ring-primary/20 font-bold text-lg px-6"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Descripción (Opcional)</Label>
                        <textarea
                            placeholder="Notas sobre el objetivo del plan..."
                            value={formData.description}
                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                            className="w-full min-h-[120px] p-6 rounded-3xl border-none bg-neutral-100 dark:bg-neutral-800 focus:ring-2 ring-primary/20 font-medium text-sm outline-none"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Duración (Días)</Label>
                        <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <Input
                                type="number"
                                min="1"
                                max="31"
                                value={formData.duration_days}
                                onChange={e => setFormData(p => ({ ...p, duration_days: Number(e.target.value) }))}
                                className="h-14 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 focus:ring-2 ring-primary/20 font-bold pl-16 text-lg"
                            />
                        </div>
                        <p className="text-[10px] text-neutral-400 font-medium px-1">Recomendamos planes de 7 días que puedes repetir cíclicamente.</p>
                    </div>
                </div>

                <div className="pt-6 flex gap-4">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 h-14 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold text-lg gap-2 shadow-xl shadow-neutral-200 dark:shadow-none"
                    >
                        <Save className="h-5 w-5" />
                        {isPending ? 'Creando...' : 'Crear Plan y Continuar'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="h-14 px-8 rounded-2xl font-bold border-2"
                    >
                        Cancelar
                    </Button>
                </div>
            </Card>
        </form>
    )
}

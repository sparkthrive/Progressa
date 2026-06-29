'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ChevronLeft,
    Check,
    Loader2,
    Flame,
    Fish,
    Wheat,
    Droplets
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertNutritionLog } from '../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddNutritionPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)

    const [protein, setProtein] = useState(0)
    const [carbs, setCarbs] = useState(0)
    const [fats, setFats] = useState(0)

    // Automatically calculate calories: P=4, C=4, F=9
    const calculatedCalories = (protein * 4) + (carbs * 4) + (fats * 9)

    const handleSave = async () => {
        setIsPending(true)
        try {
            await upsertNutritionLog({
                recorded_at: new Date().toISOString().split('T')[0],
                calories: calculatedCalories,
                protein,
                carbs,
                fats
            })
            // Redirect happens in the action
        } catch (error) {
            console.error(error)
            alert('Error al guardar el registro')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard/nutrition">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight">Registrar Comida</h1>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Macro-Nutrientes de hoy</p>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-neutral-900 overflow-hidden">
                <CardHeader className="bg-neutral-900 dark:bg-black text-white p-8">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Estimado Total</p>
                        <h2 className="text-5xl font-black tracking-tighter">
                            {calculatedCalories} <span className="text-xl font-bold text-neutral-500">KCAL</span>
                        </h2>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {/* Protein */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                <Fish className="h-4 w-4" /> Proteína
                            </Label>
                            <span className="text-xs font-bold text-neutral-400">{protein}g</span>
                        </div>
                        <Input
                            type="number"
                            value={protein}
                            onChange={(e) => setProtein(Number(e.target.value))}
                            className="h-14 text-lg font-bold bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl"
                            placeholder="Gramos de proteína"
                        />
                    </div>

                    {/* Carbs */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2">
                                <Wheat className="h-4 w-4" /> Carbohidratos
                            </Label>
                            <span className="text-xs font-bold text-neutral-400">{carbs}g</span>
                        </div>
                        <Input
                            type="number"
                            value={carbs}
                            onChange={(e) => setCarbs(Number(e.target.value))}
                            className="h-14 text-lg font-bold bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl"
                            placeholder="Gramos de carbohidratos"
                        />
                    </div>

                    {/* Fats */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                <Droplets className="h-4 w-4" /> Grasas
                            </Label>
                            <span className="text-xs font-bold text-neutral-400">{fats}g</span>
                        </div>
                        <Input
                            type="number"
                            value={fats}
                            onChange={(e) => setFats(Number(e.target.value))}
                            className="h-14 text-lg font-bold bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl"
                            placeholder="Gramos de grasa"
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="w-full h-16 rounded-[2rem] bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-black text-xl gap-3 shadow-2xl shadow-neutral-200 dark:shadow-none transition-all active:scale-95"
                        >
                            {isPending ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <Check className="h-6 w-6" /> Guardar Nutrición
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

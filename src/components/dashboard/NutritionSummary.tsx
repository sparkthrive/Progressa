'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Plus,
    Flame,
    Fish,
    Wheat,
    Droplets,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Target,
    UtensilsCrossed,
    TrendingUp
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface NutritionSummaryProps {
    log: any
    goals: {
        calories: number
        protein: number
        carbs: number
        fats: number
    }
}

export function NutritionSummary({ log, goals }: NutritionSummaryProps) {
    const calories = log?.calories || 0
    const protein = log?.protein || 0
    const carbs = log?.carbs || 0
    const fats = log?.fats || 0

    const caloriePercentage = Math.min((calories / goals.calories) * 100, 100)
    const proteinPercentage = Math.min((protein / goals.protein) * 100, 100)
    const carbsPercentage = Math.min((carbs / goals.carbs) * 100, 100)
    const fatsPercentage = Math.min((fats / goals.fats) * 100, 100)

    const remainingCalories = goals.calories - calories

    return (
        <div className="space-y-8">
            {/* Main Progress Card */}
            <Card className="border-none bg-neutral-900 text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <UtensilsCrossed size={160} strokeWidth={1} />
                </div>
                <CardContent className="p-8 sm:p-12 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="space-y-6 text-center md:text-left">
                            <div className="space-y-1">
                                <Badge className="bg-white/10 text-white border-white/20 px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
                                    Resumen Diario
                                </Badge>
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Tu Nutrición</h1>
                            </div>

                            <div className="flex flex-col gap-1">
                                <p className="text-5xl sm:text-6xl font-black tracking-tighter text-blue-400">
                                    {calories} <span className="text-xl font-bold text-neutral-500 uppercase">kcal</span>
                                </p>
                                <p className="text-sm font-medium text-neutral-400">
                                    Consumidas de un objetivo de {goals.calories} kcal
                                </p>
                            </div>

                            <Button asChild className="rounded-full bg-white text-neutral-900 hover:bg-neutral-200 font-bold px-8 py-6 shadow-xl shadow-blue-500/10">
                                <Link href="/dashboard/nutrition/add" className="gap-2">
                                    <Plus className="h-5 w-5" /> Registrar Comida
                                </Link>
                            </Button>
                        </div>

                        {/* Radial Progress Visual (Simplified for MVP with high-impact CSS) */}
                        <div className="relative h-48 w-48 sm:h-64 sm:w-64 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    className="stroke-white/5 fill-none"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    className="stroke-blue-500 fill-none transition-all duration-1000 ease-out"
                                    strokeWidth="12"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * caloriePercentage) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Restantes</p>
                                <p className="text-3xl sm:text-4xl font-black tracking-tight">{Math.max(0, remainingCalories)}</p>
                                <p className="text-[10px] font-bold text-neutral-500">KCAL</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Macros Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MacroCard
                    label="Proteína"
                    current={protein}
                    goal={goals.protein}
                    percentage={proteinPercentage}
                    icon={Fish}
                    color="text-red-500"
                    barColor="bg-red-500"
                    unit="g"
                />
                <MacroCard
                    label="Carbohidratos"
                    current={carbs}
                    goal={goals.carbs}
                    percentage={carbsPercentage}
                    icon={Wheat}
                    color="text-yellow-500"
                    barColor="bg-yellow-500"
                    unit="g"
                />
                <MacroCard
                    label="Grasas"
                    current={fats}
                    goal={goals.fats}
                    percentage={fatsPercentage}
                    icon={Droplets}
                    color="text-blue-500"
                    barColor="bg-blue-500"
                    unit="g"
                />
            </div>

            {/* Insights Placeholder */}
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 p-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                        <Target className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Estado del Objetivo</h3>
                        <p className="text-sm text-neutral-500">
                            {caloriePercentage > 100
                                ? "Has excedido tu objetivo calórico. ¡Mañana es un nuevo día!"
                                : caloriePercentage > 85
                                    ? "Estás muy cerca de completar tu objetivo diario. ¡Buen ritmo!"
                                    : "Sigue registrando tus comidas para ver tu progreso."}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

function MacroCard({ label, current, goal, percentage, icon: Icon, color, barColor, unit }: any) {
    return (
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden group">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className={`h-10 w-10 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Meta: {goal}{unit}</p>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-50">{label}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tabular-nums">{current}</span>
                        <span className="text-xs font-bold text-neutral-400 uppercase">{unit}</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-neutral-400">{Math.round(percentage)}%</span>
                        <span className="text-neutral-400">{Math.max(0, goal - current)}{unit} rest.</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${barColor} transition-all duration-700`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

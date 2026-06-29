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
    TrendingUp,
    Beef
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { logPlannedMeal } from '@/app/dashboard/nutrition/actions'
import { useRouter } from 'next/navigation'
import { ChefHat, ClipboardList, BookOpen, Clock, Info, ShoppingBasket } from 'lucide-react'

interface NutritionSummaryProps {
    log: any
    goals: {
        calories: number
        protein: number
        carbs: number
        fats: number
    }
    activePlan?: any
    startDate?: string | null
}

export function NutritionSummary({ log, goals, activePlan, startDate }: NutritionSummaryProps) {
    const router = useRouter()
    const [isLogging, setIsLogging] = useState<string | null>(null)
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

    const calories = log?.calories || 0
    const protein = log?.protein || 0
    const carbs = log?.carbs || 0
    const fats = log?.fats || 0

    const caloriePercentage = Math.min((calories / goals.calories) * 100, 100)
    const proteinPercentage = Math.min((protein / goals.protein) * 100, 100)
    const carbsPercentage = Math.min((carbs / goals.carbs) * 100, 100)
    const fatsPercentage = Math.min((fats / goals.fats) * 100, 100)

    const remainingCalories = goals.calories - calories

    // logic for active plan day
    let currentDayMeals: any[] = []
    let planDay = 1
    if (activePlan && startDate) {
        const start = new Date(startDate)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - start.getTime())
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        currentDayMeals = activePlan.meal_plan_items
            ?.filter((item: any) => item.day_number === planDay)
            .sort((a: any, b: any) => (a.meal_time || '').localeCompare(b.meal_time || '')) || []
    }

    const handleLogMeal = async (item: any) => {
        if (!item.recipe) return

        setIsLogging(item.id)
        try {
            await logPlannedMeal({
                calories: item.recipe.calories,
                protein: Number(item.recipe.protein),
                carbs: Number(item.recipe.carbs),
                fats: Number(item.recipe.fats),
                recorded_at: new Date().toISOString().split('T')[0]
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al registrar la comida')
        } finally {
            setIsLogging(null)
        }
    }

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

                            <div className="flex flex-wrap gap-3">
                                <Button asChild className="rounded-2xl bg-white text-neutral-900 hover:bg-neutral-200 font-bold px-6 py-6 shadow-xl shadow-blue-500/10 h-14">
                                    <Link href="/dashboard/nutrition/add" className="gap-2">
                                        <Plus className="h-5 w-5" /> Registrar Comida
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-6 h-14">
                                    <Link href="/dashboard/nutrition/recipes" className="gap-2">
                                        <ChefHat className="h-5 w-5" /> Mi Recetario
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-6 h-14">
                                    <Link href="/dashboard/nutrition/plans" className="gap-2">
                                        <ClipboardList className="h-5 w-5" /> Mis Planes
                                    </Link>
                                </Button>
                                {activePlan && (
                                    <Button asChild variant="outline" className="rounded-2xl border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold px-6 py-6 h-14">
                                        <Link href="/dashboard/nutrition/shopping-list" className="gap-2">
                                            <ShoppingBasket className="h-5 w-5" /> Lista de Compras
                                        </Link>
                                    </Button>
                                )}
                            </div>
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

            {/* Active Plan Section */}
            {activePlan && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">Plan Activo: {activePlan.name}</h2>
                                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Día {planDay} de la Programación</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-blue-500 font-bold">
                            <Link href={`/dashboard/nutrition/plans/${activePlan.id}`}>Ver completo</Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentDayMeals.length > 0 ? (
                            currentDayMeals.map((item: any) => (
                                <Card key={item.id} className="border-none bg-white dark:bg-neutral-900 rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <Badge className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-none font-bold text-[9px] h-4">
                                                    {item.meal_time?.slice(0, 5) || 'Sin hora'}
                                                </Badge>
                                                <h4 className="font-black text-lg leading-tight">{item.meal_category}</h4>
                                            </div>
                                            <div className="h-10 w-10 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-300">
                                                <UtensilsCrossed className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-sm font-bold text-neutral-400 line-clamp-1">
                                                {item.recipe?.name || 'Comida personalizada'}
                                            </p>

                                            {item.recipe && (
                                                <div className="flex gap-4 pt-2 border-t border-neutral-50 dark:border-neutral-800/50">
                                                    <div className="flex items-center gap-1">
                                                        <Flame className="h-3 w-3 text-orange-500" />
                                                        <span className="text-[10px] font-black">{item.recipe.calories}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Beef className="h-3 w-3 text-red-500" />
                                                        <span className="text-[10px] font-black">{Math.round(item.recipe.protein)}g</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={!item.recipe}
                                                        className="flex-1 rounded-xl h-9 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700 font-bold text-[10px] uppercase"
                                                    >
                                                        Ver Detalles
                                                    </Button>
                                                </DialogTrigger>
                                                {item.recipe && (
                                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8">
                                                        <DialogHeader>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Badge className="bg-blue-500 text-white border-none font-bold">Receta</Badge>
                                                                <div className="flex items-center gap-1 text-neutral-400 text-xs">
                                                                    <Clock className="h-3 w-3" /> {item.recipe.prep_time_minutes || 0} min
                                                                </div>
                                                            </div>
                                                            <DialogTitle className="text-3xl font-black">{item.recipe.name}</DialogTitle>
                                                        </DialogHeader>

                                                        <div className="mt-6 space-y-8 text-neutral-600 dark:text-neutral-400">
                                                            {/* Macros Row */}
                                                            <div className="grid grid-cols-4 gap-4">
                                                                <div className="text-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Kcal</p>
                                                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{item.recipe.calories}</p>
                                                                </div>
                                                                <div className="text-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Prot</p>
                                                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{item.recipe.protein}g</p>
                                                                </div>
                                                                <div className="text-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Carbs</p>
                                                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{item.recipe.carbs}g</p>
                                                                </div>
                                                                <div className="text-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl">
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Fat</p>
                                                                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{item.recipe.fats}g</p>
                                                                </div>
                                                            </div>

                                                            {/* Ingredients */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-100">Ingredientes</h4>
                                                                <ul className="grid gap-2">
                                                                    {item.recipe.ingredients?.map((ing: any, i: number) => (
                                                                        <li key={i} className="flex justify-between text-sm p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                                                                            <span className="font-bold">{ing.item}</span>
                                                                            <span className="text-neutral-400 font-medium">{ing.amount}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Instructions */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-100">Preparación</h4>
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap px-1">
                                                                    {item.recipe.instructions || 'No hay instrucciones detalladas.'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                )}
                                            </Dialog>

                                            <Button
                                                size="sm"
                                                onClick={() => handleLogMeal(item)}
                                                disabled={!item.recipe || isLogging === item.id}
                                                className="flex-1 rounded-xl h-9 bg-blue-500 text-white font-bold text-[10px] uppercase gap-1.5 shadow-lg shadow-blue-500/20"
                                            >
                                                {isLogging === item.id ? (
                                                    <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : <Plus className="h-3 w-3" />}
                                                {isLogging === item.id ? 'Log...' : 'Log Meal'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-neutral-50 dark:bg-neutral-900/50 rounded-[2.5rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                                <ChefHat className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                                <p className="text-sm text-neutral-500 font-medium">No hay comidas programadas para hoy en este plan.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

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

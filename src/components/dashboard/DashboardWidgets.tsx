'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dumbbell,
    Zap,
    Trophy,
    TrendingUp,
    Play,
    Clock,
    Target,
    Activity,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState } from 'react'
import { startWorkout } from '@/app/dashboard/workouts/actions'

export function DashboardStats({ stats }: { stats: any }) {
    const items = [
        { label: 'Entrenamientos', value: stats.workouts, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
        { label: 'Racha (Días)', value: stats.streak, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
        { label: 'Puntos XP', value: stats.points, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        { label: 'Volumen (kg)', value: stats.volume, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function TodayWorkout({ routine }: { routine: any }) {
    const [isStarting, setIsStarting] = useState(false)

    const handleStart = async () => {
        if (!routine?.id) return
        setIsStarting(true)
        try {
            await startWorkout(routine.id)
        } catch (error: any) {
            if (error.message === 'NEXT_REDIRECT') return
            console.error(error)
            alert('Error al iniciar el entrenamiento')
        } finally {
            setIsStarting(false)
        }
    }

    if (!routine) {
        return (
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                <CardContent className="p-10 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                        <Dumbbell className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold">No hay rutina para hoy</h3>
                        <p className="text-sm text-neutral-500">Crea una rutina para empezar a entrenar.</p>
                    </div>
                    <Button asChild className="mt-2 bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900">
                        <Link href="/dashboard/routines/new">Crear Rutina</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const exerciseCount = routine.routine_exercises?.length || 0
    const previewExercises = routine.routine_exercises?.slice(0, 3) || []

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden group relative">
            {isStarting && (
                <div className="absolute inset-0 z-20 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-900 dark:text-neutral-50" />
                </div>
            )}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 p-6 text-white flex justify-between items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            HOY
                        </Badge>
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Sugerido
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{routine.name}</h3>
                </div>
                <Button
                    onClick={handleStart}
                    disabled={isStarting}
                    className="rounded-full h-14 w-14 bg-white text-neutral-900 hover:bg-neutral-100 shadow-xl transition-transform group-hover:scale-105"
                >
                    <Play className="h-6 w-6 ml-1" />
                </Button>
            </div>
            <CardContent className="p-6">
                <div className="grid gap-6">
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-neutral-500">
                            <Dumbbell className="h-4 w-4" />
                            <span className="font-bold text-neutral-900 dark:text-neutral-50">{exerciseCount}</span> Ejercicios
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500">
                            <Target className="h-4 w-4" />
                            <span className="font-bold text-neutral-900 dark:text-neutral-50">Fuerza</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {previewExercises.map((re: any) => (
                            <div key={re.id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                                <span className="font-medium text-neutral-900 dark:text-neutral-50">{re.exercises.name}</span>
                                <span className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">
                                    Series sugeridas
                                </span>
                            </div>
                        ))}
                        {exerciseCount > 3 && (
                            <p className="text-xs text-center text-neutral-400 font-medium py-1">
                                + {exerciseCount - 3} ejercicios más
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

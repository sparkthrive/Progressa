import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ChevronLeft,
    Calendar,
    Clock,
    TrendingUp,
    Trophy,
    Dumbbell,
    CheckCircle2,
    Share2,
    Repeat,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface WorkoutDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch workout session with nested exercises
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select(`
            *,
            workout_exercises(
                id,
                sets_data,
                exercises(
                    name,
                    muscle_group
                )
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (workoutError || !workout) {
        notFound()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        return `${mins}m ${secs}s`
    }

    // Calculate total summary stats
    const totalExercises = workout.workout_exercises?.length || 0
    let totalSets = 0
    let totalVolume = 0

    workout.workout_exercises?.forEach((ex: any) => {
        ex.sets_data?.forEach((set: any) => {
            if (set.completed) {
                totalSets++
                totalVolume += (Number(set.weight) || 0) * (Number(set.reps) || 0)
            }
        })
    })

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent">
                    <Link href="/dashboard/workouts">
                        <ChevronLeft className="h-4 w-4" /> Volver al historial
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10 text-red-500 border-red-100 hover:bg-red-50 dark:border-red-900/30">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Victory Celebration */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-8 sm:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy size={140} strokeWidth={1} />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-bold uppercase tracking-widest text-[10px] mb-2">
                                SESIÓN COMPLETADA
                            </Badge>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-tight">
                                {workout.name}
                            </h1>
                            <div className="flex items-center gap-3 text-neutral-400 font-medium">
                                <Calendar className="h-4 w-4" />
                                <span className="capitalize">{formatDate(workout.ended_at)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <CheckCircle2 className="h-8 w-8 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-white/10">
                        <StatItem label="Duración" value={formatTime(workout.duration_seconds || 0)} icon={Clock} />
                        <StatItem label="Volumen Total" value={`${totalVolume} kg`} icon={TrendingUp} />
                        <StatItem label="Series" value={totalSets.toString()} icon={Repeat} />
                        <StatItem label="Ejercicios" value={totalExercises.toString()} icon={Dumbbell} />
                    </div>
                </div>
            </div>

            {/* Session Notes */}
            {workout.notes && (
                <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
                    <CardContent className="p-6 space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Reflexión de hoy</h3>
                        <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">"{workout.notes}"</p>
                    </CardContent>
                </Card>
            )}

            {/* Exercises Breakdown */}
            <div className="space-y-6">
                <h2 className="text-2xl font-extrabold tracking-tight">Desglose de Ejercicios</h2>

                <div className="grid gap-6">
                    {workout.workout_exercises?.map((we: any) => (
                        <Card key={we.id} className="overflow-hidden border-neutral-100 dark:border-neutral-800 shadow-sm transition-hover">
                            <CardHeader className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold">{we.exercises.name}</CardTitle>
                                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200/50 dark:bg-neutral-800">
                                            {we.exercises.muscle_group}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Sets</p>
                                        <p className="text-lg font-black">{we.sets_data?.filter((s: any) => s.completed).length}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50/50 dark:bg-neutral-900/30 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                        <tr>
                                            <th className="px-6 py-3">Serie</th>
                                            <th className="px-6 py-3 text-center">Peso</th>
                                            <th className="px-6 py-3 text-center">Reps</th>
                                            <th className="px-6 py-3 text-right">Volumen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                        {we.sets_data?.map((set: any, idx: number) => (
                                            <tr key={idx} className={set.completed ? 'opacity-100' : 'opacity-30'}>
                                                <td className="px-6 py-4 font-bold text-neutral-400">{idx + 1}</td>
                                                <td className="px-6 py-4 text-center font-bold">{set.weight || '--'} kg</td>
                                                <td className="px-6 py-4 text-center font-bold">{set.reps || '--'}</td>
                                                <td className="px-6 py-4 text-right font-medium text-neutral-500">
                                                    {(Number(set.weight) || 0) * (Number(set.reps) || 0)} kg
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-10 flex flex-col sm:flex-row gap-4">
                <Button className="flex-1 h-14 rounded-2xl bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 font-bold shadow-xl">
                    Repetir Entrenamiento
                </Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-neutral-200 dark:border-neutral-800">
                    Ver Progresión
                </Button>
            </div>
        </div>
    )
}

function StatItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
    return (
        <div className="space-y-1 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-neutral-400">
                <Icon className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xl font-black tracking-tight">{value}</p>
        </div>
    )
}

function Trash2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    )
}

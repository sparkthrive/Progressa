import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Activity,
    Calendar,
    Clock,
    ChevronRight,
    Dumbbell,
    Trash2,
    Trophy,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function WorkoutsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: workouts, error } = await supabase
        .from('workouts')
        .select(`
            *,
            workout_exercises(
                id,
                exercises(name)
            )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })

    if (error) {
        console.error(error)
    }

    const completedWorkouts = workouts?.filter(w => w.status === 'completed') || []
    const inProgressWorkouts = workouts?.filter(w => w.status === 'in_progress') || []

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Historial</h1>
                    <p className="text-neutral-500 text-lg mt-1">Tus batallas y victorias, registradas.</p>
                </div>
                <Button asChild className="bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 gap-2">
                    <Link href="/dashboard/routines">
                        <Play className="h-4 w-4 fill-current" /> Nuevo Entrenamiento
                    </Link>
                </Button>
            </div>

            {inProgressWorkouts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-orange-500 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        En curso
                    </h2>
                    <div className="grid gap-4">
                        {inProgressWorkouts.map(workout => (
                            <Link key={workout.id} href={`/dashboard/workouts/${workout.id}/active`}>
                                <Card className="border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-950/10 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                                <Activity className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 dark:text-neutral-50">{workout.name}</h3>
                                                <p className="text-xs text-orange-600 font-medium">Continuar sesión</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-orange-400" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-neutral-400" />
                        Sesiones Completadas
                    </h2>
                    <Badge variant="outline" className="font-bold">
                        {completedWorkouts.length} Total
                    </Badge>
                </div>

                <div className="grid gap-4">
                    {completedWorkouts.length > 0 ? (
                        completedWorkouts.map((workout) => (
                            <Card key={workout.id} className="group overflow-hidden border-neutral-200/60 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-sm">
                                <CardContent className="p-0">
                                    <Link href={`/dashboard/workouts/${workout.id}`} className="block">
                                        <div className="flex flex-col sm:flex-row sm:items-center p-5 gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-bold group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                                                            {workout.name}
                                                        </h3>
                                                        <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                                                            {new Date(workout.ended_at).toLocaleDateString('es-ES', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-100 dark:border-green-900/50">
                                                        Completado
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> Duración
                                                        </p>
                                                        <p className="font-bold text-sm">
                                                            {Math.floor(workout.duration_seconds / 60)} min
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" /> Volumen
                                                        </p>
                                                        <p className="font-bold text-sm">
                                                            {workout.total_volume || '0'} kg
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest flex items-center gap-1">
                                                            <Dumbbell className="h-3 w-3" /> Ejercicios
                                                        </p>
                                                        <p className="font-bold text-sm">
                                                            {workout.workout_exercises?.length || 0}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest flex items-center gap-1">
                                                            <Trophy className="h-3 w-3" /> PRs
                                                        </p>
                                                        <p className="font-bold text-sm text-yellow-600">
                                                            0
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex items-center justify-center p-2 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">
                                                <ChevronRight className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/10">
                            <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                                <Activity className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">No hay entrenamientos aún</h3>
                            <p className="text-neutral-500 mt-2 max-w-xs mx-auto">
                                Tu historial está esperando. Empieza una rutina para ver tus estadísticas aquí.
                            </p>
                            <Button asChild className="mt-6 bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900">
                                <Link href="/dashboard/routines">Explorar Rutinas</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Play({ className }: { className?: string }) {
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
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    )
}

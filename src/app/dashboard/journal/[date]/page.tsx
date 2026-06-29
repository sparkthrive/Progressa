import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    ChevronLeft,
    Calendar as CalendarIcon,
    Dumbbell,
    Camera,
    Target,
    ArrowRight,
    Plus,
    Activity,
    Edit2,
    Clock,
    Star
} from 'lucide-react'
import Link from 'next/link'
import { WorkoutLogForm } from '@/components/journal/WorkoutLogForm'
import { HealthLogForm } from '@/components/journal/HealthLogForm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface JournalDetailPageProps {
    params: Promise<{
        date: string
    }>
}

const WORKOUT_TYPE_LABELS: Record<string, string> = {
    strength: 'Fuerza',
    cardio: 'Cardio',
    flexibility: 'Flexibilidad',
    sports: 'Deportes',
    other: 'Otro'
}

const MOOD_LABELS: Record<string, string> = {
    awful: 'Fatal',
    bad: 'Mal',
    neutral: 'Regular',
    good: 'Bien',
    great: 'Excelente'
}

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
    const { date } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all records for this day
    const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorded_at', date)
        .order('created_at', { ascending: false })

    const { data: dailyLog } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorded_at', date)
        .single()

    const { data: completedWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('ended_at', `${date}T00:00:00`)
        .lte('ended_at', `${date}T23:59:59`)
        .eq('status', 'completed')

    const { data: photos } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorded_at', date)

    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    // Check if any records exist
    const hasRecords = (workoutLogs && workoutLogs.length > 0) || dailyLog || (completedWorkouts && completedWorkouts.length > 0)

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent">
                    <Link href="/dashboard/journal">
                        <ChevronLeft className="h-4 w-4" /> Volver al calendario
                    </Link>
                </Button>
            </div>

            <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-400 font-mono uppercase tracking-[0.3em]">
                    {date}
                </p>
                <h1 className="text-4xl font-black tracking-tight capitalize">
                    {formattedDate}
                </h1>
            </div>

            {!hasRecords ? (
                // EMPTY STATE: Show forms to add first records
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Workout Log Form (Primary) */}
                    <div className="lg:col-span-2">
                        <WorkoutLogForm date={date} />
                    </div>

                    {/* Right: Health Markers & Info */}
                    <div className="space-y-6">
                        {/* Health Markers Form (Secondary) */}
                        <HealthLogForm date={date} />

                        {/* Completed Workouts Card */}
                        {completedWorkouts && completedWorkouts.length > 0 && (
                            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Dumbbell className="h-4 w-4" /> Entrenamientos Completados
                                    </h3>
                                    <div className="space-y-3">
                                        {completedWorkouts.map((w) => (
                                            <Link
                                                key={w.id}
                                                href={`/dashboard/workouts/${w.id}`}
                                                className="block p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 transition-colors group"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-sm tracking-tight">{w.name}</p>
                                                        <p className="text-[10px] text-neutral-400 uppercase font-black">
                                                            {Math.floor(w.duration_seconds / 60)} MINS
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Photos Card */}
                        {photos && photos.length > 0 && (
                            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                            <Camera className="h-4 w-4" /> Fotos de Progreso
                                        </h3>
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                                            <Link href="/dashboard/photos">
                                                <Plus className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {photos.map((p) => (
                                            <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative group">
                                                <img
                                                    src={p.photo_url}
                                                    alt={p.label || 'Progress'}
                                                    className="w-full h-full object-cover"
                                                />
                                                {p.label && (
                                                    <Badge className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-md text-[8px] font-bold border-none capitalize">
                                                        {p.label}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                // RECORDS VIEW: Show existing records as cards
                <div className="space-y-6">
                    {/* Workout Logs */}
                    {workoutLogs && workoutLogs.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-neutral-400" />
                                Registros de Entrenamiento
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workoutLogs.map((log) => (
                                    <Card key={log.id} className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden group hover:shadow-md transition-shadow">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-none px-2 py-1 text-xs font-black uppercase">
                                                        {WORKOUT_TYPE_LABELS[log.workout_type] || log.workout_type}
                                                    </Badge>
                                                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {log.duration_minutes} min
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3.5 w-3.5" />
                                                            {log.intensity}/5
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {log.notes && (
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                                                    {log.notes}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Add New Workout Log Card */}
                                <Link href={`/dashboard/journal/${date}/add-workout`}>
                                    <Card className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 shadow-none bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors cursor-pointer h-full min-h-[180px]">
                                        <CardContent className="p-6 flex flex-col items-center justify-center h-full gap-3">
                                            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                <Plus className="h-6 w-6 text-neutral-400" />
                                            </div>
                                            <p className="text-sm font-bold text-neutral-500">Agregar Nuevo Registro</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Health Markers */}
                    {dailyLog && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-neutral-400" />
                                Marcadores de Salud
                            </h2>
                            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {dailyLog.mood && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Humor</p>
                                                <p className="text-sm font-bold">{MOOD_LABELS[dailyLog.mood] || dailyLog.mood}</p>
                                            </div>
                                        )}
                                        {dailyLog.energy_level && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Energía</p>
                                                <p className="text-sm font-bold">{dailyLog.energy_level}/5</p>
                                            </div>
                                        )}
                                        {dailyLog.sleep_hours && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sueño</p>
                                                <p className="text-sm font-bold">{dailyLog.sleep_hours}h</p>
                                            </div>
                                        )}
                                    </div>
                                    {dailyLog.notes && (
                                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{dailyLog.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Completed Workouts from Active Sessions */}
                    {completedWorkouts && completedWorkouts.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Target className="h-5 w-5 text-neutral-400" />
                                Entrenamientos Completados
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {completedWorkouts.map((w) => (
                                    <Link key={w.id} href={`/dashboard/workouts/${w.id}`}>
                                        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-sm tracking-tight">{w.name}</p>
                                                        <p className="text-[10px] text-neutral-400 uppercase font-black">
                                                            {Math.floor(w.duration_seconds / 60)} MINS
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-neutral-300" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Photos */}
                    {photos && photos.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Camera className="h-5 w-5 text-neutral-400" />
                                Fotos de Progreso
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {photos.map((p) => (
                                    <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative group">
                                        <img
                                            src={p.photo_url}
                                            alt={p.label || 'Progress'}
                                            className="w-full h-full object-cover"
                                        />
                                        {p.label && (
                                            <Badge className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-[8px] font-bold border-none capitalize">
                                                {p.label}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add First Workout Log if none exist */}
                    {(!workoutLogs || workoutLogs.length === 0) && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-neutral-400" />
                                Registros de Entrenamiento
                            </h2>
                            <Link href={`/dashboard/journal/${date}/add-workout`}>
                                <Card className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 shadow-none bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors cursor-pointer">
                                    <CardContent className="p-12 flex flex-col items-center justify-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                            <Plus className="h-8 w-8 text-neutral-400" />
                                        </div>
                                        <p className="text-base font-bold text-neutral-500">Agregar Registro de Entrenamiento</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

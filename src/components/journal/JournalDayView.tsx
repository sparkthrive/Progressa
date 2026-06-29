'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Dumbbell,
    Camera,
    Target,
    ArrowRight,
    Plus,
    Activity,
    Clock,
    Star,
    Smile,
    Zap,
    Moon,
    MessageSquare,
    Info,
    Play
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { WorkoutLogForm } from './WorkoutLogForm'
import { HealthLogForm } from './HealthLogForm'
import { startWorkout } from '@/app/dashboard/workouts/actions'
import { useRouter } from 'next/navigation'

interface Routine {
    id: string
    name: string
    description: string
    routine_exercises: any[]
}

interface JournalDayViewProps {
    date: string
    workoutLogs: any[]
    dailyLog: any | null
    completedWorkouts: any[]
    photos: any[]
    routines: Routine[]
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

export function JournalDayView({
    date,
    workoutLogs,
    dailyLog,
    completedWorkouts,
    photos,
    routines
}: JournalDayViewProps) {
    const router = useRouter()
    const [activeModal, setActiveModal] = useState<'none' | 'health' | 'workout-log' | 'routine-picker'>('none')
    const [selectedLog, setSelectedLog] = useState<any>(null)

    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const hasRecords = workoutLogs.length > 0 || !!dailyLog || completedWorkouts.length > 0 || photos.length > 0
    const isToday = new Date().toISOString().split('T')[0] === date

    const handleStartRoutine = async (id: string) => {
        try {
            await startWorkout(id)
        } catch (error) {
            console.error(error)
            alert('Error al iniciar el entrenamiento')
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
            {/* Contextual Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent text-neutral-500">
                    <Link href="/dashboard/journal">
                        <ChevronLeft className="h-4 w-4" /> Volver al calendario
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-neutral-400 font-mono uppercase tracking-[0.4em]">
                        {date.replace(/-/g, ' / ')}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight capitalize">
                        {formattedDate}
                    </h1>
                </div>

                {hasRecords && (
                    <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="rounded-2xl gap-2 font-bold bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900">
                                    <Plus className="h-4 w-4" /> Agregar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle>¿Qué quieres registrar?</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-2"
                                        onClick={() => setActiveModal('workout-log')}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600">
                                            <Dumbbell className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Registro Manual</p>
                                            <p className="text-[10px] text-neutral-500">Log de entrenamiento rápido</p>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-2"
                                        onClick={() => setActiveModal('health')}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Marcadores de Salud</p>
                                            <p className="text-[10px] text-neutral-500">Humor, energía y sueño</p>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-2"
                                        onClick={() => setActiveModal('routine-picker')}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600">
                                            <Play className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Comenzar Rutina</p>
                                            <p className="text-[10px] text-neutral-500">Sesión guiada en tiempo real</p>
                                        </div>
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {!hasRecords ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="h-24 w-24 rounded-[2rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mb-8 rotate-12">
                        <CalendarIcon className="h-10 w-10 text-neutral-200" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">No hay nada en este día</h2>
                    <p className="text-neutral-500 max-w-sm mb-10">
                        Aprovecha para registrar tu entrenamiento, marcadores de salud o fotos de progreso.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                        <Button
                            variant="outline"
                            className="h-32 flex-col gap-3 rounded-[2rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 transition-all group"
                            onClick={() => setActiveModal('workout-log')}
                        >
                            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                <Dumbbell className="h-5 w-5" />
                            </div>
                            <span className="font-bold">Log de Entrenam.</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32 flex-col gap-3 rounded-[2rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 transition-all group"
                            onClick={() => setActiveModal('health')}
                        >
                            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="font-bold">Marcadores Salud</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32 flex-col gap-3 rounded-[2rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 transition-all group"
                            onClick={() => setActiveModal('routine-picker')}
                        >
                            <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <Play className="h-5 w-5" />
                            </div>
                            <span className="font-bold">Empezar Rutina</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Logs and Workouts */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Daily Health Summary */}
                        {dailyLog && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 px-2">
                                    <Activity className="h-4 w-4" /> Marcadores de Salud
                                </h3>
                                <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[2rem] overflow-hidden">
                                    <div className="p-8">
                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
                                                    <Smile className="h-7 w-7" />
                                                </div>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Humor</p>
                                                <p className="font-bold capitalize">{MOOD_LABELS[dailyLog.mood] || 'N/A'}</p>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-14 w-14 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center text-yellow-500">
                                                    <Zap className="h-7 w-7" />
                                                </div>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Energía</p>
                                                <p className="font-bold">{dailyLog.energy_level}/5</p>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500">
                                                    <Moon className="h-7 w-7" />
                                                </div>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sueño</p>
                                                <p className="font-bold">{dailyLog.sleep_hours}h</p>
                                            </div>
                                        </div>

                                        {dailyLog.notes && (
                                            <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border-l-4 border-neutral-200 dark:border-neutral-700">
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                                                    "{dailyLog.notes}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-end">
                                            <Button variant="ghost" className="text-xs font-bold gap-2 text-neutral-400" onClick={() => setActiveModal('health')}>
                                                <Plus className="h-3 w-3" /> Editar Marcadores
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </section>
                        )}

                        {/* Workout Entries */}
                        {(workoutLogs.length > 0 || completedWorkouts.length > 0) && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 px-2">
                                    <Dumbbell className="h-4 w-4" /> Actividad Física
                                </h3>
                                <div className="grid gap-4">
                                    {/* Manual Logs */}
                                    {workoutLogs.map((log) => (
                                        <Card key={log.id} className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-3xl overflow-hidden group cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedLog(log)}>
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform shrink-0">
                                                    <Dumbbell className="h-8 w-8" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-none px-2 py-0 h-5 text-[10px] font-black uppercase tracking-tighter">
                                                            LOG MANUAL
                                                        </Badge>
                                                        <span className="text-xs font-bold text-neutral-400">
                                                            {WORKOUT_TYPE_LABELS[log.workout_type] || log.workout_type}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-lg leading-tight truncate">Resumen Entrenamiento</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                                                            <Clock className="h-3 w-3" /> {log.duration_minutes} min
                                                        </span>
                                                        <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                                                            <Star className="h-3 w-3" /> {log.intensity}/5
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-neutral-200 group-hover:text-neutral-400 group-hover:translate-x-1 transition-all" />
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {/* App Workouts */}
                                    {completedWorkouts.map((w) => (
                                        <Link key={w.id} href={`/dashboard/workouts/${w.id}`}>
                                            <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
                                                <CardContent className="p-6 flex items-center gap-6">
                                                    <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 group-hover:scale-105 transition-transform shrink-0">
                                                        <Target className="h-8 w-8" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-none px-2 py-0 h-5 text-[10px] font-black uppercase tracking-tighter">
                                                                SÉSIÓN GUIADA
                                                            </Badge>
                                                            <span className="text-xs font-bold text-neutral-400">
                                                                {Math.floor(w.duration_seconds / 60)} min
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-lg leading-tight truncate">{w.name}</h4>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                                                                <Star className="h-3 w-3" /> 100 XP Ganados
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-5 w-5 text-neutral-200 group-hover:text-neutral-400 group-hover:translate-x-1 transition-all" />
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Progress Photos */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 px-2">
                                <Camera className="h-4 w-4" /> Fotos de Progreso
                            </h3>
                            <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[2rem] overflow-hidden">
                                <CardContent className="p-6">
                                    {photos.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Camera className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Sin fotos aún</p>
                                            <Button variant="ghost" size="sm" asChild className="mt-4 rounded-xl">
                                                <Link href="/dashboard/photos">Subir Foto</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {photos.map((p) => (
                                                <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative group cursor-pointer shadow-sm">
                                                    <img src={p.photo_url} alt="Progress" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    {p.label && (
                                                        <Badge className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-md text-[8px] font-bold border-none capitalize justify-center">
                                                            {p.label}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                            <Link href="/dashboard/photos" className="aspect-square rounded-2xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                <Plus className="h-5 w-5 text-neutral-300" />
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Más</span>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* Tips or Summary */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 px-2">
                                <Info className="h-4 w-4" /> Resumen del Día
                            </h3>
                            <Card className="border-none bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-100 dark:to-neutral-50 text-white dark:text-neutral-900 shadow-xl rounded-[2rem] overflow-hidden">
                                <CardContent className="p-8 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black">{workoutLogs.length + completedWorkouts.length}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Entrenamientos</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black">{dailyLog?.sleep_hours || '-'}h</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Descanso Total</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>
            )}

            {/* MODALS */}

            {/* Modal: Health Log */}
            <Dialog open={activeModal === 'health'} onOpenChange={(open) => !open && setActiveModal('none')}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none">
                    <HealthLogForm date={date} initialData={dailyLog || undefined} />
                </DialogContent>
            </Dialog>

            {/* Modal: Workout Log */}
            <Dialog open={activeModal === 'workout-log'} onOpenChange={(open) => !open && setActiveModal('none')}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none">
                    <WorkoutLogForm date={date} />
                </DialogContent>
            </Dialog>

            {/* Modal: Routine Picker */}
            <Dialog open={activeModal === 'routine-picker'} onOpenChange={(open) => !open && setActiveModal('none')}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-8 border-none bg-white dark:bg-neutral-950 max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black mb-4">Selecciona una rutina</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        {routines.map((routine) => (
                            <div
                                key={routine.id}
                                className="group p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-50 transition-all cursor-pointer flex justify-between items-center"
                                onClick={() => handleStartRoutine(routine.id)}
                            >
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg">{routine.name}</h4>
                                    <p className="text-xs text-neutral-500 line-clamp-1">{routine.description}</p>
                                    <div className="flex gap-2 pt-1">
                                        <Badge className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-none font-bold text-[9px] h-4">
                                            {routine.routine_exercises.length} Ejercicios
                                        </Badge>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 flex items-center justify-center scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all">
                                    <Play className="h-5 w-5 fill-current" />
                                </div>
                            </div>
                        ))}
                        {routines.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-neutral-500 font-medium">No tienes rutinas creadas.</p>
                                <Button asChild variant="link" className="mt-2">
                                    <Link href="/dashboard/routines/new">Crear mi primera rutina</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Log Details */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-8 border-none bg-white dark:bg-neutral-950">
                    {selectedLog && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600">
                                    <Dumbbell className="h-8 w-8" />
                                </div>
                                <div>
                                    <Badge className="bg-purple-200 text-purple-700 dark:bg-purple-400 dark:text-purple-950 border-none px-2 py-0 h-5 text-[10px] font-black uppercase tracking-tighter mb-1">
                                        DETALLE DEL REGISTRO
                                    </Badge>
                                    <h2 className="text-2xl font-black">Resumen del Entrenamiento</h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Tipo</p>
                                    <p className="font-bold text-lg">{WORKOUT_TYPE_LABELS[selectedLog.workout_type] || selectedLog.workout_type}</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Duración</p>
                                    <p className="font-bold text-lg">{selectedLog.duration_minutes} minutos</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Intensidad</p>
                                    <p className="font-bold text-lg">{selectedLog.intensity} / 5</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Fecha</p>
                                    <p className="font-bold text-lg">{selectedLog.recorded_at}</p>
                                </div>
                            </div>

                            {selectedLog.notes && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" /> Notas y Observaciones
                                    </p>
                                    <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                            {selectedLog.notes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold"
                                    onClick={() => {
                                        // Open editor
                                        setSelectedLog(null)
                                        // We could implement an "Edit" mode in WorkoutLogForm
                                        alert('Próximamente: Editar registro existente')
                                    }}
                                >
                                    Editar Registro
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-14 rounded-2xl font-bold"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

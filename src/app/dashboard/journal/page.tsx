import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Heart,
    Zap,
    Moon,
    Plus,
    Activity,
    Dumbbell
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function JournalPage({
    searchParams
}: {
    searchParams: Promise<{ month?: string, year?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const now = new Date()
    const month = params.month ? parseInt(params.month) : now.getMonth()
    const year = params.year ? parseInt(params.year) : now.getFullYear()

    // Get month details
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay() // 0 is Sunday, 1 is Monday...

    // Adjusted for Monday start (standard in many regions)
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    // Fetch workouts and logs for this month
    const startDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`
    const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${daysInMonth}`

    const { data: workouts } = await supabase
        .from('workouts')
        .select('ended_at')
        .eq('user_id', user.id)
        .gte('ended_at', startDate)
        .lte('ended_at', endDate + 'T23:59:59')
        .eq('status', 'completed')

    const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('recorded_at')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate)

    const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate)

    // Helper to map data to specific days
    const workoutDays = new Set(workouts?.map(w => new Date(w.ended_at).getDate()) || [])
    const workoutLogDays = new Set(workoutLogs?.map(wl => new Date(wl.recorded_at + 'T00:00:00').getDate()) || [])
    const logsMap = new Map(logs?.map(l => [new Date(l.recorded_at + 'T00:00:00').getDate(), l]) || [])

    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(firstDayOfMonth)

    // Navigation month handling
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year

    const days = []
    // Padding for start of month
    for (let i = 0; i < adjustedStartingDay; i++) {
        days.push(<div key={`pad-${i}`} className="h-24 sm:h-32 border-b border-r dark:border-neutral-800 opacity-20 bg-neutral-50 dark:bg-neutral-900/10" />)
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        const hasWorkout = workoutDays.has(d)
        const dayLog = logsMap.get(d)
        const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear()
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`

        days.push(
            <Link
                key={d}
                href={`/dashboard/journal/${dateStr}`}
                className={`relative h-24 sm:h-32 border-b border-r dark:border-neutral-800 p-2 sm:p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 group ${isToday ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                    }`}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isToday ? 'h-7 w-7 bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 rounded-full flex items-center justify-center' : 'text-neutral-400'}`}>
                        {d}
                    </span>
                    <div className="flex flex-col gap-1">
                        {hasWorkout && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-none px-1.5 py-0 h-5 text-[10px] font-black uppercase tracking-tighter">
                                TRAIN
                            </Badge>
                        )}
                        {workoutLogDays.has(d) && (
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-none px-1.5 py-0 h-5 text-[10px] font-black uppercase tracking-tighter">
                                LOG
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                    {dayLog?.mood && (
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400" title={`Mood: ${dayLog.mood}`} />
                    )}
                    {dayLog?.energy_level && (
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" title={`Energy: ${dayLog.energy_level}`} />
                    )}
                    {dayLog?.sleep_hours && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" title={`Sleep: ${dayLog.sleep_hours}h`} />
                    )}
                </div>

                {dayLog?.notes && (
                    <p className="mt-2 text-[10px] text-neutral-400 line-clamp-2 hidden sm:block">
                        {dayLog.notes}
                    </p>
                )}

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 text-neutral-300" />
                </div>
            </Link>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Diario de Salud</h1>
                    <p className="text-neutral-500 font-medium">Registra tu progreso más allá del gimnasio.</p>
                </div>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                        <Link href={`/dashboard/journal?month=${prevMonth}&year=${prevYear}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="px-4 text-sm font-bold uppercase tracking-widest min-w-[140px] text-center">
                        {monthName} {year}
                    </div>
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                        <Link href={`/dashboard/journal?month=${nextMonth}&year=${nextYear}`}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overlay (Optional/Future) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm overflow-hidden group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
                            <Heart className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Tu Estado</p>
                            <p className="text-xl font-black text-neutral-900 dark:text-neutral-50">Constante</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm overflow-hidden group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center text-yellow-500">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Energía Promedio</p>
                            <p className="text-xl font-black text-neutral-900 dark:text-neutral-50">Nivel 4</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm overflow-hidden group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500">
                            <Moon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Sueño Promedio</p>
                            <p className="text-xl font-black text-neutral-900 dark:text-neutral-50">7.2 hrs</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-neutral-950 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-xl overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                        <div key={day} className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7">
                    {days}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 px-4 py-3 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-neutral-400 w-fit">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-400" /> Humor
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-400" /> Energía
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400" /> Sueño
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-1.5 py-0.5 rounded text-[8px]">TRAIN</span> Entrenamiento Completado
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 px-1.5 py-0.5 rounded text-[8px]">LOG</span> Registro Manual
                </div>
            </div>
        </div>
    )
}

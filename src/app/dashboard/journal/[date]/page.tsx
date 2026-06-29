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
import { JournalDayView } from '@/components/journal/JournalDayView'

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

    // Fetch all records concurrent
    const [
        { data: workoutLogs },
        { data: dailyLog },
        { data: completedWorkouts },
        { data: photos },
        { data: routines }
    ] = await Promise.all([
        supabase.from('workout_logs').select('*').eq('user_id', user.id).eq('recorded_at', date).order('created_at', { ascending: false }),
        supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('recorded_at', date).single(),
        supabase.from('workouts').select('*').eq('user_id', user.id).gte('ended_at', `${date}T00:00:00`).lte('ended_at', `${date}T23:59:59`).eq('status', 'completed'),
        supabase.from('progress_photos').select('*').eq('user_id', user.id).eq('recorded_at', date),
        supabase.from('routines').select('*, routine_exercises(*)').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    return (
        <JournalDayView
            date={date}
            workoutLogs={workoutLogs || []}
            dailyLog={dailyLog}
            completedWorkouts={completedWorkouts || []}
            photos={photos || []}
            routines={routines || []}
        />
    )
}

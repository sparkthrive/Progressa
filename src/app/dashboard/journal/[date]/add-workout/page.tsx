import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { WorkoutLogForm } from '@/components/journal/WorkoutLogForm'

interface AddWorkoutPageProps {
    params: Promise<{
        date: string
    }>
}

export default async function AddWorkoutPage({ params }: AddWorkoutPageProps) {
    const { date } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent">
                    <Link href={`/dashboard/journal/${date}`}>
                        <ChevronLeft className="h-4 w-4" /> Volver
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

            <WorkoutLogForm date={date} />
        </div>
    )
}

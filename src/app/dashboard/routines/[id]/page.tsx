import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RoutineEditor } from '@/components/routines/RoutineEditor'

export default async function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: routine, error } = await supabase
        .from('routines')
        .select(`
            *,
            routine_exercises(
                id,
                sets_target,
                exercises(id, name)
            )
        `)
        .eq('id', id)
        .single()

    if (error || !routine) {
        notFound()
    }

    const formattedData = {
        id: routine.id,
        name: routine.name,
        description: routine.description || '',
        exercises: routine.routine_exercises.map((re: any) => ({
            id: re.exercises.id,
            name: re.exercises.name,
            sets: re.sets_target ? re.sets_target.length : 3,
            reps: re.sets_target && re.sets_target[0] ? String(re.sets_target[0].reps) : '10'
        }))
    }

    return <RoutineEditor initialData={formattedData} />
}

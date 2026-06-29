import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ActiveWorkoutSession } from '@/components/workouts/ActiveWorkoutSession'

interface ActiveWorkoutPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ActiveWorkoutPage({ params }: ActiveWorkoutPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch workout session
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (workoutError || !workout) {
        notFound()
    }

    // Redirect if already completed
    if (workout.status === 'completed') {
        redirect(`/dashboard/workouts/${id}`)
    }

    // Fetch exercises for this workout
    const { data: exercises, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
            *,
            exercises(
                name,
                muscle_group,
                measurement_type
            )
        `)
        .eq('workout_id', id)
        .order('sys_order', { ascending: true })

    if (exercisesError) {
        console.error(exercisesError)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 px-4">
            <ActiveWorkoutSession
                workout={workout}
                exercises={exercises || []}
            />
        </div>
    )
}

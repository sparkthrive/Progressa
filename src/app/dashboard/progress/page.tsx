import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgressCharts } from '@/components/dashboard/ProgressCharts'

// 1RM Formula (Brzycki)
function calculate1RM(weight: number, reps: number) {
    if (!weight || !reps) return 0
    if (reps === 1) return weight
    return weight / (1.0278 - (0.0278 * reps))
}

export default async function ProgressPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch weight metrics
    const { data: metrics } = await supabase
        .from('user_metrics')
        .select('weight_kg, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true })

    // 2. Fetch workout performance for 1RM
    const { data: performances, error } = await supabase
        .from('workout_exercises')
        .select(`
            id,
            sets_data,
            exercises(name),
            workouts(ended_at)
        `)
        .not('workouts', 'is', null) // Ensure workout is finished
        .eq('workouts.status', 'completed')
        .eq('workouts.user_id', user.id)

    if (error) {
        console.error(error)
    }

    // 3. Process performances to find best 1RM per session per exercise
    const exerciseGroups: Record<string, any[]> = {}

    performances?.forEach((perf: any) => {
        const exerciseName = perf.exercises.name
        const date = perf.workouts.ended_at.split('T')[0]

        let best1RM = 0
        let bestWeight = 0
        let bestReps = 0

        perf.sets_data?.forEach((set: any) => {
            if (set.completed && set.weight && set.reps) {
                const oneRM = calculate1RM(Number(set.weight), Number(set.reps))
                if (oneRM > best1RM) {
                    best1RM = oneRM
                    bestWeight = Number(set.weight)
                    bestReps = Number(set.reps)
                }
            }
        })

        if (best1RM > 0) {
            if (!exerciseGroups[exerciseName]) {
                exerciseGroups[exerciseName] = []
            }
            exerciseGroups[exerciseName].push({
                date,
                one_rm: Math.round(best1RM * 10) / 10,
                weight: bestWeight,
                reps: bestReps
            })
        }
    })

    const progressionData = Object.entries(exerciseGroups).map(([name, data]) => ({
        exercise_name: name,
        data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }))

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tight mb-2">Análisis de Progreso</h1>
                <p className="text-neutral-500 font-medium">Tus datos nunca mienten. Cada gramo cuenta.</p>
            </div>

            <ProgressCharts
                metricsData={metrics || []}
                progressionData={progressionData}
            />
        </div>
    )
}

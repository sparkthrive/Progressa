'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function startWorkout(routineId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No authenticated user')

    // 1. Fetch routine details
    const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select(`
            *,
            routine_exercises(
                exercise_id,
                sys_order,
                sets_target,
                exercise:exercises(name, measurement_type)
            )
        `)
        .eq('id', routineId)
        .single()

    if (routineError || !routine) throw new Error('Routine not found')

    // 2. Create the workout session
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            routine_id: routineId,
            name: routine.name,
            status: 'in_progress',
            started_at: new Date().toISOString()
        })
        .select()
        .single()

    if (workoutError || !workout) throw new Error('Failed to start workout')

    // 3. Clone exercises into workout_exercises
    const workoutExercises = routine.routine_exercises.map((re: any) => ({
        workout_id: workout.id,
        exercise_id: re.exercise_id,
        sys_order: re.sys_order,
        sets_data: re.sets_target // Initialize sets_data with targets
    }))

    const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises)

    if (exercisesError) throw new Error('Failed to setup exercises')

    redirect(`/dashboard/workouts/${workout.id}/active`)
}

export async function completeWorkout(workoutId: string, notes: string = '') {
    const supabase = await createClient()
    const now = new Date()

    // 1. Fetch workout to calculate duration
    const { data: workout } = await supabase
        .from('workouts')
        .select('name, started_at')
        .eq('id', workoutId)
        .single()

    let durationSeconds = 0
    if (workout?.started_at) {
        durationSeconds = Math.floor((now.getTime() - new Date(workout.started_at).getTime()) / 1000)
    }

    const { error } = await supabase
        .from('workouts')
        .update({
            status: 'completed',
            ended_at: now.toISOString(),
            duration_seconds: durationSeconds,
            notes
        })
        .eq('id', workoutId)

    if (error) throw new Error('Failed to complete workout')

    // Award XP and Update Challenges
    try {
        const { awardXP, updateChallengeProgress } = await import('../community/actions')

        // 1. Award flat XP
        await awardXP(100)

        // 2. Fetch total volume for this workout to update volume challenges
        const { data: exData } = await supabase
            .from('workout_exercises')
            .select('total_volume')
            .eq('workout_id', workoutId)

        const totalVolume = exData?.reduce((sum, ex) => sum + (Number(ex.total_volume) || 0), 0) || 0

        // 3. Update 'workouts' challenge progress (+1)
        await updateChallengeProgress('workouts', 1)

        // 4. Update 'volume' challenge progress (+totalVolume)
        if (totalVolume > 0) {
            await updateChallengeProgress('volume', totalVolume)
        }

        // 5. Notify Groups
        const { publishGroupActivity } = await import('../groups/actions')
        await publishGroupActivity('workout_completed', {
            workout_name: workout?.name || 'Entrenamiento',
            stats: {
                minutos: Math.floor(durationSeconds / 60),
                volumen: totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k kg` : `${totalVolume}kg`
            }
        })

    } catch (e) {
        console.error('Failed to update gamification or group activity:', e)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/workouts')
    redirect(`/dashboard/workouts/${workoutId}`)
}

/**
 * Finalizes a workout by saving all exercises and their sets data at once
 */
export async function finalizeWorkoutWithData(workoutId: string, exercisesData: any[], notes: string = '') {
    const supabase = await createClient()
    const now = new Date()

    // 1. Fetch workout to calculate duration
    const { data: workout } = await supabase
        .from('workouts')
        .select('name, started_at')
        .eq('id', workoutId)
        .single()

    let durationSeconds = 0
    if (workout?.started_at) {
        durationSeconds = Math.floor((now.getTime() - new Date(workout.started_at).getTime()) / 1000)
    }

    // 2. Update each exercise's sets and volume
    let totalWorkoutVolume = 0

    for (const ex of exercisesData) {
        // Calculate volume for this exercise
        const exerciseVolume = ex.sets.reduce((acc: number, set: any) => {
            if (set.isCompleted) {
                return acc + (Number(set.weight) || 0) * (Number(set.reps) || 0)
            }
            return acc
        }, 0)

        totalWorkoutVolume += exerciseVolume

        // Update the checkout_exercises table
        // We match by workout_id and exercise_id (assuming one entry per exercise type in a workout)
        await supabase
            .from('workout_exercises')
            .update({
                sets_data: ex.sets,
                total_volume: exerciseVolume
            })
            .eq('workout_id', workoutId)
            .eq('exercise_id', ex.exerciseId)
    }

    // 3. Update workout status
    const { error } = await supabase
        .from('workouts')
        .update({
            status: 'completed',
            ended_at: now.toISOString(),
            duration_seconds: durationSeconds,
            notes,
            total_volume: totalWorkoutVolume
        })
        .eq('id', workoutId)

    if (error) throw new Error('Failed to finalize workout')

    // 4. Award XP and Update Challenges
    try {
        const { awardXP, updateChallengeProgress } = await import('../community/actions')
        await awardXP(100) // Base XP
        await updateChallengeProgress('workouts', 1)
        if (totalWorkoutVolume > 0) {
            await updateChallengeProgress('volume', totalWorkoutVolume)
        }

        // 5. Notify Groups
        const { publishGroupActivity } = await import('../groups/actions')
        await publishGroupActivity('workout_completed', {
            workout_name: workout?.name || 'Entrenamiento',
            stats: {
                minutos: Math.floor(durationSeconds / 60),
                volumen: totalWorkoutVolume > 1000 ? `${(totalWorkoutVolume / 1000).toFixed(1)}k kg` : `${totalWorkoutVolume}kg`
            }
        })
    } catch (e) {
        console.error('Failed to update gamification or group activity:', e)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/workouts')
    redirect(`/dashboard/workouts/${workoutId}`)
}

export async function updateWorkoutExercise(exerciseId: string, setsData: any[]) {
    const supabase = await createClient()

    // Calculate volume for the exercise based on completed sets
    const exerciseVolume = setsData.reduce((acc, set) => {
        if (set.completed) {
            return acc + (Number(set.weight) || 0) * (Number(set.reps) || 0)
        }
        return acc
    }, 0)

    const { error } = await supabase
        .from('workout_exercises')
        .update({
            sets_data: setsData,
            total_volume: exerciseVolume
        })
        .eq('id', exerciseId)

    if (error) throw new Error('Failed to update exercise data')
}

export async function deleteWorkout(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

    if (error) throw new Error('Failed to delete workout')

    revalidatePath('/dashboard/workouts')
}

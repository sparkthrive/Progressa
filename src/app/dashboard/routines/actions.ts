'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getExercises() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function createRoutine(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { name, description, exercises } = formData

    // 1. Insert Routine
    const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert({
            user_id: user.id,
            name,
            description,
        })
        .select()
        .single()

    if (routineError) throw new Error(routineError.message)

    // 2. Insert Routine Exercises
    const routineExercises = exercises.map((ex: any, index: number) => ({
        routine_id: routine.id,
        exercise_id: ex.id,
        sys_order: index,
        sets_target: ex.sets_target || [],
    }))

    const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises)

    if (exercisesError) throw new Error(exercisesError.message)
    revalidatePath('/dashboard/routines')
    return { success: true }
}

export async function deleteRoutine(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/routines')
    return { success: true }
}

export async function duplicateRoutine(id: string) {
    const supabase = await createClient()

    // 1. Get original routine with exercises
    const { data: original, error: fetchError } = await supabase
        .from('routines')
        .select('*, routine_exercises(*)')
        .eq('id', id)
        .single()

    if (fetchError) throw new Error(fetchError.message)

    // 2. Insert new routine
    const { data: newRoutine, error: insertError } = await supabase
        .from('routines')
        .insert({
            user_id: original.user_id,
            name: `${original.name} (Copia)`,
            description: original.description,
        })
        .select()
        .single()

    if (insertError) throw new Error(insertError.message)

    // 3. Insert exercises for the new routine
    if (original.routine_exercises && original.routine_exercises.length > 0) {
        const newExercises = original.routine_exercises.map((re: any) => ({
            routine_id: newRoutine.id,
            exercise_id: re.exercise_id,
            sys_order: re.sys_order,
            sets_target: re.sets_target,
        }))

        const { error: exercisesError } = await supabase
            .from('routine_exercises')
            .insert(newExercises)

        if (exercisesError) throw new Error(exercisesError.message)
    }

    revalidatePath('/dashboard/routines')
    return { success: true }
}

export async function updateRoutine(id: string, formData: any) {
    const supabase = await createClient()
    const { name, description, exercises } = formData

    // 1. Update Routine
    const { error: routineError } = await supabase
        .from('routines')
        .update({ name, description })
        .eq('id', id)

    if (routineError) throw new Error(routineError.message)

    // 2. Delete existing exercises
    const { error: deleteError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', id)

    if (deleteError) throw new Error(deleteError.message)

    // 3. Insert new exercises
    const routineExercises = exercises.map((ex: any, index: number) => ({
        routine_id: id,
        exercise_id: ex.id,
        sys_order: index,
        sets_target: ex.sets_target || [],
    }))

    const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises)

    if (exercisesError) throw new Error(exercisesError.message)

    revalidatePath('/dashboard/routines')
    revalidatePath(`/dashboard/routines/${id}`)
    return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function upsertDailyLog(data: {
    recorded_at: string
    mood?: string
    energy_level?: number
    sleep_hours?: number
    notes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('daily_logs')
        .upsert({
            user_id: user.id,
            recorded_at: data.recorded_at,
            mood: data.mood,
            energy_level: data.energy_level,
            sleep_hours: data.sleep_hours,
            notes: data.notes
        }, {
            onConflict: 'user_id, recorded_at'
        })

    if (error) {
        console.error(error)
        throw new Error('Failed to save daily log')
    }

    revalidatePath(`/dashboard/journal`)
    revalidatePath(`/dashboard/journal/${data.recorded_at}`)
    redirect('/dashboard/journal')
}

export async function upsertWorkoutLog(data: {
    id?: string
    recorded_at: string
    workout_type: string
    duration_minutes: number
    intensity: number
    notes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const logData = {
        user_id: user.id,
        recorded_at: data.recorded_at,
        workout_type: data.workout_type,
        duration_minutes: data.duration_minutes,
        intensity: data.intensity,
        notes: data.notes
    }

    let error
    if (data.id) {
        // Update existing log
        const result = await supabase
            .from('workout_logs')
            .update(logData)
            .eq('id', data.id)
            .eq('user_id', user.id)
        error = result.error
    } else {
        // Insert new log
        const result = await supabase
            .from('workout_logs')
            .insert(logData)
        error = result.error
    }

    if (error) {
        console.error(error)
        throw new Error('Failed to save workout log')
    }

    revalidatePath(`/dashboard/journal`)
    revalidatePath(`/dashboard/journal/${data.recorded_at}`)
    redirect('/dashboard/journal')
}

export async function saveProgressPhoto(data: {
    photo_url: string
    label?: string
    recorded_at: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('progress_photos')
        .insert({
            user_id: user.id,
            photo_url: data.photo_url,
            label: data.label,
            recorded_at: data.recorded_at
        })

    if (error) {
        console.error(error)
        throw new Error('Failed to save progress photo')
    }

    revalidatePath('/dashboard/photos')
}

export async function deleteProgressPhoto(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error(error)
        throw new Error('Failed to delete photo')
    }

    revalidatePath('/dashboard/photos')
}

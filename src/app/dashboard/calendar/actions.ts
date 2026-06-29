'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getScheduledRoutines(userId: string, startDate: Date, endDate: Date) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('scheduled_routines')
        .select(`
            id,
            scheduled_date,
            status,
            routine:routines(id, name, description)
        `)
        .eq('user_id', userId)
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString())

    if (error) {
        console.error('Error fetching scheduled routines:', error)
        return []
    }

    return data
}

export async function scheduleRoutine(routineId: string, date: Date) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('scheduled_routines')
        .insert({
            user_id: user.id,
            routine_id: routineId,
            scheduled_date: date.toISOString(),
            status: 'pending'
        })

    if (error) {
        console.error('Error scheduling routine:', error)
        throw new Error('Failed to schedule routine')
    }

    revalidatePath('/dashboard/calendar')
}

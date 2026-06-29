'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(exerciseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Check if already favorited
    const { data: existing } = await supabase
        .from('exercise_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .single()

    if (existing) {
        // Remove from favorites
        const { error } = await supabase
            .from('exercise_favorites')
            .delete()
            .eq('id', existing.id)

        if (error) {
            console.error(error)
            throw new Error('Failed to remove favorite')
        }
    } else {
        // Add to favorites
        const { error } = await supabase
            .from('exercise_favorites')
            .insert({
                user_id: user.id,
                exercise_id: exerciseId
            })

        if (error) {
            console.error(error)
            throw new Error('Failed to add favorite')
        }
    }

    revalidatePath('/dashboard/exercises')
    return !existing // Return new favorite status
}

export async function updateUserEquipment(equipment: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('users')
        .update({ equipment_available: equipment })
        .eq('id', user.id)

    if (error) {
        console.error(error)
        throw new Error('Failed to update equipment')
    }

    revalidatePath('/dashboard/exercises')
    revalidatePath('/dashboard/settings')
}

export async function getUserEquipment() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('users')
        .select('equipment_available')
        .eq('id', user.id)
        .single()

    return data?.equipment_available || []
}

export async function getUserFavorites() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('exercise_favorites')
        .select('exercise_id')
        .eq('user_id', user.id)

    return data?.map(f => f.exercise_id) || []
}

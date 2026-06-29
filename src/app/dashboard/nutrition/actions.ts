'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function upsertNutritionLog(data: {
    recorded_at: string
    calories: number
    protein: number
    carbs: number
    fats: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('nutrition_logs')
        .upsert({
            user_id: user.id,
            recorded_at: data.recorded_at,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fats: data.fats
        }, {
            onConflict: 'user_id, recorded_at'
        })

    if (error) {
        console.error(error)
        throw new Error('Failed to save nutrition log')
    }

    // Award XP for logging nutrition
    try {
        const { awardXP } = await import('../community/actions')
        await awardXP(50) // 50 XP for logging nutrition
    } catch (e) {
        console.error('Failed to award XP:', e)
    }

    revalidatePath('/dashboard/nutrition')
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/journal/${data.recorded_at}`)
    redirect('/dashboard/nutrition')
}

export async function deleteNutritionLog(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error(error)
        throw new Error('Failed to delete nutrition log')
    }

    revalidatePath('/dashboard/nutrition')
}

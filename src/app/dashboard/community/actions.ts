'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinChallenge(challengeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('user_challenges')
        .insert({
            user_id: user.id,
            challenge_id: challengeId,
            current_progress: 0
        })

    if (error) {
        console.error(error)
        throw new Error('Failed to join challenge')
    }

    revalidatePath('/dashboard/challenges')
}

export async function awardXP(amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Get current XP
    const { data: profile } = await supabase
        .from('users')
        .select('xp_points, player_level')
        .eq('id', user.id)
        .single()

    if (!profile) return

    const newXP = profile.xp_points + amount
    // Simple level formula: level = floor(sqrt(xp / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1

    const { error } = await supabase
        .from('users')
        .update({
            xp_points: newXP,
            player_level: newLevel,
            last_activity_at: new Date().toISOString().split('T')[0]
        })
        .eq('id', user.id)

    if (error) {
        console.error(error)
        throw new Error('Failed to award XP')
    }

    // Log XP entry for weekly rankings
    await supabase.from('xp_logs').insert({
        user_id: user.id,
        amount: amount,
        reason: 'activity' // Could be passed as argument
    })

    revalidatePath('/dashboard')
}

export async function updateChallengeProgress(targetType: string, increment: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Find active joined challenges of this type
    const { data: joinedChallenges } = await supabase
        .from('user_challenges')
        .select(`
            *,
            challenges!inner(target_type, target_goal)
        `)
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .eq('challenges.target_type', targetType)

    if (!joinedChallenges) return

    for (const uc of joinedChallenges) {
        const newProgress = Number(uc.current_progress) + increment
        const isCompleted = newProgress >= Number(uc.challenges.target_goal)

        const update: any = {
            current_progress: newProgress,
            is_completed: isCompleted
        }

        if (isCompleted) {
            update.completed_at = new Date().toISOString()
        }

        await supabase
            .from('user_challenges')
            .update(update)
            .eq('id', uc.id)
    }
}

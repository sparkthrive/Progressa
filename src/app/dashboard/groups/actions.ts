'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Creates a new class for a group
 */
export async function createGroupClass(data: {
    group_id: string
    name: string
    description?: string
    start_time: string
    duration_minutes: number
    max_attendees?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Verify user is admin or trainer in the group
    const { data: member } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', data.group_id)
        .eq('user_id', user.id)
        .single()

    if (!member || (member.role !== 'admin' && member.role !== 'trainer')) {
        throw new Error('Solo admin o entrenadores pueden crear clases')
    }

    // 2. Insert class
    const { error } = await supabase
        .from('group_classes')
        .insert({
            ...data,
            trainer_id: user.id
        })

    if (error) {
        console.error(error)
        throw new Error('Error al crear la clase')
    }

    revalidatePath(`/dashboard/groups/${data.group_id}`)
}

/**
 * RSVP/Join a group class
 */
export async function joinGroupClass(classId: string, groupId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Verify user is member of the group
    const { data: isMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

    if (!isMember) throw new Error('Debes ser miembro del grupo para unirte a la clase')

    // 2. Insert attendance
    const { error } = await supabase
        .from('class_attendance')
        .insert({
            class_id: classId,
            user_id: user.id,
            status: 'confirmed'
        })

    if (error) {
        console.error(error)
        throw new Error('Error al unirse a la clase')
    }

    // 3. Update current_attendees count
    await supabase.rpc('increment_class_attendees', { row_id: classId })

    revalidatePath(`/dashboard/groups/${groupId}`)
}

/**
 * Fetch group members ranked by XP in the last 7 days
 */
export async function getGroupWeeklyRanking(groupId: string) {
    const supabase = await createClient()

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // This is a complex query that joins group_members, xp_logs and users
    const { data: ranking, error } = await supabase
        .from('group_members')
        .select(`
            user_id,
            user:users(id, full_name, avatar_url),
            xp_logs:xp_logs(amount)
        `)
        .eq('group_id', groupId)
        // We filter xp_logs by date later because Supabase filter on joined tables is tricky 
        // Or we use a manual filter if supported:
        .gte('xp_logs.created_at', sevenDaysAgo.toISOString())

    if (error) {
        console.error(error)
        return []
    }

    // Process ranking in JS for accuracy
    const processed = ranking.map((m: any) => {
        const weeklyXP = (m.xp_logs || []).reduce((acc: number, curr: any) => acc + curr.amount, 0)
        return {
            id: m.user_id,
            full_name: m.user?.full_name || 'Usuario',
            avatar_url: m.user?.avatar_url,
            weekly_xp: weeklyXP
        }
    }).sort((a, b) => b.weekly_xp - a.weekly_xp).slice(0, 5)

    return processed
}

/**
 * Publishes an activity to all groups a user belongs to
 */
export async function publishGroupActivity(type: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Get all groups user belongs to
    const { data: memberOf } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

    if (!memberOf || memberOf.length === 0) return

    // 2. Prepare activities
    const activities = memberOf.map(m => ({
        group_id: m.group_id,
        user_id: user.id,
        type,
        data,
        is_public: true,
        approved: true
    }))

    // 3. Insert in bulk
    await supabase.from('group_activities').insert(activities)
}

/**
 * Remove a member from a group (Admin only)
 */
export async function kickGroupMember(groupId: string, targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Verify user is admin
    const { data: member } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

    if (!member || member.role !== 'admin') {
        throw new Error('Solo el administrador puede expulsar miembros')
    }

    // 2. Delete membership
    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', targetUserId)

    if (error) throw error

    // 3. Decrement count
    await supabase.rpc('decrement_group_member_count', { group_id: groupId })

    revalidatePath(`/dashboard/groups/${groupId}`)
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)

    if (error) throw error

    // Decrement count
    await supabase.rpc('decrement_group_member_count', { group_id: groupId })

    revalidatePath('/dashboard/groups')
    revalidatePath(`/dashboard/groups/${groupId}`)
}


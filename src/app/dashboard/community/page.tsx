import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CommunityClient } from '@/components/groups/CommunityClient'

export default async function CommunityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch top 10 users by XP
    const { data: leaderboard } = await supabase
        .from('users')
        .select('id, full_name, username, xp_points, player_level, avatar_url, current_streak')
        .order('xp_points', { ascending: false })
        .limit(10)

    // Fetch some active challenges
    const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .gte('ends_at', new Date().toISOString())
        .limit(3)

    return (
        <CommunityClient
            leaderboard={leaderboard || []}
            challenges={challenges || []}
            currentUser={user}
        />
    )
}

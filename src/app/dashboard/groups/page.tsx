import { createClient } from '@/lib/supabase/server'
import { GroupsClient } from '@/components/groups/GroupsClient'

export default async function GroupsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch User's Groups IDs
    const { data: membershipData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user?.id || '')

    const myGroupIds = membershipData?.map(m => m.group_id) || []

    // 2. Fetch User's Groups details
    const { data: myGroups } = await supabase
        .from('groups')
        .select('*')
        .in('id', myGroupIds.length > 0 ? myGroupIds : ['00000000-0000-0000-0000-000000000000'])
        .order('created_at', { ascending: false })

    // 3. Fetch Featured/Public Groups (excluding ones I'm already in)
    let publicGroupsQuery = supabase
        .from('groups')
        .select('*')
        .eq('is_private', false)

    if (myGroupIds.length > 0) {
        publicGroupsQuery = publicGroupsQuery.not('id', 'in', `(${myGroupIds.join(',')})`)
    }

    const { data: publicGroups } = await publicGroupsQuery
        .limit(6)
        .order('current_members', { ascending: false })

    return <GroupsClient myGroups={myGroups || []} publicGroups={publicGroups || []} />
}

import { createClient } from '@/lib/supabase/server'
import { CalendarWrapper } from '@/components/calendar/CalendarWrapper'

export default async function CalendarPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please login</div>

    // 1. Fetch routines for the calendar dropdown
    const { data: routines } = await supabase
        .from('routines')
        .select('id, name, description_text:description')
        .eq('user_id', user.id)
        .order('name')

    // 2. Fetch plans for the plans tab
    const { data: plans } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <CalendarWrapper
            routines={routines || []}
            userId={user.id}
            plans={plans || []}
        />
    )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NutritionSummary } from '@/components/dashboard/NutritionSummary'

export default async function NutritionPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const today = new Date().toISOString().split('T')[0]

    // Fetch today's nutrition log
    const { data: log } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorded_at', today)
        .single()

    // Default goals (In a real app, these would come from the user's profile/settings)
    // We'll use 2500 kcal as a base for now, but ideally we'd calculate this based on onboarding data.
    const goals = {
        calories: 2500,
        protein: 180,
        carbs: 250,
        fats: 80
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20">
            <NutritionSummary log={log || null} goals={goals} />
        </div>
    )
}

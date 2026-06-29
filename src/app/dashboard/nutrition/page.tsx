import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NutritionSummary } from '@/components/dashboard/NutritionSummary'
import { getWeeklyNutritionStats } from './actions'
import { WeeklyNutritionChart } from '@/components/nutrition/WeeklyNutritionChart'
import { Button } from '@/components/ui/button'
import { MealPhotoUpload } from '@/components/nutrition/MealPhotoUpload'

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

    // Fetch active meal plan
    const { data: activePlanRelation } = await supabase
        .from('user_active_plans')
        .select(`
            *,
            meal_plan:meal_plans(
                *,
                meal_plan_items(
                    *,
                    recipe:recipes(*)
                )
            )
        `)
        .eq('user_id', user.id)
        .single()

    // Fetch weekly stats
    const weeklyLogs = await getWeeklyNutritionStats()

    // Default goals 
    const goals = {
        calories: 2500,
        protein: 180,
        carbs: 250,
        fats: 80
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pb-32 space-y-12">
            <NutritionSummary
                log={log || null}
                goals={goals}
                activePlan={activePlanRelation?.meal_plan || null}
                startDate={activePlanRelation?.start_date || null}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <WeeklyNutritionChart data={weeklyLogs || []} />
                </div>
                <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-black">Meta Semanal</h3>
                    <p className="text-neutral-400 font-medium">Has cumplido con tus objetivos calóricos el 75% de los días esta semana.</p>
                    <div className="pt-4">
                        <Button className="w-full h-12 rounded-2xl bg-white text-neutral-900 font-bold">Ver Reporte Detallado</Button>
                    </div>
                </div>
            </div>

            {/* Meal Photos Gallery */}
            <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-8 md:p-12 shadow-sm">
                <MealPhotoUpload existingImages={log?.meal_images || []} />
            </div>
        </div>
    )
}

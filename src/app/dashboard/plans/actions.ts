'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addDays } from 'date-fns'

export async function createTrainingPlan(data: {
    name: string
    description?: string
    duration_weeks: number
    is_public: boolean
    schedule: Record<string, string> // key: "week-day" (e.g. "1-1"), value: routineId
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // 1. Create Plan
    const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .insert({
            user_id: user.id,
            name: data.name,
            description: data.description,
            duration_weeks: data.duration_weeks,
            is_public: data.is_public
        })
        .select()
        .single()

    if (planError) {
        console.error('Error creating plan:', planError)
        throw new Error('Failed to create training plan')
    }

    // 2. Create Plan Routines
    const scheduleEntries = Object.entries(data.schedule).map(([key, routineId]) => {
        const [week, day] = key.split('-').map(Number)
        return {
            plan_id: plan.id,
            routine_id: routineId,
            week_number: week,
            day_of_week: day
        }
    })

    if (scheduleEntries.length > 0) {
        const { error: routinesError } = await supabase
            .from('training_plan_routines')
            .insert(scheduleEntries)

        if (routinesError) {
            console.error('Error adding routines to plan:', routinesError)
            // Should probably delete the plan or warn user
            throw new Error('Failed to add routines to plan')
        }
    }

    revalidatePath('/dashboard/plans')
    redirect('/dashboard/plans')
}

export async function assignPlanToCalendar(planId: string, startDate: Date) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // 1. Fetch Plan Details and Routines
    const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .select(`
            *,
            training_plan_routines (
                week_number,
                day_of_week,
                routine_id
            )
        `)
        .eq('id', planId)
        .single()

    if (planError || !plan) throw new Error('Plan not found')

    // 2. Calculate Dates and Create Scheduled Routines
    const scheduledRoutines = []

    // Normalize start date to Monday of that week? 
    // Usually people want "Start Date" to be Week 1, Day 1.
    // If Day 1 is Monday, and user picks a Wednesday, do we start Week 1 Day 1 on Wednesday?
    // Or do we align with the week? 
    // Simpler approach: startDate IS Week 1, Day 1.
    // So Week W, Day D is: startDate + (W-1)*7 + (D-1) days.

    // We assume training_plan_routines.day_of_week is 1..7

    for (const item of plan.training_plan_routines) {
        const weeksToAdd = item.week_number - 1
        const daysToAdd = item.day_of_week - 1
        const totalDaysToAdd = (weeksToAdd * 7) + daysToAdd

        const scheduledDate = addDays(startDate, totalDaysToAdd)

        scheduledRoutines.push({
            user_id: user.id,
            routine_id: item.routine_id,
            plan_id: plan.id,
            scheduled_date: scheduledDate.toISOString(),
            status: 'pending'
        })
    }

    if (scheduledRoutines.length > 0) {
        const { error: insertError } = await supabase
            .from('scheduled_routines')
            .insert(scheduledRoutines)

        if (insertError) {
            console.error('Error scheduling plan:', insertError)
            throw new Error('Failed to schedule plan')
        }
    }

    revalidatePath('/dashboard/calendar')
    return { success: true }
}

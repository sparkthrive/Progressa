'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { recipeSchema, mealPlanSchema } from '@/lib/validations/nutrition'

// Recipes Actions
export async function createRecipe(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const validatedData = recipeSchema.parse(data)

    const { data: recipe, error } = await supabase
        .from('recipes')
        .insert({
            ...validatedData,
            user_id: user.id
        })
        .select()
        .single()

    if (error) {
        console.error(error)
        throw new Error('Failed to create recipe')
    }

    revalidatePath('/dashboard/nutrition/recipes')
    return recipe
}

export async function updateRecipe(id: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const validatedData = recipeSchema.parse(data)

    const { data: recipe, error } = await supabase
        .from('recipes')
        .update(validatedData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error(error)
        throw new Error('Failed to update recipe')
    }

    revalidatePath('/dashboard/nutrition/recipes')
    return recipe
}

export async function deleteRecipe(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error(error)
        throw new Error('Failed to delete recipe')
    }

    revalidatePath('/dashboard/nutrition/recipes')
}

// Meal Plan Actions
export async function createMealPlan(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const validatedData = mealPlanSchema.parse(data)

    const { data: plan, error } = await supabase
        .from('meal_plans')
        .insert({
            ...validatedData,
            user_id: user.id
        })
        .select()
        .single()

    if (error) {
        console.error(error)
        throw new Error('Failed to create meal plan')
    }

    revalidatePath('/dashboard/nutrition/plans')
    return plan
}

export async function addMealPlanItem(data: {
    meal_plan_id: string
    day_number: number
    meal_category: string
    meal_time?: string
    recipe_id?: string
    notes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('meal_plan_items')
        .insert({
            ...data
        })

    if (error) {
        console.error(error)
        throw new Error('Failed to add meal plan item')
    }

    revalidatePath(`/dashboard/nutrition/plans/${data.meal_plan_id}`)
}

export async function activateMealPlan(mealPlanId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Using upsert on user_id context
    const { error } = await supabase
        .from('user_active_plans')
        .upsert({
            user_id: user.id,
            meal_plan_id: mealPlanId,
            start_date: new Date().toISOString().split('T')[0]
        }, { onConflict: 'user_id' })

    if (error) {
        console.error(error)
        throw new Error('Failed to activate meal plan')
    }

    revalidatePath('/dashboard/nutrition')
}

export async function logPlannedMeal(data: {
    calories: number
    protein: number
    carbs: number
    fats: number
    recorded_at: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get current log
    const { data: currentLog } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorded_at', data.recorded_at)
        .single()

    const newLog = {
        user_id: user.id,
        recorded_at: data.recorded_at,
        calories: (currentLog?.calories || 0) + data.calories,
        protein: Number(currentLog?.protein || 0) + data.protein,
        carbs: Number(currentLog?.carbs || 0) + data.carbs,
        fats: Number(currentLog?.fats || 0) + data.fats
    }

    const { error } = await supabase
        .from('nutrition_logs')
        .upsert(newLog, { onConflict: 'user_id, recorded_at' })

    if (error) {
        console.error(error)
        throw new Error('Failed to log meal')
    }

    revalidatePath('/dashboard/nutrition')
}

export async function upsertNutritionLog(data: {
    recorded_at: string
    calories: number
    protein: number
    carbs: number
    fats: number
    water_ml?: number
    notes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('nutrition_logs')
        .upsert({
            user_id: user.id,
            ...data
        }, { onConflict: 'user_id, recorded_at' })

    if (error) {
        console.error(error)
        throw new Error('Failed to save nutrition log')
    }

    revalidatePath('/dashboard/nutrition')
    redirect('/dashboard/nutrition')
}

export async function getWeeklyNutritionStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    const { data: logs, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate)
        .order('recorded_at', { ascending: true })

    if (error) {
        console.error(error)
        throw new Error('Failed to fetch weekly stats')
    }

    return logs
}

export async function uploadMealPhoto(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const file = formData.get('file') as File
    const today = new Date().toISOString().split('T')[0]

    // 1. Upload to storage
    const path = `${user.id}/${today}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('nutrition')
        .upload(path, file)

    if (uploadError) {
        console.error(uploadError)
        throw new Error('Failed to upload image')
    }

    const { data: { publicUrl } } = supabase.storage
        .from('nutrition')
        .getPublicUrl(path)

    // 2. Get current nutrition log
    const { data: currentLog } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorded_at', today)
        .single()

    const currentImages = currentLog?.meal_images || []
    const updatedImages = [...currentImages, publicUrl]

    // 3. Update log
    const { error: updateError } = await supabase
        .from('nutrition_logs')
        .upsert({
            user_id: user.id,
            recorded_at: today,
            meal_images: updatedImages
        }, { onConflict: 'user_id, recorded_at' })

    if (updateError) {
        console.error(updateError)
        throw new Error('Failed to update nutrition log with image')
    }

    revalidatePath('/dashboard/nutrition')
    return { url: publicUrl }
}

export async function deleteMealPhoto(photoUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const today = new Date().toISOString().split('T')[0]

    // 1. Get current log to update images array
    const { data: currentLog } = await supabase
        .from('nutrition_logs')
        .select('meal_images')
        .eq('user_id', user.id)
        .eq('recorded_at', today)
        .single()

    if (!currentLog) return

    const updatedImages = (currentLog.meal_images || []).filter((url: string) => url !== photoUrl)

    // 2. Update database
    const { error: updateError } = await supabase
        .from('nutrition_logs')
        .update({ meal_images: updatedImages })
        .eq('user_id', user.id)
        .eq('recorded_at', today)

    if (updateError) throw new Error('Failed to update nutrition log')

    // 3. Optional: Delete from storage (extra credit)
    // We'd need to parse the path from the URL, which is a bit messy with getPublicUrl
    // For now, removing it from the DB is the primary goal.

    revalidatePath('/dashboard/nutrition')
}


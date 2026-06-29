'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.session) {
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    // No session means email confirmation is required
    redirect('/login?message=check_email')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function loginWithProvider(provider: 'google' | 'apple' | 'facebook' | 'azure', origin: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}


export async function completeOnboarding(data: {
    goal: string,
    level: string,
    age: string,
    weight: string,
    height: string,
    gender: string,
    frequency: string,
    equipment: string[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("No user found")

    // Update user profile
    const { error: profileError } = await supabase
        .from('users')
        .update({
            experience_level: data.level,
            goals: [data.goal],
        })
        .eq('id', user.id)

    if (profileError) return { error: profileError.message }

    // Save initial metrics
    const { error: metricsError } = await supabase
        .from('user_metrics')
        .insert({
            user_id: user.id,
            weight_kg: parseFloat(data.weight),
            height_cm: parseFloat(data.height),
            recorded_at: new Date().toISOString()
        })

    if (metricsError) return { error: metricsError.message }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function updateUserProfile(data: {
    fullName?: string,
    username?: string,
    avatarUrl?: string,
    experienceLevel?: string,
    goals?: string[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("No user found")

    const updates: any = {}
    if (data.fullName !== undefined) updates.full_name = data.fullName
    if (data.username !== undefined) updates.username = data.username
    if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl
    if (data.experienceLevel !== undefined) updates.experience_level = data.experienceLevel
    if (data.goals !== undefined) updates.goals = data.goals

    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    return { success: true }
}

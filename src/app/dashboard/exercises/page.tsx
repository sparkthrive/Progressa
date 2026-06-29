import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExercisesClientPage } from '@/components/exercises/ExercisesClientPage'
import { getUserEquipment, getUserFavorites } from './actions'

export default async function ExerciseLibraryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all exercises
    const { data: exercises } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })

    // Fetch user's favorites
    const favorites = await getUserFavorites()

    // Fetch user's equipment
    const userEquipment = await getUserEquipment()

    return (
        <ExercisesClientPage
            exercises={exercises || []}
            favorites={favorites}
            userEquipment={userEquipment}
        />
    )
}

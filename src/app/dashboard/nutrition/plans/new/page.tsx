import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MealPlanBuilder } from '@/components/nutrition/MealPlanBuilder'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewMealPlanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-32">
            <div className="mb-10">
                <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent text-neutral-500 mb-4">
                    <Link href="/dashboard/nutrition/plans">
                        <ChevronLeft className="h-4 w-4" /> Volver a Mis Planes
                    </Link>
                </Button>
            </div>

            <MealPlanBuilder />
        </div>
    )
}

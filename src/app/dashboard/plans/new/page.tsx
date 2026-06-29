import { createClient } from '@/lib/supabase/server'
import { PlanEditor } from '@/components/plans/PlanEditor'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Dumbbell, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewPlanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch routines for dropdown
    const { data: routines } = await supabase
        .from('routines')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name')

    if (!routines || routines.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 bg-neutral-50/50 dark:bg-neutral-900/10">
                <div className="h-20 w-20 rounded-full bg-neutral-100 p-6 dark:bg-neutral-800 mb-6 flex items-center justify-center">
                    <Dumbbell className="h-10 w-10 text-neutral-300" />
                </div>
                <CardTitle className="text-2xl font-bold">Necesitas Rutinas</CardTitle>
                <CardDescription className="max-w-xs mt-3 text-base">
                    Antes de crear un plan, necesitas tener al menos una rutina creada.
                </CardDescription>
                <Button asChild className="mt-8 px-8" variant="default">
                    <Link href="/dashboard/routines/new">Crear Rutina</Link>
                </Button>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Nuevo Plan</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Diseña un calendario de entrenamiento personalizado.</p>
            </div>

            <PlanEditor routines={routines} />
        </div>
    )
}

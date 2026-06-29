import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Dumbbell } from 'lucide-react'
import { RoutineCard } from '@/components/routines/RoutineCard'

export default async function RoutinesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: routines } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises(
            id,
            exercises(name, muscle_group)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">Mis Rutinas</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Gestiona y personaliza tus planes de entrenamiento.</p>
                </div>
                <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200">
                    <Link href="/dashboard/routines/new" className="gap-2">
                        <Plus className="h-4 w-4" /> Nueva Rutina
                    </Link>
                </Button>
            </div>

            {!routines || routines.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 bg-neutral-50/50 dark:bg-neutral-900/10">
                    <div className="h-20 w-20 rounded-full bg-neutral-100 p-6 dark:bg-neutral-800 mb-6 flex items-center justify-center">
                        <Dumbbell className="h-10 w-10 text-neutral-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold">No tienes rutinas aún</CardTitle>
                    <CardDescription className="max-w-xs mt-3 text-base">
                        Diseña tu primer entrenamiento personalizado y empieza a alcanzar tus metas hoy mismo.
                    </CardDescription>
                    <Button asChild className="mt-8 px-8" variant="default">
                        <Link href="/dashboard/routines/new">Empezar a crear</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {routines.map((routine) => (
                        <RoutineCard key={routine.id} routine={routine} />
                    ))}
                </div>
            )}
        </div>
    )
}

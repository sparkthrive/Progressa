import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PlanCard } from '@/components/plans/PlanCard'

export default async function PlansPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: plans } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">Planes de Entrenamiento</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Estructura tus rutinas en planes a largo plazo.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/plans/new">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Plan
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans?.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}

                {(!plans || plans.length === 0) && (
                    <div className="col-span-full py-12 text-center text-neutral-500 border-2 border-dashed rounded-xl">
                        No tienes planes creados. ¡Crea el primero!
                    </div>
                )}
            </div>
        </div>
    )
}

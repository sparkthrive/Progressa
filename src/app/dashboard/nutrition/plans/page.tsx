import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Plus,
    ClipboardList,
    ChevronLeft,
    Calendar,
    Clock,
    TrendingUp,
    MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ActivatePlanButton } from '@/components/nutrition/ActivatePlanButton'

export default async function MealPlansPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: plans } = await supabase
        .from('meal_plans')
        .select(`
            *,
            meal_plan_items(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-7xl mx-auto px-4 pb-32 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent text-neutral-500">
                        <Link href="/dashboard/nutrition">
                            <ChevronLeft className="h-4 w-4" /> Volver a Nutrición
                        </Link>
                    </Button>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Mis Planes</h1>
                    <p className="text-neutral-500 font-medium">Crea dietas flexibles y organízate sin límites.</p>
                </div>

                <Button asChild className="h-14 px-8 rounded-2xl gap-2 font-bold bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 shadow-xl shadow-neutral-200 dark:shadow-none">
                    <Link href="/dashboard/nutrition/plans/new">
                        <Plus className="h-5 w-5" /> Nuevo Plan
                    </Link>
                </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!plans || plans.length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mb-6 -rotate-6">
                            <ClipboardList className="h-10 w-10 text-neutral-200" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Aún no tienes planes</h2>
                        <p className="text-neutral-500 max-w-sm mb-8">Crea tu primera dieta flexible y organiza todas tus comidas de la semana.</p>
                        <Button asChild className="rounded-2xl h-12 px-8 font-bold">
                            <Link href="/dashboard/nutrition/plans/new">Comenzar mi primer plan</Link>
                        </Button>
                    </div>
                ) : (
                    plans.map((plan) => (
                        <Card key={plan.id} className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-none font-black text-[9px] uppercase tracking-widest px-2">
                                            {plan.duration_days} Días
                                        </Badge>
                                        <h3 className="text-2xl font-black">{plan.name}</h3>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-xl">
                                        <MoreVertical className="h-5 w-5 text-neutral-400" />
                                    </Button>
                                </div>

                                <p className="text-sm text-neutral-500 line-clamp-2 min-h-[2.5rem]">
                                    {plan.description || 'Sin descripción adicional'}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Comidas Totales</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <span className="font-bold text-lg">{plan.meal_plan_items?.[0]?.count || 0}</span>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Estado</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${plan.is_active ? 'bg-green-500 animate-pulse' : 'bg-neutral-300'}`} />
                                            <span className="font-bold text-xs">{plan.is_active ? 'Activo' : 'Inactivo'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button asChild className="flex-1 rounded-2xl h-12 font-bold bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900">
                                        <Link href={`/dashboard/nutrition/plans/${plan.id}`}>Gestionar</Link>
                                    </Button>
                                    <ActivatePlanButton planId={plan.id} isActive={plan.is_active} />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

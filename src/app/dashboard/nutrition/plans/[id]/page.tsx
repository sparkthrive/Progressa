import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PlanItemManager } from '@/components/nutrition/PlanItemManager'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Info, Settings, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Plan Details
    const { data: plan } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!plan) notFound()

    // 2. Fetch Plan Items
    const { data: items } = await supabase
        .from('meal_plan_items')
        .select(`
            *,
            recipe:recipes(*)
        `)
        .eq('meal_plan_id', id)
        .order('day_number', { ascending: true })
        .order('meal_time', { ascending: true })

    // 3. Fetch Available Recipes for selection
    const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

    return (
        <div className="max-w-7xl mx-auto px-4 pb-32 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent text-neutral-500">
                        <Link href="/dashboard/nutrition/plans">
                            <ChevronLeft className="h-4 w-4" /> Volver a Mis Planes
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-500 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                                {plan.duration_days} Días
                            </Badge>
                            {plan.is_active && (
                                <Badge className="bg-green-500 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 animate-pulse">
                                    Plan Activo
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">{plan.name}</h1>
                        <p className="text-neutral-500 font-medium max-w-2xl">{plan.description || 'Sin descripción adicional.'}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 font-bold border-2">
                        <Settings className="h-5 w-5" /> Ajustes
                    </Button>
                </div>
            </div>

            {/* Quick Stats / Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CardInfo
                    icon={Calendar}
                    label="Días Programados"
                    value={`${plan.duration_days} días`}
                    color="text-blue-500"
                    bg="bg-blue-50 dark:bg-blue-900/20"
                />
                <CardInfo
                    icon={Info}
                    label="Comidas Registradas"
                    value={`${items?.length || 0} de ${plan.duration_days * 5} sugeridas`}
                    color="text-amber-500"
                    bg="bg-amber-50 dark:bg-amber-900/20"
                />
            </div>

            {/* Plan Manager */}
            <PlanItemManager
                planId={id}
                days={plan.duration_days}
                items={items || []}
                recipes={recipes || []}
            />
        </div>
    )
}

function CardInfo({ icon: Icon, label, value, color, bg }: any) {
    return (
        <div className={`p-6 rounded-[2.5rem] ${bg} flex items-center gap-4`}>
            <div className={`h-12 w-12 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</p>
                <p className="text-lg font-black">{value}</p>
            </div>
        </div>
    )
}

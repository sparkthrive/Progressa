import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ShoppingBasket,
    ChevronLeft,
    Printer,
    Share2,
    Calendar,
    CheckCircle2,
    Circle
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function ShoppingListPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Active Plan with items and recipes
    const { data: activePlanRelation } = await supabase
        .from('user_active_plans')
        .select(`
            *,
            meal_plan:meal_plans(
                *,
                meal_plan_items(
                    *,
                    recipe:recipes(*)
                )
            )
        `)
        .eq('user_id', user.id)
        .single()

    const plan = activePlanRelation?.meal_plan
    const items = plan?.meal_plan_items || []

    // 2. Aggregate Ingredients
    const ingredientsMap: Record<string, string[]> = {}
    items.forEach((item: any) => {
        if (item.recipe?.ingredients) {
            item.recipe.ingredients.forEach((ing: any) => {
                const name = ing.item.toLowerCase()
                if (!ingredientsMap[name]) {
                    ingredientsMap[name] = []
                }
                ingredientsMap[name].push(ing.amount)
            })
        }
    })

    const aggregatedIngredients = Object.entries(ingredientsMap).map(([name, amounts]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amounts: amounts.join(' + ')
    }))

    return (
        <div className="max-w-4xl mx-auto px-4 pb-32 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent text-neutral-500">
                        <Link href="/dashboard/nutrition">
                            <ChevronLeft className="h-4 w-4" /> Volver a Nutrición
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Lista de Compras</h1>
                        <p className="text-neutral-500 font-medium">Todos los ingredientes necesarios para tu plan "{plan?.name || 'activo'}".</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 font-bold border-2">
                        <Printer className="h-5 w-5" /> Imprimir
                    </Button>
                </div>
            </div>

            {!plan ? (
                <Card className="border-none bg-neutral-50 dark:bg-neutral-800/50 rounded-[3rem] p-12 text-center">
                    <ShoppingBasket className="h-16 w-16 text-neutral-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-2">No tienes un plan activo</h2>
                    <p className="text-neutral-500 mb-8 max-w-sm mx-auto">Activa un plan de alimentación para generar automáticamente tu lista de compras.</p>
                    <Button asChild className="rounded-2xl h-12 px-8 font-bold">
                        <Link href="/dashboard/nutrition/plans">Ir a Mis Planes</Link>
                    </Button>
                </Card>
            ) : (
                <div className="space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                            {aggregatedIngredients.length} Artículos
                        </Badge>
                        <p className="text-sm text-neutral-400 font-bold font-mono uppercase tracking-[0.2em]">Basado en {plan.duration_days} días</p>
                    </div>

                    <Card className="border-none bg-white dark:bg-neutral-900 rounded-[3rem] shadow-sm overflow-hidden p-10">
                        <div className="grid gap-4">
                            {aggregatedIngredients.map((ing, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-5 rounded-3xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-100 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-neutral-200 group-hover:text-primary transition-colors">
                                            <Circle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-neutral-900 dark:text-neutral-100">{ing.name}</p>
                                            <p className="text-xs font-medium text-neutral-400">Total: {ing.amounts}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100">
                                        <Share2 className="h-4 w-4 text-neutral-300" />
                                    </Button>
                                </div>
                            ))}

                            {aggregatedIngredients.length === 0 && (
                                <div className="py-20 text-center text-neutral-400">
                                    El plan no contiene recetas o ingredientes válidos.
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">Planifica tu supermercado</h3>
                            <p className="text-neutral-400 font-medium">Exporta esta lista a PDF o compártela por WhatsApp para mayor comodidad.</p>
                        </div>
                        <Button className="h-14 px-10 rounded-2xl bg-white text-neutral-900 font-black shadow-xl shadow-white/10">
                            Compartir Lista
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

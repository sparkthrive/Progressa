"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Plus,
    Trash2,
    ChefHat,
    Clock,
    UtensilsCrossed,
    Search,
    X,
    Loader2
} from 'lucide-react'
import { addMealPlanItem, deleteMealPlanItem } from '@/app/dashboard/nutrition/actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PlanItemManagerProps {
    planId: string
    days: number
    items: any[]
    recipes: any[]
}

export function PlanItemManager({ planId, days, items, recipes }: PlanItemManagerProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddItem = async (day: number, category: string, recipeId: string) => {
        setIsPending(true)
        try {
            await addMealPlanItem({
                meal_plan_id: planId,
                day_number: day,
                meal_category: category,
                recipe_id: recipeId
            })
            toast.success('Comida añadida al plan')
            router.refresh()
        } catch (error) {
            toast.error('Error al añadir comida')
        } finally {
            setIsPending(false)
        }
    }

    const handleDeleteItem = async (id: string) => {
        try {
            await deleteMealPlanItem(id)
            router.refresh()
        } catch (error) {
            toast.error('Error al eliminar')
        }
    }

    const categories = ['Desayuno', 'Media Mañana', 'Comida', 'Merienda', 'Cena', 'Snack']

    return (
        <div className="space-y-12">
            {[...Array(days)].map((_, i) => {
                const dayNumber = i + 1
                const dayItems = items.filter(item => item.day_number === dayNumber)

                return (
                    <div key={dayNumber} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-12 w-12 rounded-2xl bg-neutral-900 border-4 border-white shadow-xl dark:border-neutral-950 flex items-center justify-center text-white font-black text-xl">
                                {dayNumber}
                            </div>
                            <h3 className="text-2xl font-black">Día {dayNumber}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dayItems.map(item => (
                                <Card key={item.id} className="border-none bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm overflow-hidden group">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-1">
                                                <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-2">
                                                    {item.meal_category}
                                                </Badge>
                                                <h4 className="text-xl font-black leading-tight">{item.recipe?.name}</h4>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="h-8 w-8 rounded-full text-neutral-300 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-6 text-neutral-400">
                                            <div className="flex items-center gap-1.5">
                                                <ChefHat className="h-4 w-4" />
                                                <span className="text-xs font-bold">{item.recipe?.calories} kcal</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-xs font-bold">{item.recipe?.prep_time_minutes || 0}'</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add Item Trigger */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="h-full min-h-[160px] rounded-[2.5rem] border-2 border-dashed border-neutral-100 dark:border-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-all group flex flex-col items-center justify-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-primary group-hover:scale-110 transition-all">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-bold text-neutral-400 group-hover:text-primary">Añadir Comida</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-[3rem] p-0 border-none">
                                    <div className="p-8 border-b border-neutral-50 dark:border-neutral-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black">Añadir al Día {dayNumber}</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <Button
                                                    key={cat}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-full text-[10px] font-black uppercase tracking-widest bg-neutral-50 dark:bg-neutral-800"
                                                >
                                                    {cat}
                                                </Button>
                                            ))}
                                        </div>
                                        <div className="mt-6 relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                            <Input
                                                placeholder="Buscar receta..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="h-12 pl-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 space-y-3 custom-scrollbar">
                                        {filteredRecipes.map(recipe => (
                                            <button
                                                key={recipe.id}
                                                onClick={() => handleAddItem(dayNumber, 'Comida', recipe.id)}
                                                className="w-full flex items-center justify-between p-4 rounded-3xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-700/50 flex items-center justify-center overflow-hidden">
                                                        {recipe.image_url ? (
                                                            <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ChefHat className="h-6 w-6 text-neutral-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{recipe.name}</p>
                                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{recipe.calories} kcal • {recipe.protein}g P</p>
                                                    </div>
                                                </div>
                                                <Plus className="h-5 w-5 text-neutral-200 group-hover:text-primary transition-colors" />
                                            </button>
                                        ))}
                                        {filteredRecipes.length === 0 && (
                                            <div className="py-12 text-center text-neutral-400 font-medium">
                                                No se encontraron recetas.
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

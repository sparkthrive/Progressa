import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Plus,
    ChefHat,
    ChevronLeft,
    BookOpen,
    Calendar,
    Search,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RecipeEditor } from '@/components/nutrition/RecipeEditor'
import { Badge } from '@/components/ui/badge'

export default async function RecipesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
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
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Mi Recetario</h1>
                    <p className="text-neutral-500 font-medium">Guarda tus platillos favoritos con sus macros e instrucciones.</p>
                </div>

                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-8 rounded-2xl gap-2 font-bold bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 shadow-xl shadow-neutral-200 dark:shadow-none">
                                <Plus className="h-5 w-5" /> Nueva Receta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 border-none scrollbar-hide">
                            <DialogHeader className="mb-6">
                                <DialogTitle className="text-3xl font-black">Crear Receta</DialogTitle>
                            </DialogHeader>
                            <RecipeEditor />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick Filters/Links */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-neutral-900 dark:group-focus-within:text-neutral-100 transition-colors" />
                    <input
                        placeholder="Buscar en mis recetas..."
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 focus:ring-2 ring-neutral-200 dark:ring-neutral-700 outline-none font-medium transition-all"
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 font-bold border-2">
                    <BookOpen className="h-5 w-5" /> Explorar Públicas
                </Button>
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {!recipes || recipes.length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mb-6 rotate-12">
                            <ChefHat className="h-10 w-10 text-neutral-200" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No tienes recetas aún</h2>
                        <p className="text-neutral-500 max-w-sm mb-8">Comienza guardando tus platillos favoritos para incluirlos en tus planes de alimentación.</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="rounded-2xl h-12 px-8 font-bold">Crear mi primera receta</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 border-none scrollbar-hide">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-3xl font-black">Crear mi primera receta</DialogTitle>
                                </DialogHeader>
                                <RecipeEditor />
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    recipes.map((recipe) => (
                        <Card key={recipe.id} className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                            <CardContent className="p-0">
                                <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                                    {recipe.image_url ? (
                                        <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-200">
                                            <ChefHat className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-black/50 backdrop-blur-md text-white border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                                            {recipe.calories} kcal
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-1 truncate">{recipe.name}</h3>
                                    <p className="text-xs text-neutral-400 mb-4 line-clamp-2 min-h-[2rem]">{recipe.description || 'Sin descripción'}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-neutral-50 dark:border-neutral-800/50">
                                        <div className="flex gap-3">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-tighter">Prot</p>
                                                <p className="text-xs font-bold">{recipe.protein}g</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-tighter">Carb</p>
                                                <p className="text-xs font-bold">{recipe.carbs}g</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-tighter">Fat</p>
                                                <p className="text-xs font-bold">{recipe.fats}g</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-neutral-400">
                                            <Clock className="h-3 w-3" />
                                            <span className="text-[10px] font-bold">{recipe.prep_time_minutes || 0}'</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

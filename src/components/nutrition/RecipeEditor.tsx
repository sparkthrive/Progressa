'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Plus,
    Trash2,
    ChefHat,
    Clock,
    Flame,
    Dumbbell,
    Carrot,
    Beef,
    Save,
    X,
    Image as ImageIcon
} from 'lucide-react'
import { createRecipe, updateRecipe } from '@/app/dashboard/nutrition/actions'
import { useRouter } from 'next/navigation'

interface RecipeEditorProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export function RecipeEditor({ initialData, onSuccess, onCancel }: RecipeEditorProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        calories: initialData?.calories || 0,
        protein: initialData?.protein || 0,
        carbs: initialData?.carbs || 0,
        fats: initialData?.fats || 0,
        prep_time_minutes: initialData?.prep_time_minutes || 0,
        instructions: initialData?.instructions || '',
        image_url: initialData?.image_url || '',
        is_public: initialData?.is_public || false,
        ingredients: initialData?.ingredients || [{ item: '', amount: '' }]
    })

    const handleAddIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { item: '', amount: '' }]
        }))
    }

    const handleRemoveIngredient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_: any, i: number) => i !== index)
        }))
    }

    const handleUpdateIngredient = (index: number, field: string, value: string) => {
        const newIngredients = [...formData.ingredients]
        newIngredients[index] = { ...newIngredients[index], [field]: value }
        setFormData(prev => ({ ...prev, ingredients: newIngredients }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        try {
            if (initialData?.id) {
                await updateRecipe(initialData.id, formData)
            } else {
                await createRecipe(formData)
            }
            router.refresh()
            onSuccess?.()
        } catch (error) {
            console.error(error)
            alert('Error al guardar la receta')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-3xl border border-orange-100 dark:border-orange-900/50">
                    <div className="flex items-center gap-2 mb-1 text-orange-600 dark:text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Calorías</span>
                    </div>
                    <Input
                        type="number"
                        value={formData.calories}
                        onChange={e => setFormData(p => ({ ...p, calories: Number(e.target.value) }))}
                        className="bg-transparent border-none p-0 h-8 text-xl font-black focus-visible:ring-0"
                    />
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
                        <Beef className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Proteína</span>
                    </div>
                    <Input
                        type="number"
                        value={formData.protein}
                        onChange={e => setFormData(p => ({ ...p, protein: Number(e.target.value) }))}
                        className="bg-transparent border-none p-0 h-8 text-xl font-black focus-visible:ring-0"
                    />
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-3xl border border-green-100 dark:border-green-900/50">
                    <div className="flex items-center gap-2 mb-1 text-green-600 dark:text-green-400">
                        <Carrot className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Carbs</span>
                    </div>
                    <Input
                        type="number"
                        value={formData.carbs}
                        onChange={e => setFormData(p => ({ ...p, carbs: Number(e.target.value) }))}
                        className="bg-transparent border-none p-0 h-8 text-xl font-black focus-visible:ring-0"
                    />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-3xl border border-yellow-100 dark:border-yellow-900/50">
                    <div className="flex items-center gap-2 mb-1 text-yellow-600 dark:text-yellow-400">
                        <Dumbbell className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Grasas</span>
                    </div>
                    <Input
                        type="number"
                        value={formData.fats}
                        onChange={e => setFormData(p => ({ ...p, fats: Number(e.target.value) }))}
                        className="bg-transparent border-none p-0 h-8 text-xl font-black focus-visible:ring-0"
                    />
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Nombre del Platillo</Label>
                    <Input
                        placeholder="Ej. Pollo con Arroz y Brócoli"
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="h-14 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 focus:ring-2 ring-neutral-200 dark:ring-neutral-700 font-bold text-lg"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Tiempo Preparación (min)</Label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                type="number"
                                value={formData.prep_time_minutes}
                                onChange={e => setFormData(p => ({ ...p, prep_time_minutes: Number(e.target.value) }))}
                                className="h-12 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 pl-12 font-bold"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">URL de Imagen (Opcional)</Label>
                        <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="https://..."
                                value={formData.image_url}
                                onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
                                className="h-12 rounded-2xl border-none bg-neutral-100 dark:bg-neutral-800 pl-12 font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ingredients Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400">Ingredientes</h3>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddIngredient}
                        className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest gap-2 bg-neutral-100 dark:bg-neutral-800"
                    >
                        <Plus className="h-3 w-3" /> Añadir Ingrediente
                    </Button>
                </div>
                <div className="space-y-3">
                    {formData.ingredients.map((ing: any, index: number) => (
                        <div key={index} className="flex gap-3 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                            <Input
                                placeholder="Cantidad (ej. 200g)"
                                value={ing.amount}
                                onChange={e => handleUpdateIngredient(index, 'amount', e.target.value)}
                                className="flex-[0.4] h-12 rounded-2xl border-none bg-neutral-50 dark:bg-neutral-900 font-medium"
                            />
                            <Input
                                placeholder="Ingrediente (ej. Pechuga de Pollo)"
                                value={ing.item}
                                onChange={e => handleUpdateIngredient(index, 'item', e.target.value)}
                                className="flex-1 h-12 rounded-2xl border-none bg-neutral-50 dark:bg-neutral-900 font-medium"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveIngredient(index)}
                                className="h-12 w-12 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preparation Steps */}
            <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Preparación y Pasos</Label>
                <textarea
                    value={formData.instructions}
                    onChange={e => setFormData(p => ({ ...p, instructions: e.target.value }))}
                    placeholder="Describe los pasos para preparar este platillo..."
                    className="w-full min-h-[200px] p-6 rounded-3xl border-none bg-neutral-100 dark:bg-neutral-800 focus:ring-2 ring-neutral-200 dark:ring-neutral-700 transition-all outline-none font-medium text-sm leading-relaxed"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md pb-4 z-10">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 h-14 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold text-lg gap-2 shadow-xl shadow-neutral-200 dark:shadow-none"
                >
                    <Save className="h-5 w-5" />
                    {isPending ? 'Guardando...' : 'Guardar Receta'}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="h-14 px-8 rounded-2xl font-bold border-2"
                    >
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    )
}

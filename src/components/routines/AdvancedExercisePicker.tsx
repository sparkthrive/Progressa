'use client'

import { useState, useMemo, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Minus, Filter, Info } from 'lucide-react'
import { ExerciseFilterPanel } from '@/components/exercises/ExerciseFilterPanel'
import { ExerciseFilters, Exercise } from '@/types/exercise-filters'
import { getExercises } from '@/app/dashboard/routines/actions'
import { Badge } from '@/components/ui/badge'

import { getUserEquipment, getUserFavorites } from '@/app/dashboard/exercises/actions'

interface AdvancedExercisePickerProps {
    onSelect: (exercise: Exercise) => void
    onRemove?: (id: string) => void
    selectedIds: string[]
}

export function AdvancedExercisePicker({ onSelect, onRemove, selectedIds }: AdvancedExercisePickerProps) {
    const [open, setOpen] = useState(false)
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [favorites, setFavorites] = useState<string[]>([])
    const [userEquipment, setUserEquipment] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<ExerciseFilters>({})

    useEffect(() => {
        if (open) {
            loadData()
        }
    }, [open])

    async function loadData() {
        setLoading(true)
        try {
            const [exData, favData, eqData] = await Promise.all([
                getExercises(),
                getUserFavorites(),
                getUserEquipment()
            ])
            setExercises(exData)
            setFavorites(favData)
            setUserEquipment(eqData)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filteredExercises = useMemo(() => {
        return exercises.filter(exercise => {
            // Search filter
            if (searchQuery && !exercise.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }

            // Favorites filter
            if (filters.favoritesOnly && !favorites.includes(exercise.id)) {
                return false
            }

            // Discipline filter
            if (filters.disciplines && filters.disciplines.length > 0) {
                if (!exercise.discipline || !filters.disciplines.includes(exercise.discipline as any)) {
                    return false
                }
            }

            // Muscle group filter
            if (filters.muscleGroups && filters.muscleGroups.length > 0) {
                if (!filters.muscleGroups.includes(exercise.muscle_group as any)) {
                    return false
                }
            }

            // Equipment filter
            if (filters.equipment && filters.equipment.length > 0) {
                if (!exercise.equipment_required || !filters.equipment.some(eq => exercise.equipment_required?.includes(eq))) {
                    return false
                }
            }

            // Only my equipment filter
            if (filters.onlyMyEquipment && userEquipment.length > 0) {
                if (!exercise.equipment_required || !exercise.equipment_required.every(eq => userEquipment.includes(eq))) {
                    return false
                }
            }

            // Difficulty filter
            if (filters.difficulty && exercise.difficulty_level !== filters.difficulty) {
                return false
            }

            return true
        })
    }, [exercises, filters, searchQuery, favorites, userEquipment])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-14 border-dashed border-2 hover:border-neutral-400 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/10 gap-2 font-bold text-neutral-500">
                    <Plus className="h-5 w-5" /> Agregar Ejercicio...
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl font-black">Seleccionar Ejercicios</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Filters */}
                    <aside className="w-80 border-r p-6 overflow-y-auto hidden md:block">
                        <ExerciseFilterPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                            userEquipment={userEquipment}
                        />
                    </aside>

                    {/* Main List Area */}
                    <main className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 border-b space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Buscar ejercicio..."
                                    className="pl-10 h-11"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm text-neutral-500">
                                <span>{filteredExercises.length} ejercicios encontrados</span>
                                {Object.keys(filters).length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="h-7 px-2 text-xs">
                                        Limpiar filtros
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <div key={`skeleton-${i}`} className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                                    ))
                                ) : filteredExercises.length === 0 ? (
                                    <div className="col-span-full py-20 text-center">
                                        <p className="text-neutral-500 font-medium">No se encontraron ejercicios con estos filtros.</p>
                                    </div>
                                ) : (
                                    filteredExercises.map((exercise) => {
                                        const isSelected = selectedIds.includes(exercise.id)
                                        return (
                                            <div
                                                key={exercise.id}
                                                className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 ${isSelected
                                                    ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900'
                                                    : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'
                                                    }`}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter h-5">
                                                            {exercise.muscle_group}
                                                        </Badge>
                                                        {isSelected && (
                                                            <div className="flex gap-1">
                                                                <Badge className="bg-green-500 hover:bg-green-500 text-white border-none py-0 h-5">
                                                                    Agregado
                                                                </Badge>
                                                                <Badge variant="secondary" className="py-0 h-5 font-bold">
                                                                    x{selectedIds.filter(id => id === exercise.id).length}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold leading-tight">{exercise.name}</h4>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-neutral-400 font-medium truncate uppercase">
                                                        {exercise.equipment_required?.join(', ') || exercise.equipment}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {isSelected && (
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="h-8 w-8 rounded-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    onRemove?.(exercise.id)
                                                                }}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onSelect(exercise)
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    )
}

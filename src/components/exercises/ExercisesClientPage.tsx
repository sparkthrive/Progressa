'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { ExerciseCard } from '@/components/exercises/ExerciseCard'
import { ExerciseFilterPanel } from '@/components/exercises/ExerciseFilterPanel'
import { ActiveFilters } from '@/components/exercises/ActiveFilters'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ExerciseFilters, Exercise } from '@/types/exercise-filters'

interface ExercisesClientPageProps {
    exercises: Exercise[]
    favorites: string[]
    userEquipment: string[]
}

export function ExercisesClientPage({ exercises, favorites, userEquipment }: ExercisesClientPageProps) {
    const [filters, setFilters] = useState<ExerciseFilters>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Filter exercises based on all criteria
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
                if (!exercise.discipline || !filters.disciplines.includes(exercise.discipline)) {
                    return false
                }
            }

            // Muscle group filter
            if (filters.muscleGroups && filters.muscleGroups.length > 0) {
                if (!filters.muscleGroups.includes(exercise.muscle_group as any)) {
                    return false
                }
            }

            // Movement type filter
            if (filters.movementTypes && filters.movementTypes.length > 0) {
                if (!exercise.movement_type || !filters.movementTypes.some(mt => exercise.movement_type?.includes(mt))) {
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

            // Goals filter
            if (filters.goals && filters.goals.length > 0) {
                if (!exercise.exercise_goal || !filters.goals.some(g => exercise.exercise_goal?.includes(g))) {
                    return false
                }
            }

            // Difficulty filter
            if (filters.difficulty && exercise.difficulty_level !== filters.difficulty) {
                return false
            }

            // Exercise type filter
            if (filters.exerciseTypes && filters.exerciseTypes.length > 0) {
                if (!exercise.exercise_type || !filters.exerciseTypes.includes(exercise.exercise_type)) {
                    return false
                }
            }

            // Duration filter
            if (filters.durationPerSet && exercise.duration_per_set !== filters.durationPerSet) {
                return false
            }

            // Joint impact filter
            if (filters.jointImpact && exercise.joint_impact !== filters.jointImpact) {
                return false
            }

            return true
        })
    }, [exercises, filters, searchQuery, favorites, userEquipment])

    const handleRemoveFilter = (key: keyof ExerciseFilters, value?: string) => {
        const newFilters = { ...filters }

        if (value && Array.isArray(newFilters[key])) {
            // Remove specific value from array
            const arrayFilter = newFilters[key] as string[]
            newFilters[key] = arrayFilter.filter(v => v !== value) as any
            if ((newFilters[key] as string[]).length === 0) {
                delete newFilters[key]
            }
        } else {
            // Remove entire filter
            delete newFilters[key]
        }

        setFilters(newFilters)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight">Biblioteca de Ejercicios</h1>
                <p className="text-neutral-500 font-medium max-w-2xl">
                    Explora cientos de ejercicios con técnica guiada, músculos implicados y equipo necesario.
                </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                        placeholder="Buscar ejercicio (ej: Press de Banca)..."
                        className="pl-12 h-14 rounded-2xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 font-bold border-neutral-200 dark:border-neutral-800">
                            <SlidersHorizontal className="h-4 w-4" /> Filtros
                            {Object.keys(filters).length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                                    {Object.keys(filters).length}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filtros de Ejercicios</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <ExerciseFilterPanel
                                filters={filters}
                                onFiltersChange={setFilters}
                                userEquipment={userEquipment}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Active Filters */}
            {Object.keys(filters).length > 0 && (
                <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
            )}

            {/* Layout: Sidebar + Grid */}
            <div className="flex gap-8">
                {/* Desktop Filter Sidebar */}
                <aside className="hidden md:block w-80 flex-shrink-0">
                    <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2">
                        <ExerciseFilterPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                            userEquipment={userEquipment}
                        />
                    </div>
                </aside>

                {/* Exercise Grid */}
                <div className="flex-1">
                    {filteredExercises.length === 0 ? (
                        <div className="text-center py-20">
                            <Filter className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No se encontraron ejercicios</h3>
                            <p className="text-neutral-500 mb-6">
                                Intenta ajustar tus filtros o búsqueda
                            </p>
                            <Button onClick={() => { setFilters({}); setSearchQuery('') }}>
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-neutral-500">
                                Mostrando {filteredExercises.length} de {exercises.length} ejercicios
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredExercises.map(exercise => (
                                    <ExerciseCard
                                        key={exercise.id}
                                        exercise={exercise}
                                        isFavorite={favorites.includes(exercise.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

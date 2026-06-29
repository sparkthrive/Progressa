'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { ChevronDown, X, Filter as FilterIcon } from 'lucide-react'
import {
    ExerciseFilters,
    DISCIPLINE_LABELS,
    MUSCLE_GROUP_LABELS,
    MOVEMENT_TYPE_LABELS,
    EQUIPMENT_LABELS,
    EXERCISE_GOAL_LABELS,
    DIFFICULTY_LABELS,
    EXERCISE_TYPE_LABELS,
    DURATION_LABELS,
    JOINT_IMPACT_LABELS,
    Discipline,
    MuscleGroup,
    MovementType,
    Equipment,
    ExerciseGoal,
    DifficultyLevel,
    ExerciseType,
    DurationPerSet,
    JointImpact
} from '@/types/exercise-filters'

interface ExerciseFilterPanelProps {
    filters: ExerciseFilters
    onFiltersChange: (filters: ExerciseFilters) => void
    userEquipment: string[]
}

export function ExerciseFilterPanel({ filters, onFiltersChange, userEquipment }: ExerciseFilterPanelProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['discipline', 'muscle']))

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const toggleArrayFilter = <T extends string>(
        key: keyof ExerciseFilters,
        value: T
    ) => {
        const current = (filters[key] as T[]) || []
        const newValue = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]

        onFiltersChange({
            ...filters,
            [key]: newValue.length > 0 ? newValue : undefined
        })
    }

    const clearFilters = () => {
        onFiltersChange({})
    }

    const activeFilterCount = Object.values(filters).filter(v =>
        v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
    ).length

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FilterIcon className="h-5 w-5 text-neutral-400" />
                    <h3 className="font-bold text-lg">Filtros</h3>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="rounded-full">
                            {activeFilterCount}
                        </Badge>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs gap-1"
                    >
                        <X className="h-3 w-3" /> Limpiar
                    </Button>
                )}
            </div>

            {/* Quick Toggles */}
            <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl">
                <div className="flex items-center justify-between">
                    <Label htmlFor="my-equipment" className="text-sm font-medium cursor-pointer">
                        Solo mi equipamiento
                    </Label>
                    <Switch
                        id="my-equipment"
                        checked={filters.onlyMyEquipment || false}
                        onCheckedChange={(checked) =>
                            onFiltersChange({ ...filters, onlyMyEquipment: checked || undefined })
                        }
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="favorites" className="text-sm font-medium cursor-pointer">
                        Solo favoritos
                    </Label>
                    <Switch
                        id="favorites"
                        checked={filters.favoritesOnly || false}
                        onCheckedChange={(checked) =>
                            onFiltersChange({ ...filters, favoritesOnly: checked || undefined })
                        }
                    />
                </div>
            </div>

            {/* Filter Sections */}
            <div className="space-y-2">
                {/* Discipline */}
                <FilterSection
                    title="Disciplina / Modalidad"
                    isExpanded={expandedSections.has('discipline')}
                    onToggle={() => toggleSection('discipline')}
                    activeCount={(filters.disciplines?.length || 0)}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(DISCIPLINE_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() => toggleArrayFilter('disciplines', value as Discipline)}
                            >
                                <Checkbox
                                    checked={filters.disciplines?.includes(value as Discipline)}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Muscle Group */}
                <FilterSection
                    title="Grupo Muscular"
                    isExpanded={expandedSections.has('muscle')}
                    onToggle={() => toggleSection('muscle')}
                    activeCount={(filters.muscleGroups?.length || 0)}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(MUSCLE_GROUP_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() => toggleArrayFilter('muscleGroups', value as MuscleGroup)}
                            >
                                <Checkbox
                                    checked={filters.muscleGroups?.includes(value as MuscleGroup)}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Movement Type */}
                <FilterSection
                    title="Tipo de Movimiento"
                    isExpanded={expandedSections.has('movement')}
                    onToggle={() => toggleSection('movement')}
                    activeCount={(filters.movementTypes?.length || 0)}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() => toggleArrayFilter('movementTypes', value as MovementType)}
                            >
                                <Checkbox
                                    checked={filters.movementTypes?.includes(value as MovementType)}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Equipment */}
                <FilterSection
                    title="Equipamiento"
                    isExpanded={expandedSections.has('equipment')}
                    onToggle={() => toggleSection('equipment')}
                    activeCount={(filters.equipment?.length || 0)}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(EQUIPMENT_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() => toggleArrayFilter('equipment', value as Equipment)}
                            >
                                <Checkbox
                                    checked={filters.equipment?.includes(value as Equipment)}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Exercise Goal */}
                <FilterSection
                    title="Objetivo del Ejercicio"
                    isExpanded={expandedSections.has('goal')}
                    onToggle={() => toggleSection('goal')}
                    activeCount={(filters.goals?.length || 0)}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(EXERCISE_GOAL_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() => toggleArrayFilter('goals', value as ExerciseGoal)}
                            >
                                <Checkbox
                                    checked={filters.goals?.includes(value as ExerciseGoal)}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Difficulty */}
                <FilterSection
                    title="Nivel de Dificultad"
                    isExpanded={expandedSections.has('difficulty')}
                    onToggle={() => toggleSection('difficulty')}
                    activeCount={filters.difficulty ? 1 : 0}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() =>
                                    onFiltersChange({
                                        ...filters,
                                        difficulty: filters.difficulty === value ? undefined : (value as DifficultyLevel)
                                    })
                                }
                            >
                                <Checkbox
                                    checked={filters.difficulty === value}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Exercise Type */}
                <FilterSection
                    title="Tipo de Ejercicio"
                    isExpanded={expandedSections.has('type')}
                    onToggle={() => toggleSection('type')}
                    activeCount={(filters.exerciseTypes?.length || 0)}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(EXERCISE_TYPE_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() => toggleArrayFilter('exerciseTypes', value as ExerciseType)}
                            >
                                <Checkbox
                                    checked={filters.exerciseTypes?.includes(value as ExerciseType)}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Duration */}
                <FilterSection
                    title="Duración por Serie"
                    isExpanded={expandedSections.has('duration')}
                    onToggle={() => toggleSection('duration')}
                    activeCount={filters.durationPerSet ? 1 : 0}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(DURATION_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() =>
                                    onFiltersChange({
                                        ...filters,
                                        durationPerSet: filters.durationPerSet === value ? undefined : (value as DurationPerSet)
                                    })
                                }
                            >
                                <Checkbox
                                    checked={filters.durationPerSet === value}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Joint Impact */}
                <FilterSection
                    title="Impacto Articular"
                    isExpanded={expandedSections.has('impact')}
                    onToggle={() => toggleSection('impact')}
                    activeCount={filters.jointImpact ? 1 : 0}
                >
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(JOINT_IMPACT_LABELS).map(([value, label]) => (
                            <div
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                                onClick={() =>
                                    onFiltersChange({
                                        ...filters,
                                        jointImpact: filters.jointImpact === value ? undefined : (value as JointImpact)
                                    })
                                }
                            >
                                <Checkbox
                                    checked={filters.jointImpact === value}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </FilterSection>
            </div>
        </div>
    )
}

interface FilterSectionProps {
    title: string
    isExpanded: boolean
    onToggle: () => void
    activeCount: number
    children: React.ReactNode
}

function FilterSection({ title, isExpanded, onToggle, activeCount, children }: FilterSectionProps) {
    return (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{title}</span>
                    {activeCount > 0 && (
                        <Badge variant="secondary" className="rounded-full h-5 min-w-5 px-1.5 text-[10px]">
                            {activeCount}
                        </Badge>
                    )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800">
                    {children}
                </div>
            )}
        </div>
    )
}

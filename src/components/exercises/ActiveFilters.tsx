'use client'

import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
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
    JOINT_IMPACT_LABELS
} from '@/types/exercise-filters'

interface ActiveFiltersProps {
    filters: ExerciseFilters
    onRemoveFilter: (key: keyof ExerciseFilters, value?: string) => void
}

export function ActiveFilters({ filters, onRemoveFilter }: ActiveFiltersProps) {
    const activeFilters: Array<{ key: keyof ExerciseFilters; label: string; value?: string }> = []

    // Disciplines
    filters.disciplines?.forEach(d => {
        activeFilters.push({ key: 'disciplines', label: DISCIPLINE_LABELS[d], value: d })
    })

    // Muscle Groups
    filters.muscleGroups?.forEach(m => {
        activeFilters.push({ key: 'muscleGroups', label: MUSCLE_GROUP_LABELS[m], value: m })
    })

    // Movement Types
    filters.movementTypes?.forEach(m => {
        activeFilters.push({ key: 'movementTypes', label: MOVEMENT_TYPE_LABELS[m], value: m })
    })

    // Equipment
    filters.equipment?.forEach(e => {
        activeFilters.push({ key: 'equipment', label: EQUIPMENT_LABELS[e], value: e })
    })

    // Goals
    filters.goals?.forEach(g => {
        activeFilters.push({ key: 'goals', label: EXERCISE_GOAL_LABELS[g], value: g })
    })

    // Difficulty
    if (filters.difficulty) {
        activeFilters.push({ key: 'difficulty', label: DIFFICULTY_LABELS[filters.difficulty] })
    }

    // Exercise Types
    filters.exerciseTypes?.forEach(t => {
        activeFilters.push({ key: 'exerciseTypes', label: EXERCISE_TYPE_LABELS[t], value: t })
    })

    // Duration
    if (filters.durationPerSet) {
        activeFilters.push({ key: 'durationPerSet', label: DURATION_LABELS[filters.durationPerSet] })
    }

    // Joint Impact
    if (filters.jointImpact) {
        activeFilters.push({ key: 'jointImpact', label: JOINT_IMPACT_LABELS[filters.jointImpact] })
    }

    // Toggles
    if (filters.onlyMyEquipment) {
        activeFilters.push({ key: 'onlyMyEquipment', label: 'Solo mi equipamiento' })
    }

    if (filters.favoritesOnly) {
        activeFilters.push({ key: 'favoritesOnly', label: 'Solo favoritos' })
    }

    if (activeFilters.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
                <Badge
                    key={`${filter.key}-${filter.value || index}`}
                    variant="secondary"
                    className="px-3 py-1.5 gap-2 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => onRemoveFilter(filter.key, filter.value)}
                >
                    {filter.label}
                    <X className="h-3 w-3" />
                </Badge>
            ))}
        </div>
    )
}

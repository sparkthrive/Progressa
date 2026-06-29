'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { getExercises } from '@/app/dashboard/routines/actions'

interface Exercise {
    id: string
    name: string
    muscle_group: string
    equipment: string
}

interface ExercisePickerProps {
    onSelect: (exercise: Exercise) => void
}

export function ExercisePicker({ onSelect }: ExercisePickerProps) {
    const [open, setOpen] = useState(false)
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const data = await getExercises()
                setExercises(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {loading ? 'Cargando ejercicios...' : 'Agregar Ejercicio...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput placeholder="Buscar ejercicio..." />
                    <CommandList>
                        <CommandEmpty>No se encontró el ejercicio.</CommandEmpty>
                        <CommandGroup>
                            {exercises.map((exercise) => (
                                <CommandItem
                                    key={exercise.id}
                                    value={exercise.name}
                                    onSelect={() => {
                                        onSelect(exercise)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span>{exercise.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {exercise.muscle_group} • {exercise.equipment}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

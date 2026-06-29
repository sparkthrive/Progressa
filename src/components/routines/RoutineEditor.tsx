'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdvancedExercisePicker } from '@/components/routines/AdvancedExercisePicker'
import { RoutineExerciseCard } from '@/components/routines/RoutineExerciseCard'
import { MuscleBalance } from '@/components/routines/MuscleBalance'
import { createRoutine, updateRoutine } from '@/app/dashboard/routines/actions'
import { ChevronLeft, Save, Dumbbell, Clock, Zap, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

interface RoutineExercise {
    instanceId: string
    id: string
    name: string
    sets: number
    reps: string
    notes?: string
    muscle_group?: string
    measurement_type?: 'reps' | 'time'
    rest_seconds?: number
}

interface RoutineEditorProps {
    initialData?: {
        id?: string
        name: string
        description: string
        exercises: RoutineExercise[]
    }
}

export function RoutineEditor({ initialData }: RoutineEditorProps) {
    const router = useRouter()
    const isEditing = !!initialData?.id

    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(initialData?.exercises || [])
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleAddExercise = (ex: any) => {
        const instanceId = crypto.randomUUID()
        setSelectedExercises([
            ...selectedExercises,
            {
                instanceId,
                id: ex.id,
                name: ex.name,
                sets: 3,
                reps: ex.measurement_type === 'time' ? '30' : '10',
                notes: '',
                muscle_group: ex.muscle_group,
                measurement_type: ex.measurement_type || 'reps',
                rest_seconds: 60
            }
        ])
    }

    const handleRemoveLastInstance = (id: string) => {
        const lastIndex = [...selectedExercises].reverse().findIndex(ex => ex.id === id)
        if (lastIndex === -1) return
        const actualIndex = selectedExercises.length - 1 - lastIndex
        setSelectedExercises(selectedExercises.filter((_, i) => i !== actualIndex))
    }

    const handleRemoveExercise = (instanceId: string) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.instanceId !== instanceId))
    }

    const updateExercise = (instanceId: string, field: keyof RoutineExercise, value: any) => {
        setSelectedExercises(selectedExercises.map(ex =>
            ex.instanceId === instanceId ? { ...ex, [field]: value } : ex
        ))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setSelectedExercises((items) => {
                const oldIndex = items.findIndex((item) => item.instanceId === active.id)
                const newIndex = items.findIndex((item) => item.instanceId === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedExercises.length === 0) return alert('Agrega al menos un ejercicio')

        setLoading(true)
        try {
            const formData = {
                name,
                description,
                exercises: selectedExercises.map(ex => ({
                    id: ex.id,
                    sets_target: Array.from({ length: ex.sets }).map(() => ({
                        reps: parseInt(ex.reps) || 10,
                        weight: 0,
                        notes: ex.notes,
                        rest_seconds: ex.rest_seconds || 60
                    }))
                }))
            }

            if (isEditing) {
                await updateRoutine(initialData.id!, formData)
            } else {
                await createRoutine(formData)
            }

            router.push('/dashboard/routines')
            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Error al guardar la rutina')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Sticky */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">
                            {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
                        </h1>
                        <p className="text-neutral-500 font-medium text-sm">
                            {isEditing ? 'Ajusta los detalles de tu plan.' : 'Crea tu plan maestro de entrenamiento.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold" onClick={() => router.back()} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !name || selectedExercises.length === 0}
                        className="h-12 px-8 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 gap-2 font-bold shadow-lg shadow-neutral-900/10 dark:shadow-none"
                    >
                        {loading ? 'Guardando...' : <><Save className="h-4 w-4" /> {isEditing ? 'Actualizar' : 'Guardar Rutina'}</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Detalles básicos</CardTitle>
                            <CardDescription>Define el nombre y el objetivo de esta rutina.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                    Nombre de la Rutina
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Full Body A - Enfoque Fuerza"
                                    className="h-14 text-xl font-bold border-neutral-200 dark:border-neutral-800 rounded-2xl focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-50"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                    Descripción
                                </Label>
                                <Input
                                    id="description"
                                    placeholder="Ej: Enfocado en progresar en press militar y sentadillas"
                                    className="h-12 border-neutral-100 dark:border-neutral-800 rounded-xl"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Exercises List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-neutral-400" />
                                Ejercicios Seleccionados
                            </h2>
                            <Badge variant="outline" className="font-bold rounded-full px-3">
                                {selectedExercises.length} Ejercicios
                            </Badge>
                        </div>

                        {!isMounted ? (
                            <div className="grid gap-4">
                                {selectedExercises.map((ex, index) => (
                                    <RoutineExerciseCard
                                        key={ex.instanceId}
                                        exercise={ex}
                                        index={index}
                                        onRemove={handleRemoveExercise}
                                        onUpdate={updateExercise}
                                    />
                                ))}
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                modifiers={[restrictToVerticalAxis]}
                            >
                                <SortableContext
                                    items={selectedExercises.map(ex => ex.instanceId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="grid gap-4">
                                        {selectedExercises.map((ex, index) => (
                                            <RoutineExerciseCard
                                                key={ex.instanceId}
                                                exercise={ex}
                                                index={index}
                                                onRemove={handleRemoveExercise}
                                                onUpdate={updateExercise}
                                            />
                                        ))}

                                        <AdvancedExercisePicker
                                            onSelect={handleAddExercise}
                                            onRemove={handleRemoveLastInstance}
                                            selectedIds={selectedExercises.map(ex => ex.id)}
                                        />

                                        {selectedExercises.length === 0 && (
                                            <div className="text-center py-20 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/10">
                                                <Dumbbell className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                                                <p className="text-neutral-400 font-medium">Empieza agregando un ejercicio para tu rutina.</p>
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                <div className="space-y-6 lg:sticky lg:top-8">
                    {/* Routine Preview Sidebar */}
                    <MuscleBalance exercises={selectedExercises} />

                    {/* Quick Stats Card */}
                    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Resumen General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-neutral-50 dark:border-neutral-800/50">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm font-medium">Duración Est.</span>
                                </div>
                                <span className="font-bold">{selectedExercises.length * 10} min</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-neutral-50 dark:border-neutral-800/50">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <Hash className="h-4 w-4" />
                                    <span className="text-sm font-medium">Series Totales</span>
                                </div>
                                <span className="font-bold">
                                    {selectedExercises.reduce((acc, ex) => acc + (ex.sets || 0), 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <Zap className="h-4 w-4" />
                                    <span className="text-sm font-medium">Intensidad</span>
                                </div>
                                <Badge className="bg-orange-500/10 text-orange-500 border-none font-bold">Media</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

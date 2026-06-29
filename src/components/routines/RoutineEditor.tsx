'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExercisePicker } from '@/components/routines/ExercisePicker'
import { createRoutine, updateRoutine } from '@/app/dashboard/routines/actions'
import { Trash2, GripVertical, ChevronLeft, Save, Dumbbell, Hash, Repeat } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RoutineExercise {
    id: string
    name: string
    sets: number
    reps: string
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

    const handleAddExercise = (ex: any) => {
        if (selectedExercises.find(item => item.id === ex.id)) return
        setSelectedExercises([
            ...selectedExercises,
            { id: ex.id, name: ex.name, sets: 3, reps: '10' }
        ])
    }

    const handleRemoveExercise = (id: string) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.id !== id))
    }

    const updateExercise = (id: string, field: keyof RoutineExercise, value: any) => {
        setSelectedExercises(selectedExercises.map(ex =>
            ex.id === id ? { ...ex, [field]: value } : ex
        ))
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
                    sets_target: Array.from({ length: ex.sets }).map(() => ({ reps: parseInt(ex.reps) || 10, weight: 0 }))
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
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
                        </h1>
                        <p className="text-neutral-500 text-sm">
                            {isEditing ? 'Ajusta los detalles de tu plan.' : 'Crea tu plan maestro de entrenamiento.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !name || selectedExercises.length === 0}
                        className="bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 gap-2 px-6"
                    >
                        {loading ? 'Guardando...' : <><Save className="h-4 w-4" /> {isEditing ? 'Actualizar' : 'Guardar Rutina'}</>}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Detalles básicos</CardTitle>
                        <CardDescription>Información general de tu rutina.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                                Nombre de la Rutina
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: Full Body A - Enfoque Fuerza"
                                className="h-12 text-lg font-medium border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-50"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                                Descripción
                            </Label>
                            <Input
                                id="description"
                                placeholder="Ej: Enfocado en progresar en press militar y sentadillas"
                                className="h-12 border-neutral-100 dark:border-neutral-800"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-neutral-400" />
                            Ejercicios Seleccionados
                        </h2>
                        <Badge variant="outline" className="font-bold">
                            {selectedExercises.length} Total
                        </Badge>
                    </div>

                    <div className="grid gap-4">
                        {selectedExercises.map((ex, index) => (
                            <Card key={`${ex.id}-${index}`} className="group relative overflow-hidden border-neutral-200/60 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm">
                                <CardContent className="p-0">
                                    <div className="flex items-center">
                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 border-r border-neutral-100 dark:border-neutral-800 flex items-center justify-center cursor-grab active:cursor-grabbing">
                                            <GripVertical className="h-5 w-5 text-neutral-300" />
                                        </div>
                                        <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                                        Ejercicio {index + 1}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold">{ex.name}</h3>
                                            </div>

                                            <div className="flex items-center gap-4 sm:gap-8">
                                                <div className="grid gap-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                                                        <Hash className="h-3 w-3" /> Series
                                                    </Label>
                                                    <div className="flex items-center">
                                                        <Input
                                                            type="number"
                                                            className="w-16 h-10 text-center font-bold"
                                                            value={ex.sets}
                                                            onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value) || 1)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                                                        <Repeat className="h-3 w-3" /> Reps
                                                    </Label>
                                                    <Input
                                                        className="w-20 h-10 text-center font-bold"
                                                        value={ex.reps}
                                                        onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                    onClick={() => handleRemoveExercise(ex.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <div className="mt-2">
                            <ExercisePicker onSelect={handleAddExercise} />
                        </div>

                        {selectedExercises.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/10">
                                <p className="text-neutral-400 text-sm">Empieza agregando un ejercicio para tu rutina.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Trash2,
    GripVertical,
    Hash,
    Repeat,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Dumbbell,
    Timer,
    Coffee
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

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

interface RoutineExerciseCardProps {
    exercise: RoutineExercise
    index: number
    onRemove: (id: string) => void
    onUpdate: (id: string, field: keyof RoutineExercise, value: any) => void
}

export function RoutineExerciseCard({ exercise, index, onRemove, onUpdate }: RoutineExerciseCardProps) {
    const [showNotes, setShowNotes] = useState(false)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: exercise.instanceId })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <Card className="group relative overflow-hidden border-neutral-200/60 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm bg-white dark:bg-neutral-900">
                <CardContent className="p-0">
                    <div className="flex">
                        {/* Drag Handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="bg-neutral-50 dark:bg-neutral-800/50 p-4 border-r border-neutral-100 dark:border-neutral-800 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <GripVertical className="h-5 w-5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                        </div>

                        <div className="flex-1">
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                            Ejercicio {index + 1}
                                        </span>
                                        {exercise.muscle_group && (
                                            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-bold uppercase border-none">
                                                {exercise.muscle_group}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight">{exercise.name}</h3>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6">
                                    {/* Sets Control */}
                                    <div className="grid gap-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                                            <Hash className="h-3 w-3" /> Series
                                        </Label>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => onUpdate(exercise.instanceId, 'sets', Math.max(1, exercise.sets - 1))}
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                            <Input
                                                type="number"
                                                className="w-12 h-8 p-0 text-center font-bold border-none bg-transparent"
                                                value={exercise.sets}
                                                onChange={(e) => onUpdate(exercise.instanceId, 'sets', parseInt(e.target.value) || 1)}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => onUpdate(exercise.instanceId, 'sets', exercise.sets + 1)}
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Reps Control */}
                                    <div className="grid gap-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                                            {exercise.measurement_type === 'time' ? (
                                                <><Timer className="h-3 w-3" /> Tiempo (Seg)</>
                                            ) : (
                                                <><Repeat className="h-3 w-3" /> Reps</>
                                            )}
                                        </Label>
                                        <Input
                                            className="w-20 h-8 text-center font-bold bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-lg"
                                            value={exercise.reps}
                                            onChange={(e) => onUpdate(exercise.instanceId, 'reps', e.target.value)}
                                            placeholder={exercise.measurement_type === 'time' ? '30' : '10-12'}
                                        />
                                    </div>

                                    {/* Rest Control */}
                                    <div className="grid gap-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                                            <Coffee className="h-3 w-3" /> Descanso
                                        </Label>
                                        <div className="flex items-center gap-1">
                                            <Input
                                                type="number"
                                                className="w-14 h-8 text-center font-bold bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-lg"
                                                value={exercise.rest_seconds || 60}
                                                onChange={(e) => onUpdate(exercise.instanceId, 'rest_seconds', parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-[10px] font-bold text-neutral-400">s</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 pt-4 sm:pt-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-10 w-10 transition-colors ${showNotes ? 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'text-neutral-400'}`}
                                            onClick={() => setShowNotes(!showNotes)}
                                        >
                                            <MessageSquare className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                            onClick={() => onRemove(exercise.instanceId)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Field */}
                            {showNotes && (
                                <div className="px-5 pb-5 border-t border-neutral-50 dark:border-neutral-800/50 pt-4">
                                    <textarea
                                        placeholder="Instrucciones específicas (ej: pausa de 2 seg en contracción)..."
                                        className="w-full min-h-[80px] p-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-none focus:ring-1 focus:ring-neutral-200 dark:focus:ring-neutral-700 resize-none outline-none"
                                        value={exercise.notes || ''}
                                        onChange={(e) => onUpdate(exercise.instanceId, 'notes', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

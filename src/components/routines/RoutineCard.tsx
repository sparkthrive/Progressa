'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Play,
    MoreVertical,
    Copy,
    Trash2,
    Edit2,
    Dumbbell,
    Layers,
    Loader2,
    Clock,
    Flame
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteRoutine, duplicateRoutine } from '@/app/dashboard/routines/actions'
import { startWorkout } from '@/app/dashboard/workouts/actions'
import { MUSCLE_GROUP_LABELS } from '@/types/exercise-filters'

interface RoutineCardProps {
    routine: {
        id: string
        name: string
        description: string
        routine_exercises: any[]
    }
}

export function RoutineCard({ routine }: RoutineCardProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [isStarting, setIsStarting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDuplicateModal, setShowDuplicateModal] = useState(false)

    // Extract unique muscle groups
    const muscleGroups = Array.from(new Set(
        routine.routine_exercises.map(re => re.exercises?.muscle_group).filter(Boolean)
    ))

    const totalSets = routine.routine_exercises.reduce((acc, re) => acc + (re.sets_target?.length || 0), 0)
    const estDuration = routine.routine_exercises.length * 10

    const handleDelete = async () => {
        setIsPending(true)
        try {
            await deleteRoutine(routine.id)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al eliminar la rutina')
        } finally {
            setIsPending(false)
            setShowDeleteModal(false)
        }
    }

    const handleDuplicate = async () => {
        setIsPending(true)
        try {
            await duplicateRoutine(routine.id)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al duplicar la rutina')
        } finally {
            setIsPending(false)
            setShowDuplicateModal(false)
        }
    }

    const handleStartWorkout = async () => {
        setIsStarting(true)
        try {
            await startWorkout(routine.id)
        } catch (error: any) {
            if (error.message === 'NEXT_REDIRECT') return;
            console.error(error)
            alert('Error al iniciar el entrenamiento')
        } finally {
            setIsStarting(false)
        }
    }

    return (
        <Card className="group relative overflow-hidden border-neutral-200/60 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm bg-white dark:bg-neutral-900 rounded-3xl">
            {(isPending || isStarting) && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-900 dark:text-neutral-50" />
                </div>
            )}

            <CardContent className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-neutral-900 dark:bg-neutral-50 flex items-center justify-center">
                                <Dumbbell className="h-4 w-4 text-white dark:text-neutral-900" />
                            </div>
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter h-5 border-neutral-200">
                                {routine.routine_exercises.length} EJER.
                            </Badge>
                        </div>
                        <h3 className="text-xl font-black tracking-tight truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors mt-2">
                            {routine.name}
                        </h3>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl border-neutral-200 dark:border-neutral-800 shadow-xl">
                            <DropdownMenuItem asChild className="rounded-xl gap-2 cursor-pointer py-2.5">
                                <Link href={`/dashboard/routines/${routine.id}`}>
                                    <Edit2 className="h-4 w-4 text-neutral-400" /> Editar rutina
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowDuplicateModal(true)} className="rounded-xl gap-2 cursor-pointer py-2.5 font-medium">
                                <Copy className="h-4 w-4 text-neutral-400" /> Duplicar
                            </DropdownMenuItem>
                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1.5" />
                            <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="rounded-xl gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer py-2.5 font-bold">
                                <Trash2 className="h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Delete Modal */}
                    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                        <DialogContent className="max-w-md rounded-3xl border-none p-0 overflow-hidden">
                            <div className="p-8 text-center space-y-6">
                                <div className="h-20 w-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                                    <Trash2 className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <DialogTitle className="text-2xl font-black tracking-tight">¿Eliminar rutina?</DialogTitle>
                                    <DialogDescription className="text-neutral-500 font-medium">
                                        Esta acción eliminará "{routine.name}" permanentemente. No afectará a tus entrenamientos ya realizados.
                                    </DialogDescription>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 h-12 rounded-2xl font-bold"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 h-12 rounded-2xl font-bold bg-red-500 hover:bg-red-600 border-none shadow-lg shadow-red-200 dark:shadow-none"
                                        onClick={handleDelete}
                                        disabled={isPending}
                                    >
                                        {isPending ? 'Eliminando...' : 'Sí, eliminar'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Duplicate Modal */}
                    <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
                        <DialogContent className="max-w-md rounded-3xl border-none p-0 overflow-hidden">
                            <div className="p-8 text-center space-y-6">
                                <div className="h-20 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-900 dark:text-neutral-50">
                                    <Copy className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <DialogTitle className="text-2xl font-black tracking-tight">¿Duplicar rutina?</DialogTitle>
                                    <DialogDescription className="text-neutral-500 font-medium">
                                        Se creará una copia exacta de "{routine.name}" para que puedas ajustarla sin modificar la original.
                                    </DialogDescription>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 h-12 rounded-2xl font-bold"
                                        onClick={() => setShowDuplicateModal(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1 h-12 rounded-2xl font-bold bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 border-none shadow-lg shadow-neutral-200 dark:shadow-none"
                                        onClick={handleDuplicate}
                                        disabled={isPending}
                                    >
                                        {isPending ? 'Duplicando...' : 'Sí, duplicar'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Muscle Groups */}
                <div className="flex flex-wrap gap-1.5">
                    {muscleGroups.slice(0, 3).map((group: any) => (
                        <Badge key={group} variant="secondary" className="bg-neutral-100/80 dark:bg-neutral-800 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-transparent text-neutral-500">
                            {MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS] || group}
                        </Badge>
                    ))}
                    {muscleGroups.length > 3 && (
                        <Badge variant="outline" className="text-[9px] font-black px-2 py-0.5 border-neutral-200">
                            +{muscleGroups.length - 3}
                        </Badge>
                    )}
                </div>

                {/* Summary Info */}
                <div className="grid grid-cols-2 gap-3 py-1">
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-3 flex flex-col gap-1">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Duración
                        </span>
                        <span className="text-sm font-bold truncate">{estDuration} min</span>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-3 flex flex-col gap-1">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                            <Flame className="h-3 w-3" /> Volumen
                        </span>
                        <span className="text-sm font-bold truncate">{totalSets} Series</span>
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-2 border-t border-neutral-50 dark:border-neutral-800/50 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                        <Layers className="h-3 w-3" /> Previsualización
                    </div>
                    <div className="space-y-1.5">
                        {routine.routine_exercises?.slice(0, 2).map((re: any) => (
                            <div key={re.id} className="flex justify-between items-center text-xs">
                                <span className="text-neutral-600 dark:text-neutral-400 font-bold truncate max-w-[70%]">
                                    {re.exercises?.name}
                                </span>
                                <div className="text-[9px] font-black h-5 p-0 text-neutral-400 flex items-center">
                                    {re.sets_target?.length || 3}S
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button
                        disabled={isPending || isStarting}
                        onClick={handleStartWorkout}
                        className="flex-1 h-12 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 shadow-lg shadow-neutral-200/50 dark:shadow-none"
                    >
                        <Play className="h-4 w-4 fill-current" /> Entrenar
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="h-12 w-12 rounded-2xl border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:scale-105"
                    >
                        <Link href={`/dashboard/routines/${routine.id}`}>
                            <Edit2 className="h-4 w-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

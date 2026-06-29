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
    Loader2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteRoutine, duplicateRoutine } from '@/app/dashboard/routines/actions'
import { startWorkout } from '@/app/dashboard/workouts/actions'

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

    // Extract unique muscle groups
    const muscleGroups = Array.from(new Set(
        routine.routine_exercises.map(re => re.exercises.muscle_group).filter(Boolean)
    ))

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar esta rutina?')) return
        setIsPending(true)
        try {
            await deleteRoutine(routine.id)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al eliminar la rutina')
        } finally {
            setIsPending(false)
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
        }
    }

    const handleStartWorkout = async () => {
        setIsStarting(true)
        try {
            await startWorkout(routine.id)
            // No need for router.push because startWorkout uses redirect()
        } catch (error: any) {
            // Next.js redirect throws a specific error that shouldn't be caught as a "failure" 
            // but in server actions called from client it's handled if it bubbles up.
            // If we catch it, we might be catching the redirect "error".
            if (error.message === 'NEXT_REDIRECT') {
                return;
            }
            console.error(error)
            alert('Error al iniciar el entrenamiento')
        } finally {
            setIsStarting(false)
        }
    }

    return (
        <Card className="group relative overflow-hidden border-neutral-200/60 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm bg-white dark:bg-neutral-900">
            {(isPending || isStarting) && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-900 dark:text-neutral-50" />
                </div>
            )}

            <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                        <h3 className="text-xl font-extrabold tracking-tight truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                            {routine.name}
                        </h3>
                        {routine.description && (
                            <p className="text-sm text-neutral-500 line-clamp-1">
                                {routine.description}
                            </p>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-neutral-200 dark:border-neutral-800">
                            <DropdownMenuItem asChild className="rounded-lg gap-2 cursor-pointer py-2.5">
                                <Link href={`/dashboard/routines/${routine.id}`}>
                                    <Edit2 className="h-4 w-4" /> Editar rutina
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDuplicate} className="rounded-lg gap-2 cursor-pointer py-2.5">
                                <Copy className="h-4 w-4" /> Duplicar
                            </DropdownMenuItem>
                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                            <DropdownMenuItem onClick={handleDelete} className="rounded-lg gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer py-2.5">
                                <Trash2 className="h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {muscleGroups.slice(0, 3).map((group: any) => (
                        <Badge key={group} variant="secondary" className="bg-neutral-100/80 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-transparent">
                            {group}
                        </Badge>
                    ))}
                    {muscleGroups.length > 3 && (
                        <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5">
                            +{muscleGroups.length - 3}
                        </Badge>
                    )}
                </div>

                <div className="space-y-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        <Layers className="h-3 w-3" /> Previsualización
                    </div>
                    <div className="space-y-2">
                        {routine.routine_exercises?.slice(0, 2).map((re: any) => (
                            <div key={re.id} className="flex justify-between items-center text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400 font-medium truncate max-w-[70%]">
                                    {re.exercises?.name}
                                </span>
                                <span className="text-[10px] font-bold bg-neutral-50 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-100 dark:border-neutral-800">
                                    {re.sets_target?.length || 3} SETS
                                </span>
                            </div>
                        ))}
                        {routine.routine_exercises?.length > 2 && (
                            <p className="text-[10px] text-neutral-400 font-bold text-center italic">
                                + {routine.routine_exercises.length - 2} ejercicios adicionales
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                        disabled={isPending || isStarting}
                        onClick={handleStartWorkout}
                        className="flex-1 bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-full font-bold shadow-lg shadow-neutral-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 py-6"
                    >
                        <Play className="h-4 w-4 fill-current" /> Entrenar
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="h-12 w-12 rounded-full border-neutral-200 dark:border-neutral-800 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 transition-colors"
                    >
                        <Link href={`/dashboard/routines/${routine.id}`}>
                            <Edit2 className="h-4 w-4 text-neutral-400" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

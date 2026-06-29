'use client'

import { Share2, Trash2, Repeat, Clock, TrendingUp, Trophy, Dumbbell, Download, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteWorkout, startWorkout } from '@/app/dashboard/workouts/actions'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toPng } from 'html-to-image'
import download from 'downloadjs'

interface WorkoutHeaderActionsProps {
    workoutId: string
    workoutName: string
    stats: {
        duration: string
        volume: number
        sets: number
        exercises: number
        date: string
    }
}

export function WorkoutHeaderActions({ workoutId, workoutName, stats }: WorkoutHeaderActionsProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const shareCardRef = useRef<HTMLDivElement>(null)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteWorkout(workoutId)
            router.push('/dashboard/workouts')
            router.refresh()
        } catch (err: any) {
            if (err.digest?.startsWith('NEXT_REDIRECT')) {
                return
            }
            console.error('Error deleting workout:', err)
            alert('No se pudo eliminar el entrenamiento.')
            setIsDeleting(false)
            setShowDeleteModal(false)
        }
    }

    const downloadShareImage = async () => {
        if (!shareCardRef.current) return

        setIsGeneratingImage(true)
        try {
            // Give a tiny bit of time for layout to be rock solid
            await new Promise(r => setTimeout(r, 100))

            const dataUrl = await toPng(shareCardRef.current, {
                quality: 1.0,
                pixelRatio: 2, // Better resolution
                backgroundColor: '#0a0a0a' // Neutral-950 roughly
            })

            download(dataUrl, `progressa-${workoutName.toLowerCase().replace(/\s+/g, '-')}.png`)
        } catch (err) {
            console.error('Failed to generate image:', err)
            alert('No se pudo generar la imagen para compartir.')
        } finally {
            setIsGeneratingImage(false)
        }
    }

    return (
        <div className="flex gap-2">
            {/* Action Buttons */}
            <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-neutral-200 dark:border-neutral-800"
                onClick={() => setShowShareModal(true)}
            >
                <Share2 className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 text-red-500 border-red-100 hover:bg-red-50 dark:border-red-900/30"
                onClick={() => setShowDeleteModal(true)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="max-w-md rounded-3xl border-none p-0 overflow-hidden">
                    <div className="p-8 text-center space-y-6">
                        <div className="h-20 w-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <Trash2 className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black tracking-tight">¿Eliminar entrenamiento?</DialogTitle>
                            <DialogDescription className="text-neutral-500 font-medium">
                                Esta acción es permanente y eliminará todos los datos registrados en esta sesión. No se puede deshacer.
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
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Share Modal */}
            <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                <DialogContent className="max-w-lg rounded-[2.5rem] border-none p-0 bg-neutral-950 overflow-hidden shadow-2xl">
                    <div className="p-8 space-y-8">
                        <DialogHeader className="text-center">
                            <DialogTitle className="text-white text-xl font-bold">Resumen para compartir</DialogTitle>
                            <DialogDescription className="text-neutral-400">Genera una imagen premium de tus estadísticas.</DialogDescription>
                        </DialogHeader>

                        {/* Shareable Card Area */}
                        <div
                            ref={shareCardRef}
                            className="relative overflow-hidden aspect-[4/5] w-full rounded-[2rem] bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-10 text-white shadow-2xl border border-white/5"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 rotate-12">
                                <Trophy size={200} />
                            </div>
                            <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-green-500/10 blur-[100px] rounded-full" />

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                {/* Branding */}
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                                        <span className="text-black font-black text-xl italic">P</span>
                                    </div>
                                    <span className="font-black text-2xl tracking-tighter italic">PROGRESSA</span>
                                </div>

                                {/* Main Content */}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-[0.2em]">
                                            <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                                            Entrenamiento Completado
                                        </div>
                                        <h2 className="text-5xl font-black tracking-tighter leading-none">{workoutName}</h2>
                                        <p className="text-neutral-400 font-medium">
                                            {stats.date}
                                        </p>
                                    </div>

                                    {/* Stats Grid for Share Card */}
                                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                                        <div className="space-y-1 p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5">
                                            <div className="flex items-center gap-1.5 text-neutral-400">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Tiempo</span>
                                            </div>
                                            <p className="text-xl font-black">{stats.duration}</p>
                                        </div>
                                        <div className="space-y-1 p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5">
                                            <div className="flex items-center gap-1.5 text-neutral-400">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Volumen</span>
                                            </div>
                                            <p className="text-xl font-black">{stats.volume} kg</p>
                                        </div>
                                        <div className="space-y-1 p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5">
                                            <div className="flex items-center gap-1.5 text-neutral-400">
                                                <Repeat className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Series</span>
                                            </div>
                                            <p className="text-xl font-black">{stats.sets}</p>
                                        </div>
                                        <div className="space-y-1 p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5">
                                            <div className="flex items-center gap-1.5 text-neutral-400">
                                                <Dumbbell className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Ejercicios</span>
                                            </div>
                                            <p className="text-xl font-black">{stats.exercises}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Text */}
                                <div className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <X className="h-2 w-2" /> Registra tu progreso en progressa.app
                                </div>
                            </div>
                        </div>

                        {/* Download Controls */}
                        <Button
                            className="w-full h-14 rounded-2xl bg-white text-black hover:bg-neutral-200 font-bold gap-2 text-lg transition-all active:scale-95"
                            onClick={downloadShareImage}
                            disabled={isGeneratingImage}
                        >
                            {isGeneratingImage ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Download className="h-5 w-5" />
                            )}
                            Descargar Imagen
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface WorkoutBottomActionsProps {
    routineId: string | null
}

export function WorkoutBottomActions({ routineId }: WorkoutBottomActionsProps) {
    const router = useRouter()
    const [isRepeating, setIsRepeating] = useState(false)

    const handleRepeat = async () => {
        if (!routineId) {
            alert('Este entrenamiento no está asociado a una rutina específica.')
            return
        }

        setIsRepeating(true)
        try {
            await startWorkout(routineId)
        } catch (err: any) {
            if (err.digest?.startsWith('NEXT_REDIRECT')) {
                // Next.js redirect is working, we don't need to do anything
                return
            }
            console.error('Error repeating workout:', err)
            alert('No se pudo iniciar el entrenamiento.')
            setIsRepeating(false)
        }
    }

    return (
        <div className="pt-10 flex flex-col sm:flex-row gap-4">
            <Button
                disabled={!routineId || isRepeating}
                className="flex-1 h-14 rounded-2xl bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 font-bold shadow-xl"
                onClick={handleRepeat}
            >
                {isRepeating ? 'Iniciando...' : 'Repetir Entrenamiento'}
            </Button>
            <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-neutral-200 dark:border-neutral-800"
                onClick={() => router.push('/dashboard/progress')}
            >
                Ver Progresión
            </Button>
        </div>
    )
}

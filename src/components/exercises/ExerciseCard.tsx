'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dumbbell, PlayCircle, Star, Info } from 'lucide-react'
import { toggleFavorite } from '@/app/dashboard/exercises/actions'
import { Exercise } from '@/types/exercise-filters'
import Link from 'next/link'

interface ExerciseCardProps {
    exercise: Exercise
    isFavorite: boolean
}

export function ExerciseCard({ exercise, isFavorite: initialFavorite }: ExerciseCardProps) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite)
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsTogglingFavorite(true)
        try {
            const newStatus = await toggleFavorite(exercise.id)
            setIsFavorite(newStatus)
        } catch (error) {
            console.error('Failed to toggle favorite:', error)
        } finally {
            setIsTogglingFavorite(false)
        }
    }

    return (
        <Link href={`/dashboard/exercises/${exercise.id}`}>
            <Card className="group border-none shadow-sm bg-white dark:bg-neutral-900 hover:scale-[1.02] transition-all overflow-hidden cursor-pointer h-full">
                <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 relative flex items-center justify-center overflow-hidden">
                    {exercise.video_url ? (
                        <PlayCircle className="h-12 w-12 text-white/50 group-hover:text-white/80 transition-colors z-10" />
                    ) : (
                        <Dumbbell className="h-12 w-12 text-neutral-300 dark:text-neutral-700 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-blue-500/10 text-blue-500 border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                            {exercise.muscle_group}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${isFavorite ? 'text-yellow-500' : 'text-neutral-300 hover:text-yellow-500'}`}
                            onClick={handleToggleFavorite}
                            disabled={isTogglingFavorite}
                        >
                            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight mt-2 line-clamp-2">
                        {exercise.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        {exercise.difficulty_level && (
                            <Badge variant="outline" className="text-[9px] font-bold border-neutral-200 dark:border-neutral-700 px-1.5 py-0">
                                {exercise.difficulty_level.toUpperCase()}
                            </Badge>
                        )}
                        {exercise.exercise_type && (
                            <Badge variant="outline" className="text-[9px] font-bold border-neutral-200 dark:border-neutral-700 px-1.5 py-0">
                                {exercise.exercise_type.toUpperCase()}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {exercise.equipment || 'Sin equipo'}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-primary hover:text-primary/80 hover:bg-primary/5 font-black gap-1 uppercase tracking-tighter"
                        >
                            Detalles <Info className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

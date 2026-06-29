import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, Star, Dumbbell, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { getUserFavorites } from '../actions'

interface ExerciseDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: exercise } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single()

    if (!exercise) {
        notFound()
    }

    const favorites = await getUserFavorites()
    const isFavorite = favorites.includes(exercise.id)

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent">
                    <Link href="/dashboard/exercises">
                        <ChevronLeft className="h-4 w-4" /> Volver a ejercicios
                    </Link>
                </Button>
            </div>

            {/* Exercise Info */}
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-blue-500/10 text-blue-500 border-none">
                                {exercise.muscle_group}
                            </Badge>
                            {exercise.difficulty_level && (
                                <Badge variant="outline">
                                    {exercise.difficulty_level}
                                </Badge>
                            )}
                            {exercise.exercise_type && (
                                <Badge variant="outline">
                                    {exercise.exercise_type}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">{exercise.name}</h1>
                        {exercise.description && (
                            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                                {exercise.description}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-12 w-12 ${isFavorite ? 'text-yellow-500 border-yellow-500' : ''}`}
                    >
                        <Star className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                </div>

                {/* Video/Image */}
                <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                    <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 relative flex items-center justify-center">
                        {exercise.video_url ? (
                            <>
                                <PlayCircle className="h-20 w-20 text-white/70" />
                                <p className="absolute bottom-4 text-sm text-neutral-400">Video próximamente</p>
                            </>
                        ) : (
                            <Dumbbell className="h-20 w-20 text-neutral-300 dark:text-neutral-700" />
                        )}
                    </div>
                </Card>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exercise.equipment && (
                        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                            <CardContent className="p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                    Equipamiento
                                </h3>
                                <p className="font-semibold">{exercise.equipment}</p>
                            </CardContent>
                        </Card>
                    )}

                    {exercise.joint_impact && (
                        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                            <CardContent className="p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                    Impacto Articular
                                </h3>
                                <p className="font-semibold capitalize">{exercise.joint_impact}</p>
                            </CardContent>
                        </Card>
                    )}

                    {exercise.duration_per_set && (
                        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                            <CardContent className="p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                    Duración por Serie
                                </h3>
                                <p className="font-semibold capitalize">{exercise.duration_per_set}</p>
                            </CardContent>
                        </Card>
                    )}

                    {exercise.discipline && (
                        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                            <CardContent className="p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                    Disciplina
                                </h3>
                                <p className="font-semibold capitalize">{exercise.discipline}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Instructions */}
                {exercise.instructions && exercise.instructions.length > 0 && (
                    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                Instrucciones
                            </h3>
                            <ol className="space-y-3">
                                {exercise.instructions.map((instruction, index) => (
                                    <li key={index} className="flex gap-3">
                                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-neutral-700 dark:text-neutral-300">{instruction}</span>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button className="flex-1 h-14 rounded-2xl font-bold text-lg">
                        Agregar a Rutina
                    </Button>
                </div>
            </div>
        </div>
    )
}

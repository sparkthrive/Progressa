import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Settings,
    Trophy,
    Calendar,
    Dumbbell,
    Flame,
    Edit2
} from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch full profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch workout stats
    const { count: workoutCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')

    // Fetch PRs (Mocked logic for now, using latest heavy sets)
    const { data: prs } = await supabase
        .from('workout_exercises')
        .select(`
            id,
            total_volume,
            exercise:exercises(name),
            workout:workouts(ended_at)
        `)
        .order('total_volume', { ascending: false })
        .limit(3)

    const fullName = profile?.full_name || user.email?.split('@')[0] || 'Atleta'
    const level = profile?.player_level || 1
    const xp = profile?.xp_points || 0
    const streak = profile?.current_streak || 0

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header / Banner */}
            <div className="relative rounded-[2rem] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border border-white/5 p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white/10 ring-4 ring-primary/20 shadow-2xl">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="text-4xl bg-neutral-800 font-black">{fullName[0]}</AvatarFallback>
                        </Avatar>
                        <Badge className="absolute bottom-0 right-0 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-black border-4 border-neutral-900">
                            {level}
                        </Badge>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <h1 className="text-4xl font-black tracking-tighter">{fullName}</h1>
                            <Link href="/dashboard/settings">
                                <Button variant="secondary" size="sm" className="rounded-xl h-8 gap-2">
                                    <Edit2 className="h-3 w-3" /> Editar
                                </Button>
                            </Link>
                        </div>
                        <p className="text-neutral-400 font-medium">Nivel {level} • {xp} XP acumulados</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <Badge variant="outline" className="bg-white/5 border-white/10 py-1.5 px-3 rounded-full gap-2">
                                <Flame className="h-4 w-4 text-orange-500 fill-orange-500" /> {streak} Días de racha
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 border-white/10 py-1.5 px-3 rounded-full gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {workoutCount} Entrenamientos
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 border-white/10 py-1.5 px-3 rounded-full gap-2 text-primary font-bold">
                                {profile?.experience_level === 'beginner' ? 'Principiante' :
                                    profile?.experience_level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Records */}
                <Card className="rounded-[2rem] bg-neutral-900/50 border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" /> Mejores Récords
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {prs && prs.length > 0 ? prs.map((pr: any) => (
                            <div key={pr.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-1">
                                    <p className="font-bold">{pr.exercise.name}</p>
                                    <p className="text-xs text-neutral-500">
                                        {new Date(pr.workout.ended_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-primary">{Math.round(pr.total_volume)} kg</p>
                                    <p className="text-[10px] text-neutral-500 uppercase font-black uppercase tracking-widest">VOLUMEN MAX</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-neutral-500">
                                <Dumbbell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>Sigue entrenando para ver tus récords</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Details */}
                <Card className="rounded-[2rem] bg-neutral-900/50 border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" /> Objetivos Actuales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {profile?.goals && profile.goals.map((goal: string, idx: number) => (
                                <Badge key={idx} className="bg-blue-500/10 text-blue-400 border-none px-4 py-2 rounded-xl text-sm font-bold">
                                    {goal === 'muscle' ? 'Ganar Músculo' :
                                        goal === 'weight-loss' ? 'Perder Peso' :
                                            goal === 'endurance' ? 'Resistencia' : goal}
                                </Badge>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-neutral-400">Email de cuenta</span>
                                <span className="font-bold">{user.email}</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-neutral-400">Miembro desde</span>
                                <span className="font-bold">{new Date(profile?.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

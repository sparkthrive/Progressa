import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardStats, TodayWorkout } from '@/components/dashboard/DashboardWidgets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    Activity,
    TrendingUp,
    Calendar,
    ChevronRight,
    Star,
    Users,
    ArrowUpRight,
    Trophy
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch User Profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // 2. Fetch Workouts Count
    const { count: workoutsCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')

    // 3. Fetch Recent Activity
    const { data: recentWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false })
        .limit(3)

    // 4. Fetch today's nutrition log
    const today = new Date().toISOString().split('T')[0]
    const { data: nutritionLog } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('recorded_at', today)
        .single()

    // 5. Fetch a real challenge for the sidebar
    const { data: featuredChallenge } = await supabase
        .from('challenges')
        .select('*')
        .gte('ends_at', new Date().toISOString())
        .limit(1)
        .single()

    // 6. Fetch a Routine for "Today" (Simple logic: most recent or first)
    const { data: todayRoutine } = await supabase
        .from('routines')
        .select(`
            *,
            routine_exercises(
                id,
                exercises(name, muscle_group)
            )
        `)
        .eq('user_id', user.id)
        .limit(1)
        .single()

    const firstName = profile?.full_name?.split(' ')[0] || 'Atleta'

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Hola, {firstName} 👋
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        {workoutsCount === 0
                            ? 'Es un gran día para empezar tu transformación.'
                            : 'Estás haciendo un excelente trabajo. ¡Sigue así!'}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-2 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black">
                        {profile?.player_level || 1}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Nivel de Atleta</p>
                        <p className="text-xs font-bold">{profile?.xp_points || 0} XP</p>
                    </div>
                </div>
            </div>

            {/* Main Stats Row */}
            <DashboardStats stats={{
                workouts: workoutsCount || 0,
                streak: profile?.current_streak || 0,
                points: profile?.xp_points || 0,
                volume: 0 // In a real app, sum total_volume from workout_exercises
            }} />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Today's Focus */}
                <div className="lg:col-span-2 space-y-6">
                    <TodayWorkout routine={todayRoutine} />

                    {/* Recent Activity */}
                    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">Actividad Reciente</CardTitle>
                                <p className="text-sm text-neutral-500">Tus últimos entrenamientos.</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="text-neutral-500">
                                <Link href="/dashboard/workouts" className="gap-1">
                                    Ver todo <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentWorkouts && recentWorkouts.length > 0 ? (
                                    recentWorkouts.map((workout) => (
                                        <div key={workout.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 group hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm">
                                                    <Activity className="h-5 w-5 text-neutral-900 dark:text-neutral-50" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-900 dark:text-neutral-50">{workout.name}</p>
                                                    <p className="text-xs text-neutral-500">
                                                        {workout.ended_at ? new Date(workout.ended_at).toLocaleDateString() : 'N/A'} • {workout.duration_seconds ? Math.floor(workout.duration_seconds / 60) : 0} min
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                                    Completo
                                                </Badge>
                                                <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-neutral-400 text-sm">No hay actividad reciente. ¡Empieza hoy!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Secondary Info */}
                <div className="space-y-6">
                    {/* Nutrition Summary */}
                    <Card className="border-none shadow-sm bg-neutral-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp className="h-24 w-24" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-neutral-400" />
                                Nutrición Hoy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400 font-medium">Calorías</span>
                                    <span className="font-bold">{nutritionLog?.calories || 0} <span className="text-neutral-500 font-normal">/ 2500</span></span>
                                </div>
                                <Progress value={Math.min(((nutritionLog?.calories || 0) / 2500) * 100, 100)} className="h-2 bg-neutral-800" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-neutral-500">Prot</p>
                                    <p className="text-sm font-bold">{nutritionLog?.protein || 0}g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-neutral-500">Carb</p>
                                    <p className="text-sm font-bold">{nutritionLog?.carbs || 0}g</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-neutral-500">Grasa</p>
                                    <p className="text-sm font-bold">{nutritionLog?.fats || 0}g</p>
                                </div>
                            </div>
                            <Button asChild className="w-full bg-white text-neutral-900 hover:bg-neutral-200 font-bold h-11 rounded-xl">
                                <Link href="/dashboard/nutrition">Detalles</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Community / Challenges */}
                    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                {featuredChallenge ? 'Reto Destacado' : 'Próximo Reto'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                                {featuredChallenge ? (
                                    <>
                                        <h4 className="font-bold text-sm">{featuredChallenge.title}</h4>
                                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                                            {featuredChallenge.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className="bg-blue-500 text-white border-none text-[8px] font-black">+{featuredChallenge.xp_reward} XP</Badge>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Activo</span>
                                        </div>
                                        <Button asChild className="w-full mt-2 h-9 text-xs rounded-xl" variant="outline">
                                            <Link href="/dashboard/challenges">Ver Reto</Link>
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-neutral-400">No hay retos disponibles en este momento.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

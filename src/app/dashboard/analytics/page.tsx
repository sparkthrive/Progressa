import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    TrendingUp,
    Dumbbell,
    Calendar,
    Trophy,
    ChevronLeft,
    ChevronRight,
    Target,
    Activity,
    Scale,
    Flame
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch User Stats (XP, Level)
    const { data: userStats } = await supabase
        .from('users')
        .select('xp, level')
        .eq('id', user.id)
        .single()

    // 2. Fetch Weekly Workout Volume (Last 4 weeks)
    // We would need a more complex query for actual volume, but let's mock the data for the UI
    // and show actual number of workouts
    const { count: workoutCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')

    // 3. Fetch Progress Photos (Last 4)
    const { data: photos } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(4)

    return (
        <div className="max-w-7xl mx-auto px-4 pb-32 space-y-12">
            {/* Header */}
            <div className="space-y-4">
                <Button variant="ghost" asChild className="gap-2 px-0 hover:bg-transparent text-neutral-500">
                    <Link href="/dashboard">
                        <ChevronLeft className="h-4 w-4" /> Volver al Dashboard
                    </Link>
                </Button>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Análisis de Progreso</h1>
                    <p className="text-neutral-500 font-medium">Visualiza tus resultados y mantén la motivación al máximo.</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Nivel Actual"
                    value={userStats?.level || 1}
                    subvalue={`${userStats?.xp || 0} XP Totales`}
                    icon={Trophy}
                    color="text-amber-500"
                    bg="bg-amber-50 dark:bg-amber-950/20"
                />
                <StatCard
                    label="Entrenamientos"
                    value={workoutCount || 0}
                    subvalue="Sesiones completadas"
                    icon={Dumbbell}
                    color="text-blue-500"
                    bg="bg-blue-50 dark:bg-blue-950/20"
                />
                <StatCard
                    label="Consistencia"
                    value="92%"
                    subvalue="Últimos 30 días"
                    icon={TrendingUp}
                    color="text-green-500"
                    bg="bg-green-50 dark:bg-green-950/20"
                />
                <StatCard
                    label="Meta Diaria"
                    value="2,450"
                    subvalue="Kcal promedio"
                    icon={Flame}
                    color="text-red-500"
                    bg="bg-red-50 dark:bg-red-950/20"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Volume Chart Placeholder */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[3rem] p-10">
                        <CardHeader className="p-0 mb-10 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black">Volumen de Entrenamiento</CardTitle>
                                <p className="text-sm text-neutral-500 font-medium font-mono uppercase tracking-widest">Kg levantados por semana</p>
                            </div>
                            <select className="bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-xs font-bold p-3 outline-none">
                                <option>Últimos 3 meses</option>
                                <option>Este año</option>
                            </select>
                        </CardHeader>
                        <div className="h-[350px] w-full bg-neutral-50 dark:bg-neutral-800/50 rounded-[2.5rem] flex items-end justify-around p-8 gap-4">
                            {/* Mock Bar Chart */}
                            {[45, 60, 55, 85, 70, 95, 80, 100].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div
                                        className="w-full bg-primary/10 group-hover:bg-primary/30 transition-all duration-500 rounded-t-2xl relative"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pb-2">
                                            <Badge className="bg-neutral-900 text-[9px] px-2 py-0.5">{10 + i * 2}k</Badge>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-tighter">S{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[2.5rem] p-8">
                            <h3 className="font-black mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" /> Distribución Muscular
                            </h3>
                            <div className="space-y-4">
                                <MuscleBar label="Pecho" percentage={75} color="bg-blue-500" />
                                <MuscleBar label="Espalda" percentage={60} color="bg-indigo-500" />
                                <MuscleBar label="Piernas" percentage={90} color="bg-green-500" />
                                <MuscleBar label="Brazos" percentage={45} color="bg-amber-500" />
                                <MuscleBar label="Hombros" percentage={30} color="bg-red-500" />
                            </div>
                        </Card>
                        <Card className="border-none bg-blue-600 text-white shadow-xl shadow-blue-500/20 rounded-[2.5rem] p-8 flex flex-col justify-between">
                            <div className="space-y-2">
                                <Trophy className="w-10 h-10 mb-4" />
                                <h3 className="text-2xl font-black leading-tight">¡Sigue así!<br />Estás a 250 XP del Nivel {userStats?.level ? userStats.level + 1 : 2}</h3>
                            </div>
                            <Button className="w-full h-12 rounded-2xl bg-white text-blue-600 font-bold mt-8">Ver Recompensas</Button>
                        </Card>
                    </div>
                </div>

                {/* Sidebar - Photos & More */}
                <aside className="lg:col-span-4 space-y-8">
                    <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black tracking-tight">Fotos de Progreso</h3>
                            <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-primary">
                                <Link href="/dashboard/progress">Ver todas</Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {photos && photos.length > 0 ? (
                                photos.map(photo => (
                                    <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 relative group">
                                        <img src={photo.photo_url} alt="Progreso" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <span className="text-[10px] text-white font-bold">{new Date(photo.recorded_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex items-center justify-center">
                                        <Scale className="w-6 h-6 text-neutral-200" />
                                    </div>
                                ))
                            )}
                        </div>
                        <Button className="w-full mt-6 rounded-2xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50 font-bold border-none h-12">
                            Añadir Nueva Foto
                        </Button>
                    </Card>

                    <Card className="border-none bg-neutral-900 text-white rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-black">Objetivos</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-neutral-400">Peso Corporal</span>
                                    <span>78kg / 75kg</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[30%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-neutral-400">Press de Banca</span>
                                    <span>95kg / 100kg</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[95%]" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    )
}

function StatCard({ label, value, subvalue, icon: Icon, color, bg }: any) {
    return (
        <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between">
            <div className={`h-12 w-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{label}</p>
                <h2 className="text-4xl font-black tracking-tighter">{value}</h2>
                <p className="text-[10px] font-medium text-neutral-500">{subvalue}</p>
            </div>
        </Card>
    )
}

function MuscleBar({ label, percentage, color }: any) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-neutral-500">{label}</span>
                <span className="text-neutral-400">{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

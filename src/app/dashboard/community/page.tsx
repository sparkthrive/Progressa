import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Trophy,
    Users,
    Star,
    TrendingUp,
    Flame,
    Target,
    ChevronRight,
    Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CommunityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch top 10 users by XP
    const { data: leaderboard } = await supabase
        .from('users')
        .select('id, full_name, username, xp_points, player_level, avatar_url, current_streak')
        .order('xp_points', { ascending: false })
        .limit(10)

    // Fetch some active challenges
    const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .gte('ends_at', new Date().toISOString())
        .limit(3)

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight">Comunidad</h1>
                    <p className="text-neutral-500 font-medium">Compite con otros atletas y sube de nivel.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl font-bold border-neutral-200 dark:border-neutral-800 gap-2">
                        <Search className="h-4 w-4" /> Buscar Atletas
                    </Button>
                    <Button asChild className="rounded-2xl font-bold bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900">
                        <Link href="/dashboard/challenges" className="gap-2">
                            <Trophy className="h-4 w-4" /> Ver Retos
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Leaderboard Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" /> Atletas de Élite
                        </h2>
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Global</span>
                    </div>

                    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                        <CardContent className="p-0">
                            {leaderboard?.map((u, idx) => (
                                <div
                                    key={u.id}
                                    className={`flex items-center justify-between p-6 border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group ${u.id === user.id ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-8 text-center">
                                            {idx === 0 ? <span className="text-2xl">🥇</span> :
                                                idx === 1 ? <span className="text-2xl">🥈</span> :
                                                    idx === 2 ? <span className="text-2xl">🥉</span> :
                                                        <span className="text-lg font-black text-neutral-300">{idx + 1}</span>}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-white dark:border-neutral-800 shadow-sm">
                                                    <AvatarImage src={u.avatar_url} />
                                                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 font-black text-xs">
                                                        {(u.full_name || u.username || '?').substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {u.current_streak > 0 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[8px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900 group-hover:scale-110 transition-transform">
                                                        <Flame className="h-3 w-3 fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                                                    {u.full_name || u.username} {u.id === user.id && <span className="text-[10px] text-blue-500 ml-1 font-black uppercase">(Tú)</span>}
                                                </p>
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">NIVEL {u.player_level}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black tabular-nums">{u.xp_points}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">XP TOTAL</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Challenges & Stats */}
                <div className="space-y-8">
                    {/* Featured Challenges */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Retos Activos</h3>
                            <ChevronRight className="h-4 w-4 text-neutral-300" />
                        </div>
                        {challenges?.map(c => (
                            <Link key={c.id} href="/dashboard/challenges">
                                <Card className="border-none shadow-sm bg-neutral-900 text-white overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                <Target className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <Badge className="bg-blue-500 text-white border-none font-bold text-[8px] uppercase tracking-widest">
                                                +{c.xp_reward} XP
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold tracking-tight">{c.title}</h4>
                                            <p className="text-xs text-neutral-400 line-clamp-2">{c.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Fun Stats */}
                    <Card className="border-none bg-blue-600 text-white p-6 rounded-[2rem] overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Star size={80} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-lg font-black tracking-tight leading-tight">¿Sabías que...?</h3>
                            <p className="text-sm font-medium text-blue-100">
                                Los atletas que entrenan con una comunidad son un <span className="font-black text-white">40% más constantes</span> en sus objetivos. 🚀
                            </p>
                            <Button className="w-full rounded-2xl bg-white text-blue-600 hover:bg-white/90 font-bold">
                                Invitar Amigos
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

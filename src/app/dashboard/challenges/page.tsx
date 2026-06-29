import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Trophy,
    Target,
    Clock,
    Zap,
    CheckCircle2,
    Lock,
    ChevronRight,
    Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { joinChallenge } from '../community/actions'

export default async function ChallengesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all challenges
    const { data: challenges } = await supabase
        .from('challenges')
        .select(`
            *,
            user_challenges(user_id, current_progress, is_completed)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-500">
                    <Trophy className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">PROGRESSA ACROSS</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter">Retos de la Comunidad</h1>
                <p className="text-neutral-500 font-medium max-w-xl">Supera tus límites, compite con la comunidad y desbloquea recompensas exclusivas.</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2rem] bg-neutral-900 text-white flex flex-col justify-between h-40">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    <div>
                        <p className="text-3xl font-black">1,250</p>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">XP Ganada esta semana</p>
                    </div>
                </div>
                <div className="p-8 rounded-[1.5rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-40">
                    <Trophy className="h-6 w-6 text-blue-500" />
                    <div>
                        <p className="text-3xl font-black">{challenges?.filter(c => c.user_challenges?.[0]?.is_completed).length || 0}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Retos Completados</p>
                    </div>
                </div>
                <div className="p-8 rounded-[1.5rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-40">
                    <Target className="h-6 w-6 text-red-500" />
                    <div>
                        <p className="text-3xl font-black">2</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">En Progreso</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black tracking-tight">Disponible Ahora</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges?.map(challenge => {
                        const userJoin = challenge.user_challenges?.find((uc: any) => uc.user_id === user.id)
                        const isJoined = !!userJoin
                        const isCompleted = userJoin?.is_completed
                        const progress = userJoin?.current_progress || 0
                        const percentage = Math.min((progress / challenge.target_goal) * 100, 100)

                        return (
                            <Card key={challenge.id} className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-green-100 dark:bg-green-950/30 text-green-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                                                {isCompleted ? <CheckCircle2 className="h-8 w-8" /> : <Trophy className="h-8 w-8" />}
                                            </div>
                                            <Badge className="bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 border-none font-bold py-1 px-3">
                                                +{challenge.xp_reward} XP
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold tracking-tight">{challenge.title}</h3>
                                            <p className="text-sm text-neutral-500 font-medium leading-relaxed">{challenge.description}</p>
                                        </div>

                                        {isJoined ? (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Progreso: {progress}/{challenge.target_goal}</p>
                                                    <p className="text-xs font-bold">{Math.round(percentage)}%</p>
                                                </div>
                                                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <form action={async () => {
                                                'use server'
                                                await joinChallenge(challenge.id)
                                            }}>
                                                <Button size="lg" className="w-full rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold group-hover:scale-[1.02] transition-transform">
                                                    Unirse al Reto
                                                </Button>
                                            </form>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="px-8 py-4 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                            <Clock className="h-3.5 w-3.5" />
                                            Termina en 5 días
                                        </div>
                                        <div className="flex items-center -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-700" />
                                            ))}
                                            <span className="ml-2 text-[10px] font-bold text-neutral-400">+128 atletas</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

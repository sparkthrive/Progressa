"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Clock, CheckCircle2, Target, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGroupChallenges } from '@/lib/hooks/groups'
import { joinChallenge } from '@/app/dashboard/community/actions'
import { toast } from 'sonner'

interface GroupChallengesProps {
    userId: string | null
}

export function GroupChallenges({ userId }: GroupChallengesProps) {
    const { challenges, loading } = useGroupChallenges()

    const handleJoinChallenge = async (id: string) => {
        try {
            await joinChallenge(id)
            toast.success('¡Te has unido al reto!')
            window.location.reload() // Quick fix to refresh state
        } catch (error) {
            toast.error('No se pudo unir al reto')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
            </div>
        )
    }

    if (challenges.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <p className="text-neutral-500 font-medium">No hay retos disponibles.</p>
                    <p className="text-sm text-neutral-400">Vuelve pronto para nuevas competencias.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
            {challenges.map(challenge => {
                const userJoin = challenge.user_challenges?.find((uc: any) => uc.user_id === userId)
                const isJoined = !!userJoin
                const isCompleted = userJoin?.is_completed
                const progress = userJoin?.current_progress || 0
                const percentage = Math.min((progress / challenge.target_goal) * 100, 100)

                return (
                    <Card key={challenge.id} className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden group rounded-3xl">
                        <CardContent className="p-0">
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-green-100 dark:bg-green-950/30 text-green-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                                        {isCompleted ? <CheckCircle2 className="h-6 h-6" /> : <Trophy className="h-6 h-6" />}
                                    </div>
                                    <Badge className="bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 border-none font-bold">
                                        +{challenge.xp_reward} XP
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold tracking-tight">{challenge.title}</h3>
                                    <p className="text-xs text-neutral-500 font-medium leading-relaxed line-clamp-2">{challenge.description}</p>
                                </div>

                                {isJoined ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Progreso: {progress}/{challenge.target_goal}</p>
                                            <p className="text-xs font-bold">{Math.round(percentage)}%</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleJoinChallenge(challenge.id)}
                                        size="sm"
                                        className="w-full rounded-xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold"
                                    >
                                        Unirse al Reto
                                    </Button>
                                )}
                            </div>

                            <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                    <Clock className="h-3.5 w-3.5" />
                                    Activo
                                </div>
                                <div className="flex items-center -space-x-1.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-5 w-5 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200" />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

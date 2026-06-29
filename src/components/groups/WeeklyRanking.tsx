"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Loader2, Info } from 'lucide-react'
import { getGroupWeeklyRanking } from '@/app/dashboard/groups/actions'

interface WeeklyRankingProps {
    groupId: string
}

export function WeeklyRanking({ groupId }: WeeklyRankingProps) {
    const [ranking, setRanking] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const data = await getGroupWeeklyRanking(groupId)
                setRanking(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchRanking()
    }, [groupId])

    if (loading) {
        return (
            <Card className="border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden rounded-[2rem]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-400">Ranking Semanal</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden rounded-[2rem]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-400">Ranking Semanal</CardTitle>
                <Trophy className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-0">
                {ranking.length > 0 ? (
                    <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                        {ranking.map((member, idx) => (
                            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 flex justify-center items-center">
                                        {idx === 0 ? (
                                            <div className="bg-amber-100 dark:bg-amber-950/40 p-1.5 rounded-lg">
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                            </div>
                                        ) : idx === 1 ? (
                                            <div className="bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-lg">
                                                <Medal className="w-4 h-4 text-neutral-400" />
                                            </div>
                                        ) : idx === 2 ? (
                                            <div className="bg-orange-100 dark:bg-orange-950/40 p-1.5 rounded-lg">
                                                <Medal className="w-4 h-4 text-orange-600" />
                                            </div>
                                        ) : (
                                            <span className="text-xs font-black text-neutral-300 dark:text-neutral-600">{idx + 1}</span>
                                        )}
                                    </div>
                                    <Avatar className="w-10 h-10 border-2 border-white dark:border-neutral-900 shadow-sm">
                                        <AvatarImage src={member.avatar_url} />
                                        <AvatarFallback className="text-[10px] bg-neutral-100 dark:bg-neutral-800 font-bold">
                                            {member.full_name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 line-clamp-1">{member.full_name}</span>
                                        <span className="text-[10px] font-medium text-neutral-400">Atleta</span>
                                    </div>
                                </div>
                                <div className="text-right bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/5">
                                    <span className="text-sm font-black text-primary">{member.weekly_xp.toLocaleString()}</span>
                                    <span className="text-[8px] font-bold text-primary/60 ml-1 uppercase">XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center space-y-2">
                        <div className="mx-auto w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                            <Info className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-neutral-500 font-medium px-4">Aún no hay actividad registrada esta semana.</p>
                    </div>
                )}

                <div className="p-4 bg-neutral-50/50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 text-center font-medium">Se reinicia cada Lunes a las 00:00</p>
                </div>
            </CardContent>
        </Card>
    )
}

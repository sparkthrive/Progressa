"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Trophy,
    Flame,
    Target,
    ChevronRight,
    Search,
    Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CommunityClientProps {
    leaderboard: any[]
    challenges: any[]
    currentUser: any
}

export function CommunityClient({ leaderboard, challenges, currentUser }: CommunityClientProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredLeaderboard = leaderboard.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight">Comunidad</h1>
                    <p className="text-neutral-500 font-medium">Compite con otros atletas y sube de nivel.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar atletas..."
                            className="h-10 pl-9 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 outline-none focus:ring-2 ring-primary/20 w-48 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button asChild className="rounded-xl font-bold bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 h-10">
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

                    <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden rounded-[2rem]">
                        <CardContent className="p-0">
                            {filteredLeaderboard.length > 0 ? filteredLeaderboard.map((u, idx) => (
                                <div
                                    key={u.id}
                                    className={`flex items-center justify-between p-6 border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group ${u.id === currentUser.id ? 'bg-primary/5 dark:bg-primary/10' : ''
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
                                                    {u.full_name || u.username} {u.id === currentUser.id && <span className="text-[10px] text-primary ml-1 font-black uppercase">(Tú)</span>}
                                                </p>
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">NIVEL {u.player_level || 1}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black tabular-nums">{u.xp_points || 0}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">XP TOTAL</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center">
                                    <p className="text-neutral-500">No se encontraron atletas.</p>
                                </div>
                            )}
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
                        {challenges && challenges.length > 0 ? challenges.map(c => (
                            <Link key={c.id} href="/dashboard/challenges">
                                <Card className="border-none shadow-sm bg-neutral-900 text-white overflow-hidden group hover:scale-[1.02] transition-transform rounded-2xl">
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
                        )) : (
                            <div className="p-6 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-2xl">
                                <p className="text-xs text-neutral-500 italic">No hay retos vigentes hoy.</p>
                            </div>
                        )}
                    </div>

                    {/* Fun Stats */}
                    <Card className="border-none bg-primary text-white p-6 rounded-[2.5rem] overflow-hidden relative shadow-xl shadow-primary/20">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Star size={80} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-lg font-black tracking-tight leading-tight">¿Sabías que...?</h3>
                            <p className="text-sm font-medium text-primary-100">
                                Los atletas que entrenan con una comunidad son un <span className="font-black text-white">40% más constantes</span> en sus objetivos. 🚀
                            </p>
                            <Button
                                className="w-full rounded-xl bg-white text-primary hover:bg-white/90 font-bold"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin)
                                    alert('Link de invitación copiado!')
                                }}
                            >
                                Invitar Amigos
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

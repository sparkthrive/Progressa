"use client"

import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    useGroup,
    useGroupActivities,
    useGroupMembers,
    useJoinGroup,
    useGroupClasses
} from '@/lib/hooks/groups'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Users,
    MessageSquare,
    Activity,
    Settings,
    Calendar,
    ChevronLeft,
    Share2,
    Trophy,
    Loader2,
    Lock,
    CheckCircle2,
    CalendarDays,
    Info,
    LayoutGrid,
    Target,
    Copy,
    Check,
    Sparkles,
    Hash,
    MoreVertical,
    UserMinus,
    LogOut,
    ChevronDown,
    Clock,
    TrendingUp,
    Dumbbell
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ActivityFeedItem } from '@/components/groups/ActivityFeedItem'
import { GroupChat } from '@/components/groups/GroupChat'
import { CreateClassDialog } from '@/components/groups/CreateClassDialog'
import { ClassCard } from '@/components/groups/ClassCard'
import { WeeklyRanking } from '@/components/groups/WeeklyRanking'
import { GroupChallenges } from '@/components/groups/GroupChallenges'
import { GroupSocialWall } from '@/components/groups/GroupSocialWall'
import { GroupShareActions } from '@/components/groups/GroupShareActions'
import { GroupSettingsDialog } from '@/components/groups/GroupSettingsDialog'
import { kickGroupMember, leaveGroup } from '@/app/dashboard/groups/actions'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const supabase = createClient()
    const [userId, setUserId] = useState<string | null>(null)

    const { group, loading: groupLoading } = useGroup(id)
    const { activities, loading: activitiesLoading } = useGroupActivities(id)
    const { members, loading: membersLoading } = useGroupMembers(id)
    const { classes, loading: classesLoading } = useGroupClasses(id)

    const { joinByCode, loading: joining } = useJoinGroup()
    const router = useRouter()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const isMember = !!(members.some(m => m.user_id === userId) || (group && userId && group.creator_id === userId))
    const isAdmin = !!(members.some(m => m.user_id === userId && (m.role === 'admin' || m.role === 'trainer')) || (group && userId && group.creator_id === userId))

    useEffect(() => {
        supabase.auth.getUser().then(({ data }: any) => setUserId(data.user?.id || null))
    }, [])

    const handleJoin = async () => {
        if (!group?.join_code) return
        const resultId = await joinByCode(group.join_code)
        if (resultId) {
            toast.success('¡Te has unido al grupo!')
            // Local state update or refresh
            window.location.reload()
        }
    }

    const handleKick = async (memberUserId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar a este miembro?')) return
        setActionLoading(memberUserId)
        try {
            await kickGroupMember(id, memberUserId)
            toast.success('Miembro eliminado')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleLeave = async () => {
        if (!confirm('¿Estás seguro de que deseas abandonar este grupo?')) return

        try {
            await leaveGroup(id)
            toast.success('Has abandonado el grupo')
            router.push('/dashboard/groups')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    if (groupLoading || membersLoading || !userId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-neutral-500">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="animate-pulse font-medium">Sincronizando con tu comunidad...</p>
            </div>
        );
    }

    if (!group) return <div>Grupo no encontrado</div>

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header Profile Section */}
            <div className="relative mb-8">
                <Link href="/dashboard/groups" className="absolute -top-12 left-0 flex items-center text-sm text-neutral-500 hover:text-primary transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Volver
                </Link>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pt-4">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-neutral-900 shadow-xl rounded-3xl overflow-hidden">
                        <AvatarImage src={group.photo_url || ''} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary-400 to-primary-600 text-white text-3xl font-bold">
                            {group.name[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                            <h1 className="text-3xl font-black tracking-tight">{group.name}</h1>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
                                {group.type.toUpperCase()}
                            </Badge>
                            {group.is_private && <Badge variant="outline" className="border-neutral-200 dark:border-neutral-800">Privado</Badge>}
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto md:mx-0">
                            {group.description}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm font-medium">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                <Users className="w-4 h-4 text-neutral-400" /> {group.current_members} miembros
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                <Activity className="w-4 h-4 text-neutral-400" /> {activities.length} actividades
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <GroupShareActions group={group} />
                        {isAdmin && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-xl border-neutral-200 dark:border-neutral-800"
                                onClick={() => setIsSettingsOpen(true)}
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        )}
                        {isMember && !isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-xl border-neutral-200 dark:border-neutral-800">
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="p-2 rounded-2xl">
                                    <DropdownMenuItem
                                        onClick={handleLeave}
                                        className="text-red-500 gap-2 p-3 rounded-xl cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Abandonar Grupo</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {!isMember && (
                            <Button
                                className="bg-primary hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary/20"
                                onClick={handleJoin}
                                disabled={joining}
                            >
                                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unirse al Grupo'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Tabs UI */}
            <Tabs defaultValue="feed" className="w-full">
                <TabsList className="w-full justify-start p-1 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-xl border border-neutral-100 dark:border-neutral-800 rounded-2xl mb-8 overflow-x-auto h-auto">
                    <TabsTrigger value="feed" className="rounded-xl flex gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm">
                        <Activity className="w-4 h-4" /> Actividad
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="rounded-xl flex gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
                        <Users className="w-4 h-4" /> Comunidad
                    </TabsTrigger>
                    <TabsTrigger value="classes" className="rounded-xl flex gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
                        <CalendarDays className="w-4 h-4" /> Clases
                    </TabsTrigger>
                    <TabsTrigger value="challenges" className="rounded-xl flex gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
                        <Trophy className="w-4 h-4" /> Retos
                    </TabsTrigger>
                    <TabsTrigger value="members" className="rounded-xl flex gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">
                        <Users className="w-4 h-4" /> Miembros
                    </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <TabsContent value="feed" className="space-y-4 m-0 focus-visible:ring-0">
                            {activitiesLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-2xl" />)}
                                </div>
                            ) : activities.length > 0 ? (
                                activities.map(activity => (
                                    <ActivityFeedItem key={activity.id} activity={activity} />
                                ))
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-3xl">
                                    <Activity className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                    <p className="text-neutral-500 font-medium">No hay actividad reciente aún.</p>
                                    <p className="text-sm text-neutral-400">¡Sé el primero en publicar tu progreso!</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="chat" className="m-0 focus-visible:ring-0">
                            {isMember ? (
                                <GroupSocialWall groupId={id} userId={userId || ''} />
                            ) : (
                                <div className="py-20 text-center bg-neutral-50 dark:bg-neutral-800/20 rounded-3xl border border-neutral-100 dark:border-neutral-800">
                                    <Lock className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                    <p className="text-neutral-500 font-bold">Muro restringido</p>
                                    <p className="text-sm text-neutral-400 mb-6">Debes ser miembro de este grupo para ver y participar en el muro social.</p>
                                    <Button variant="outline" className="rounded-xl">Unirse ahora</Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="classes" className="space-y-6 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Próximas Clases</h3>
                                {isAdmin && <CreateClassDialog groupId={id} />}
                            </div>

                            {classesLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
                                </div>
                            ) : classes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {classes.map(c => (
                                        <ClassCard
                                            key={c.id}
                                            classItem={c}
                                            groupId={id}
                                            currentUserId={userId || ''}
                                            isMember={isMember}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] space-y-4">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                                        <CalendarDays className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-neutral-500 font-medium">No hay clases programadas.</p>
                                        <p className="text-sm text-neutral-400">Vuelve más tarde para ver nuevas sesiones.</p>
                                    </div>
                                    {isAdmin && <CreateClassDialog groupId={id} />}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="challenges" className="m-0 focus-visible:ring-0">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Retos de Grupo</h3>
                            </div>
                            <GroupChallenges userId={userId} />
                        </TabsContent>

                        <TabsContent value="members" className="m-0 focus-visible:ring-0">
                            {membersLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-3xl" />
                                    ))}
                                </div>
                            ) : members.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar className="w-14 h-14 border-2 border-white dark:border-neutral-800 shadow-sm">
                                                        <AvatarImage src={member.user?.avatar_url} />
                                                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                                            {member.user?.full_name?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full" title="Conectado" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{member.user?.full_name || 'Atleta'}</h4>
                                                        {member.user_id === userId && <Badge variant="secondary" className="text-[9px] h-4 bg-primary/10 text-primary border-transparent">Tú</Badge>}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="outline" className={`text-[10px] py-0 px-2 h-5 rounded-full ${member.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20' :
                                                            member.role === 'trainer' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20' : 'text-neutral-400 border-neutral-100'
                                                            }`}>
                                                            {member.role === 'admin' ? 'Fundador' : member.role === 'trainer' ? 'Entrenador' : 'Miembro'}
                                                        </Badge>
                                                        <span className="text-[10px] text-neutral-400 font-medium tracking-tight">Desde {new Date(member.joined_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {isAdmin && member.user_id !== userId && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                                <MoreVertical className="w-4 h-4 text-neutral-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="p-2 rounded-2xl">
                                                            <DropdownMenuItem
                                                                onClick={() => handleKick(member.user_id)}
                                                                className="text-red-500 gap-2 p-3 rounded-xl cursor-pointer"
                                                                disabled={actionLoading === member.user_id}
                                                            >
                                                                {actionLoading === member.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                                                                <span>Expulsar del grupo</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                                <Button variant="ghost" size="icon" className="rounded-full">
                                                    <MessageSquare className="w-4 h-4 text-neutral-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] space-y-4">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-neutral-500 font-medium">No hay miembros aún.</p>
                                        <p className="text-sm text-neutral-400">Invita a tus amigos para que se unan.</p>
                                    </div>
                                    {group?.join_code && (
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(group.join_code || '');
                                                toast.success('¡Código copiado!');
                                            }}
                                            className="bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                                        >
                                            Copiar Código de Invitación
                                        </Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </div>

                    {/* Right Sidebar - Group Info */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Weekly Ranking */}
                        <WeeklyRanking groupId={id} />

                        {/* Join Code Card (Only for members/admins) */}
                        {isMember && group?.join_code && (
                            <div className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-[2rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Sparkles className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                                    <Hash className="w-4 h-4" /> Código de acceso
                                </h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                                    Comparte este código para que otros atletas se unan a tu comunidad.
                                </p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(group.join_code || '');
                                        toast.success('¡Código copiado!');
                                    }}
                                    className="w-full p-4 bg-white dark:bg-neutral-900 border border-primary/20 rounded-2xl text-center font-mono font-black text-2xl tracking-[0.2em] text-primary shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                                >
                                    {group.join_code}
                                    <Copy className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            </Tabs>

            {isAdmin && (
                <GroupSettingsDialog
                    group={group}
                    isOpen={isSettingsOpen}
                    onOpenChange={setIsSettingsOpen}
                />
            )}
        </div>
    )
}

"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Dumbbell, Camera, Star, UserPlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { GroupActivity } from '@/types/groups'

interface ActivityFeedItemProps {
    activity: GroupActivity
}

export function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
    const getIcon = () => {
        switch (activity.type) {
            case 'workout_completed': return <Dumbbell className="w-4 h-4 text-blue-500" />;
            case 'new_pr': return <Trophy className="w-4 h-4 text-amber-500" />;
            case 'photo_uploaded': return <Camera className="w-4 h-4 text-purple-500" />;
            case 'joined_group': return <UserPlus className="w-4 h-4 text-green-500" />;
            default: return <Star className="w-4 h-4 text-primary" />;
        }
    };

    const getTitle = () => {
        const name = activity.user?.full_name || 'Alguien';
        switch (activity.type) {
            case 'workout_completed': return <span><b>{name}</b> completó su entrenamiento</span>;
            case 'new_pr': return <span><b>{name}</b> ¡batió un récord personal!</span>;
            case 'photo_uploaded': return <span><b>{name}</b> subió una foto</span>;
            case 'joined_group': return <span><b>{name}</b> se unió al grupo</span>;
            default: return <span><b>{name}</b> tuvo una novedad</span>;
        }
    };

    return (
        <Card className="p-4 border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <div className="flex gap-4">
                <Avatar className="w-10 h-10 border border-neutral-100 dark:border-neutral-800">
                    <AvatarImage src={activity.user?.avatar_url} />
                    <AvatarFallback>{activity.user?.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-neutral-50 dark:bg-neutral-800">
                            {getIcon()}
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                            {getTitle()}
                        </div>
                    </div>

                    {activity.data?.message && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 italic">
                            "{activity.data.message}"
                        </p>
                    )}

                    {activity.data?.photo_url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
                            <img src={activity.data.photo_url} alt="Activity" className="w-full h-auto max-h-80 object-cover" />
                        </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}
                        </span>
                        {activity.data?.stats && (
                            <div className="flex gap-2">
                                {Object.entries(activity.data.stats).map(([key, val]: any) => (
                                    <Badge key={key} variant="outline" className="text-[10px] py-0 px-1.5 h-5 bg-neutral-50 dark:bg-neutral-800">
                                        {val} {key}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

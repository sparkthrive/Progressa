"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Loader2, CheckCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { joinGroupClass } from '@/app/dashboard/groups/actions'
import { toast } from 'sonner'

interface ClassCardProps {
    classItem: any
    groupId: string
    currentUserId: string
    isMember: boolean
}

export function ClassCard({ classItem, groupId, currentUserId, isMember }: ClassCardProps) {
    const [loading, setLoading] = useState(false)
    const isJoined = classItem.attendance?.some((a: any) => a.user_id === currentUserId)
    const isFull = classItem.max_attendees && classItem.current_attendees >= classItem.max_attendees
    const isPast = new Date(classItem.start_time) < new Date()

    const handleJoin = async () => {
        if (!isMember) return toast.error('Únete al grupo primero')
        setLoading(true)
        try {
            await joinGroupClass(classItem.id, groupId)
            toast.success('¡Te has anotado a la clase!')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-none bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-wider">
                                Entrenamiento
                            </Badge>
                            {isJoined && (
                                <Badge className="bg-green-500 text-white border-none text-[10px] font-black uppercase tracking-wider">
                                    Inscrito
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-lg font-bold tracking-tight">{classItem.name}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black">{classItem.current_attendees || 0}/{classItem.max_attendees || '∞'}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">Lugares</p>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-neutral-500">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                        {format(parseISO(classItem.start_time), "EEEE d 'de' MMMM", { locale: es })}
                    </div>
                    <div className="flex items-center text-sm text-neutral-500">
                        <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                        {format(parseISO(classItem.start_time), "HH:mm")} ({classItem.duration_minutes} min)
                    </div>
                    {classItem.location && (
                        <div className="flex items-center text-sm text-neutral-500">
                            <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                            {classItem.location}
                        </div>
                    )}
                </div>

                {classItem.description && (
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-6 italic">
                        "{classItem.description}"
                    </p>
                )}

                {!isPast && (
                    <Button
                        onClick={handleJoin}
                        disabled={loading || isJoined || isFull}
                        variant={isJoined ? "outline" : "default"}
                        className={`w-full rounded-xl font-bold h-10 ${isJoined ? 'border-green-500 text-green-500 hover:bg-green-50' : 'bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900'}`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            isJoined ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Inscrito</> :
                                isFull ? 'Clase Llena' : 'Anotarme'}
                    </Button>
                )}
                {isPast && (
                    <Button disabled className="w-full rounded-xl font-bold h-10 bg-neutral-100 text-neutral-400">
                        Clase Finalizada
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

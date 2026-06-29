"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Lock, ChevronRight, Hash } from 'lucide-react'
import { Group } from '@/types/groups'

interface GroupCardProps {
    group: Group
}

export function GroupCard({ group }: GroupCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 group">
            <div className="relative h-32 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {group.photo_url ? (
                    <img
                        src={group.photo_url}
                        alt={group.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                        <Users className="w-10 h-10 text-primary-500/40" />
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    {group.is_private && (
                        <Badge variant="secondary" className="bg-black/40 text-white backdrop-blur-md border-transparent">
                            <Lock className="w-3 h-3 mr-1" /> Privado
                        </Badge>
                    )}
                    <Badge className="bg-primary/90 text-white border-transparent">
                        {group.type === 'gym' ? 'Gimnasio' :
                            group.type === 'friends' ? 'Amigos' :
                                group.type === 'bootcamp' ? 'Bootcamp' :
                                    group.type === 'online' ? 'Online' : 'Empresa'}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white line-clamp-1">{group.name}</h3>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 h-10">
                    {group.description || 'Sin descripción disponible.'}
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        <span>{group.current_members} {group.max_members ? `/ ${group.max_members}` : ''}</span>
                    </div>
                    {group.join_code && (
                        <div className="flex items-center">
                            <Hash className="w-3.5 h-3.5 mr-1" />
                            <span>{group.join_code}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Link
                    href={`/dashboard/groups/${group.id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-primary hover:bg-primary-600 rounded-lg group/btn"
                >
                    Ver Grupo
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
            </CardFooter>
        </Card>
    )
}

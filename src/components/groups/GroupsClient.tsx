"use client"

import React, { useState } from 'react'
import { GroupCard } from '@/components/groups/GroupCard'
import { Button } from '@/components/ui/button'
import { Plus, Search, Users, Sparkles, Hash, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useJoinGroup } from '@/lib/hooks/groups'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Group } from '@/types/groups'

interface GroupsClientProps {
    myGroups: Group[]
    publicGroups: Group[]
}

export function GroupsClient({ myGroups, publicGroups }: GroupsClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
    const { joinByCode, loading: joining } = useJoinGroup()
    const router = useRouter()

    const filteredMyGroups = myGroups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredPublicGroups = publicGroups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleJoinByCode = async () => {
        if (!joinCode) return toast.error('Ingresa un código')

        const groupId = await joinByCode(joinCode)
        if (groupId) {
            toast.success('¡Te has unido al grupo!')
            setIsJoinDialogOpen(false)
            router.push(`/dashboard/groups/${groupId}`)
        } else {
            toast.error('Código no válido o ya eres miembro')
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary" />
                        Grupos de Entrenamiento
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl">
                        Entrena en comunidad, comparte tus logros y participa en clases exclusivas.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-neutral-200 dark:border-neutral-800">
                                <Hash className="w-4 h-4 mr-2" /> Unirse con código
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Unirse con código</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Ingresa el código único de 6 caracteres que te compartieron.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2 py-4">
                                <Input
                                    placeholder="EJ: AF7G21"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    className="h-14 text-center font-mono text-xl tracking-widest rounded-2xl uppercase"
                                    maxLength={6}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    className="w-full h-12 rounded-xl bg-primary text-white font-bold"
                                    onClick={handleJoinByCode}
                                    disabled={joining}
                                >
                                    {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unirse ahora'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Link href="/dashboard/groups/new">
                        <Button className="bg-primary hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary/20 h-10">
                            <Plus className="w-4 h-4 mr-2" /> Crear Grupo
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Search */}
            <div className="relative mb-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                    className="pl-10 h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl"
                    placeholder="Busca grupos por nombre o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* My Groups Section */}
            {filteredMyGroups.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Mis Grupos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMyGroups.map((group) => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </div>
                </section>
            )}

            {/* Recommended Groups */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">Descubrir Grupos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPublicGroups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                    {filteredPublicGroups.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-3xl">
                            <p className="text-neutral-500">No se encontraron grupos públicos.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

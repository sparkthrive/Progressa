"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, ChevronLeft, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewGroupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'friends',
        is_private: false,
        max_members: '50',
        join_code: Math.random().toString(36).substring(2, 8).toUpperCase()
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) return toast.error('El nombre es obligatorio')

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No estás autenticado')

            // 1. Create the group
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name: formData.name,
                    description: formData.description,
                    type: formData.type,
                    is_private: formData.is_private,
                    max_members: parseInt(formData.max_members),
                    join_code: formData.join_code,
                    creator_id: user.id,
                    current_members: 1
                })
                .select()
                .single()

            if (groupError) throw groupError

            // 2. Add creator as Admin
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'admin'
                })

            if (memberError) throw memberError

            toast.success('¡Grupo creado con éxito!')
            router.push(`/dashboard/groups/${group.id}`)
        } catch (error: any) {
            console.error('Error creating group:', error)
            const message = error.message || error.details || 'Error al crear el grupo'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 pb-20 lg:pb-0">
            <Link href="/dashboard/groups" className="inline-flex items-center text-sm text-neutral-500 hover:text-primary mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Volver a Grupos
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Crear Nuevo Grupo</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                    Define la identidad de tu comunidad y empieza a entrenar juntos.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="border-neutral-100 dark:border-neutral-800 shadow-xl shadow-neutral-200/20 dark:shadow-none bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                        <CardTitle className="text-lg">Información Básica</CardTitle>
                        <CardDescription>Estos detalles serán visibles para los miembros potenciales.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Grupo</Label>
                            <Input
                                id="name"
                                placeholder="Ej. Los Guerreros del HIIT"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl"
                                maxLength={50}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                placeholder="¿De qué trata este grupo? ¿Cuál es el objetivo?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="rounded-xl min-h-[120px]"
                                maxLength={500}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo de Grupo</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="friends">Amigos</SelectItem>
                                        <SelectItem value="gym">Gimnasio</SelectItem>
                                        <SelectItem value="company">Empresa</SelectItem>
                                        <SelectItem value="bootcamp">Bootcamp</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_members">Capacidad Máxima</Label>
                                <Input
                                    id="max_members"
                                    type="number"
                                    value={formData.max_members}
                                    onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-neutral-100 dark:border-neutral-800 shadow-xl shadow-neutral-200/20 dark:shadow-none bg-white dark:bg-neutral-900 rounded-2xl">
                    <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                        <CardTitle className="text-lg">Privacidad y Acceso</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                            <div className="space-y-0.5">
                                <Label className="text-base">Grupo Privado</Label>
                                <p className="text-sm text-neutral-500">Solo personas con el código podrán unirse.</p>
                            </div>
                            <Switch
                                checked={formData.is_private}
                                onCheckedChange={(val) => setFormData({ ...formData, is_private: val })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="join_code">Código de Invitación</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="join_code"
                                    value={formData.join_code}
                                    readOnly
                                    className="rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-center tracking-widest uppercase"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => setFormData({ ...formData, join_code: Math.random().toString(36).substring(2, 8).toUpperCase() })}
                                >
                                    Regenerar
                                </Button>
                            </div>
                            <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Comparte este código para que otros se unan.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 pt-4">
                    <Button
                        disabled={loading}
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary-600 text-white h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5 mr-2" /> Crear Grupo
                            </>
                        )}
                    </Button>
                    <Link href="/dashboard/groups" className="flex-1">
                        <Button variant="outline" className="w-full h-12 rounded-xl text-md font-medium border-neutral-200 dark:border-neutral-800">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}

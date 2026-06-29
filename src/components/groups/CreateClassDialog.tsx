"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, Loader2, Plus, Users } from 'lucide-react'
import { createGroupClass } from '@/app/dashboard/groups/actions'
import { toast } from 'sonner'

interface CreateClassDialogProps {
    groupId: string
}

export function CreateClassDialog({ groupId }: CreateClassDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_time: '',
        duration_minutes: 60,
        max_attendees: 20
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.start_time) return toast.error('Completa los campos obligatorios')

        setLoading(true)
        try {
            await createGroupClass({
                group_id: groupId,
                ...formData,
                max_attendees: Number(formData.max_attendees)
            })
            toast.success('¡Clase programada con éxito!')
            setOpen(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mt-4 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" /> Crear Clase
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-[2.5rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Programar Clase</DialogTitle>
                    <DialogDescription>
                        Crea una sesión de entrenamiento para los miembros del grupo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="className">Nombre de la Clase</Label>
                        <Input
                            id="className"
                            placeholder="Ej: Power Yoga o Intro al Crossfit"
                            className="rounded-xl"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="classDesc">Descripción (Opcional)</Label>
                        <Textarea
                            id="classDesc"
                            placeholder="Detalles sobre el equipo necesario o nivel..."
                            className="rounded-xl"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Fecha y Hora</Label>
                            <div className="relative">
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    className="rounded-xl pl-9"
                                    value={formData.start_time}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duración (min)</Label>
                            <div className="relative">
                                <Input
                                    id="duration"
                                    type="number"
                                    className="rounded-xl pl-9"
                                    value={formData.duration_minutes}
                                    onChange={e => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max">Capacidad Máxima (Atletas)</Label>
                        <div className="relative">
                            <Input
                                id="max"
                                type="number"
                                className="rounded-xl pl-9"
                                value={formData.max_attendees}
                                onChange={e => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
                            />
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-white font-bold" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar Clase'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

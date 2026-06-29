"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Settings, Loader2, Trash2, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ui/image-upload'

interface GroupSettingsDialogProps {
    group: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function GroupSettingsDialog({ group, isOpen, onOpenChange }: GroupSettingsDialogProps) {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: group.name,
        description: group.description || '',
        is_private: group.is_private,
        photo_url: group.photo_url || ''
    })

    const handleUpdate = async () => {
        if (!formData.name) return toast.error('El nombre es obligatorio')

        setLoading(true)
        try {
            const { error } = await supabase
                .from('groups')
                .update({
                    name: formData.name,
                    description: formData.description,
                    is_private: formData.is_private,
                    photo_url: formData.photo_url
                })
                .eq('id', group.id)

            if (error) throw error

            toast.success('¡Grupo actualizado!')
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            toast.error('Error al actualizar el grupo')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.')) return

        setDeleting(true)
        try {
            const { error } = await supabase
                .from('groups')
                .delete()
                .eq('id', group.id)

            if (error) throw error

            toast.success('Grupo eliminado')
            router.push('/dashboard/groups')
        } catch (error) {
            toast.error('Error al eliminar el grupo')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-8">
                <DialogHeader className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                            <Settings className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Ajustes del Grupo</DialogTitle>
                    </div>
                    <DialogDescription className="text-neutral-500">
                        Gestiona la identidad y privacidad de tu comunidad.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex justify-center">
                        <ImageUpload
                            value={formData.photo_url}
                            onChange={(url) => setFormData({ ...formData, photo_url: url })}
                            bucketName="avatars"
                            folderPath="groups"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nombre del Grupo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-medium px-4"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-neutral-400">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[100px] rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none font-medium px-4 py-3"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Grupo Privado</Label>
                            <p className="text-[10px] text-neutral-400">Solo personas con el código podrán unirse.</p>
                        </div>
                        <Switch
                            checked={formData.is_private}
                            onCheckedChange={(val) => setFormData({ ...formData, is_private: val })}
                        />
                    </div>

                    <div className="pt-4">
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-red-600 mb-1">
                                <ShieldAlert className="w-4 h-4" /> Zona Peligrosa
                            </h4>
                            <p className="text-[11px] text-red-600/70 mb-4">Una vez eliminado el grupo, todos los datos, mensajes y miembros se perderán para siempre.</p>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl h-10 px-3 font-bold text-xs"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Trash2 className="w-3 h-3 mr-2" />}
                                Eliminar permanentemente este grupo
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-8 gap-3 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-2xl h-12 font-bold flex-1 sm:flex-none sm:min-w-[100px]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-primary hover:bg-primary-600 text-white rounded-2xl h-12 font-bold shadow-lg shadow-primary/20 flex-1 sm:flex-none sm:min-w-[140px]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

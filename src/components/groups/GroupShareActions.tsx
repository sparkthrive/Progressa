"use client"

import React, { useRef, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Share2, Download, Copy, Image as ImageIcon, Loader2, Sparkles, User, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface GroupShareActionsProps {
    group: any
    className?: string
}

export function GroupShareActions({ group, className }: GroupShareActionsProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [generating, setGenerating] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    const handleCopyLink = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success('¡Enlace copiado al portapapeles!')
        } catch (err) {
            toast.error('No se pudo copiar el enlace')
        }
    }

    const handleDownloadInvite = async () => {
        if (!cardRef.current) return
        setGenerating(true)
        try {
            // Wait a bit for images to load if any
            await new Promise(resolve => setTimeout(resolve, 500))

            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            })

            download(dataUrl, `invite-${group.name.toLowerCase().replace(/\s+/g, '-')}.png`)
            toast.success('¡Invitación lista para compartir!')
            setIsInviteOpen(false)
        } catch (err) {
            console.error(err)
            toast.error('Error al generar la imagen')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className={`rounded-xl border-neutral-200 dark:border-neutral-800 ${className}`}>
                        <Share2 className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-none shadow-2xl">
                    <DropdownMenuItem
                        onClick={() => setIsInviteOpen(true)}
                        className="flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <ImageIcon className="w-4 h-4 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">Tarjeta de Invitación</span>
                            <span className="text-[10px] text-neutral-400">Generat imagen con QR/Código</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-800 mx-1" />
                    <DropdownMenuItem
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <Copy className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm font-bold">Copiar Link de Acceso</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 border-none bg-transparent shadow-none overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-white text-center hidden">Invitación al Grupo</DialogTitle>
                    </DialogHeader>

                    <div className="p-4 flex flex-col items-center gap-6">
                        {/* The Invitation Card UI */}
                        <div
                            ref={cardRef}
                            className="w-full aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col items-center justify-between p-10 text-center"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 0% 0%, var(--primary-50) 0%, transparent 50%), radial-gradient(circle at 100% 100%, var(--primary-50) 0%, transparent 50%)'
                            }}
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-8 right-8">
                                <Sparkles className="w-8 h-8 text-primary shadow-sm" />
                            </div>

                            <div className="space-y-6 flex flex-col items-center w-full">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110" />
                                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl relative z-10 rounded-[2rem] overflow-hidden">
                                        <AvatarImage src={group.photo_url || ''} className="object-cover" />
                                        <AvatarFallback className="bg-primary text-white text-4xl font-black">
                                            {group.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black tracking-tight text-neutral-900 leading-tight">
                                        {group.name}
                                    </h2>
                                    <p className="text-sm text-neutral-500 font-medium px-4">
                                        ¡Me he unido a esta comunidad de atletas! Entrena conmigo en PROGRESSA.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full space-y-6 mt-4">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                                        Código de Acceso
                                    </p>
                                    <div className="bg-neutral-50 border-2 border-dashed border-primary/20 p-5 rounded-3xl relative group">
                                        <span className="text-4xl font-mono font-black text-neutral-900 tracking-widest uppercase">
                                            {group.join_code}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-neutral-400">
                                    <Hash className="w-4 h-4" />
                                    <span className="text-xs font-bold tracking-widest font-mono">PROGRESSA APP</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full max-w-[340px]">
                            <Button
                                className="flex-1 bg-white hover:bg-neutral-50 text-neutral-900 rounded-2xl h-12 font-bold shadow-lg shadow-white/10"
                                variant="outline"
                                onClick={() => setIsInviteOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-2xl h-12 font-bold shadow-lg shadow-primary/20"
                                onClick={handleDownloadInvite}
                                disabled={generating}
                            >
                                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

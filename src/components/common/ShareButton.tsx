"use client"

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
    title: string
    text: string
    url: string
    className?: string
    variant?: "outline" | "ghost" | "default" | "secondary"
    size?: "default" | "sm" | "lg" | "icon"
}

export function ShareButton({ title, text, url, className, variant = "outline", size = "icon" }: ShareButtonProps) {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                })
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    toast.error('Error al compartir')
                }
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${text} ${url}`)
                toast.success('Enlace copiado al portapapeles')
            } catch (err) {
                toast.error('No se pudo copiar el enlace')
            }
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleShare}
            title="Compartir"
        >
            <Share2 className="w-4 h-4" />
            {size !== "icon" && <span className="ml-2">Compartir</span>}
        </Button>
    )
}

"use client"

import { useState, useRef } from 'react'
import { Loader2, Camera, Image as ImageIcon, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value?: string | null
    onChange: (url: string) => void
    disabled?: boolean
    bucketName?: string // 'avatars' or 'groups'
    folderPath?: string
    className?: string
    type?: 'avatar' | 'banner'
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    bucketName = 'avatars',
    folderPath = 'profiles',
    className,
    type = 'avatar'
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            // Basic validation
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen debe pesar menos de 5MB')
                return
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${folderPath}/${crypto.randomUUID()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, { upsert: true })

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName)

            onChange(publicUrl)
            toast.success('Imagen subida correctamente')

        } catch (error: any) {
            console.error(error)
            toast.error('Error al subir la imagen', { description: 'Asegúrate de que el bucket de almacenamiento exista y sea público.' })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            <div className={cn(
                "relative group cursor-pointer overflow-hidden border-2 border-dashed border-neutral-200 dark:border-neutral-800 transition-all hover:border-primary/50",
                type === 'avatar' ? "h-32 w-32 rounded-full" : "h-48 w-full rounded-2xl"
            )} onClick={() => !disabled && !uploading && inputRef.current?.click()}>

                {value ? (
                    <img
                        src={value}
                        alt="Upload"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center text-neutral-400 gap-2">
                        {type === 'avatar' ? <User className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                        <>
                            <Camera className="h-8 w-8 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Cambiar</span>
                        </>
                    )}
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                disabled={disabled || uploading}
                onChange={handleUpload}
            />
        </div>
    )
}

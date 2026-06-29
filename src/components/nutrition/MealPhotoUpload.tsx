'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Plus, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadMealPhoto, deleteMealPhoto } from '@/app/dashboard/nutrition/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MealPhotoUploadProps {
    existingImages?: string[]
}

export function MealPhotoUpload({ existingImages = [] }: MealPhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            await uploadMealPhoto(formData)
            toast.success('¡Foto de comida subida con éxito!')
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Error al subir la imagen')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDelete = async (url: string) => {
        if (!confirm('¿Eliminar esta foto?')) return
        try {
            await deleteMealPhoto(url)
            toast.success('Foto eliminada')
        } catch (error) {
            toast.error('Error al eliminar')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                        <Camera className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black">Fotos del Día</h3>
                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Documenta tus platillos</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-2xl h-12 px-6 gap-2 font-black border-2"
                >
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Plus className="h-5 w-5" />
                    )}
                    {isUploading ? 'Subiendo...' : 'Añadir Foto'}
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {existingImages.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                    <ImageIcon className="h-10 w-10 text-neutral-200 mb-3" />
                    <p className="text-sm font-medium text-neutral-400">¿Qué comiste hoy? Sube una foto.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingImages.map((url, idx) => (
                        <div key={idx} className="aspect-square relative rounded-[2rem] overflow-hidden group">
                            <img
                                src={url}
                                alt={`Meal ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(url)}
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

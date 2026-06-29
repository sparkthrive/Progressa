'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Plus,
    Camera,
    MoreVertical,
    Trash2,
    Maximize2,
    ArrowLeftRight,
    X,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { deleteProgressPhoto, saveProgressPhoto } from '@/app/dashboard/journal/actions'
import { useRouter } from 'next/navigation'

interface ProgressPhoto {
    id: string
    photo_url: string
    label: string
    recorded_at: string
}

export function PhotoGallery({ initialPhotos }: { initialPhotos: ProgressPhoto[] }) {
    const router = useRouter()
    const [photos, setPhotos] = useState(initialPhotos)
    const [isComparing, setIsComparing] = useState(false)
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('¿Estás seguro de eliminar esta foto?')) return
        try {
            await deleteProgressPhoto(id)
            setPhotos(prev => prev.filter(p => p.id !== id))
            router.refresh()
        } catch (error) {
            alert('Error al eliminar la foto')
        }
    }

    const toggleCompare = (id: string) => {
        if (selectedPhotos.includes(id)) {
            setSelectedPhotos(prev => prev.filter(p => p !== id))
        } else if (selectedPhotos.length < 2) {
            setSelectedPhotos(prev => [...prev, id])
        }
    }

    const clearComparison = () => {
        setIsComparing(false)
        setSelectedPhotos([])
    }

    // Mock upload flow
    const handleMockUpload = async () => {
        const url = prompt('Ingresa la URL de la imagen (mientras implementamos el storage nativo):')
        if (!url) return

        setIsUploading(true)
        try {
            await saveProgressPhoto({
                photo_url: url,
                label: 'Frente',
                recorded_at: new Date().toISOString().split('T')[0]
            })
            router.refresh()
        } catch (error) {
            alert('Error al guardar la foto')
        } finally {
            setIsUploading(false)
        }
    }

    const comparedPhotoData = photos.filter(p => selectedPhotos.includes(p.id))

    return (
        <div className="space-y-8">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Galería de Progreso</h1>
                    <p className="text-neutral-500 font-medium">Visualiza tu transformación física.</p>
                </div>
                <div className="flex gap-2">
                    {selectedPhotos.length === 2 ? (
                        <Button
                            onClick={() => setIsComparing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl font-bold gap-2 px-6"
                        >
                            <ArrowLeftRight className="h-4 w-4" /> Comparar
                        </Button>
                    ) : (
                        <Badge variant="outline" className="h-10 px-4 rounded-xl border-neutral-200 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
                            {selectedPhotos.length}/2 Seleccionadas
                        </Badge>
                    )}
                    <Button
                        onClick={handleMockUpload}
                        disabled={isUploading}
                        className="h-10 w-10 sm:w-auto sm:px-6 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900 font-bold gap-2"
                    >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Subir Foto</span></>}
                    </Button>
                </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => {
                    const isSelected = selectedPhotos.includes(photo.id)
                    return (
                        <div
                            key={photo.id}
                            onClick={() => toggleCompare(photo.id)}
                            className={`group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-neutral-950 scale-[0.98]' : 'hover:scale-[1.02]'
                                }`}
                        >
                            <img
                                src={photo.photo_url}
                                alt={photo.label}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <div className="flex items-center justify-between text-white">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black uppercase tracking-widest">{photo.label}</p>
                                        <p className="text-[10px] text-neutral-300 font-medium">
                                            {new Date(photo.recorded_at + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl border-neutral-100 dark:border-neutral-800">
                                            <DropdownMenuItem onClick={(e: any) => handleDelete(photo.id, e)} className="text-red-500 font-bold focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 gap-2">
                                                <Trash2 className="h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Selection Marker */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white">
                                    {selectedPhotos.indexOf(photo.id) + 1}
                                </div>
                            )}
                        </div>
                    )
                })}

                {photos.length === 0 && (
                    <div className="col-span-full py-20 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-200">
                            <Camera className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">Sin fotos aún</h3>
                            <p className="text-sm text-neutral-500 max-w-[240px]">Sube tu primera foto para empezar a documentar tu cambio físico.</p>
                        </div>
                        <Button onClick={handleMockUpload} variant="outline" className="rounded-2xl font-bold border-neutral-200">
                            Subir primera foto
                        </Button>
                    </div>
                )}
            </div>

            {/* Comparison Overlay */}
            {isComparing && comparedPhotoData.length === 2 && (
                <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 animate-in fade-in duration-300">
                    <div className="p-6 flex items-center justify-between border-b border-white/10">
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-black text-white tracking-tight">Comparativa de Progreso</h2>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Antes vs Después</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={clearComparison}
                            className="h-12 w-12 rounded-full text-white hover:bg-white/10"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-px bg-white/10 overflow-hidden">
                        {comparedPhotoData.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()).map((p, idx) => (
                            <div key={p.id} className="relative h-full">
                                <img
                                    src={p.photo_url}
                                    alt="Comp"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-white">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                        {idx === 0 ? 'PUNTO DE PARTIDA' : 'ACTUALIDAD'}
                                    </p>
                                    <p className="text-2xl font-black">{new Date(p.recorded_at + 'T12:00:00').toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

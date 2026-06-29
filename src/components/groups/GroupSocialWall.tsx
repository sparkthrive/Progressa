"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    MessageCircle,
    Send,
    MoreHorizontal,
    Image as ImageIcon,
    Loader2,
    Smile,
    Flame,
    Zap,
    Trophy,
    HeartPulse,
    Camera,
    X
} from 'lucide-react'
import { useGroupPosts } from '@/lib/hooks/groups'
import { createGroupPost, togglePostLike, addPostComment } from '@/app/dashboard/groups/social-actions'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface GroupSocialWallProps {
    groupId: string
    userId: string
}

export function GroupSocialWall({ groupId, userId }: GroupSocialWallProps) {
    const { posts, loading } = useGroupPosts(groupId)
    const supabase = createClient()
    const [newPostContent, setNewPostContent] = useState('')
    const [selectedFeeling, setSelectedFeeling] = useState<{ label: string, emoji: string } | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [posting, setPosting] = useState(false)

    const feelings = [
        { label: 'Motivado', emoji: '🔥' },
        { label: 'Cansado', emoji: '😫' },
        { label: 'Fuerte', emoji: '💪' },
        { label: 'Energizado', emoji: '⚡' },
        { label: 'Determinado', emoji: '🎯' },
        { label: 'Feliz', emoji: '😊' },
    ]

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPostContent.trim() && !selectedImage) return

        setPosting(true)
        try {
            let imageUrl = ''

            // 1. Upload image if selected
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop()
                const fileName = `${userId}/${Math.random()}.${fileExt}`
                const { error: uploadError, data } = await supabase.storage
                    .from('progress')
                    .upload(fileName, selectedImage)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('progress')
                    .getPublicUrl(fileName)

                imageUrl = publicUrl
            }

            // 2. Prepare content with feeling
            const finalContent = selectedFeeling
                ? `Feeling: ${selectedFeeling.emoji} ${selectedFeeling.label}\n\n${newPostContent}`
                : newPostContent

            const formData = new FormData()
            formData.append('groupId', groupId)
            formData.append('content', finalContent)
            if (imageUrl) formData.append('imageUrl', imageUrl)

            await createGroupPost(formData)
            setNewPostContent('')
            setSelectedImage(null)
            setImagePreview(null)
            setSelectedFeeling(null)
            toast.success('¡Publicado en la comunidad!')
        } catch (error) {
            console.error(error)
            toast.error('No se pudo publicar')
        } finally {
            setPosting(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-3xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Create Post Input */}
            <Card className="border-none shadow-xl shadow-neutral-200/20 dark:shadow-none bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex gap-4">
                        <Avatar className="w-12 h-12 shadow-sm border-2 border-white dark:border-neutral-800">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">YO</AvatarFallback>
                        </Avatar>
                        <form onSubmit={handleCreatePost} className="flex-1 space-y-4">
                            <div className="relative group/input">
                                <textarea
                                    placeholder="¿Qué hay de nuevo en tu entrenamiento?"
                                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-none rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[120px] outline-none"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                />
                                {selectedFeeling && (
                                    <Badge className="absolute top-4 right-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md text-neutral-900 dark:text-neutral-50 border-none shadow-sm gap-1.5 py-1.5 px-3 rounded-full animate-in zoom-in-50">
                                        <span>{selectedFeeling.emoji}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedFeeling.label}</span>
                                        <button onClick={() => setSelectedFeeling(null)} className="ml-1 hover:text-red-500">
                                            <Flame className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                )}
                            </div>

                            {imagePreview && (
                                <div className="relative rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-800 animate-in fade-in slide-in-from-top-2">
                                    <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        id="post-image"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full h-11 px-5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all gap-2"
                                        asChild
                                    >
                                        <label htmlFor="post-image" className="cursor-pointer">
                                            <Camera className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs font-bold">Foto</span>
                                        </label>
                                    </Button>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-full h-11 px-5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all gap-2"
                                            >
                                                <Smile className="w-4 h-4 text-amber-500" />
                                                <span className="text-xs font-bold">Feeling</span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-56 p-2 rounded-3xl border-none shadow-2xl">
                                            <div className="grid grid-cols-2 gap-1">
                                                {feelings.map(f => (
                                                    <button
                                                        key={f.label}
                                                        type="button"
                                                        onClick={() => setSelectedFeeling(f)}
                                                        className="flex items-center gap-2 p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                                                    >
                                                        <span className="text-lg">{f.emoji}</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{f.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={(!newPostContent.trim() && !selectedImage) || posting}
                                    className="bg-neutral-900 dark:bg-neutral-50 dark:text-neutral-900 text-white rounded-2xl px-8 h-11 font-bold shadow-lg shadow-neutral-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                                >
                                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={userId}
                        groupId={groupId}
                    />
                ))}
                {posts.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[3rem]">
                        <p className="text-neutral-500 font-medium">Aún no hay publicaciones.</p>
                        <p className="text-sm text-neutral-400">¡Sé el primero en saludar al grupo!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function PostCard({ post, currentUserId, groupId }: { post: any, currentUserId: string, groupId: string }) {
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [commenting, setCommenting] = useState(false)

    const isLiked = post.likes?.some((l: any) => l.user_id === currentUserId)

    const handleLike = async () => {
        try {
            await togglePostLike(post.id, groupId)
        } catch (error) {
            toast.error('Error al dar like')
        }
    }

    const handleComment = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault()
        const text = parentId ? replyText : commentText
        if (!text.trim() || commenting) return

        setCommenting(true)
        try {
            await addPostComment({
                postId: post.id,
                groupId,
                content: text,
                parentId: parentId || null
            })
            if (parentId) {
                setReplyText('')
                setReplyToId(null)
            } else {
                setCommentText('')
            }
            toast.success('Comentario añadido')
        } catch (error) {
            toast.error('Error al comentar')
        } finally {
            setCommenting(false)
        }
    }

    const [replyToId, setReplyToId] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')

    // Organize comments into a tree
    const rootComments = post.comments?.filter((c: any) => !c.parent_id) || []
    const getReplies = (parentId: string) => post.comments?.filter((c: any) => c.parent_id === parentId) || []

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 space-y-4">
                {/* Post Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-neutral-100 dark:border-neutral-800">
                            <AvatarImage src={post.user?.avatar_url || ''} />
                            <AvatarFallback>{post.user?.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{post.user?.full_name}</h4>
                            <p className="text-[10px] text-neutral-400 font-medium font-mono uppercase tracking-widest">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                    </Button>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </p>
                    {post.image_url && (
                        <div className="rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-800 bg-neutral-50">
                            <img src={post.image_url} alt="Post" className="w-full h-auto max-h-[400px] object-cover" />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-50 dark:border-neutral-800">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'}`}
                        >
                            <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-50 dark:bg-red-950/30' : 'group-hover:bg-red-50 dark:group-hover:bg-red-950/30'}`}>
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                        </button>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 text-neutral-500 hover:text-primary group transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {rootComments.map((comment: any) => (
                                <div key={comment.id} className="space-y-3">
                                    <div className="flex gap-3">
                                        <Avatar className="w-8 h-8 shrink-0">
                                            <AvatarImage src={comment.user?.avatar_url || ''} />
                                            <AvatarFallback className="text-[10px]">{comment.user?.full_name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl rounded-tl-none">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[11px] font-bold">{comment.user?.full_name}</span>
                                                    <span className="text-[9px] text-neutral-400">
                                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">{comment.content}</p>
                                            </div>
                                            <button
                                                onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                                                className="text-[10px] font-bold text-neutral-400 hover:text-primary px-1"
                                            >
                                                Responder
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {getReplies(comment.id).map((reply: any) => (
                                        <div key={reply.id} className="flex gap-3 ml-11">
                                            <Avatar className="w-6 h-6 shrink-0">
                                                <AvatarImage src={reply.user?.avatar_url || ''} />
                                                <AvatarFallback className="text-[8px]">{reply.user?.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-800/30 p-2.5 rounded-xl rounded-tl-none">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-bold">{reply.user?.full_name}</span>
                                                    <span className="text-[8px] text-neutral-400">
                                                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Reply Input */}
                                    {replyToId === comment.id && (
                                        <form onSubmit={(e) => handleComment(e, comment.id)} className="flex gap-2 ml-11 animate-in slide-in-from-top-1">
                                            <Input
                                                placeholder={`Respondiendo a ${comment.user?.full_name}...`}
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                autoFocus
                                                className="h-8 text-[11px] rounded-full bg-neutral-50 dark:bg-neutral-800 border-none px-4"
                                            />
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={!replyText.trim() || commenting}
                                                className="h-8 rounded-full bg-primary text-white"
                                            >
                                                {commenting ? '...' : <Send className="w-3 h-3" />}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handleComment} className="flex gap-2">
                            <Input
                                placeholder="Escribe un comentario..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="h-10 text-xs rounded-full bg-neutral-50 dark:bg-neutral-800 border-none px-4"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!commentText.trim() || commenting}
                                className="h-10 w-10 shrink-0 rounded-full bg-primary text-white shadow-lg shadow-primary/10"
                            >
                                {commenting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </Card>
    )
}

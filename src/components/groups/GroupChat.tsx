"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useGroupMessages } from '@/lib/hooks/groups'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface GroupChatProps {
    groupId: string;
    currentUserId: string;
}

export function GroupChat({ groupId, currentUserId }: GroupChatProps) {
    const { messages, loading, sendMessage } = useGroupMessages(groupId);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        await sendMessage(newMessage);
        setNewMessage('');
        setSending(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] text-neutral-500">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Cargando chat...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] border border-neutral-100 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-semibold">Chat del Grupo</span>
                </div>
                <span className="text-xs text-neutral-500">{messages.length} mensajes</span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg, i) => {
                        const isMe = msg.user_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {!isMe && (
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarImage src={msg.user?.avatar_url} />
                                        <AvatarFallback>{msg.user?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && (
                                        <span className="text-[10px] text-neutral-500 mb-1 ml-1">
                                            {msg.user?.full_name}
                                        </span>
                                    )}
                                    <div
                                        className={`max-w-[280px] p-3 rounded-2xl text-sm ${isMe
                                                ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] text-neutral-400 mt-1">
                                        {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-neutral-50/50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full">
                        <ImageIcon className="w-5 h-5 text-neutral-500" />
                    </Button>
                    <Input
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 rounded-full focus-visible:ring-primary h-10 px-4"
                    />
                    <Button
                        disabled={!newMessage.trim() || sending}
                        type="submit"
                        size="icon"
                        className="shrink-0 rounded-full bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </div>
    )
}

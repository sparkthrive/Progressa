'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Timer, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimerDisplayProps {
    duration: number // in seconds
    onComplete?: () => void
    label?: string
    autoStart?: boolean
}

export function TimerDisplay({ duration, onComplete, label, autoStart = false }: TimerDisplayProps) {
    const initialDuration = Number(duration) || 60
    const [timeLeft, setTimeLeft] = useState(initialDuration)
    const [totalTime, setTotalTime] = useState(initialDuration)
    const [isRunning, setIsRunning] = useState(autoStart)
    const [isEditing, setIsEditing] = useState(false)
    const onCompleteRef = useRef(onComplete)

    // Update onComplete reference whenever it changes
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    // Effect 1: Handle the Countdown
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isRunning) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false)
                        // Trigger completion in next tick to avoid state-during-render issues
                        setTimeout(() => onCompleteRef.current?.(), 0)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isRunning]) // Stable dependency: only depends on isRunning

    // Effect 2: Handle external duration sync (e.g. when switching exercises)
    useEffect(() => {
        const numDuration = Number(duration)
        if (!isRunning && !isEditing) {
            setTimeLeft(numDuration)
            setTotalTime(numDuration)
        }
    }, [duration, isRunning, isEditing])

    const toggleTimer = () => {
        if (isEditing) setIsEditing(false)
        setIsRunning(!isRunning)
    }

    const resetTimer = () => {
        setIsRunning(false)
        setIsEditing(false)
        setTimeLeft(duration)
        setTotalTime(duration)
    }

    const adjustTime = (seconds: number) => {
        const newTime = Math.max(0, timeLeft + seconds)
        setTimeLeft(newTime)
        // If we add time or change it, we reset the "100%" to this new value 
        // to make the animation understandable
        setTotalTime(newTime)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0

    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-neutral-900 text-white rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            {label && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</p>}

            <div className="relative h-24 w-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        className="stroke-neutral-800 fill-none"
                        strokeWidth="6"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        className="stroke-blue-500 fill-none transition-all duration-1000 ease-linear"
                        strokeWidth="6"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * percentage) / 100}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    {isEditing ? (
                        <input
                            type="number"
                            autoFocus
                            className="w-16 bg-transparent text-center text-2xl font-black focus:outline-none"
                            defaultValue={timeLeft}
                            onBlur={(e) => {
                                const val = Number(e.target.value) || 0
                                setTimeLeft(val)
                                setTotalTime(val)
                                setIsEditing(false)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = Number((e.target as HTMLInputElement).value) || 0
                                    setTimeLeft(val)
                                    setTotalTime(val)
                                    setIsEditing(false)
                                }
                            }}
                        />
                    ) : (
                        <span
                            className="text-3xl font-black tabular-nums cursor-text hover:text-blue-400 transition-colors"
                            onClick={() => {
                                setIsRunning(false)
                                setIsEditing(true)
                            }}
                        >
                            {formatTime(timeLeft)}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 rounded-lg bg-white/5 border-white/10 text-[10px] font-bold"
                    onClick={() => adjustTime(-15)}
                >
                    -15s
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 rounded-lg bg-white/5 border-white/10 text-[10px] font-bold"
                    onClick={() => adjustTime(30)}
                >
                    +30s
                </Button>
            </div>

            <div className="flex gap-2">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 text-white"
                    onClick={resetTimer}
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    className={`h-10 w-10 rounded-full ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg`}
                    onClick={toggleTimer}
                >
                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 text-white"
                    onClick={() => {
                        setIsRunning(false)
                        setTimeLeft(0)
                    }}
                >
                    <Square className="h-3 w-3 fill-current" />
                </Button>
            </div>
        </div>
    )
}

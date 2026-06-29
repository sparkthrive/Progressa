'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getScheduledRoutines, scheduleRoutine } from '@/app/dashboard/calendar/actions' // Correct import path?
import { toast } from 'sonner'
import Link from 'next/link'

interface Routine {
    id: string
    name: string
    description_text?: string
}

interface ScheduledRoutine {
    id: string
    scheduled_date: string
    status: string
    routine: {
        id: string
        name: string
        description?: string
    }
}

interface CalendarViewProps {
    routines: Routine[]
    userId: string
}

export function CalendarView({ routines, userId }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedRoutineId, setSelectedRoutineId] = useState<string>('')
    const [scheduledEvents, setScheduledEvents] = useState<ScheduledRoutine[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    // Calculate days to display
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    // Fetch events when month changes
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true)
            try {
                // Fetch a range covering the view
                const events = await getScheduledRoutines(userId, startDate, endDate)
                setScheduledEvents(events as any) // Type mismatch from DB vs Client interface, simple casting for now
            } catch (error) {
                console.error("Failed to fetch events", error)
                toast.error("Error al cargar eventos del calendario")
            } finally {
                setIsLoading(false)
            }
        }
        fetchEvents()
    }, [currentMonth, userId]) // Depend on userId and currentMonth. startDate changes with currentMonth.

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    const handleDateClick = (day: Date) => {
        setSelectedDate(day)
        setIsAddModalOpen(true)
    }

    const handleAddRoutine = async () => {
        if (!selectedDate || !selectedRoutineId) return

        setIsAdding(true)
        try {
            await scheduleRoutine(selectedRoutineId, selectedDate)
            toast.success("Rutina programada correctamente")
            setIsAddModalOpen(false)
            setSelectedRoutineId('')
            // Refresh events
            const events = await getScheduledRoutines(userId, startDate, endDate)
            setScheduledEvents(events as any)
        } catch (error) {
            toast.error("Error al programar la rutina")
        } finally {
            setIsAdding(false)
        }
    }

    const getEventsForDay = (day: Date) => {
        return scheduledEvents.filter(event => isSameDay(new Date(event.scheduled_date), day))
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-neutral-950 rounded-xl border shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold capitalize text-neutral-900 dark:text-neutral-50">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <div className="flex items-center rounded-md border bg-white dark:bg-neutral-950 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-8 w-8 rounded-none border-r">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-none">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                        Hoy
                    </Button>
                </div>
            </div>

            {/* Calendar Grid Header (Days of Week) */}
            <div className="grid grid-cols-7 border-b bg-neutral-50 dark:bg-neutral-900">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid Body */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-neutral-100 dark:bg-neutral-800 gap-[1px]">
                {calendarDays.map((day, dayIdx) => {
                    const isSelectedMonth = isSameMonth(day, currentMonth)
                    const isTodayDate = isToday(day)
                    const dayEvents = getEventsForDay(day)

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "min-h-[100px] p-2 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer relative group",
                                !isSelectedMonth && "bg-neutral-50/50 dark:bg-neutral-900/30 text-neutral-400"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                        isTodayDate
                                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                            : "text-neutral-700 dark:text-neutral-300"
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-xs font-medium text-neutral-400">{dayEvents.length}</span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayEvents.map((event) => (
                                    <Link
                                        href={`/dashboard/routines/${event.routine.id}`} // Or logic to start workout
                                        key={event.id}
                                        onClick={(e) => e.stopPropagation()} // Prevent opening add modal
                                        className={cn(
                                            "block text-xs truncate px-1.5 py-1 rounded border",
                                            event.status === 'completed'
                                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30"
                                        )}
                                    >
                                        {event.routine.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Hover Add Button */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-white dark:hover:bg-neutral-700">
                                    <Plus className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Add Routine Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Programar Entrenamiento</DialogTitle>
                        <DialogDescription>
                            Selecciona una rutina para realizar el {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : ''}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="routine" className="text-right text-sm font-medium">
                                Rutina
                            </label>
                            <Select onValueChange={setSelectedRoutineId} value={selectedRoutineId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccionar rutina..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {routines.map((routine) => (
                                        <SelectItem key={routine.id} value={routine.id}>
                                            {routine.name}
                                        </SelectItem>
                                    ))}
                                    {routines.length === 0 && (
                                        <div className="p-2 text-sm text-neutral-500 text-center">
                                            No tienes rutinas creadas.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddRoutine} disabled={!selectedRoutineId || isAdding}>
                            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Programar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

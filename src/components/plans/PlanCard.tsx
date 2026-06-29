'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { assignPlanToCalendar } from '@/app/dashboard/plans/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PlanCardProps {
    plan: any
}

export function PlanCard({ plan }: PlanCardProps) {
    const router = useRouter()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isLoading, setIsLoading] = useState(false)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    const handleSchedule = async () => {
        if (!date) return

        setIsLoading(true)
        try {
            await assignPlanToCalendar(plan.id, date)
            toast.success("Plan programado en el calendario")
            setIsPopoverOpen(false)
            router.refresh()
        } catch (error) {
            toast.error("Error al programar el plan")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-950 dark:border-neutral-800 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xl font-bold mb-2 break-words">{plan.name}</h3>
                <p className="text-sm text-neutral-500 line-clamp-3 mb-4 min-h-[40px]">{plan.description || 'Sin descripción'}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-400 mb-6">
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md text-neutral-600 dark:text-neutral-300">
                        {plan.duration_weeks} semanas
                    </span>
                    <span>•</span>
                    <span>Creado: {new Date(plan.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="border-t pt-4 flex justify-end">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                            <CalendarIcon className="h-4 w-4" />
                            Programar
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        <div className="p-3 border-t flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsPopoverOpen(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleSchedule} disabled={!date || isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </Card>
    )
}

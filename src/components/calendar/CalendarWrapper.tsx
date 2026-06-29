'use client'

import { useState } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PlanCard } from '@/components/plans/PlanCard'

interface CalendarWrapperProps {
    routines: any[]
    userId: string
    plans: any[]
}

export function CalendarWrapper({ routines, userId, plans }: CalendarWrapperProps) {
    const [activeTab, setActiveTab] = useState('calendar')

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        {activeTab === 'calendar' ? 'Calendario' : 'Planes de Entrenamiento'}
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        {activeTab === 'calendar'
                            ? 'Gestiona y visualiza tu agenda de entrenamientos.'
                            : 'Crea y administra tus planes a largo plazo.'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {activeTab === 'plans' && (
                        <Button asChild>
                            <Link href="/dashboard/plans/new">
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Plan
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="w-full sm:w-auto self-start mb-4">
                    <TabsTrigger value="calendar">Calendario</TabsTrigger>
                    <TabsTrigger value="plans">Mis Planes</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="flex-1 mt-0 h-full">
                    <CalendarView routines={routines} userId={userId} />
                </TabsContent>

                <TabsContent value="plans" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {plans?.map((plan) => (
                            <PlanCard key={plan.id} plan={plan} />
                        ))}

                        {(!plans || plans.length === 0) && (
                            <div className="col-span-full py-12 text-center text-neutral-500 border-2 border-dashed rounded-xl bg-neutral-50/50 dark:bg-neutral-900/10">
                                No tienes planes creados. ¡Crea el primero!
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

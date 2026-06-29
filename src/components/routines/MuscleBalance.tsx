'use client'

import { useMemo } from 'react'
import {
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MUSCLE_GROUP_LABELS } from '@/types/exercise-filters'

interface MuscleBalanceProps {
    exercises: {
        id: string
        name: string
        muscle_group?: string
    }[]
}

const MUSCLE_COLORS: Record<string, string> = {
    'pecho': '#3b82f6', // blue
    'espalda': '#10b981', // green
    'piernas': '#f59e0b', // amber
    'hombros': '#8b5cf6', // violet
    'brazos': '#ec4899', // pink
    'core': '#f43f5e', // rose
    'full_body': '#6366f1', // indigo
    'cardio': '#f97316', // orange
    'flexibilidad': '#06b6d4', // cyan
}

export function MuscleBalance({ exercises }: MuscleBalanceProps) {
    const data = useMemo(() => {
        const counts: Record<string, number> = {}

        // Count exercises per muscle group
        exercises.forEach(ex => {
            if (ex.muscle_group) {
                counts[ex.muscle_group] = (counts[ex.muscle_group] || 0) + 1
            }
        })

        // Convert to chart data
        return Object.entries(MUSCLE_GROUP_LABELS).map(([key, label]) => ({
            muscle: label,
            key: key,
            value: counts[key] || 0,
            fullMark: Math.max(...Object.values(counts), 5)
        })).filter(item => item.value > 0 || exercises.length === 0)
    }, [exercises])

    if (exercises.length === 0) return null

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Balance Muscular</CardTitle>
                <CardDescription className="text-xs">Distribución de enfoque por grupo muscular.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pb-6">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="muscle"
                                type="category"
                                width={80}
                                axisLine={false}
                                tickLine={false}
                                fontSize={10}
                                fontWeight="bold"
                                className="fill-neutral-500"
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-neutral-800 p-2 border rounded-lg shadow-xl text-xs font-bold">
                                                {payload[0].value} ejercicios
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={MUSCLE_COLORS[entry.key] || '#888888'} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="px-6 flex flex-wrap gap-2">
                    {data.map((entry) => (
                        <div key={entry.key} className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: MUSCLE_COLORS[entry.key] || '#888888' }} />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                {entry.muscle} ({entry.value})
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

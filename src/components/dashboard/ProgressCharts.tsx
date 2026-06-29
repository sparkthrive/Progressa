'use client'

import { useState, useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    TrendingUp,
    Scale,
    Dumbbell,
    Calendar,
    ChevronDown
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MetricData {
    recorded_at: string
    weight_kg: number
}

interface ExerciseProgression {
    exercise_name: string
    data: {
        date: string
        one_rm: number
        weight: number
        reps: number
    }[]
}

export function ProgressCharts({
    metricsData,
    progressionData
}: {
    metricsData: any[],
    progressionData: ExerciseProgression[]
}) {
    const [selectedExercise, setSelectedExercise] = useState(progressionData[0]?.exercise_name || '')
    const [timeRange, setTimeRange] = useState('30d')

    const weightChartData = useMemo(() => {
        return metricsData.map(m => ({
            date: new Date(m.recorded_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            weight: Number(m.weight_kg)
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [metricsData])

    const activeProgression = useMemo(() => {
        const found = progressionData.find(p => p.exercise_name === selectedExercise)
        if (!found) return []
        return found.data.map(d => ({
            ...d,
            formattedDate: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [selectedExercise, progressionData])

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl shadow-xl">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-lg font-black text-neutral-900 dark:text-neutral-50">
                        {payload[0].value} <span className="text-xs font-medium text-neutral-500">kg</span>
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-8">
            {/* Exercise One-RM Chart */}
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" /> Progresión de Fuerza (1RM)
                        </CardTitle>
                        <p className="text-xs text-neutral-500 font-medium">Basado en tu mejor serie por sesión.</p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl font-bold border-neutral-200 dark:border-neutral-800 gap-2">
                                {selectedExercise || 'Seleccionar Ejercicio'} <ChevronDown className="h-4 w-4 text-neutral-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-neutral-100 dark:border-neutral-800">
                            {progressionData.map(p => (
                                <DropdownMenuItem
                                    key={p.exercise_name}
                                    onClick={() => setSelectedExercise(p.exercise_name)}
                                    className="font-medium p-3"
                                >
                                    {p.exercise_name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activeProgression}>
                                <defs>
                                    <linearGradient id="colorRM" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                                <XAxis
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888888', fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888888', fontWeight: 'bold' }}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="one_rm"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRM)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Body Weight Chart */}
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Scale className="h-5 w-5 text-blue-500" /> Peso Corporal
                        </CardTitle>
                        <p className="text-xs text-neutral-500 font-medium">Tendencia de los últimos registros.</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weightChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888811" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888888', fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888888', fontWeight: 'bold' }}
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

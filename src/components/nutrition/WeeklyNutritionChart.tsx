'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface WeeklyNutritionChartProps {
    data: any[]
}

export function WeeklyNutritionChart({ data }: WeeklyNutritionChartProps) {
    const chartData = data.map(log => ({
        date: format(parseISO(log.recorded_at), 'EEE', { locale: es }),
        calories: log.calories,
        protein: log.protein
    }))

    // Fill missing days if needed
    if (chartData.length < 7) {
        // In a real app we'd pad this better, but for now we show what we have
    }

    return (
        <Card className="border-none bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-black">Progreso Semanal</CardTitle>
                <CardDescription className="font-medium">Consumo de calorías en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '1.5rem',
                                    border: 'none',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                    fontWeight: 900,
                                    fontSize: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="calories"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorCal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Promedio Diario</p>
                        <p className="text-3xl font-black tracking-tighter">
                            {data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.calories, 0) / data.length) : 0}
                            <span className="text-sm text-neutral-400 ml-1">kcal</span>
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Meta Proteica</p>
                        <p className="text-3xl font-black tracking-tighter text-blue-500">
                            {data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0) / data.length) : 0}
                            <span className="text-sm text-neutral-400 ml-1 text-neutral-400">g</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

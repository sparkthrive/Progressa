'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    Dumbbell,
    History,
    BookOpen,
    Apple,
    Users,
    Trophy,
    BarChart3,
    User,
    Settings,
    LogOut,
    Star,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    ClipboardList
} from 'lucide-react'
import { useState } from 'react'
import { signout } from '@/app/(auth)/actions'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Rutinas', href: '/dashboard/routines', icon: Dumbbell },
    { name: 'Entrenamientos', href: '/dashboard/workouts', icon: History },
    { name: 'Diario', href: '/dashboard/journal', icon: BookOpen },
    { name: 'Calendario', href: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Nutrición', href: '/dashboard/nutrition', icon: Apple },
    { name: 'Grupos', href: '/dashboard/groups', icon: Users },
    { name: 'Comunidad', href: '/dashboard/community', icon: Trophy },
    { name: 'Ejercicios', href: '/dashboard/exercises', icon: BookOpen },
    { name: 'Retos', href: '/dashboard/challenges', icon: Star },
    { name: 'Progreso', href: '/dashboard/progress', icon: BarChart3 },
    { name: 'Perfil', href: '/dashboard/profile', icon: User },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                "sticky top-0 h-screen border-r bg-white hidden flex-col dark:bg-neutral-950 md:flex transition-all duration-300 ease-in-out z-40 group/sidebar",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-12 h-6 w-6 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-center shadow-sm z-50 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                title={isCollapsed ? "Expandir" : "Colapsar"}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 text-neutral-500" />
                ) : (
                    <ChevronLeft className="h-3 w-3 text-neutral-500" />
                )}
            </button>

            <div className={cn("p-6", isCollapsed && "px-4")}>
                <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-neutral-900 dark:text-neutral-50 overflow-hidden">
                    <div className="h-8 w-8 min-w-[32px] rounded-lg bg-neutral-900 flex items-center justify-center text-white dark:bg-neutral-50 dark:text-neutral-900">
                        P
                    </div>
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">PROGRESSA</span>}
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : ""}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                isActive
                                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                                    : "text-neutral-500 dark:text-neutral-400",
                                isCollapsed && "justify-center px-2"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 min-w-[16px]", isActive ? "text-neutral-900 dark:text-neutral-50" : "")} />
                            {!isCollapsed && (
                                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className={cn("p-4 border-t", isCollapsed && "px-2 text-center")}>
                <form action={signout}>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
                            isCollapsed && "justify-center px-0"
                        )}
                        type="submit"
                        title={isCollapsed ? "Cerrar Sesión" : ""}
                    >
                        <LogOut className="h-4 w-4 min-w-[16px]" />
                        {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Cerrar Sesión</span>}
                    </Button>
                </form>
            </div>
        </aside>
    )
}

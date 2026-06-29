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
    LogOut
} from 'lucide-react'
import { signout } from '@/app/(auth)/actions'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Rutinas', href: '/dashboard/routines', icon: Dumbbell },
    { name: 'Entrenamientos', href: '/dashboard/workouts', icon: History },
    { name: 'Diario', href: '/dashboard/journal', icon: BookOpen },
    { name: 'Nutrición', href: '/dashboard/nutrition', icon: Apple },
    { name: 'Comunidad', href: '/dashboard/community', icon: Users },
    { name: 'Ejercicios', href: '/dashboard/exercises', icon: BookOpen },
    { name: 'Retos', href: '/dashboard/challenges', icon: Trophy },
    { name: 'Progreso', href: '/dashboard/progress', icon: BarChart3 },
    { name: 'Perfil', href: '/dashboard/profile', icon: User },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden w-64 border-r bg-white flex-col dark:bg-neutral-950 md:flex">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-neutral-900 dark:text-neutral-50">
                    <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white dark:bg-neutral-50 dark:text-neutral-900">
                        P
                    </div>
                    PROGRESSA
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                isActive
                                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                                    : "text-neutral-500 dark:text-neutral-400"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4", isActive ? "text-neutral-900 dark:text-neutral-50" : "")} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t">
                <form action={signout}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" type="submit">
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </form>
            </div>
        </aside>
    )
}

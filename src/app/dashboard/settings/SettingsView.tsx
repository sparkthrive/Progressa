'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    User,
    Shield,
    Bell,
    Palette,
    LogOut,
    Check,
    Save,
    Moon,
    Sun,
    Monitor,
    Mail,
    Smartphone,
    Eye,
    EyeOff,
    Trash2,
    Camera
} from 'lucide-react'
import { updateUserProfile, signout } from '@/app/(auth)/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/ui/image-upload'

export default function SettingsView({ initialProfile }: { initialProfile: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const [fullName, setFullName] = useState(initialProfile?.full_name || '')
    const [username, setUsername] = useState(initialProfile?.username || '')
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '')
    const [experienceLevel, setExperienceLevel] = useState(initialProfile?.experience_level || 'beginner')
    const [goals, setGoals] = useState<string[]>(initialProfile?.goals || [])

    // Appearance State (Mock)
    const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
    const [primaryColor, setPrimaryColor] = useState('blue')

    // Notifications State (Mock)
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [pushNotifs, setPushNotifs] = useState(true)
    const [workoutReminders, setWorkoutReminders] = useState(true)

    // Privacy State (Mock)
    const [isPublicProfile, setIsPublicProfile] = useState(true)
    const [showActivity, setShowActivity] = useState(true)

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const result = await updateUserProfile({
                fullName,
                username,
                avatarUrl,
                experienceLevel,
                goals
            })
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Perfil actualizado correctamente')
            }
        } catch (error) {
            toast.error('Error al actualizar el perfil')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleGoal = (goal: string) => {
        if (goals.includes(goal)) {
            setGoals(goals.filter(g => g !== goal))
        } else {
            setGoals([...goals, goal])
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tighter">Configuración</h1>
                    <p className="text-neutral-500 font-medium">Gestiona tu cuenta, preferencias y privacidad.</p>
                </div>
                <Button
                    variant="destructive"
                    className="h-12 rounded-2xl px-6 gap-3 font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border-none"
                    onClick={() => signout()}
                >
                    <LogOut className="h-5 w-5" /> CERRAR SESIÓN
                </Button>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
                <TabsList className="bg-white/5 border border-white/5 p-1.5 h-auto overflow-x-auto justify-start md:justify-center rounded-[2rem] w-full md:w-fit mx-auto">
                    <TabsTrigger value="profile" className="rounded-full px-8 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                        <User className="h-4 w-4" /> Perfil
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-full px-8 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                        <Palette className="h-4 w-4" /> Apariencia
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-full px-8 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                        <Bell className="h-4 w-4" /> Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="rounded-full px-8 py-3 gap-2 data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                        <Shield className="h-4 w-4" /> Privacidad
                    </TabsTrigger>
                </TabsList>

                {/* --- PERFIL Y CUENTA --- */}
                <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <Card className="rounded-[2.5rem] bg-neutral-900/50 backdrop-blur-xl border-white/5 overflow-hidden shadow-2xl">
                                <CardHeader className="p-8 border-b border-white/5">
                                    <CardTitle className="text-2xl font-black tracking-tight">Información Personal</CardTitle>
                                    <CardDescription className="text-neutral-400">Actualiza tus detalles públicos y nivel.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {/* Avatar Uploader */}
                                    <div className="flex items-center gap-6">
                                        <ImageUpload
                                            value={avatarUrl}
                                            onChange={setAvatarUrl}
                                            bucketName="avatars"
                                            folderPath="profiles"
                                        />
                                        <div className="space-y-1">
                                            <h4 className="font-bold">Foto de Perfil</h4>
                                            <p className="text-sm text-neutral-500">JPG o PNG. Máximo 5MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-neutral-500">Nombre Completo</Label>
                                            <Input
                                                id="fullName"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 focus:bg-white/10 focus:border-primary transition-all font-medium"
                                                placeholder="Ej. Angel Hernández"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-neutral-500">Username (@)</Label>
                                            <Input
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="atleta_premium"
                                                className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 focus:bg-white/10 focus:border-primary transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-neutral-500">Nivel de Experiencia</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'beginner', label: 'Novato', color: 'blue' },
                                                { id: 'intermediate', label: 'Intermedio', color: 'purple' },
                                                { id: 'advanced', label: 'Atleta Pro', color: 'yellow' }
                                            ].map((lvl) => (
                                                <Button
                                                    key={lvl.id}
                                                    variant="outline"
                                                    className={cn(
                                                        "h-16 rounded-2xl border-white/5 font-black text-sm transition-all relative overflow-hidden group",
                                                        experienceLevel === lvl.id
                                                            ? "bg-white text-black border-white shadow-lg shadow-white/5 scale-[1.02]"
                                                            : "bg-white/5 text-neutral-400 hover:bg-white/10"
                                                    )}
                                                    onClick={() => setExperienceLevel(lvl.id)}
                                                >
                                                    {lvl.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] bg-neutral-900/50 backdrop-blur-xl border-white/5 overflow-hidden shadow-2xl">
                                <CardHeader className="p-8 border-b border-white/5">
                                    <CardTitle className="text-2xl font-black tracking-tight">Objetivos de Entrenamiento</CardTitle>
                                    <CardDescription className="text-neutral-400">Personaliza tus recomendaciones y métricas.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: 'muscle', label: 'Ganar Músculo' },
                                            { id: 'weight-loss', label: 'Perder Peso' },
                                            { id: 'endurance', label: 'Resistencia' },
                                            { id: 'strength', label: 'Fuerza Pura' },
                                            { id: 'health', label: 'Salud General' },
                                            { id: 'flexibility', label: 'Flexibilidad' }
                                        ].map((goal) => (
                                            <Badge
                                                key={goal.id}
                                                onClick={() => toggleGoal(goal.id)}
                                                className={cn(
                                                    "cursor-pointer px-6 py-3 rounded-2xl text-sm font-bold transition-all border-none",
                                                    goals.includes(goal.id)
                                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                        : "bg-white/5 text-neutral-500 hover:bg-white/10"
                                                )}
                                            >
                                                {goal.label}
                                                {goals.includes(goal.id) && <Check className="ml-2 h-4 w-4" />}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] bg-blue-600 p-8 border-none text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Trophy className="h-32 w-32" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <h3 className="text-2xl font-black leading-tight">MANTÉN TU PERFIL ACTUALIZADO</h3>
                                    <p className="text-blue-100 font-medium">Completar tu perfil nos ayuda a darte mejores planes de entrenamiento.</p>
                                    <Button className="w-full h-12 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold border-none">
                                        VER MI PERFIL
                                    </Button>
                                </div>
                            </Card>

                            <Button
                                size="lg"
                                className="w-full rounded-[2rem] h-20 gap-4 font-black text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? 'GUARDANDO...' : (
                                    <><Save className="h-6 w-6" /> GUARDAR CAMBIOS</>
                                )}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* --- APARIENCIA (Mock) --- */}
                <TabsContent value="appearance" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <Card className="max-w-3xl border-white/5 bg-neutral-900/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-2xl font-black">Tema del Sistema</CardTitle>
                            <CardDescription>Elige cómo se ve Progressa en tu dispositivo.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { id: 'light', label: 'Claro', icon: Sun },
                                    { id: 'dark', label: 'Oscuro', icon: Moon },
                                    { id: 'system', label: 'Sistema', icon: Monitor }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id as any)}
                                        className={cn(
                                            "flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all",
                                            theme === t.id
                                                ? "bg-white text-black border-white shadow-xl"
                                                : "bg-white/5 border-white/5 text-neutral-500 hover:bg-white/10"
                                        )}
                                    >
                                        <t.icon className="h-8 w-8" />
                                        <span className="font-bold text-sm uppercase tracking-wider">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6 pt-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-neutral-500">Color Primario</Label>
                                <div className="flex gap-4">
                                    {['blue', 'purple', 'emerald', 'orange', 'rose'].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setPrimaryColor(c)}
                                            className={cn(
                                                "h-12 w-12 rounded-full transition-all ring-offset-4 ring-offset-black",
                                                primaryColor === c ? "ring-2 scale-110" : "scale-100 hover:scale-105",
                                                c === 'blue' && "bg-blue-500 ring-blue-500",
                                                c === 'purple' && "bg-purple-500 ring-purple-500",
                                                c === 'emerald' && "bg-emerald-500 ring-emerald-500",
                                                c === 'orange' && "bg-orange-500 ring-orange-500",
                                                c === 'rose' && "bg-rose-500 ring-rose-500",
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICACIONES (Mock) --- */}
                <TabsContent value="notifications" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <Card className="max-w-3xl border-white/5 bg-neutral-900/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5">
                            <CardTitle className="text-2xl font-black">Notificaciones</CardTitle>
                            <CardDescription>Controla cuándo y cómo te contactamos.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Correos Electrónicos</p>
                                        <p className="text-sm text-neutral-500">Resumen semanal y logros.</p>
                                    </div>
                                </div>
                                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Notificaciones Push</p>
                                        <p className="text-sm text-neutral-500">Alertas de entrenamiento en vivo.</p>
                                    </div>
                                </div>
                                <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Recordatorios de Rutina</p>
                                        <p className="text-sm text-neutral-500">Te avisamos cuando te toca entrenar.</p>
                                    </div>
                                </div>
                                <Switch checked={workoutReminders} onCheckedChange={setWorkoutReminders} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PRIVACIDAD (Mock) --- */}
                <TabsContent value="privacy" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-white/5 bg-neutral-900/50 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-white/5">
                                <CardTitle className="text-2xl font-black">Visibilidad del Perfil</CardTitle>
                                <CardDescription>Decide quién puede ver tu progreso.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                    <div>
                                        <p className="font-bold">Perfil Público</p>
                                        <p className="text-sm text-neutral-500">Cualquiera puede ver tus estadísticas.</p>
                                    </div>
                                    <Switch checked={isPublicProfile} onCheckedChange={setIsPublicProfile} />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                    <div>
                                        <p className="font-bold">Mostrar Actividad</p>
                                        <p className="text-sm text-neutral-500">Aparecer en el feed de la comunidad.</p>
                                    </div>
                                    <Switch checked={showActivity} onCheckedChange={setShowActivity} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-red-500/20 bg-red-500/5 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-red-500/10">
                                <CardTitle className="text-2xl font-black text-red-500">Zona de Peligro</CardTitle>
                                <CardDescription className="text-red-400/60">Acciones irreversibles sobre tu cuenta.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <Button variant="ghost" className="w-full justify-between h-14 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all px-6">
                                    <span>Exportar mis datos</span>
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" className="w-full justify-between h-14 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all px-6">
                                    <span>Eliminar mi cuenta</span>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}

'use client'

import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import Link from 'next/link'
import { useActionState, use } from 'react'

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const resolvedSearchParams = use(searchParams)
    const [state, formAction, isPending] = useActionState(login, null)
    const message = resolvedSearchParams?.message

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Inicia Sesión</CardTitle>
                <CardDescription className="text-center">
                    Ingresa tu correo y contraseña para acceder
                </CardDescription>
                {message === 'check_email' && (
                    <div className="p-3 text-sm text-center text-emerald-800 bg-emerald-100 rounded-md dark:bg-emerald-900/30 dark:text-emerald-200">
                        ¡Cuenta creada! Revisa tu correo para confirmar.
                    </div>
                )}
                {state?.error && (
                    <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-200">
                        {state.error}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <SocialAuthButtons />
                <form action={formAction} className="mt-4">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" name="email" type="email" placeholder="m@ejemplo.com" required disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm font-medium underline underline-offset-4 hover:text-primary"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <PasswordInput id="password" name="password" required disabled={isPending} />
                        </div>
                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending ? "Iniciando sesión..." : "Continuar"}
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-neutral-500 text-center">
                    ¿No tienes cuenta? <Link href="/register" className="underline text-neutral-900 dark:text-neutral-100 font-medium">Regístrate</Link>
                </div>
            </CardFooter>
        </Card>
    )
}

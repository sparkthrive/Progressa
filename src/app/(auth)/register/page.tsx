'use client'

import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import Link from 'next/link'
import { useActionState } from 'react'

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(signup, null)

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
                <CardDescription className="text-center">
                    Ingresa tus datos para comenzar en Progressa
                </CardDescription>
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
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input id="fullName" name="fullName" type="text" placeholder="Juan Pérez" required disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" name="email" type="email" placeholder="m@ejemplo.com" required disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <PasswordInput id="password" name="password" required minLength={6} disabled={isPending} />
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                required
                                disabled={isPending}
                                className="h-4 w-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Acepto los{" "}
                                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                    términos
                                </Link>{" "}
                                y la{" "}
                                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                    privacidad
                                </Link>
                            </label>
                        </div>
                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending ? "Creando cuenta..." : "Registrarse"}
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-neutral-500 text-center">
                    ¿Ya tienes cuenta? <Link href="/login" className="underline text-neutral-900 dark:text-neutral-100 font-medium">Inicia sesión</Link>
                </div>
            </CardFooter>
        </Card>
    )
}

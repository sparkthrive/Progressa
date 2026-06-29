import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Error de Autenticación</CardTitle>
                    <CardDescription className="text-center">
                        Hubo un problema al procesar tu inicio de sesión. Esto puede deberse a un código expirado o una sesión inválida.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-neutral-500">
                    Por favor, intenta iniciar sesión de nuevo. Si el problema persiste, contacta con soporte.
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/login">Volver al Inicio de Sesión</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

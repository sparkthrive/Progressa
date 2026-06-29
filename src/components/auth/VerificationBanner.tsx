import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function VerificationBanner({ isVerified }: { isVerified: boolean }) {
    if (isVerified) return null

    return (
        <Alert variant="destructive" className="mb-6 rounded-none border-x-0 border-t-0 border-b-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verifica tu correo electrónico</AlertTitle>
            <AlertDescription>
                Tu cuenta no está verificada. Revisa tu bandeja de entrada para desbloquear todas las funciones.
            </AlertDescription>
        </Alert>
    )
}

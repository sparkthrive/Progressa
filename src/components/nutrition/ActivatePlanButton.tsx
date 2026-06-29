'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { activateMealPlan } from '@/app/dashboard/nutrition/actions'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface ActivatePlanButtonProps {
    planId: string
    isActive: boolean
}

export function ActivatePlanButton({ planId, isActive }: ActivatePlanButtonProps) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleActivate = async () => {
        setIsPending(true)
        try {
            await activateMealPlan(planId)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al activar el plan')
        } finally {
            setIsPending(false)
        }
    }

    if (isActive) {
        return (
            <Button disabled className="flex-1 rounded-2xl h-12 font-bold bg-green-500/10 text-green-500 border-none hover:bg-green-500/10 gap-2">
                <Check className="h-4 w-4" /> Activo
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            onClick={handleActivate}
            disabled={isPending}
            className="flex-1 rounded-2xl h-12 font-bold border-2"
        >
            {isPending ? 'Activando...' : 'Activar'}
        </Button>
    )
}

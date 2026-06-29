'use client'

import { Button } from '@/components/ui/button'
import { loginWithProvider } from '@/app/(auth)/actions'
import { Chrome, Apple, Facebook, LayoutGrid } from 'lucide-react'

export function SocialAuthButtons() {
    return (
        <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                        await loginWithProvider('google', window.location.origin)
                    }}
                >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                        await loginWithProvider('apple', window.location.origin)
                    }}
                >
                    <Apple className="mr-2 h-4 w-4" />
                    Apple
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                        await loginWithProvider('azure', window.location.origin)
                    }}
                >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Microsoft
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                        await loginWithProvider('facebook', window.location.origin)
                    }}
                >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        O continúa con correo
                    </span>
                </div>
            </div>
        </div>
    )
}

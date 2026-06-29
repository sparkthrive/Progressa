'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function PasswordInput({ className, ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
        <div className="relative group">
            <Input
                type={showPassword ? 'text' : 'password'}
                className={className}
                {...props}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-full px-2 py-2 hover:bg-transparent cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-neutral-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-neutral-500" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>{showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

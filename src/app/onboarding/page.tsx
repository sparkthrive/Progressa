'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

import { completeOnboarding } from '../(auth)/actions'

const steps = [
    { title: 'Objetivo', description: '¿Qué quieres lograr?' },
    { title: 'Experiencia', description: 'Tu nivel actual' },
    { title: 'Biometría', description: 'Datos básicos' },
    { title: 'Preferencias', description: 'Equipamiento disponible' },
]

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        goal: '',
        level: '',
        age: '',
        weight: '',
        height: '',
        gender: '',
        frequency: '',
        equipment: [] as string[],
    })
    const router = useRouter()

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            setIsSubmitting(true)
            setError(null)
            try {
                const result = await completeOnboarding(formData)
                if (result?.error) {
                    setError(result.error)
                } else {
                    router.push('/dashboard')
                }
            } catch (err) {
                setError("Hubo un error al guardar tus datos. Inténtalo de nuevo.")
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <div className="mb-8 flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-10 translate-y-[-50%]" />
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${index <= currentStep
                                ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-neutral-50 dark:border-neutral-50 dark:text-neutral-900'
                                : 'bg-white border-neutral-200 text-neutral-400 dark:bg-neutral-950 dark:border-neutral-800'
                                }`}>
                                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                            </div>
                            <span className={`text-[10px] mt-2 font-medium uppercase tracking-tighter sm:text-xs ${index <= currentStep ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-400'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                <Card className="shadow-lg border-neutral-200/50 dark:border-neutral-800/50">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
                        <CardDescription>{steps[currentStep].description}</CardDescription>
                        {error && (
                            <div className="mt-2 p-3 text-sm text-red-800 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-200">
                                {error}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="min-h-[300px]">
                        {currentStep === 0 && (
                            <RadioGroup value={formData.goal} onValueChange={(val: string) => updateField('goal', val)} className="gap-4">
                                {[
                                    { id: 'lose-weight', label: 'Perder peso', icon: '🔥' },
                                    { id: 'gain-muscle', label: 'Ganar músculo', icon: '💪' },
                                    { id: 'endurance', label: 'Mejorar resistencia', icon: '🏃' },
                                    { id: 'maintenance', label: 'Mantenimiento', icon: '⚖️' },
                                ].map((item) => (
                                    <Label
                                        key={item.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 ${formData.goal === item.id
                                            ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-50 dark:bg-neutral-900'
                                            : 'border-neutral-100 dark:border-neutral-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="font-semibold">{item.label}</span>
                                        </div>
                                        <RadioGroupItem value={item.id} className="sr-only" />
                                    </Label>
                                ))}
                            </RadioGroup>
                        )}

                        {currentStep === 1 && (
                            <RadioGroup value={formData.level} onValueChange={(val: string) => updateField('level', val)} className="gap-4">
                                {[
                                    { id: 'beginner', label: 'Principiante', desc: 'Nunca he entrenado o llevo poco tiempo' },
                                    { id: 'intermediate', label: 'Intermedio', desc: 'Entreno regularmente hace meses' },
                                    { id: 'advanced', label: 'Avanzado', desc: 'Años de entrenamiento constante' },
                                ].map((item) => (
                                    <Label
                                        key={item.id}
                                        className={`flex flex-col gap-1 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 ${formData.level === item.id
                                            ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-50 dark:bg-neutral-900'
                                            : 'border-neutral-100 dark:border-neutral-800'
                                            }`}
                                    >
                                        <span className="font-semibold">{item.label}</span>
                                        <span className="text-sm text-neutral-500">{item.desc}</span>
                                        <RadioGroupItem value={item.id} className="sr-only" />
                                    </Label>
                                ))}
                            </RadioGroup>
                        )}

                        {currentStep === 2 && (
                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="age">Edad</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            placeholder="25"
                                            value={formData.age}
                                            onChange={(e) => updateField('age', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">Género</Label>
                                        <select
                                            id="gender"
                                            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-950"
                                            value={formData.gender}
                                            onChange={(e) => updateField('gender', e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="male">Masculino</option>
                                            <option value="female">Femenino</option>
                                            <option value="other">Otro</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="weight">Peso (kg)</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            placeholder="70"
                                            value={formData.weight}
                                            onChange={(e) => updateField('weight', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="height">Altura (cm)</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            placeholder="175"
                                            value={formData.height}
                                            onChange={(e) => updateField('height', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="grid gap-6">
                                <div className="grid gap-4">
                                    <Label>Frecuencia Semanal</Label>
                                    <RadioGroup value={formData.frequency} onValueChange={(val: string) => updateField('frequency', val)} className="grid grid-cols-3 gap-2">
                                        {['1-2', '3-4', '5+'].map((freq) => (
                                            <Label
                                                key={freq}
                                                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${formData.frequency === freq
                                                    ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-50 dark:bg-neutral-900'
                                                    : 'border-neutral-100 dark:border-neutral-800'
                                                    }`}
                                            >
                                                <span className="font-medium">{freq} día{freq === '1-2' ? 's' : 's'}</span>
                                                <RadioGroupItem value={freq} className="sr-only" />
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="grid gap-4">
                                    <Label>Equipamiento disponible</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'gym', label: 'Gimnasio completo' },
                                            { id: 'dumbbells', label: 'Mancuernas' },
                                            { id: 'bands', label: 'Bandas elásticas' },
                                            { id: 'bodyweight', label: 'Peso corporal' },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center space-x-2 bg-white dark:bg-neutral-950 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                                <Checkbox
                                                    id={item.id}
                                                    checked={formData.equipment.includes(item.id)}
                                                    onCheckedChange={(checked: boolean) => {
                                                        const newEquip = checked
                                                            ? [...formData.equipment, item.id]
                                                            : formData.equipment.filter(e => e !== item.id)
                                                        updateField('equipment', newEquip)
                                                    }}
                                                    disabled={isSubmitting}
                                                />
                                                <Label htmlFor={item.id} className="text-sm font-medium leading-none cursor-pointer">
                                                    {item.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6 bg-neutral-50/50 dark:bg-neutral-950/50">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0 || isSubmitting}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Atrás
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={
                                isSubmitting ||
                                (currentStep === 0 && !formData.goal) ||
                                (currentStep === 1 && !formData.level) ||
                                (currentStep === 2 && (!formData.age || !formData.weight || !formData.height || !formData.gender)) ||
                                (currentStep === 3 && !formData.frequency)
                            }
                            className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 gap-2 px-8"
                        >
                            {isSubmitting ? "Guardando..." : (currentStep === steps.length - 1 ? '¡Listo para empezar!' : 'Siguiente')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

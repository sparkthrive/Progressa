import * as z from 'zod'

export const recipeSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    calories: z.number().min(0).default(0),
    protein: z.number().min(0).default(0),
    carbs: z.number().min(0).default(0),
    fats: z.number().min(0).default(0),
    prep_time_minutes: z.number().min(0).optional(),
    instructions: z.string().optional(),
    ingredients: z.array(z.object({
        item: z.string().min(1, 'Nombre del ingrediente requerido'),
        amount: z.string().min(1, 'Cantidad requerida')
    })).default([]),
    image_url: z.string().optional(),
    is_public: z.boolean().default(false)
})

export type RecipeFormValues = z.infer<typeof recipeSchema>

export const mealPlanSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    duration_days: z.number().min(1).max(31).default(7)
})

export type MealPlanFormValues = z.infer<typeof mealPlanSchema>

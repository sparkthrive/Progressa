# Plan de Implementación: Sistema Avanzado de Nutrición y Planes de Alimentación

Este documento detalla la hoja de ruta para implementar un sistema de gestión de dietas y recetas dentro de Progressa, permitiendo a los usuarios organizar su alimentación de manera profesional.

## 1. Arquitectura de Base de Datos (Supabase)

Necesitamos expandir el esquema actual para soportar la complejidad de los planes semanales o dinámicos.

### Nuevas Tablas:
- **`recipes`**: Catálogo de platillos/recetas.
  - `id`, `user_id` (FK), `name`, `description`, `calories`, `protein`, `carbs`, `fats`, `ingredients` (JSONB), `instructions` (Text), `prep_time`, `image_url`.
- **`meal_plans`**: Cabecera del plan o dieta.
  - `id`, `user_id` (FK), `name`, `description`, `duration_days` (ej. 7 para semanal), `is_active` (Boolean).
- **`meal_plan_items`**: La asignación de recetas a momentos específicos.
  - `id`, `meal_plan_id` (FK), `day_number` (1-30), `meal_time` (ej. 08:30), `meal_category` (Desayuno, Comida, etc.), `recipe_id` (FK).
- **`shopping_lists` (Opcional/Fase 2)**: Para consolidar ingredientes.

---

## 2. Fase 1: Gestión de Recetas (CRUD)
Antes de planear, necesitamos qué comer.
- **Vista de Recetario**: Grid con búsqueda y filtros por macros.
- **Editor de Recetas**:
  - Formulario dinámico para añadir ingredientes (cantidad + unidad + nombre).
  - Editor de texto para la preparación paso a paso.
  - Calculadora de macros automática basada en los ingredientes (o manual por el usuario).

---

## 3. Fase 2: Constructor de Planes (Plan Builder)
Una interfaz tipo calendario o lista organizada por días.
- **Selector de Duración**: Definir si el plan es de 1 día, 7 días (semanal) o 30 días.
- **Diseño del Plan**:
  - Añadir bloques de comida por día.
  - Buscador integrado de recetas para "soltar" platillos en los bloques.
  - Resumen dinámico de macros totales por día para asegurar que el plan cumple con los objetivos del usuario.

---

## 4. Fase 3: Visualización y Seguimiento (Dashboard)
Integración con la vista de Nutrición principal.
- **"Mi Comida de Hoy"**: 
  - Tarjetas que muestran qué toca comer ahora según la hora actual.
  - Botón de "Registrar Consumo": Al dar clic, los macros de la receta se suman automáticamente al log diario.
- **Vista de Cocina**: Al dar clic en un platillo del plan, se abre un modal con los ingredientes y las instrucciones de preparación.

---

## 5. Fase 4: Inteligencia y Organización
- **Cambio Programado**: El sistema detecta qué día del plan es (Día 1, Día 2...) basándose en la fecha de inicio del plan activo.
- **Lista de Compra**: Generar una lista consolidada de todos los ingredientes necesarios para los próximos 7 días del plan.

---

## Próximos Pasos Inmediatos:
1.  **Migración SQL**: Crear las tablas `recipes`, `meal_plans` y `meal_plan_items`.
2.  **Server Actions**: Implementar la lógica para guardar y activar planes.
3.  **UI Base**: Crear la página `/dashboard/nutrition/recipes` y `/dashboard/nutrition/plans`.

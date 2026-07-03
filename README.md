# ⚡ Progressa - Plataforma de Entrenamiento y Bienestar

Progressa es una plataforma SaaS premium para el seguimiento de entrenamientos, nutrición y progreso físico, diseñada con una estética moderna, limpia y de alto rendimiento. Permite a los atletas gestionar rutinas de ejercicios, planificar comidas con precisión macro-nutricional, programar calendarios de entrenamiento a largo plazo, interactuar con una comunidad y competir en base a un sistema gamificado de niveles y XP.

---

## 🚀 Características Principales

### 1. 🔐 Autenticación y Onboarding
- Flujo completo de registro e inicio de sesión seguro gestionado por **Supabase Auth**.
- Proceso de inducción (onboarding) interactivo para recopilar información clave del usuario (objetivos, nivel, peso, metas calóricas y macros).

### 2. 📊 Panel de Control (Dashboard)
- Resumen dinámico del día actual.
- Widgets interactivos con:
  - **Rutina de hoy**: Acceso rápido al entrenamiento agendado.
  - **Seguimiento nutricional**: Progreso gráfico de calorías consumidas vs. objetivo diario.
  - **Progreso de nivel**: Barra de experiencia (XP) y nivel actual.
  - **Desafíos activos**: Retos grupales en curso.
  - **Últimas entradas**: Acceso directo al diario y fotos de progreso.

### 3. 🏋️ Sistema de Entrenamientos (Workouts Engine)
- **Biblioteca de Ejercicios**: Catálogo filtrable por grupo muscular, equipo y tipo de ejercicio.
- **Creador de Rutinas**: Diseña rutinas personalizadas estructurando series, repeticiones, tiempo de descanso y cargas.
- **Log de Entrenamientos**: Registra en tiempo real tu volumen, RPE (esfuerzo percibido) y progresión de carga.

### 4. 🍎 Nutrición Avanzada y Planificación
- **Recetario Profesional**: Crea recetas detalladas con ingredientes dinámicos y cálculo automático de calorías, proteínas, carbohidratos y grasas.
- **Planificador de Alimentación (Meal Planner)**: Diseña planes de alimentación semanales o de duración personalizada (1 a 30 días), distribuyendo recetas en diferentes comidas del día.
- **Mi Comida de Hoy**: Muestra qué comer según la hora actual y permite registrar el consumo con un solo clic, sumando los macros al conteo diario.
- **Lista de Compras Automática**: Genera una lista de ingredientes consolidados para los días seleccionados en tu plan activo.

### 5. 📅 Calendario y Planes de Entrenamiento
- **Calendario Mensual/Semanal**: Visualiza y agenda rutinas de manera interactiva.
- **Planes de Entrenamiento (Training Plans)**: Agrupa múltiples rutinas en bloques estructurados semana a semana y asígnalos al calendario con un solo clic.

### 6. 🏆 Sistema Social y Gamificación
- **Comunidades y Grupos**: Crea o únete a clubes/grupos de entrenamiento con contadores de miembros activos.
- **Tablón de Discusión**: Interactúa con otros miembros del grupo.
- **Retos del Grupo**: Retos comunitarios con fecha límite y metas específicas.
- **Sistema de XP y Niveles**: Gana experiencia al completar entrenamientos, registrar recetas y cumplir desafíos.
- **Clasificación (Leaderboard)**: Tabla de clasificación global o por grupos basada en el XP acumulado.

### 7. 📸 Registro de Progreso y Diario
- **Diario (Journal)**: Registro diario de estado de ánimo, notas de entrenamiento, horas de sueño y bienestar general.
- **Fotos de Progreso (Progress Photos)**: Galería visual cronológica con subida de imágenes a **Supabase Storage** para comparar la evolución física.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Estilos**: [TailwindCSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) (Componentes accesibles)
- **Base de Datos y Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage para avatares y fotos, políticas RLS)
- **Gestión de Estado**: [Zustand](https://github.com/pmndrs/zustand) (Estado global del cliente) & [React Query](https://tanstack.com/query/latest) (Estado del servidor)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Validación de Datos**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

---

## 📁 Estructura del Proyecto

```text
├── public/                 # Recursos estáticos (imágenes, logos, etc.)
├── supabase/               # Base de datos Supabase
│   ├── migrations/         # Archivos de migración de base de datos SQL
│   ├── schema.sql          # Esquema completo de la base de datos
│   └── seed_exercises.sql  # Datos iniciales para la biblioteca de ejercicios
├── src/
│   ├── app/                # Next.js App Router (Rutas de la aplicación)
│   │   ├── (auth)/         # Grupo de rutas de autenticación
│   │   ├── auth/           # Rutas para flujos de autenticación de Supabase
│   │   ├── onboarding/     # Flujo inicial del perfil de usuario
│   │   ├── dashboard/      # Rutas principales del panel de administración
│   │   ├── layout.tsx      # Layout raíz
│   │   └── page.tsx        # Página de bienvenida / Landing Page
│   ├── components/         # Componentes reutilizables por dominio
│   │   ├── ui/             # Componentes base (Botones, Inputs, etc.)
│   │   ├── common/         # Componentes comunes de la aplicación
│   │   ├── layout/         # Componentes de estructura (Sidebars, Navbars)
│   │   └── [feature]/      # Componentes específicos (nutrition, workouts, calendar, etc.)
│   ├── lib/                # Configuración de librerías de terceros (Supabase, utils)
│   ├── store/              # Stores de Zustand (global state)
│   └── types/              # Definición de tipos de TypeScript
├── package.json            # Dependencias y scripts de ejecución
└── tsconfig.json           # Configuración de TypeScript
```

---

## ⚙️ Configuración e Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Progressa
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto y añade las credenciales de tu proyecto de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 4. Configurar la Base de Datos (Supabase)
Ejecuta las migraciones en tu instancia de Supabase. Puedes hacerlo:
1. Copiando el contenido de los archivos en `supabase/migrations/` en el editor de SQL de Supabase (comenzando por `00_run_this_migration.sql` y siguiendo el orden cronológico).
2. Sembrando la base de datos de ejercicios usando `supabase/seed_exercises.sql`.

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación ejecutándose.

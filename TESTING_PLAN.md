# Plan de Pruebas de Aceptación (UAT) - Funcionalidades Sociales y de Grupo

Este documento detalla los casos de prueba para validar las nuevas funcionalidades de Grupos, Ajustes y Perfil en la aplicación Gym App (Progressa).

## 📋 Prerrequisitos
- El servidor de desarrollo debe estar corriendo (`npm run dev`).
- Base de datos Supabase conectada y migraciones aplicadas (incluyendo `storage_setup` y `avatars_bucket`).

## 🧪 Casos de Prueba

### 1. Autenticación y Onboarding
| ID | Paso | Acción | Resultado Esperado | Estado |
|----|------|--------|-------------------|--------|
| A01 | Registro | Navegar a `/login` -> "Registrarse". Crear cuenta con email nuevo (ej. `test_admin@gym.com`). | Redirección al Onboarding. | ⬜️ |
| A02 | Onboarding | Completar formulario de onboarding (Objetivo, Nivel, Datos físicos). | Redirección exitosa a `/dashboard`. Datos guardados en perfil. | ⬜️ |

### 2. Gestión de Grupos (Admin)
| ID | Paso | Acción | Resultado Esperado | Estado |
|----|------|--------|-------------------|--------|
| G01 | Crear Grupo | Ir a `/dashboard/groups`. Clic "Crear nuevo grupo". Llenar nombre "Grupo Test" y desc. | Redirección a `/dashboard/groups/[id]`. Toaster de éxito. | ⬜️ |
| G02 | Info Grupo | Verificar cabecera del grupo. | Muestra nombre, descripción, contador de miembros (1) y badges correctos. | ⬜️ |
| G03 | Ajustes - Edición | Clic en icono Engranaje. Cambiar nombre a "Grupo Editado" y privacidad a "Privado". Guardar. | El modal se cierra. La página se actualiza con nuevos datos. Toaster de éxito. | ⬜️ |
| G04 | Ajustes - Foto | En Ajustes, clic en el avatar/cámera. Seleccionar imagen JPG/PNG < 5MB. Guardar. | La imagen se sube, se muestra preview. Al guardar, el header del grupo muestra la nueva foto. | ⬜️ |

### 3. Funcionalidades Sociales
| ID | Paso | Acción | Resultado Esperado | Estado |
|----|------|--------|-------------------|--------|
| S01 | Compartir - Link | Clic botón Compartir -> "Copiar Link de Acceso". | Toaster: "¡Enlace copiado!". El portapapeles contiene la URL actual. | ⬜️ |
| S02 | Compartir - Tarjeta | Clic botón Compartir -> "Tarjeta de Invitación". | Se abre modal con preview de tarjeta (Foto grupo + Código). Clic "Descargar" descarga el PNG. | ⬜️ |
| S03 | Pestaña Miembros | Clic tab "Miembros". | Muestra tarjeta del usuario actual con badge "Tú" y rol "Fundador". | ⬜️ |

### 4. Gestión de Perfil de Usuario
| ID | Paso | Acción | Resultado Esperado | Estado |
|----|------|--------|-------------------|--------|
| P01 | Navegación | Ir a `/dashboard/settings` (o clic en avatar usuario -> Ajustes). | Carga página de ajustes con tabs. | ⬜️ |
| P02 | Editar Foto | En tab Perfil, clic en avatar. Subir nueva foto. Clic "Guardar Cambios". | Toaster de éxito. La foto de perfil se actualiza en el header global y en la página. | ⬜️ |
| P03 | Editar Datos | Cambiar Nombre Completo y Nivel de Experiencia. Guardar. | Datos persisten al recargar. | ⬜️ |

### 5. Interacción Miembro (Requiere 2do Usuario)
*Nota: Para esta prueba, usar ventana incógnito o segundo navegador.*
| ID | Paso | Acción | Resultado Esperado | Estado |
|----|------|--------|-------------------|--------|
| M01 | Unirse con Código | Usuario B: Ir a `/dashboard/groups`. "Unirse a un grupo". Ingresar código del Grupo Test. | Redirección al grupo. Usuario B es miembro. | ⬜️ |
| M02 | Ver Miembros (Admin) | Usuario A (Admin): Refrescar tab "Miembros". | Ve a Usuario B en la lista. Aparece menú (tres puntos) en tarjeta de Usuario B. | ⬜️ |
| M03 | Expulsar (Admin) | Usuario A: Clic menú en Usuario B -> "Expulsar". | Usuario B desaparece de la lista. Contador de miembros baja. | ⬜️ |
| M04 | Salir (Miembro) | Usuario B (Re-unido): Clic botón "..." o "Chevron" en header -> "Abandonar Grupo". | Redirección a `/dashboard/groups`. Usuario eliminado de lista. | ⬜️ |

## 📝 Notas de Ejecución
- Si la subida de imagen falla, verificar políticas RLS en Supabase Storage (bucket `avatars`).
- Si "Expulsar" falla, verificar RLS en tabla `group_members`.

# 🚀 Guía de Configuración - Panel Admin Sabotage

Esta guía te llevará paso a paso para configurar el panel de administración con Supabase.

## 📋 Índice

1. [Crear Proyecto en Supabase](#1-crear-proyecto-en-supabase)
2. [Configurar Credenciales](#2-configurar-credenciales)
3. [Crear Base de Datos](#3-crear-base-de-datos)
4. [Configurar Storage](#4-configurar-storage)
5. [Crear Usuario Admin](#5-crear-usuario-admin)
6. [Probar el Panel](#6-probar-el-panel)
7. [Seguridad y Producción](#7-seguridad-y-producción)

---

## 1. Crear Proyecto en Supabase

### Paso 1.1: Registrarse
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Regístrate con GitHub, Google o email

### Paso 1.2: Crear Nuevo Proyecto
1. Haz clic en **"New Project"**
2. Selecciona tu organización (o crea una)
3. Completa los datos:
   - **Name:** `sabotage-store` (o el nombre que prefieras)
   - **Database Password:** Genera una contraseña segura (¡GUÁRDALA!)
   - **Region:** Selecciona la más cercana (ej: `South America (São Paulo)`)
4. Haz clic en **"Create new project"**
5. Espera 2-3 minutos mientras se crea el proyecto

---

## 2. Configurar Credenciales

### Paso 2.1: Obtener las Credenciales
1. En tu proyecto de Supabase, ve a **Settings** (ícono de engranaje) ➜ **API**
2. Copia estos valores:
   - **Project URL** (ejemplo: `https://abc123xyz.supabase.co`)
   - **anon public** key (en la sección "Project API keys")

### Paso 2.2: Configurar el Frontend
1. Abre el archivo `src/environments/environment.ts`
2. Reemplaza los valores placeholder:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://TU-PROYECTO.supabase.co',  // ← Pega tu Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',  // ← Pega tu anon key
  },
};
```

3. Haz lo mismo en `src/environments/environment.prod.ts` para producción.

> ⚠️ **IMPORTANTE:** La `anon key` es segura de usar en el frontend. ¡NUNCA uses la `service_role key` en el frontend!

---

## 3. Crear Base de Datos

### Paso 3.1: Abrir SQL Editor
1. En Supabase, ve a **SQL Editor** (ícono de consola) en el menú lateral

### Paso 3.2: Crear Tablas
1. Haz clic en **"New query"**
2. Copia y pega TODO el contenido del archivo: `supabase/01_create_tables.sql`
3. Haz clic en **"Run"** (o presiona Ctrl+Enter)
4. Deberías ver: "Success. No rows returned"

### Paso 3.3: Insertar Datos Iniciales
1. Haz clic en **"New query"** nuevamente
2. Copia y pega TODO el contenido de: `supabase/02_seed_data.sql`
3. Haz clic en **"Run"**

### Paso 3.4: Configurar Políticas de Seguridad (RLS)
1. Haz clic en **"New query"**
2. Copia y pega TODO el contenido de: `supabase/03_rls_policies.sql`
3. Haz clic en **"Run"**

### Verificar Tablas
1. Ve a **Table Editor** en el menú lateral
2. Deberías ver las tablas: `categories`, `products`, `discount_codes`, `subscribers`, `orders`, `site_config`
3. Verifica que `categories` y `discount_codes` tienen datos

---

## 4. Configurar Storage

### Paso 4.1: Crear Bucket
1. En Supabase, ve a **Storage** en el menú lateral
2. Haz clic en **"New bucket"**
3. Configura:
   - **Name:** `products`
   - ✅ Marca la opción **"Public bucket"**
4. Haz clic en **"Create bucket"**

### Paso 4.2: Configurar Políticas de Storage
1. Ve a **SQL Editor**
2. Haz clic en **"New query"**
3. Copia y pega TODO el contenido de: `supabase/04_storage_policies.sql`
4. Haz clic en **"Run"**

---

## 5. Crear Usuario Admin

### Paso 5.1: Crear el Usuario
1. En Supabase, ve a **Authentication** en el menú lateral
2. Haz clic en la pestaña **"Users"**
3. Haz clic en **"Add user"** ➜ **"Create new user"**
4. Completa:
   - **Email:** tu email (ej: `admin@sabotage.pe`)
   - **Password:** una contraseña segura
   - ✅ Marca **"Auto Confirm User"**
5. Haz clic en **"Create user"**

### Paso 5.2: Verificar
El usuario debería aparecer en la lista con status "Confirmed"

---

## 6. Probar el Panel

### Paso 6.1: Iniciar el Servidor
```bash
cd sabotage-frontend
npm run start
# o
ng serve
```

### Paso 6.2: Acceder al Panel
1. Abre tu navegador en: `http://localhost:4200/admin`
2. Te redirigirá a la página de login
3. Ingresa las credenciales del usuario que creaste
4. ¡Deberías ver el Dashboard!

### Paso 6.3: Probar Funcionalidades
- ✅ Crear un producto nuevo con imagen
- ✅ Editar una categoría
- ✅ Crear un código de descuento
- ✅ Ver la lista de suscriptores

---

## 7. Seguridad y Producción

### ¿Es seguro exponer la anon key?

**SÍ, es seguro.** La `anon key` está diseñada para ser pública porque:

1. Solo permite acceso según las políticas RLS que configuraste
2. Los usuarios anónimos solo pueden:
   - Leer productos activos
   - Leer categorías activas
   - Validar códigos de descuento activos
   - Crear suscriptores y órdenes
3. Los usuarios autenticados (admin) tienen acceso completo

### ¿Qué NUNCA debe exponerse?

❌ **NUNCA** expongas la `service_role key` en el frontend. Esta clave:
- Ignora todas las políticas RLS
- Tiene acceso total a tu base de datos
- Solo debe usarse en servidores backend seguros

### Configuración para Producción

Para mayor seguridad en producción, puedes usar variables de entorno:

**Opción A: Variables de entorno en CI/CD**
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  supabase: {
    url: 'SUPABASE_URL', // Se reemplaza en el pipeline de CI/CD
    anonKey: 'SUPABASE_ANON_KEY',
  },
};
```

**Opción B: fileReplacements en angular.json**
```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

### Checklist de Seguridad

- [x] Solo usar `anon key` en frontend (nunca `service_role`)
- [x] RLS habilitado en todas las tablas
- [x] Políticas RLS configuradas correctamente
- [x] Storage bucket con políticas apropiadas
- [x] Contraseñas de admin seguras
- [ ] (Opcional) Habilitar autenticación de dos factores en Supabase Dashboard

---

## 🆘 Solución de Problemas

### Error: "Supabase not configured"
- Verifica que copiaste correctamente la URL y anon key
- Asegúrate de que no haya espacios extra

### Error: "Invalid login credentials"
- Verifica que el usuario esté confirmado en Supabase Auth
- Prueba restablecer la contraseña

### Las imágenes no se suben
- Verifica que el bucket `products` existe y es público
- Verifica que ejecutaste `04_storage_policies.sql`

### No se muestran los productos
- Verifica que la tabla `products` tiene la columna `is_active = true`
- Verifica las políticas RLS con el SQL Editor

---

## 📁 Estructura de Archivos SQL

```
supabase/
├── 01_create_tables.sql    # Estructura de tablas
├── 02_seed_data.sql        # Datos iniciales
├── 03_rls_policies.sql     # Políticas de seguridad
└── 04_storage_policies.sql # Políticas de storage
```

---

## 🎉 ¡Listo!

Tu panel de administración debería estar completamente funcional. Si tienes problemas, revisa cada paso o abre un issue en el repositorio.

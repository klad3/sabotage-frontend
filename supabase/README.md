# SABOTAGE E-Commerce - Supabase Setup

## 📋 Orden de Ejecución para Proyecto Nuevo

### Paso 1: Crear Buckets de Storage

En Supabase Dashboard > Storage > New bucket:

| Bucket | Tipo | Descripción |
|--------|------|-------------|
| `products` | Público | Imágenes de productos |
| `banners` | Público | Imágenes de banners |
| `categories` | Público | Imágenes de categorías |

> ⚠️ **IMPORTANTE**: Marcar "Public bucket" en cada uno.

---

### Paso 2: Ejecutar Scripts SQL

En Supabase Dashboard > SQL Editor, ejecutar **en orden**:

1. **`01_create_tables.sql`** - Crea todas las tablas
2. **`02_seed_data.sql`** - Datos iniciales (categorías, descuentos)
3. **`03_rls_policies.sql`** - Políticas de seguridad de tablas
4. **`04_storage_policies.sql`** - Políticas de seguridad de buckets
5. **`05_banners_table.sql`** - Tabla de banners + RLS
6. **`06_site_settings_seed.sql`** - Configuraciones del sitio

---

### Paso 3: Configurar Variables de Entorno

Crear `environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU-ANON-KEY'
};
```

---

## 📁 Estructura de Archivos SQL

| Archivo | Contenido |
|---------|-----------|
| `01_create_tables.sql` | Tablas: categories, products, orders, subscribers, discount_codes, site_config |
| `02_seed_data.sql` | Datos iniciales: categorías y códigos de descuento |
| `03_rls_policies.sql` | Row Level Security para todas las tablas |
| `04_storage_policies.sql` | Políticas para buckets: products, banners, categories |
| `05_banners_table.sql` | Tabla banners + sus políticas RLS |
| `06_site_settings_seed.sql` | Configuraciones del sitio (anuncios, contacto, etc.) |

---

## ✅ Verificación

Después de ejecutar todo, verifica:

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar categorías
SELECT * FROM categories;

-- Verificar configuraciones
SELECT * FROM site_config;
```

---

## 🔐 Autenticación

Para acceder al admin, crea un usuario desde:
- Supabase Dashboard > Authentication > Users > Add user

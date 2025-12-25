# Supabase - Configuración de Base de Datos

## Orden de Ejecución

Ejecutar los scripts en este **orden exacto** al configurar un nuevo proyecto de Supabase:

### Paso 0: Crear Buckets de Storage (Dashboard)

Antes de ejecutar cualquier SQL, ve a **Supabase Dashboard > Storage** y crea estos buckets **públicos**:

1. `products`
2. `banners`
3. `categories`

### Paso 1: Schema (Tablas)

```bash
# Ejecutar en SQL Editor
01_schema.sql
```

Crea todas las tablas, índices, triggers y funciones.

### Paso 2: Políticas RLS

```bash
# Ejecutar en SQL Editor
02_rls_policies.sql
```

Configura Row Level Security y permisos para cada tabla.

### Paso 3: Storage Policies

```bash
# Ejecutar en SQL Editor
03_storage_policies.sql
```

Configura políticas de acceso para los buckets de imágenes.

### Paso 4: Datos Iniciales (Opcional)

```bash
# Ejecutar en SQL Editor
04_seed_data.sql
```

Inserta categorías, códigos de descuento, configuración del sitio y reviews iniciales.

---

## Estructura de Archivos

```
supabase/
├── 01_schema.sql          # Todas las tablas y triggers
├── 02_rls_policies.sql    # Políticas de seguridad
├── 03_storage_policies.sql # Políticas de storage
├── 04_seed_data.sql       # Datos iniciales
└── README.md              # Este archivo
```

## Tablas Incluidas

| Tabla | Descripción |
|-------|-------------|
| `categories` | Categorías de productos |
| `products` | Productos del catálogo |
| `discount_codes` | Códigos de descuento |
| `subscribers` | Suscriptores del newsletter |
| `orders` | Órdenes/Pedidos |
| `site_config` | Configuración del sitio (JSONB) |
| `banners` | Banners del carrusel |
| `reviews` | Reseñas de clientes |
| `social_embeds` | Embeds de redes sociales |
| `carts` | Carritos de compra (server-side) |
| `cart_items` | Items del carrito |

## Notas Importantes

### Órdenes (orders)

La tabla `orders` tiene **RLS deshabilitado** y usa GRANTs directos porque hay problemas conocidos con el insert anónimo en Supabase RLS. Los permisos son:

- `anon`: INSERT, SELECT
- `authenticated`: ALL

### Carritos (carts)

Los carritos son anónimos (por dispositivo) y se limpian automáticamente después de 7 días de inactividad. Para ejecutar la limpieza:

```sql
-- Manual
SELECT cleanup_old_carts();

-- Con pg_cron (Plan Pro)
SELECT cron.schedule('cleanup-carts', '0 3 * * *', 'SELECT cleanup_old_carts();');
```

## Credenciales

Después de configurar, actualiza `environment.ts`:

```typescript
export const environment = {
  supabase: {
    url: 'https://TU-PROYECTO.supabase.co',
    anonKey: 'TU-ANON-KEY',
  }
};
```

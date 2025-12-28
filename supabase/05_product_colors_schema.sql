-- ============================================
-- SABOTAGE E-COMMERCE - PRODUCT COLORS & IMAGES
-- Archivo: 05_product_colors_schema.sql
-- ============================================
-- Este script agrega soporte para múltiples colores por producto,
-- donde cada color tiene su propia galería de imágenes.
-- ============================================

-- ============================================
-- TABLA: COLORES DE PRODUCTO
-- ============================================

CREATE TABLE IF NOT EXISTS product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    hex_code TEXT,  -- Formato: #FFFFFF
    display_order INT DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_colors_default ON product_colors(product_id) WHERE is_default = true;

-- ============================================
-- TABLA: IMÁGENES POR COLOR
-- ============================================

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_color_id UUID NOT NULL REFERENCES product_colors(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_color ON product_images(product_color_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_color_id) WHERE is_primary = true;

-- ============================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- ============================================

-- Crear un color por cada producto que tenga color o imagen
INSERT INTO product_colors (product_id, color_name, hex_code, is_default, in_stock)
SELECT 
    id AS product_id,
    COALESCE(NULLIF(TRIM(color), ''), 'Default') AS color_name,
    NULL AS hex_code,
    true AS is_default,
    in_stock
FROM products
WHERE color IS NOT NULL OR image_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Migrar imágenes existentes al nuevo esquema
INSERT INTO product_images (product_color_id, image_url, display_order, is_primary)
SELECT 
    pc.id AS product_color_id,
    p.image_url,
    0 AS display_order,
    true AS is_primary
FROM products p
JOIN product_colors pc ON pc.product_id = p.id
WHERE p.image_url IS NOT NULL AND p.image_url != ''
ON CONFLICT DO NOTHING;

-- ============================================
-- ACTUALIZAR TABLA CART_ITEMS
-- ============================================

-- Agregar columna para color seleccionado
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS product_color_id UUID REFERENCES product_colors(id) ON DELETE SET NULL;

-- Actualizar constraint único para incluir color
-- Primero eliminar el constraint existente si existe
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_size_key;

-- Crear nuevo constraint que incluye color
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_cart_product_color_size_key 
UNIQUE (cart_id, product_id, product_color_id, size);

-- ============================================
-- ELIMINAR COLUMNAS OBSOLETAS DE PRODUCTS
-- (Ejecutar después de verificar la migración)
-- ============================================

-- NOTA: Estas líneas están comentadas para permitir un rollback fácil.
-- Descomentar y ejecutar manualmente después de verificar que todo funciona.

-- ALTER TABLE products DROP COLUMN IF EXISTS color;
-- ALTER TABLE products DROP COLUMN IF EXISTS image_url;

-- ============================================
-- FUNCIÓN HELPER: Obtener imagen principal de un producto
-- ============================================

CREATE OR REPLACE FUNCTION get_product_primary_image(p_product_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_image_url TEXT;
BEGIN
    -- Buscar la imagen primaria del color default
    SELECT pi.image_url INTO v_image_url
    FROM product_images pi
    JOIN product_colors pc ON pc.id = pi.product_color_id
    WHERE pc.product_id = p_product_id 
      AND pc.is_default = true 
      AND pi.is_primary = true
    LIMIT 1;
    
    -- Si no hay imagen primaria del default, buscar cualquier imagen primaria
    IF v_image_url IS NULL THEN
        SELECT pi.image_url INTO v_image_url
        FROM product_images pi
        JOIN product_colors pc ON pc.id = pi.product_color_id
        WHERE pc.product_id = p_product_id 
          AND pi.is_primary = true
        LIMIT 1;
    END IF;
    
    -- Si aún no hay, buscar cualquier imagen
    IF v_image_url IS NULL THEN
        SELECT pi.image_url INTO v_image_url
        FROM product_images pi
        JOIN product_colors pc ON pc.id = pi.product_color_id
        WHERE pc.product_id = p_product_id
        ORDER BY pc.display_order, pi.display_order
        LIMIT 1;
    END IF;
    
    RETURN v_image_url;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNCIÓN HELPER: Obtener color default de un producto
-- ============================================

CREATE OR REPLACE FUNCTION get_product_default_color(p_product_id UUID)
RETURNS UUID AS $$
DECLARE
    v_color_id UUID;
BEGIN
    -- Buscar el color marcado como default
    SELECT id INTO v_color_id
    FROM product_colors
    WHERE product_id = p_product_id AND is_default = true
    LIMIT 1;
    
    -- Si no hay default, tomar el primero por orden
    IF v_color_id IS NULL THEN
        SELECT id INTO v_color_id
        FROM product_colors
        WHERE product_id = p_product_id
        ORDER BY display_order
        LIMIT 1;
    END IF;
    
    RETURN v_color_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: Anyone can view product colors and images
CREATE POLICY "Public read access for product_colors"
ON product_colors FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read access for product_images"
ON product_images FOR SELECT
TO public
USING (true);

-- ADMIN WRITE: All operations for authenticated users
CREATE POLICY "Admin full access for product_colors"
ON product_colors FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin full access for product_images"
ON product_images FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


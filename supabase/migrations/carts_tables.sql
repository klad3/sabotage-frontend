-- ============================================
-- TABLAS DE CARRITO
-- Ejecutar en: Supabase SQL Editor
-- ============================================
-- Sistema de carrito server-side para evitar
-- manipulación de precios en localStorage
-- ============================================

-- Tabla de carritos (anónimos, por dispositivo)
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0 AND quantity <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, product_id, size)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_updated_at ON carts(updated_at);

-- Trigger para actualizar updated_at en carts
DROP TRIGGER IF EXISTS carts_updated_at ON carts;
CREATE TRIGGER carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para actualizar updated_at en cart_items
DROP TRIGGER IF EXISTS cart_items_updated_at ON cart_items;
CREATE TRIGGER cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para actualizar updated_at del carrito cuando se modifican items
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE carts SET updated_at = NOW() WHERE id = OLD.cart_id;
        RETURN OLD;
    ELSE
        UPDATE carts SET updated_at = NOW() WHERE id = NEW.cart_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cart_items_update_cart ON cart_items;
CREATE TRIGGER cart_items_update_cart
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_cart_timestamp();

-- ============================================
-- LIMPIEZA AUTOMÁTICA DE CARRITOS INACTIVOS
-- ============================================

-- Función para limpiar carritos sin actividad por 7 días
CREATE OR REPLACE FUNCTION cleanup_old_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM carts
    WHERE updated_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario: Para ejecutar la limpieza periódicamente:
-- Opción 1: pg_cron (plan Pro de Supabase)
--   SELECT cron.schedule('cleanup-carts', '0 3 * * *', 'SELECT cleanup_old_carts();');
-- Opción 2: Llamar desde cron externo (GitHub Actions, etc.)
--   POST /rest/v1/rpc/cleanup_old_carts
-- Opción 3: Ejecutar manualmente desde SQL Editor
--   SELECT cleanup_old_carts();

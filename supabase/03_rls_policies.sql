-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ejecutar después de 02_seed_data.sql
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTOS
-- ============================================

-- Lectura pública (solo productos activos)
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true);

-- Admins pueden ver todos los productos (incluso inactivos)
CREATE POLICY "Authenticated users can view all products"
    ON products FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admins pueden crear, editar y eliminar
CREATE POLICY "Authenticated users can insert products"
    ON products FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
    ON products FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
    ON products FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- CATEGORÍAS
-- ============================================

CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can view all categories"
    ON categories FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert categories"
    ON categories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
    ON categories FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories"
    ON categories FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- CÓDIGOS DE DESCUENTO
-- ============================================

-- Lectura pública para validar códigos (solo activos y no expirados)
CREATE POLICY "Active discount codes are viewable"
    ON discount_codes FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Authenticated users can view all discount codes"
    ON discount_codes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert discount codes"
    ON discount_codes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update discount codes"
    ON discount_codes FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete discount codes"
    ON discount_codes FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- SUSCRIPTORES
-- ============================================

-- Cualquiera puede suscribirse
CREATE POLICY "Anyone can subscribe"
    ON subscribers FOR INSERT
    WITH CHECK (true);

-- Solo admins pueden ver suscriptores
CREATE POLICY "Authenticated users can view subscribers"
    ON subscribers FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subscribers"
    ON subscribers FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete subscribers"
    ON subscribers FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- ÓRDENES
-- ============================================

-- Cualquiera puede crear órdenes (checkout público)
CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Solo admins pueden ver y gestionar órdenes
CREATE POLICY "Authenticated users can view orders"
    ON orders FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders"
    ON orders FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete orders"
    ON orders FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- CONFIGURACIÓN
-- ============================================

-- Lectura pública para obtener config
CREATE POLICY "Config is readable by everyone"
    ON site_config FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can update config"
    ON site_config FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert config"
    ON site_config FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

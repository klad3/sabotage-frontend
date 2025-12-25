-- ============================================
-- SABOTAGE E-COMMERCE - RLS POLICIES
-- Archivo: 02_rls_policies.sql
-- ============================================
-- Ejecutar después de 01_schema.sql
-- ============================================

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY; -- Deshabilitado por problema con anon insert
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTOS
-- ============================================

CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert products"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
    ON products FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete products"
    ON products FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- CATEGORÍAS
-- ============================================

CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can view all categories"
    ON categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert categories"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
    ON categories FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete categories"
    ON categories FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- CÓDIGOS DE DESCUENTO
-- ============================================

CREATE POLICY "Active discount codes are viewable"
    ON discount_codes FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Authenticated users can view all discount codes"
    ON discount_codes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert discount codes"
    ON discount_codes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update discount codes"
    ON discount_codes FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete discount codes"
    ON discount_codes FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- SUSCRIPTORES
-- ============================================

CREATE POLICY "Anyone can subscribe"
    ON subscribers FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers"
    ON subscribers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can update subscribers"
    ON subscribers FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete subscribers"
    ON subscribers FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- ÓRDENES (RLS DESHABILITADO - Usar GRANTs)
-- ============================================
-- NOTA: RLS está deshabilitado para orders porque hay problemas
-- con el insert anónimo. Usamos GRANTs directos en su lugar.

GRANT INSERT, SELECT ON orders TO anon;
GRANT ALL ON orders TO authenticated;

-- ============================================
-- CONFIGURACIÓN DEL SITIO
-- ============================================

CREATE POLICY "Config is readable by everyone"
    ON site_config FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can update config"
    ON site_config FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert config"
    ON site_config FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- BANNERS
-- ============================================

CREATE POLICY "banners_public_read" ON banners
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "banners_admin_all" ON banners
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- REVIEWS
-- ============================================

CREATE POLICY "Anyone can view approved reviews" 
    ON reviews 
    FOR SELECT 
    USING (status = 'approved');

CREATE POLICY "Anyone can submit reviews" 
    ON reviews 
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated can manage all reviews" 
    ON reviews 
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- ============================================
-- SOCIAL EMBEDS
-- ============================================

CREATE POLICY "Allow public read active embeds" ON social_embeds
    FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Allow authenticated full access" ON social_embeds
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- CARRITOS
-- ============================================

CREATE POLICY "Anyone can create carts"
    ON carts FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can read carts"
    ON carts FOR SELECT
    USING (true);

CREATE POLICY "Anyone can update carts"
    ON carts FOR UPDATE
    USING (true);

CREATE POLICY "Authenticated users can delete carts"
    ON carts FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- CART ITEMS
-- ============================================

CREATE POLICY "Anyone can create cart items"
    ON cart_items FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can read cart items"
    ON cart_items FOR SELECT
    USING (true);

CREATE POLICY "Anyone can update cart items"
    ON cart_items FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete cart items"
    ON cart_items FOR DELETE
    USING (true);

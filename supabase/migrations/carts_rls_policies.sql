-- ============================================
-- RLS POLICIES PARA CARRITOS
-- Ejecutar después de carts_tables.sql
-- ============================================

-- Habilitar RLS en tablas de carrito
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CARRITOS
-- ============================================

-- Cualquiera puede crear un carrito
CREATE POLICY "Anyone can create carts"
    ON carts FOR INSERT
    WITH CHECK (true);

-- Cualquiera puede leer carritos (por ID desde localStorage)
CREATE POLICY "Anyone can read carts"
    ON carts FOR SELECT
    USING (true);

-- Cualquiera puede actualizar su carrito
CREATE POLICY "Anyone can update carts"
    ON carts FOR UPDATE
    USING (true);

-- Los carritos se eliminan automáticamente por el cleanup
-- pero admins también pueden eliminar
CREATE POLICY "Authenticated users can delete carts"
    ON carts FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- CART ITEMS
-- ============================================

-- Cualquiera puede agregar items a su carrito
CREATE POLICY "Anyone can create cart items"
    ON cart_items FOR INSERT
    WITH CHECK (true);

-- Cualquiera puede leer items de carrito
CREATE POLICY "Anyone can read cart items"
    ON cart_items FOR SELECT
    USING (true);

-- Cualquiera puede actualizar items (cantidad)
CREATE POLICY "Anyone can update cart items"
    ON cart_items FOR UPDATE
    USING (true);

-- Cualquiera puede eliminar items de su carrito
CREATE POLICY "Anyone can delete cart items"
    ON cart_items FOR DELETE
    USING (true);

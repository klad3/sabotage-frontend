-- ============================================
-- FIX: RLS Policy para permitir órdenes anónimas
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Eliminar políticas existentes de INSERT en orders
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anon can create orders" ON orders;
DROP POLICY IF EXISTS "Auth can create orders" ON orders;

-- Asegurar que RLS está habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Crear política correcta para INSERT anónimo
-- Usando la sintaxis correcta: TO anon, authenticated
CREATE POLICY "Orders can be created by anyone"
    ON orders 
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Verificar que la política se creó correctamente
SELECT policyname, cmd, qual, with_check, roles
FROM pg_policies 
WHERE tablename = 'orders';

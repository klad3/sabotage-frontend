-- ============================================
-- STORAGE POLICIES
-- Ejecutar después de crear el bucket 'products' en Supabase Dashboard
-- ============================================
-- NOTA: Antes de ejecutar este script:
-- 1. Ve a Storage en Supabase Dashboard
-- 2. Crea un nuevo bucket llamado "products"
-- 3. Marca la opción "Public bucket"
-- 4. Luego ejecuta este script
-- ============================================

-- Política para lectura pública de imágenes
CREATE POLICY "Product images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

-- Política para subir imágenes (solo autenticados)
CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

-- Política para actualizar imágenes (solo autenticados)
CREATE POLICY "Authenticated users can update product images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

-- Política para eliminar imágenes (solo autenticados)
CREATE POLICY "Authenticated users can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

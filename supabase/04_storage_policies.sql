-- ============================================
-- SABOTAGE E-COMMERCE - STORAGE POLICIES
-- Ejecutar en: Supabase SQL Editor
-- ============================================
-- IMPORTANTE: Antes de ejecutar este script debes crear los buckets
-- en Supabase Dashboard > Storage > New bucket:
--
-- 1. Bucket: "products" (marcar como Public bucket)
-- 2. Bucket: "banners" (marcar como Public bucket)
-- 3. Bucket: "categories" (marcar como Public bucket)
--
-- Después de crear los 3 buckets, ejecuta este script.
-- ============================================

-- ============================================
-- BUCKET: PRODUCTS
-- ============================================

-- Lectura pública
CREATE POLICY "Product images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

-- Subir (solo autenticados)
CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

-- Actualizar (solo autenticados)
CREATE POLICY "Authenticated users can update product images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

-- Eliminar (solo autenticados)
CREATE POLICY "Authenticated users can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- BUCKET: BANNERS
-- ============================================

-- Lectura pública
CREATE POLICY "Banner images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banners');

-- Subir (solo autenticados)
CREATE POLICY "Authenticated users can upload banner images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

-- Actualizar (solo autenticados)
CREATE POLICY "Authenticated users can update banner images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

-- Eliminar (solo autenticados)
CREATE POLICY "Authenticated users can delete banner images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- BUCKET: CATEGORIES
-- ============================================

-- Lectura pública
CREATE POLICY "Category images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'categories');

-- Subir (solo autenticados)
CREATE POLICY "Authenticated users can upload category images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'categories' 
        AND auth.role() = 'authenticated'
    );

-- Actualizar (solo autenticados)
CREATE POLICY "Authenticated users can update category images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'categories' 
        AND auth.role() = 'authenticated'
    );

-- Eliminar (solo autenticados)
CREATE POLICY "Authenticated users can delete category images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'categories' 
        AND auth.role() = 'authenticated'
    );

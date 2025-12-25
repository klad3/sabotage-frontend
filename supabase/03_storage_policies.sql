-- ============================================
-- SABOTAGE E-COMMERCE - STORAGE POLICIES
-- Archivo: 03_storage_policies.sql
-- ============================================
-- PRERREQUISITO: Crear buckets públicos en Dashboard:
-- 1. products
-- 2. banners
-- 3. categories
-- ============================================

-- ============================================
-- BUCKET: PRODUCTS
-- ============================================

CREATE POLICY "Product images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update product images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- BUCKET: BANNERS
-- ============================================

CREATE POLICY "Banner images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banner images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update banner images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete banner images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- BUCKET: CATEGORIES
-- ============================================

CREATE POLICY "Category images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'categories');

CREATE POLICY "Authenticated users can upload category images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'categories' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update category images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'categories' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete category images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'categories' 
        AND auth.role() = 'authenticated'
    );

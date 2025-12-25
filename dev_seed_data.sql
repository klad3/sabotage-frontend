-- ============================================
-- SABOTAGE E-COMMERCE - DEV SEED DATA
-- Archivo: dev_seed_data.sql
-- ============================================
-- SOLO PARA DESARROLLO
-- Este script inserta datos de prueba extraídos
-- del proyecto Sabotage original
-- ============================================
-- INSTRUCCIONES:
-- 1. Ejecutar en Supabase SQL Editor
-- 2. El script limpia las tablas antes de insertar
-- ============================================

-- ============================================
-- LIMPIAR TABLAS (TRUNCATE con CASCADE)
-- ============================================

-- Desactivar triggers temporalmente para evitar problemas
SET session_replication_role = 'replica';

TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE carts CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE discount_codes CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE social_embeds CASCADE;
TRUNCATE TABLE banners CASCADE;
TRUNCATE TABLE subscribers CASCADE;
-- site_config se mantiene porque es configuración del sitio

-- Reactivar triggers
SET session_replication_role = 'origin';

-- ============================================
-- CATEGORÍAS
-- ============================================

INSERT INTO categories (id, name, slug, description, display_order, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Oversize', 'oversize', 'Polos oversize con estilo urbano', 1, true),
    ('22222222-2222-2222-2222-222222222222', 'Clásico', 'clasico', 'Polos clásicos que nunca pasan de moda', 2, true),
    ('33333333-3333-3333-3333-333333333333', 'Personalizados', 'personalizados', 'Diseños personalizados para ti', 3, true),
    ('44444444-4444-4444-4444-444444444444', 'Tottebags', 'tottebags', 'Bolsas tote con diseño único', 4, true);

-- ============================================
-- PRODUCTOS - OVERSIZE
-- ============================================

INSERT INTO products (name, description, price, category_id, type, color, theme, sizes, image_url, in_stock, is_active) VALUES
    -- Producto 1: POLO OVERSIZE NEGRO BDU
    (
        'POLO OVERSIZE NEGRO BDU',
        'Polo oversize de algodón premium con diseño urbano exclusivo. Estampado de alta calidad.',
        49.90,
        '11111111-1111-1111-1111-111111111111',
        'personalizado',
        'negro',
        'urbano',
        ARRAY['S', 'M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 2: POLO OVERSIZE BLANCO ANIME
    (
        'POLO OVERSIZE BLANCO ANIME',
        'Diseño exclusivo inspirado en anime. Tela suave y cómoda, perfecto para cualquier ocasión.',
        54.90,
        '11111111-1111-1111-1111-111111111111',
        'simple',
        'blanco',
        'anime',
        ARRAY['S', 'M', 'L', 'XL'],
        NULL,
        false,
        true
    ),
    -- Producto 3: POLO OVERSIZE GRIS SKATE
    (
        'POLO OVERSIZE GRIS SKATE',
        'Estilo skateboard urbano. Material resistente y diseño único para los amantes del skate.',
        52.90,
        '11111111-1111-1111-1111-111111111111',
        'personalizado',
        'gris',
        'skate',
        ARRAY['M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 4: POLO OVERSIZE NEGRO GAMING
    (
        'POLO OVERSIZE NEGRO GAMING',
        'Para los verdaderos gamers. Diseño inspirado en los videojuegos más populares del momento.',
        56.90,
        '11111111-1111-1111-1111-111111111111',
        'personalizado',
        'negro',
        'videojuegos',
        ARRAY['S', 'M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 5: POLO OVERSIZE AZUL ESPIRITUAL
    (
        'POLO OVERSIZE AZUL ESPIRITUAL',
        'Diseño místico y espiritual. Perfecto para quienes buscan algo diferente y único.',
        53.90,
        '11111111-1111-1111-1111-111111111111',
        'simple',
        'azul',
        'espiritual',
        ARRAY['XS', 'S', 'M', 'L', 'XL'],
        NULL,
        true,
        true
    ),
    -- Producto 6: POLO OVERSIZE ROJO MÚSICA
    (
        'POLO OVERSIZE ROJO MÚSICA',
        'Para los amantes de la música. Estampado de bandas legendarias con estilo urbano.',
        55.90,
        '11111111-1111-1111-1111-111111111111',
        'simple',
        'rojo',
        'musica',
        ARRAY['S', 'M', 'L', 'XL'],
        NULL,
        true,
        true
    ),
    -- Producto 7: POLO OVERSIZE VERDE ANIME
    (
        'POLO OVERSIZE VERDE ANIME',
        'Diseño exclusivo de anime japonés. Calidad premium y estilo inigualable.',
        57.90,
        '11111111-1111-1111-1111-111111111111',
        'personalizado',
        'verde',
        'anime',
        ARRAY['M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 8: POLO OVERSIZE BLANCO URBANO
    (
        'POLO OVERSIZE BLANCO URBANO',
        'Minimalista y elegante. Perfecto para el día a día con estilo urbano único.',
        48.90,
        '11111111-1111-1111-1111-111111111111',
        'simple',
        'blanco',
        'urbano',
        ARRAY['XS', 'S', 'M', 'L', 'XL'],
        NULL,
        true,
        true
    ),
    -- Producto 9: POLO OVERSIZE NEGRO ESPIRITUAL
    (
        'POLO OVERSIZE NEGRO ESPIRITUAL',
        'Diseño místico en negro. Símbolos ancestrales con estilo moderno.',
        59.90,
        '11111111-1111-1111-1111-111111111111',
        'simple',
        'negro',
        'espiritual',
        ARRAY['S', 'M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 10: POLO OVERSIZE GRIS GAMING
    (
        'POLO OVERSIZE GRIS GAMING',
        'Edición especial gaming. Para los que viven y respiran videojuegos.',
        58.90,
        '11111111-1111-1111-1111-111111111111',
        'simple',
        'gris',
        'videojuegos',
        ARRAY['M', 'L', 'XL'],
        NULL,
        true,
        true
    );

-- ============================================
-- PRODUCTOS - CLÁSICOS
-- ============================================

INSERT INTO products (name, description, price, category_id, type, color, theme, sizes, image_url, in_stock, is_active) VALUES
    -- Producto 1: POLO CLASICO NEGRO BDU
    (
        'POLO CLASICO NEGRO BDU',
        'Polo clasico de algodón premium con diseño urbano exclusivo. Estampado de alta calidad.',
        49.90,
        '22222222-2222-2222-2222-222222222222',
        'personalizado',
        'negro',
        'urbano',
        ARRAY['S', 'M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 2: POLO CLASICO BLANCO ANIME
    (
        'POLO CLASICO BLANCO ANIME',
        'Diseño exclusivo inspirado en anime. Tela suave y cómoda, perfecto para cualquier ocasión.',
        54.90,
        '22222222-2222-2222-2222-222222222222',
        'simple',
        'blanco',
        'anime',
        ARRAY['S', 'M', 'L', 'XL'],
        NULL,
        false,
        true
    ),
    -- Producto 3: POLO CLASICO GRIS SKATE
    (
        'POLO CLASICO GRIS SKATE',
        'Estilo skateboard urbano. Material resistente y diseño único para los amantes del skate.',
        52.90,
        '22222222-2222-2222-2222-222222222222',
        'personalizado',
        'gris',
        'skate',
        ARRAY['M', 'L', 'XL', 'XXL'],
        NULL,
        false,
        true
    ),
    -- Producto 4: POLO CLASICO NEGRO GAMING
    (
        'POLO CLASICO NEGRO GAMING',
        'Para los verdaderos gamers. Diseño inspirado en los videojuegos más populares del momento.',
        56.90,
        '22222222-2222-2222-2222-222222222222',
        'personalizado',
        'negro',
        'videojuegos',
        ARRAY['S', 'M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 5: POLO CLASICO AZUL ESPIRITUAL
    (
        'POLO CLASICO AZUL ESPIRITUAL',
        'Diseño místico y espiritual. Perfecto para quienes buscan algo diferente y único.',
        53.90,
        '22222222-2222-2222-2222-222222222222',
        'simple',
        'azul',
        'espiritual',
        ARRAY['XS', 'S', 'M', 'L', 'XL'],
        NULL,
        true,
        true
    ),
    -- Producto 6: POLO CLASICO ROJO MÚSICA
    (
        'POLO CLASICO ROJO MÚSICA',
        'Para los amantes de la música. Estampado de bandas legendarias con estilo urbano.',
        55.90,
        '22222222-2222-2222-2222-222222222222',
        'simple',
        'rojo',
        'musica',
        ARRAY['S', 'M', 'L', 'XL'],
        NULL,
        true,
        true
    ),
    -- Producto 7: POLO CLASICO VERDE ANIME
    (
        'POLO CLASICO VERDE ANIME',
        'Diseño exclusivo de anime japonés. Calidad premium y estilo inigualable.',
        57.90,
        '22222222-2222-2222-2222-222222222222',
        'personalizado',
        'verde',
        'anime',
        ARRAY['M', 'L', 'XL', 'XXL'],
        NULL,
        false,
        true
    ),
    -- Producto 8: POLO CLASICO BLANCO URBANO
    (
        'POLO CLASICO BLANCO URBANO',
        'Minimalista y elegante. Perfecto para el día a día con estilo urbano único.',
        48.90,
        '22222222-2222-2222-2222-222222222222',
        'simple',
        'blanco',
        'urbano',
        ARRAY['XS', 'S', 'M', 'L', 'XL'],
        NULL,
        true,
        true
    ),
    -- Producto 9: POLO CLASICO NEGRO ESPIRITUAL
    (
        'POLO CLASICO NEGRO ESPIRITUAL',
        'Diseño místico en negro. Símbolos ancestrales con estilo moderno.',
        59.90,
        '22222222-2222-2222-2222-222222222222',
        'simple',
        'negro',
        'espiritual',
        ARRAY['S', 'M', 'L', 'XL', 'XXL'],
        NULL,
        true,
        true
    ),
    -- Producto 10: POLO CLASICO GRIS GAMING
    (
        'POLO CLASICO GRIS GAMING',
        'Edición especial gaming. Para los que viven y respiran videojuegos.',
        58.90,
        '22222222-2222-2222-2222-222222222222',
        'simple',
        'gris',
        'videojuegos',
        ARRAY['M', 'L', 'XL'],
        NULL,
        true,
        true
    );

-- ============================================
-- CÓDIGOS DE DESCUENTO
-- ============================================

INSERT INTO discount_codes (code, percentage, is_active) VALUES
    ('SABOTAGE10', 10, true),
    ('PRIMERACOMPRA', 15, true),
    ('VERANO2024', 20, true),
    ('NAVIDAD2024', 25, true);

-- ============================================
-- REVIEWS (TESTIMONIOS)
-- ============================================

INSERT INTO reviews (author, text, stars, status, is_featured, created_at) VALUES
    (
        'María G.',
        'La calidad de las prendas es increíble! El oversize fit es perfecto y la tela super cómoda. Definitivamente volveré a comprar.',
        5,
        'approved',
        true,
        NOW() - INTERVAL '5 days'
    ),
    (
        'Carlos R.',
        'Me encanta el estilo urbano que tienen. Los diseños son únicos y la atención al cliente es de primera. 100% recomendado!',
        5,
        'approved',
        true,
        NOW() - INTERVAL '3 days'
    ),
    (
        'Andrea L.',
        'Mejor relación calidad-precio imposible. Las prendas llegaron súper rápido y son tal cual se ven en las fotos. SABOTAGE rules!',
        5,
        'approved',
        true,
        NOW() - INTERVAL '1 day'
    );

-- ============================================
-- VERIFICAR INSERCIÓN
-- ============================================

SELECT 'Categorías' AS tabla, COUNT(*) AS total FROM categories
UNION ALL
SELECT 'Productos', COUNT(*) FROM products
UNION ALL
SELECT 'Códigos de descuento', COUNT(*) FROM discount_codes
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews;

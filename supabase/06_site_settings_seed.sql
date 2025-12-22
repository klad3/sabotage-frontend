-- ============================================
-- SABOTAGE E-COMMERCE - SITE SETTINGS SEED
-- Ejecutar en: Supabase SQL Editor
-- ============================================
-- Este script inserta las configuraciones iniciales del sitio.
-- Ejecutar DESPUÉS de 01_create_tables.sql
-- ============================================

-- Limpiar configuraciones existentes (opcional, comentar si no deseas)
-- DELETE FROM site_config;

-- Barra de anuncios
INSERT INTO site_config (key, value)
VALUES ('announcement_bar', '{
    "text": "¡Envío GRATIS en compras mayores a S/100!",
    "link": null,
    "is_active": true,
    "background_color": "#1a1a1a",
    "text_color": "#ffffff"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Información de contacto
INSERT INTO site_config (key, value)
VALUES ('contact_info', '{
    "whatsapp": "51999999999",
    "whatsapp_message": "Hola! Me interesa hacer un pedido",
    "email": "contacto@sabotage.pe",
    "instagram": "sabotage.pe",
    "facebook": "sabotageperu",
    "tiktok": "sabotage.pe"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Branding (logo y favicon)
INSERT INTO site_config (key, value)
VALUES ('branding', '{
    "logo_url": null,
    "logo_alt": "SABOTAGE",
    "favicon_url": null,
    "site_name": "SABOTAGE",
    "tagline": "VISTIENDO TU PASIÓN"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Estadísticas de la sección Stats
INSERT INTO site_config (key, value)
VALUES ('stats', '[
    {"value": "15K+", "label": "Clientes felices", "numeric_value": 15, "suffix": "K+", "order": 1},
    {"value": "500+", "label": "Productos", "numeric_value": 500, "suffix": "+", "order": 2},
    {"value": "98%", "label": "Satisfacción", "numeric_value": 98, "suffix": "%", "order": 3},
    {"value": "24/7", "label": "Atención", "numeric_value": null, "suffix": null, "order": 4}
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Títulos de secciones
INSERT INTO site_config (key, value)
VALUES ('section_titles', '{
    "categories": "COMPRA POR CATEGORÍA",
    "products_month": "PRODUCTOS DEL MES",
    "testimonials": "LO QUE DICEN NUESTROS CLIENTES",
    "newsletter": "ÚNETE A NUESTRA COMUNIDAD"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Configuración del footer
INSERT INTO site_config (key, value)
VALUES ('footer', '{
    "about_text": "SABOTAGE es una marca peruana de ropa urbana que combina diseño único con calidad premium.",
    "copyright": "© 2024 SABOTAGE. Todos los derechos reservados.",
    "show_social_links": true,
    "show_payment_methods": true
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- ============================================
-- VERIFICAR INSERCIÓN
-- ============================================
-- SELECT * FROM site_config;

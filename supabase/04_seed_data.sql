-- ============================================
-- SABOTAGE E-COMMERCE - SEED DATA
-- Archivo: 04_seed_data.sql
-- ============================================
-- Ejecutar después de 01, 02 y 03
-- Contiene datos iniciales para el sitio
-- ============================================

-- ============================================
-- CATEGORÍAS INICIALES
-- ============================================

INSERT INTO categories (name, slug, description, display_order) VALUES
    ('Oversize', 'oversize', 'Polos oversize con estilo urbano', 1),
    ('Clásico', 'clasico', 'Polos clásicos que nunca pasan de moda', 2),
    ('Totebags', 'totebags', 'Bolsos urbanos para el día a día', 3),
    ('Poleras', 'poleras', 'Abrigo con estilo urbano', 4),
    ('Gorros', 'gorros', 'Completa tu look urbano', 5);
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CÓDIGOS DE DESCUENTO INICIALES
-- ============================================

INSERT INTO discount_codes (code, percentage, is_active) VALUES
    ('SABOTAGE10', 10, true),
    ('PRIMERACOMPRA', 15, true),
    ('VERANO2024', 20, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- CONFIGURACIÓN DEL SITIO
-- ============================================

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

-- Branding
INSERT INTO site_config (key, value)
VALUES ('branding', '{
    "logo_url": null,
    "logo_alt": "SABOTAGE",
    "favicon_url": null,
    "site_name": "SABOTAGE",
    "tagline": "VISTIENDO TU PASIÓN"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Estadísticas
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

-- Footer
INSERT INTO site_config (key, value)
VALUES ('footer', '{
    "about_text": "SABOTAGE es una marca peruana de ropa urbana que combina diseño único con calidad premium.",
    "copyright": "© 2024 SABOTAGE. Todos los derechos reservados.",
    "show_social_links": true,
    "show_payment_methods": true
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Newsletter content
INSERT INTO site_config (key, value)
VALUES ('newsletter_content', '{
    "title": "ÚNETE AL CREW",
    "subtitle": "Suscríbete y recibe descuentos exclusivos, lanzamientos y más"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Shipping y WhatsApp (legacy keys)
INSERT INTO site_config (key, value) VALUES
    ('shipping_cost', '{"amount": 15.00, "currency": "PEN"}'),
    ('whatsapp', '{"phone_number": "51933866156"}'),
    ('social_links', '{"instagram": "", "facebook": "", "tiktok": ""}')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- REVIEWS INICIALES (TESTIMONIOS)
-- ============================================

INSERT INTO reviews (author, text, stars, status, is_featured, created_at) VALUES
    ('María G.', 'La calidad es increíble, superó mis expectativas. El material es premium y los acabados son perfectos.', 5, 'approved', true, NOW() - INTERVAL '3 days'),
    ('Carlos R.', 'Los diseños son únicos, no encuentras esto en ningún otro lugar. Me encanta el estilo urbano.', 5, 'approved', true, NOW() - INTERVAL '2 days'),
    ('Andrea L.', 'Excelente relación calidad-precio. El envío fue rápido y el empaque muy cuidado.', 5, 'approved', true, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

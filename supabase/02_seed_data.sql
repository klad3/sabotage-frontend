-- ============================================
-- DATOS INICIALES
-- Ejecutar después de 01_create_tables.sql
-- ============================================

-- Categorías
INSERT INTO categories (name, slug, description, display_order) VALUES
    ('Oversize', 'oversize', 'Polos oversize con estilo urbano', 1),
    ('Clásico', 'clasico', 'Polos clásicos que nunca pasan de moda', 2)
ON CONFLICT (slug) DO NOTHING;

-- Códigos de descuento iniciales
INSERT INTO discount_codes (code, percentage, is_active) VALUES
    ('SABOTAGE10', 10, true),
    ('PRIMERACOMPRA', 15, true),
    ('VERANO2024', 20, true)
ON CONFLICT (code) DO NOTHING;

-- Configuración inicial del sitio
INSERT INTO site_config (key, value) VALUES
    ('shipping_cost', '{"amount": 15.00, "currency": "PEN"}'),
    ('whatsapp', '{"phone_number": "51933866156"}'),
    ('social_links', '{"instagram": "", "facebook": "", "tiktok": ""}')
ON CONFLICT (key) DO NOTHING;

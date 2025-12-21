-- ============================================
-- SABOTAGE E-COMMERCE - BANNERS TABLE
-- Ejecutar en: Supabase SQL Editor
-- ============================================

-- Tabla de banners para el carrusel
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_desktop TEXT,          -- URL imagen para desktop (1920x720 horizontal)
    image_tablet TEXT,           -- URL imagen para tablet (1024x768)
    image_mobile TEXT,           -- URL imagen para mobile (400x600 vertical)
    link TEXT,                   -- URL opcional al hacer clic
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS banners_updated_at ON banners;
CREATE TRIGGER banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índice para ordenamiento
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer banners activos (público)
CREATE POLICY "banners_public_read" ON banners
    FOR SELECT
    USING (is_active = true);

-- Solo usuarios autenticados pueden crear/editar/eliminar
CREATE POLICY "banners_admin_insert" ON banners
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "banners_admin_update" ON banners
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "banners_admin_delete" ON banners
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Crear bucket 'banners' si no existe (ejecutar en Storage > Policies)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('banners', 'banners', true)
-- ON CONFLICT (id) DO NOTHING;

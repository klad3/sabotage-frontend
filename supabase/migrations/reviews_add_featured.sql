-- Migration: Add is_featured column and seed initial reviews
-- Created: 2024-12-24

-- ============================================
-- Add is_featured column
-- ============================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for featured reviews
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured) WHERE is_featured = true;

-- ============================================
-- Seed Data: Initial testimonials (previously hardcoded)
-- ============================================

INSERT INTO reviews (author, text, stars, status, is_featured, created_at) VALUES
    ('María G.', 'La calidad es increíble, superó mis expectativas. El material es premium y los acabados son perfectos.', 5, 'approved', true, NOW() - INTERVAL '3 days'),
    ('Carlos R.', 'Los diseños son únicos, no encuentras esto en ningún otro lugar. Me encanta el estilo urbano.', 5, 'approved', true, NOW() - INTERVAL '2 days'),
    ('Andrea L.', 'Excelente relación calidad-precio. El envío fue rápido y el empaque muy cuidado.', 5, 'approved', true, NOW() - INTERVAL '1 day');

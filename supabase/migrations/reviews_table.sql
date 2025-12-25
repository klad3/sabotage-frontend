-- Migration: Create reviews table for customer testimonials/reviews system
-- Created: 2024-12-24

-- ============================================
-- Reviews Table
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create index for ordering by date
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public: Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" 
    ON reviews 
    FOR SELECT 
    USING (status = 'approved');

-- Public: Anyone can submit reviews (will be pending)
CREATE POLICY "Anyone can submit reviews" 
    ON reviews 
    FOR INSERT 
    WITH CHECK (true);

-- Authenticated: Full access for admins
CREATE POLICY "Authenticated can manage all reviews" 
    ON reviews 
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Updated At Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================
-- Social Embeds Table Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Create social_embeds table
CREATE TABLE IF NOT EXISTS social_embeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL DEFAULT 'instagram',
    embed_code TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_mode VARCHAR(20) NOT NULL DEFAULT 'cropped',  -- 'cropped', 'custom', 'original'
    custom_height INTEGER DEFAULT NULL,  -- height in px when display_mode is 'custom'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_embeds ENABLE ROW LEVEL SECURITY;

-- Allow public read for active embeds (for the frontend)
CREATE POLICY "Allow public read active embeds" ON social_embeds
    FOR SELECT USING (is_active = true);

-- Allow authenticated users full access (for admin panel)
CREATE POLICY "Allow authenticated full access" ON social_embeds
    FOR ALL USING (auth.role() = 'authenticated');

-- Create index for ordering
CREATE INDEX idx_social_embeds_order ON social_embeds(display_order);

-- Optional: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_embeds_updated_at
    BEFORE UPDATE ON social_embeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

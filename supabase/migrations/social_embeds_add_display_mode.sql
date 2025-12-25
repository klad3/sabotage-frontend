-- ============================================
-- Social Embeds - Add Display Mode Columns
-- Run this if you already have the social_embeds table created
-- ============================================

-- Add display_mode column (cropped, custom, original)
ALTER TABLE social_embeds 
ADD COLUMN IF NOT EXISTS display_mode VARCHAR(20) NOT NULL DEFAULT 'cropped';

-- Add custom_height column (for custom display mode)
ALTER TABLE social_embeds 
ADD COLUMN IF NOT EXISTS custom_height INTEGER DEFAULT NULL;

-- Update existing rows to use 'cropped' as default
UPDATE social_embeds 
SET display_mode = 'cropped' 
WHERE display_mode IS NULL;

-- Migration: 002_add_styling_fields
-- Description: Add font_family, line_style, line_thickness, custom_colors, and endpoints columns to roadmaps

-- Up Migration
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS font_family VARCHAR(50) DEFAULT 'system';
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS line_style VARCHAR(20) DEFAULT 'solid';
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS line_thickness VARCHAR(20) DEFAULT 'medium';
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS custom_colors JSONB DEFAULT NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS endpoints JSONB DEFAULT NULL;

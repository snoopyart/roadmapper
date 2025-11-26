-- Migration: 001_initial
-- Description: Create initial tables for users, roadmaps, and collaborators

-- Up Migration
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'My Roadmap',
  entries JSONB NOT NULL DEFAULT '[]',
  theme_id VARCHAR(50) DEFAULT 'ocean',
  orientation VARCHAR(20) DEFAULT 'horizontal',
  font_size VARCHAR(20) DEFAULT 'medium',
  entry_shape VARCHAR(20) DEFAULT 'rounded',
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(20) DEFAULT 'view',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(roadmap_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roadmaps_owner ON roadmaps(owner_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_public ON roadmaps(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_roadmaps_share_token ON roadmaps(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_roadmap ON collaborators(roadmap_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roadmaps_updated_at ON roadmaps;
CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

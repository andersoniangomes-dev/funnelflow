-- FunnelFlow Database Schema for Neon PostgreSQL
-- Execute este script no console SQL do Neon ou use o script de inicialização automática

-- Table: utm_clicks
-- Stores UTM click tracking data
CREATE TABLE IF NOT EXISTS utm_clicks (
  id SERIAL PRIMARY KEY,
  utm_id VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  ip VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for utm_clicks (created automatically by lib/db.js)
-- CREATE INDEX IF NOT EXISTS idx_utm_clicks_utm_id ON utm_clicks(utm_id);
-- CREATE INDEX IF NOT EXISTS idx_utm_clicks_timestamp ON utm_clicks(timestamp);

-- Table: short_urls
-- Stores shortened URLs
CREATE TABLE IF NOT EXISTS short_urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_click TIMESTAMP
);

-- Indexes for short_urls (created automatically by lib/db.js)
-- CREATE INDEX IF NOT EXISTS idx_short_urls_code ON short_urls(short_code);
-- CREATE INDEX IF NOT EXISTS idx_short_urls_created_at ON short_urls(created_at);

-- Table: saved_funnels
-- Stores saved funnel configurations
CREATE TABLE IF NOT EXISTS saved_funnels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  steps JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for saved_funnels (created automatically by lib/db.js)
-- CREATE INDEX IF NOT EXISTS idx_saved_funnels_is_default ON saved_funnels(is_default);

-- Table: saved_utms
-- Stores saved UTM configurations
CREATE TABLE IF NOT EXISTS saved_utms (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  tracking_url TEXT,
  short_url TEXT,
  source VARCHAR(100),
  medium VARCHAR(100),
  campaign VARCHAR(255),
  content VARCHAR(255),
  term VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for saved_utms
-- CREATE INDEX IF NOT EXISTS idx_saved_utms_created_at ON saved_utms(created_at);

-- Table: ga4_config
-- Stores GA4 configuration (property ID and credentials)
CREATE TABLE IF NOT EXISTS ga4_config (
  id SERIAL PRIMARY KEY,
  property_id VARCHAR(50) NOT NULL UNIQUE,
  credentials JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: app_settings
-- Stores application settings (API endpoint, etc)
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


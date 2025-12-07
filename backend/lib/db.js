import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Get database URL from environment variable
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL não configurada. Usando armazenamento em arquivo JSON.');
}

// Create Neon client
let sql = null;

if (DATABASE_URL) {
  try {
    sql = neon(DATABASE_URL);
    console.log('✅ Conectado ao banco de dados Neon PostgreSQL');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    console.warn('⚠️  Continuando com armazenamento em arquivo JSON.');
  }
}

// Helper function to check if database is available
export function isDatabaseAvailable() {
  return sql !== null && DATABASE_URL !== undefined;
}

// Export sql client
export { sql };

// Initialize database tables
export async function initializeDatabase() {
  if (!isDatabaseAvailable()) {
    console.log('📝 Banco de dados não configurado. Pulando inicialização.');
    return;
  }

  try {
    // Create utm_clicks table
    await sql`
      CREATE TABLE IF NOT EXISTS utm_clicks (
        id SERIAL PRIMARY KEY,
        utm_id VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        ip VARCHAR(45),
        user_agent TEXT,
        referer TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for utm_clicks
    await sql`CREATE INDEX IF NOT EXISTS idx_utm_clicks_utm_id ON utm_clicks(utm_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_utm_clicks_timestamp ON utm_clicks(timestamp)`;

    // Create short_urls table
    await sql`
      CREATE TABLE IF NOT EXISTS short_urls (
        id SERIAL PRIMARY KEY,
        short_code VARCHAR(20) UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_click TIMESTAMP
      )
    `;

    // Create indexes for short_urls
    await sql`CREATE INDEX IF NOT EXISTS idx_short_urls_code ON short_urls(short_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_short_urls_created_at ON short_urls(created_at)`;

    // Create saved_funnels table
    await sql`
      CREATE TABLE IF NOT EXISTS saved_funnels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        steps JSONB NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_saved_funnels_is_default ON saved_funnels(is_default)`;

    // Create saved_utms table
    await sql`
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
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_saved_utms_created_at ON saved_utms(created_at)`;

    // Create ga4_config table
    await sql`
      CREATE TABLE IF NOT EXISTS ga4_config (
        id SERIAL PRIMARY KEY,
        property_id VARCHAR(50) NOT NULL UNIQUE,
        credentials JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create app_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ Tabelas do banco de dados inicializadas');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}


/**
 * Script de migração de dados JSON para PostgreSQL (Neon)
 * 
 * Este script migra os dados existentes dos arquivos JSON para o banco de dados PostgreSQL
 * 
 * Uso: node scripts/migrate-to-db.js
 */

import { sql, isDatabaseAvailable } from '../lib/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const CLICKS_FILE = path.join(DATA_DIR, 'utm-clicks.json');
const SHORT_URLS_FILE = path.join(DATA_DIR, 'short-urls.json');

async function migrateUTMClicks() {
  if (!isDatabaseAvailable()) {
    console.log('⚠️  Banco de dados não configurado. Pulando migração de cliques UTM.');
    return;
  }

  try {
    const data = await fs.readFile(CLICKS_FILE, 'utf8');
    const clicks = JSON.parse(data);

    console.log(`📦 Migrando ${Object.keys(clicks).length} UTMs...`);

    for (const [utmId, utmData] of Object.entries(clicks)) {
      if (!utmData.clicks || utmData.clicks.length === 0) {
        continue;
      }

      console.log(`  Migrando UTM ${utmId} (${utmData.clicks.length} cliques)...`);

      for (const click of utmData.clicks) {
        try {
          // Check if click already exists (by timestamp and utm_id)
          const existing = await sql`
            SELECT id FROM utm_clicks
            WHERE utm_id = ${utmId}
              AND timestamp = ${click.timestamp ? new Date(click.timestamp) : new Date()}
            LIMIT 1
          `;

          if (existing.length === 0) {
            await sql`
              INSERT INTO utm_clicks (utm_id, url, ip, user_agent, referer, timestamp)
              VALUES (
                ${utmId},
                ${click.url || ''},
                ${click.ip || 'unknown'},
                ${click.userAgent || 'unknown'},
                ${click.referer || 'unknown'},
                ${click.timestamp ? new Date(click.timestamp) : new Date()}
              )
            `;
          }
        } catch (error) {
          console.error(`    Erro ao migrar clique:`, error.message);
        }
      }
    }

    console.log('✅ Migração de cliques UTM concluída!');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📝 Arquivo utm-clicks.json não encontrado. Nada para migrar.');
    } else {
      console.error('❌ Erro ao migrar cliques UTM:', error);
    }
  }
}

async function migrateShortUrls() {
  if (!isDatabaseAvailable()) {
    console.log('⚠️  Banco de dados não configurado. Pulando migração de URLs encurtadas.');
    return;
  }

  try {
    const data = await fs.readFile(SHORT_URLS_FILE, 'utf8');
    const shortUrls = JSON.parse(data);

    console.log(`📦 Migrando ${Object.keys(shortUrls).length} URLs encurtadas...`);

    for (const [code, urlData] of Object.entries(shortUrls)) {
      try {
        // Check if short URL already exists
        const existing = await sql`
          SELECT short_code FROM short_urls
          WHERE short_code = ${code}
          LIMIT 1
        `;

        if (existing.length > 0) {
          // Update existing
          await sql`
            UPDATE short_urls
            SET clicks = ${urlData.clicks || 0},
                last_click = ${urlData.lastClick ? new Date(urlData.lastClick) : null}
            WHERE short_code = ${code}
          `;
        } else {
          // Insert new
          await sql`
            INSERT INTO short_urls (short_code, original_url, clicks, created_at, last_click)
            VALUES (
              ${code},
              ${urlData.originalUrl},
              ${urlData.clicks || 0},
              ${urlData.createdAt ? new Date(urlData.createdAt) : new Date()},
              ${urlData.lastClick ? new Date(urlData.lastClick) : null}
            )
          `;
        }
        console.log(`  ✅ Migrado: ${code}`);
      } catch (error) {
        console.error(`  ❌ Erro ao migrar ${code}:`, error.message);
      }
    }

    console.log('✅ Migração de URLs encurtadas concluída!');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📝 Arquivo short-urls.json não encontrado. Nada para migrar.');
    } else {
      console.error('❌ Erro ao migrar URLs encurtadas:', error);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando migração de dados para PostgreSQL...\n');

  await migrateUTMClicks();
  console.log('');
  await migrateShortUrls();

  console.log('\n✅ Migração concluída!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Erro fatal na migração:', error);
  process.exit(1);
});


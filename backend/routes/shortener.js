import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { sql, isDatabaseAvailable } from '../lib/db.js';

// Import click tracking functions from utm.js (for JSON fallback)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UTM_DATA_DIR = path.join(__dirname, '../data');
const CLICKS_FILE = path.join(UTM_DATA_DIR, 'utm-clicks.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(UTM_DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

async function loadClicks() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CLICKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveClicks(clicks) {
  try {
    await ensureDataDir();
    await fs.writeFile(CLICKS_FILE, JSON.stringify(clicks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving clicks:', error);
  }
}

const router = express.Router();

// Path to store shortened URLs (fallback)
const DATA_DIR = path.join(__dirname, '../data');
const SHORT_URLS_FILE = path.join(DATA_DIR, 'short-urls.json');

// Load short URLs (fallback - JSON file)
async function loadShortUrls() {
  try {
    await ensureDataDir(); // Uses the function defined above
    const data = await fs.readFile(SHORT_URLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Save short URLs (fallback - JSON file)
async function saveShortUrls(urls) {
  try {
    await ensureDataDir();
    await fs.writeFile(SHORT_URLS_FILE, JSON.stringify(urls, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving short URLs:', error);
  }
}

// Generate short code
function generateShortCode() {
  return crypto.randomBytes(3).toString('base64url').substring(0, 6).toLowerCase();
}

// Get short URL info (must come before /:code)
router.get('/info/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (isDatabaseAvailable()) {
      const result = await sql`
        SELECT * FROM short_urls
        WHERE short_code = ${code.toLowerCase()}
        LIMIT 1
      `;

      if (result.length === 0) {
        return res.status(404).json({
          error: 'Short URL not found'
        });
      }

      const shortUrlData = result[0];
      const protocol = req.protocol;
      const host = req.get('host');
      const shortUrl = `${protocol}://${host}/s/${code}`;

      res.json({
        shortCode: code,
        shortUrl,
        originalUrl: shortUrlData.original_url,
        clicks: shortUrlData.clicks || 0,
        createdAt: shortUrlData.created_at.toISOString(),
        lastClick: shortUrlData.last_click ? shortUrlData.last_click.toISOString() : null
      });
    } else {
      // Fallback to JSON
    const shortUrls = await loadShortUrls();
    const shortUrlData = shortUrls[code.toLowerCase()];

    if (!shortUrlData) {
      return res.status(404).json({
        error: 'Short URL not found'
      });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const shortUrl = `${protocol}://${host}/s/${code}`;

    res.json({
      shortCode: code,
      shortUrl,
      originalUrl: shortUrlData.originalUrl,
      clicks: shortUrlData.clicks || 0,
      createdAt: shortUrlData.createdAt,
      lastClick: shortUrlData.lastClick
    });
    }
  } catch (error) {
    console.error('Error getting short URL info:', error);
    res.status(500).json({
      error: 'Failed to get URL info',
      message: error.message
    });
  }
});

// Create short URL (must come before /:code)
router.post('/shorten', async (req, res) => {
  try {
    const { url, customCode } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'URL is required'
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }
    
    let shortCode;

    if (isDatabaseAvailable()) {
      try {
    if (customCode) {
          // Check if custom code exists
          const existing = await sql`
            SELECT * FROM short_urls
            WHERE short_code = ${customCode.toLowerCase()}
            LIMIT 1
          `;

          if (existing.length > 0) {
        return res.status(409).json({
          error: 'Custom code already exists'
        });
      }
      shortCode = customCode.toLowerCase();
    } else {
      // Generate unique code
          let exists = true;
          while (exists) {
            shortCode = generateShortCode();
            const existing = await sql`
              SELECT * FROM short_urls
              WHERE short_code = ${shortCode}
              LIMIT 1
            `;
            exists = existing.length > 0;
          }
        }

        // Insert into database
        await sql`
          INSERT INTO short_urls (short_code, original_url, clicks, created_at)
          VALUES (${shortCode}, ${url}, 0, CURRENT_TIMESTAMP)
        `;

        const protocol = req.protocol;
        const host = req.get('host');
        const shortUrl = `${protocol}://${host}/s/${shortCode}`;

        res.json({
          success: true,
          shortCode,
          shortUrl,
          originalUrl: url
        });
      } catch (dbError) {
        console.error('Erro ao salvar no banco de dados, usando fallback JSON:', dbError);
        // Fallback to JSON
        const shortUrls = await loadShortUrls();
        
        if (customCode) {
          if (shortUrls[customCode.toLowerCase()]) {
            return res.status(409).json({
              error: 'Custom code already exists'
            });
          }
          shortCode = customCode.toLowerCase();
        } else {
      do {
        shortCode = generateShortCode();
      } while (shortUrls[shortCode]);
    }

    shortUrls[shortCode] = {
      originalUrl: url,
      createdAt: new Date().toISOString(),
      clicks: 0,
      lastClick: null
    };

    await saveShortUrls(shortUrls);

    const protocol = req.protocol;
    const host = req.get('host');
    const shortUrl = `${protocol}://${host}/s/${shortCode}`;

    res.json({
      success: true,
      shortCode,
      shortUrl,
      originalUrl: url
    });
      }
    } else {
      // Use JSON fallback
      const shortUrls = await loadShortUrls();
      
      if (customCode) {
        if (shortUrls[customCode.toLowerCase()]) {
          return res.status(409).json({
            error: 'Custom code already exists'
          });
        }
        shortCode = customCode.toLowerCase();
      } else {
        do {
          shortCode = generateShortCode();
        } while (shortUrls[shortCode]);
      }

      shortUrls[shortCode] = {
        originalUrl: url,
        createdAt: new Date().toISOString(),
        clicks: 0,
        lastClick: null
      };

      await saveShortUrls(shortUrls);

      const protocol = req.protocol;
      const host = req.get('host');
      const shortUrl = `${protocol}://${host}/s/${shortCode}`;

      res.json({
        success: true,
        shortCode,
        shortUrl,
        originalUrl: url
      });
    }
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({
      error: 'Failed to shorten URL',
      message: error.message
    });
  }
});

// Redirect short URL (must be last to catch all other GET requests)
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Don't process reserved routes
    if (code === 'shorten' || code === 'info') {
      return res.status(404).json({
        error: 'Not found'
      });
    }
    
    if (isDatabaseAvailable()) {
      try {
        const result = await sql`
          SELECT * FROM short_urls
          WHERE short_code = ${code.toLowerCase()}
          LIMIT 1
        `;

        if (result.length === 0) {
          return res.status(404).json({
            error: 'Short URL not found'
          });
        }

        const shortUrlData = result[0];

        // Check if original_url is a tracking URL (/utm/track/:utmId?url=...)
        const originalUrl = shortUrlData.original_url;
        console.log(`🔍 Verificando URL original do link encurtado ${code}: ${originalUrl.substring(0, 100)}...`);
        
        const trackingUrlMatch = originalUrl.match(/\/utm\/track\/([^?]+)\?url=(.+)/);
        
        if (trackingUrlMatch) {
          // This is a tracking URL - register the click in utm_clicks before redirecting
          const utmId = trackingUrlMatch[1];
          const finalUrl = decodeURIComponent(trackingUrlMatch[2]);
          const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
          const userAgent = req.headers['user-agent'] || 'unknown';
          const referer = req.headers['referer'] || 'unknown';
          
          console.log(`📊 Detectado link de tracking! UTM ID: ${utmId}, URL final: ${finalUrl.substring(0, 50)}...`);
          
          try {
            // Register click in utm_clicks table
            await sql`
              INSERT INTO utm_clicks (utm_id, url, ip, user_agent, referer, timestamp)
              VALUES (${String(utmId)}, ${finalUrl}, ${ip}, ${userAgent}, ${referer}, CURRENT_TIMESTAMP)
            `;
            console.log(`✅ Clique registrado no UTM ${utmId} via link encurtado ${code}`);
          } catch (trackingError) {
            console.error('❌ Erro ao registrar clique do link encurtado:', trackingError);
            // Continue with redirect even if tracking fails
          }
        } else {
          console.log(`⚠️ Link encurtado ${code} não é uma URL de tracking. URL original: ${originalUrl.substring(0, 100)}...`);
        }

        // Update click count and last click for the short URL
        await sql`
          UPDATE short_urls
          SET clicks = clicks + 1,
              last_click = CURRENT_TIMESTAMP
          WHERE short_code = ${code.toLowerCase()}
        `;

        // If it's a tracking URL, redirect to the final URL directly (skip the tracking redirect)
        if (trackingUrlMatch) {
          const finalUrl = decodeURIComponent(trackingUrlMatch[2]);
          res.redirect(finalUrl);
        } else {
          res.redirect(originalUrl);
        }
      } catch (dbError) {
        console.error('Erro ao acessar banco de dados, usando fallback JSON:', dbError);
        // Fallback to JSON
    const shortUrls = await loadShortUrls();
        const shortUrlData = shortUrls[code.toLowerCase()];

        if (!shortUrlData) {
          return res.status(404).json({
            error: 'Short URL not found'
          });
        }

        // Check if originalUrl is a tracking URL
        const originalUrl = shortUrlData.originalUrl;
        const trackingUrlMatch = originalUrl.match(/\/utm\/track\/([^?]+)\?url=(.+)/);
        
        if (trackingUrlMatch) {
          // This is a tracking URL - register the click in utm_clicks before redirecting
          const utmId = trackingUrlMatch[1];
          const finalUrl = decodeURIComponent(trackingUrlMatch[2]);
          const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
          const userAgent = req.headers['user-agent'] || 'unknown';
          const referer = req.headers['referer'] || 'unknown';
          
          try {
            // Load clicks from JSON fallback
            const clicks = await loadClicks();
            if (!clicks[utmId]) {
              clicks[utmId] = { totalClicks: 0, clicks: [], lastClick: null };
            }
            clicks[utmId].clicks.push({
              timestamp: new Date().toISOString(),
              url: finalUrl,
              ip,
              userAgent,
              referer
            });
            clicks[utmId].totalClicks = clicks[utmId].clicks.length;
            clicks[utmId].lastClick = new Date().toISOString();
            await saveClicks(clicks);
            console.log(`✅ Clique registrado no UTM ${utmId} via link encurtado ${code} (JSON fallback)`);
          } catch (trackingError) {
            console.error('Erro ao registrar clique do link encurtado:', trackingError);
          }
        }

        shortUrlData.clicks = (shortUrlData.clicks || 0) + 1;
        shortUrlData.lastClick = new Date().toISOString();
        await saveShortUrls(shortUrls);

        // If it's a tracking URL, redirect to the final URL directly
        if (trackingUrlMatch) {
          const finalUrl = decodeURIComponent(trackingUrlMatch[2]);
          res.redirect(finalUrl);
        } else {
          res.redirect(originalUrl);
        }
      }
    } else {
      // Use JSON fallback
      const shortUrls = await loadShortUrls();
    const shortUrlData = shortUrls[code.toLowerCase()];

    if (!shortUrlData) {
      return res.status(404).json({
        error: 'Short URL not found'
      });
    }

    shortUrlData.clicks = (shortUrlData.clicks || 0) + 1;
    shortUrlData.lastClick = new Date().toISOString();
    await saveShortUrls(shortUrls);

    res.redirect(shortUrlData.originalUrl);
    }
  } catch (error) {
    console.error('Error redirecting short URL:', error);
    res.status(500).json({
      error: 'Failed to redirect',
      message: error.message
    });
  }
});

export default router;

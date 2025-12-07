import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store shortened URLs
const DATA_DIR = path.join(__dirname, '../data');
const SHORT_URLS_FILE = path.join(DATA_DIR, 'short-urls.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Load short URLs
async function loadShortUrls() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SHORT_URLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Save short URLs
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
  // Generate a 6-character code using random bytes
  return crypto.randomBytes(3).toString('base64url').substring(0, 6).toLowerCase();
}

// Get short URL info (must come before /:code)
router.get('/info/:code', async (req, res) => {
  try {
    const { code } = req.params;
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
  console.log('📝 POST /s/shorten - Request received:', { url: req.body?.url, customCode: req.body?.customCode });
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

    const shortUrls = await loadShortUrls();
    
    let shortCode;
    if (customCode) {
      // Check if custom code is available
      if (shortUrls[customCode]) {
        return res.status(409).json({
          error: 'Custom code already exists'
        });
      }
      shortCode = customCode.toLowerCase();
    } else {
      // Generate unique code
      do {
        shortCode = generateShortCode();
      } while (shortUrls[shortCode]);
    }

    // Save short URL
    shortUrls[shortCode] = {
      originalUrl: url,
      createdAt: new Date().toISOString(),
      clicks: 0,
      lastClick: null
    };

    await saveShortUrls(shortUrls);

    // Get base URL from request
    const protocol = req.protocol;
    const host = req.get('host');
    const shortUrl = `${protocol}://${host}/s/${shortCode}`;

    res.json({
      success: true,
      shortCode,
      shortUrl,
      originalUrl: url
    });

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
    
    const shortUrls = await loadShortUrls();

    const shortUrlData = shortUrls[code.toLowerCase()];

    if (!shortUrlData) {
      return res.status(404).json({
        error: 'Short URL not found'
      });
    }

    // Increment click count
    shortUrlData.clicks = (shortUrlData.clicks || 0) + 1;
    shortUrlData.lastClick = new Date().toISOString();

    await saveShortUrls(shortUrls);

    // Redirect to original URL
    res.redirect(shortUrlData.originalUrl);

  } catch (error) {
    console.error('Error redirecting short URL:', error);
    res.status(500).json({
      error: 'Failed to redirect',
      message: error.message
    });
  }
});

export default router;


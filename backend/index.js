import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.js';
import kpisRoutes from './routes/kpis.js';
import eventsRoutes from './routes/events.js';
import funnelRoutes from './routes/funnel.js';
import trafficRoutes from './routes/traffic.js';
import configRoutes from './routes/config.js';
import { loadGA4Config } from './lib/ga4Config.js';

// Load environment variables
dotenv.config();

// Load GA4 configuration from saved config
loadGA4Config().then(config => {
  if (config.propertyId) {
    console.log(`📊 GA4 Property ID loaded: ${config.propertyId}`);
  }
}).catch(err => {
  console.log('No saved GA4 configuration found, using environment variables');
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/config', configRoutes);
app.use('/health', healthRoutes);
app.use('/kpis', kpisRoutes);
app.use('/events', eventsRoutes);
app.use('/funnel', funnelRoutes);
app.use('/traffic', trafficRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FunnelFlow API',
    version: '1.0.0',
    endpoints: {
      config: '/config',
      health: '/health',
      kpis: '/kpis',
      events: '/events',
      funnel: '/funnel',
      traffic: '/traffic'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FunnelFlow API running on port ${PORT}`);
  console.log(`📊 GA4 Property ID: ${process.env.GA4_PROPERTY_ID || 'Not configured'}`);
});


/**
 * Firmware API Main Router
 * 
 * Routes to specialized firmware modules
 * 
 * @module firmware
 */

import express from 'express';
import firmwareLibraryRouter from './firmware/library.js';

const router = express.Router();

/**
 * GET /api/v1/firmware
 * Get firmware API information and available features
 */
router.get('/', (req, res) => {
  res.sendEnvelope({
    available: true,
    features: {
      library: {
        available: true,
        endpoint: '/api/v1/firmware/library',
        description: 'Firmware database and management'
      },
      download: {
        available: process.env.ALLOW_FIRMWARE_DOWNLOAD === '1',
        endpoint: '/api/v1/firmware/library/download',
        description: 'Firmware download (requires ALLOW_FIRMWARE_DOWNLOAD=1)',
        note: process.env.ALLOW_FIRMWARE_DOWNLOAD !== '1' ? 'Firmware downloads are disabled. Set ALLOW_FIRMWARE_DOWNLOAD=1 to enable.' : null
      }
    },
    documentation: {
      library: 'GET /api/v1/firmware/library/brands - List available brands',
      search: 'GET /api/v1/firmware/library/search - Search firmware database',
      add: 'POST /api/v1/firmware/library/add - Add firmware to database',
      download: 'POST /api/v1/firmware/library/download - Download firmware',
      stats: 'GET /api/v1/firmware/library/stats - Get database statistics'
    }
  });
});

// Mount firmware library router
router.use('/library', firmwareLibraryRouter);

export default router;


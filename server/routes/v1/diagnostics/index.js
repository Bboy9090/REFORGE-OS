/**
 * Diagnostics API Main Router
 * 
 * Routes to specialized diagnostic modules
 * 
 * @module diagnostics
 */

import express from 'express';
import hardwareRouter from './hardware.js';
import batteryRouter from './battery.js';

const router = express.Router();

/**
 * GET /api/v1/diagnostics
 * Get available diagnostic features
 */
router.get('/', (req, res) => {
  res.sendEnvelope({
    available: true,
    features: {
      hardware: {
        available: true,
        endpoint: '/api/v1/diagnostics/hardware/:serial',
        description: 'Hardware diagnostics (screen, sensors, camera, audio)'
      },
      battery: {
        available: true,
        endpoint: '/api/v1/diagnostics/battery/:serial',
        description: 'Battery health diagnostics and monitoring'
      },
      network: {
        available: false,
        endpoint: '/api/v1/diagnostics/network/:serial',
        description: 'Network diagnostics (WiFi, Bluetooth, cellular) - Coming soon',
        status: 'not_implemented'
      },
      performance: {
        available: true,
        endpoint: '/api/v1/monitor/performance/:serial',
        description: 'Performance diagnostics (CPU, memory, battery)',
        note: 'See /api/v1/monitor/performance endpoint'
      }
    },
    documentation: {
      hardware: 'GET /api/v1/diagnostics/hardware/:serial - Run comprehensive hardware tests',
      battery: 'GET /api/v1/diagnostics/battery/:serial - Get battery health information',
      batteryMonitor: 'POST /api/v1/diagnostics/battery/:serial/monitor - Monitor battery during charge/discharge'
    }
  });
});

// Mount specialized diagnostic routers
router.use('/hardware', hardwareRouter);
router.use('/battery', batteryRouter);

export default router;


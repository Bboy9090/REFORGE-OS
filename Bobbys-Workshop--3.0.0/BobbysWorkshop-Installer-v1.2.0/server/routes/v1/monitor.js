/**
 * Monitoring API endpoints (v1)
 * 
 * Main monitoring router - routes to specialized monitoring modules
 * 
 * @module monitor
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/v1/monitor
 * Get monitoring status and available monitoring features
 */
router.get('/', (req, res) => {
  res.sendEnvelope({
    available: true,
    features: {
      performance: {
        available: true,
        endpoint: '/api/v1/monitor/performance/:serial',
        description: 'Real-time CPU, memory, and battery metrics'
      },
      live: {
        available: false,
        endpoint: '/api/v1/monitor/live',
        description: 'Live monitoring dashboard (coming soon)',
        status: 'not_implemented'
      }
    },
    documentation: {
      performance: 'GET /api/v1/monitor/performance/:serial - Get current performance metrics for a device',
      history: 'GET /api/v1/monitor/performance/:serial/history - Get performance history (coming soon)'
    }
  });
});

/**
 * GET /api/v1/monitor/live
 * Get live monitoring metrics (real-time dashboard data)
 * 
 * Note: For individual device metrics, use /api/v1/monitor/performance/:serial
 */
router.get('/live', (req, res) => {
  return res.sendNotImplemented(
    'Live monitoring dashboard is not yet implemented. This endpoint will provide aggregated real-time metrics across all connected devices.',
    {
      currentAlternative: 'GET /api/v1/monitor/performance/:serial - Get metrics for a specific device',
      plannedFeatures: [
        'Aggregated metrics across all devices',
        'Real-time CPU/memory usage charts',
        'Disk I/O metrics',
        'USB transfer speeds',
        'Device temperature monitoring',
        'Battery level tracking',
        'WebSocket-based real-time updates'
      ],
      note: 'Individual device performance metrics are available via /api/v1/monitor/performance/:serial'
    }
  );
});

/**
 * POST /api/v1/monitor/start
 * Start continuous monitoring session for a device
 * 
 * Note: For real-time metrics, use WebSocket connections or poll /monitor/performance/:serial
 */
router.post('/start', (req, res) => {
  return res.sendNotImplemented(
    'Continuous monitoring sessions are not yet implemented. For now, use GET /api/v1/monitor/performance/:serial to get current metrics.',
    {
      currentAlternative: 'GET /api/v1/monitor/performance/:serial',
      plannedFeatures: [
        'Background monitoring sessions',
        'Configurable sampling intervals',
        'Automatic alerting on thresholds',
        'Historical data collection',
        'Session management'
      ],
      note: 'Real-time performance metrics are available via /api/v1/monitor/performance/:serial'
    }
  );
});

/**
 * POST /api/v1/monitor/stop
 * Stop an active monitoring session
 */
router.post('/stop', (req, res) => {
  return res.sendNotImplemented(
    'Monitoring session management is not yet implemented',
    {
      note: 'Monitoring sessions are not currently supported. Use GET /api/v1/monitor/performance/:serial for on-demand metrics.'
    }
  );
});

export default router;


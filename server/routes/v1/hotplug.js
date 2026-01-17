/**
 * Hotplug Events API endpoints (v1)
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/v1/hotplug/events
 * Get hotplug device events (currently placeholder)
 */
router.get('/events', (req, res) => {
  // TODO: Implement actual hotplug event tracking
  res.sendEnvelope({
    events: [],
    message: 'Hotplug event tracking is not yet implemented. Use WebSocket /ws/device-events for real-time device events.',
    timestamp: new Date().toISOString()
  });
});

export default router;


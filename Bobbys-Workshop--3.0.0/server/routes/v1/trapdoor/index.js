/**
 * Trapdoor API - Bobby's Secret Rooms
 * 
 * Ultra-secure, authenticated access to advanced device manipulation capabilities.
 * All operations require Trapdoor passcode authentication and are audit-logged.
 * 
 * @module trapdoor
 */

import express from 'express';
import unlockRouter from './unlock.js';
import workflowsRouter from './workflows.js';
import logsRouter from './logs.js';
import bypassRouter from './bypass.js';
import pandoraRouter from './pandora.js';

const router = express.Router({ mergeParams: true });

/**
 * GET /api/v1/trapdoor
 * Get information about available Secret Room operations
 */
router.get('/', (req, res) => {
  res.sendEnvelope({
    name: "Bobby's Secret Rooms",
    description: 'Ultra-secure, authenticated access to advanced device manipulation capabilities',
    authentication: {
      required: true,
      methods: [
        'X-Secret-Room-Passcode header',
        'X-API-Key header'
      ],
      note: 'All operations require Trapdoor passcode authentication'
    },
    secretRooms: {
      unlock: {
        name: 'The Unlock Chamber',
        description: 'Complete device unlock automation',
        endpoint: '/api/v1/trapdoor/unlock',
        features: [
          'FRP bypass (owner devices only)',
          'Bootloader unlock automation',
          'OEM unlock enable',
          'Security patch bypass (testing)'
        ]
      },
      flash: {
        name: 'The Flash Forge',
        description: 'Multi-brand flash operations',
        endpoint: '/api/v1/trapdoor/flash',
        features: [
          'Samsung Odin automation',
          'MediaTek SP Flash',
          'Qualcomm EDL',
          'Custom recovery installation',
          'Partition-level operations'
        ]
      },
      ios: {
        name: 'The Jailbreak Sanctum',
        description: 'iOS device manipulation',
        endpoint: '/api/v1/trapdoor/ios',
        features: [
          'DFU mode automation',
          'Jailbreak integration',
          'SHSH blob management',
          'FutureRestore automation',
          'iTunes backup manipulation'
        ]
      },
      root: {
        name: 'The Root Vault',
        description: 'Root installation and management',
        endpoint: '/api/v1/trapdoor/root',
        features: [
          'Magisk installation',
          'SuperSU installation',
          'Xposed framework',
          'Root verification',
          'System app management'
        ]
      },
      bypass: {
        name: 'The Bypass Laboratory',
        description: 'Security bypass automation',
        endpoint: '/api/v1/trapdoor/bypass',
        features: [
          'Screen lock bypass',
          'Biometric bypass (research)',
          'Certificate pinning bypass',
          'MDM removal (authorized)',
          'Encryption bypass (owner devices)'
        ]
      },
      workflows: {
        name: 'The Workflow Engine',
        description: 'Automated workflow execution',
        endpoint: '/api/v1/trapdoor/workflows',
        features: [
          'Custom workflow execution',
          'Conditional logic',
          'Parallel execution',
          'Error recovery',
          'Workflow templates'
        ]
      },
      logs: {
        name: 'The Shadow Archive',
        description: 'Complete operation history',
        endpoint: '/api/v1/trapdoor/logs',
        features: [
          'Shadow logs (encrypted)',
          'Operation history',
          'Correlation tracking',
          'Analytics dashboard',
          'Export capabilities'
        ]
      }
    },
    security: {
      authentication: 'Required for all operations',
      rateLimiting: 'Enabled',
      auditLogging: 'Shadow logs for all operations',
      policyEnforcement: 'Active',
      confirmationGates: 'Required for destructive operations'
    },
    legal: {
      note: 'All operations are for owner devices only. Use responsibly and in compliance with applicable laws.',
      disclaimer: 'Bobby\'s Workshop is a tool for device management. Users are responsible for ensuring all operations comply with local laws and regulations.'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/trapdoor/status
 * Get Secret Rooms status and access information
 */
router.get('/status', (req, res) => {
  res.sendEnvelope({
    accessible: true,
    authenticated: !!req.headers['x-secret-room-passcode'] || !!req.headers['x-api-key'],
    secretRooms: {
      unlock: { available: true, requiresAuth: true },
      flash: { available: true, requiresAuth: true },
      ios: { available: true, requiresAuth: true },
      root: { available: true, requiresAuth: true },
      bypass: { available: true, requiresAuth: true },
      workflows: { available: true, requiresAuth: true },
      logs: { available: true, requiresAuth: true }
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Secret Room routers
router.use('/unlock', unlockRouter);
router.use('/workflows', workflowsRouter);
router.use('/logs', logsRouter);
router.use('/bypass', bypassRouter);
router.use('/pandora', pandoraRouter);

export default router;


/**
 * Operations API
 * 
 * Endpoints for executing operations and simulating/dry-run operations.
 * All responses use Operation Envelopes for consistency.
 * 
 * Supports:
 * - Real execution with audit logging
 * - Dry-run simulation
 * - Policy evaluation and enforcement
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import os from 'os';
import {
  createExecuteEnvelope,
  createSimulateEnvelope,
  createPolicyDenyEnvelope,
  createAuditLogFromEnvelope
} from '../core/lib/operation-envelope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const IS_WINDOWS = os.platform() === 'win32';

// Load manifests
const RUNTIME_DIR = path.join(__dirname, '..', 'runtime', 'manifests');
const TOOLS_MANIFEST_PATH = path.join(RUNTIME_DIR, 'tools.json');
const POLICIES_MANIFEST_PATH = path.join(RUNTIME_DIR, 'policies.json');

/**
 * Load manifest file
 */
function loadManifest(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading manifest ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get capability by ID from tools manifest
 */
function getCapability(capabilityId) {
  const manifest = loadManifest(TOOLS_MANIFEST_PATH);
  if (!manifest || !manifest.capabilities) {
    return null;
  }
  return manifest.capabilities.find(c => c.id === capabilityId);
}

/**
 * Check if required tools are available
 */
function checkToolsAvailable(requiredTools) {
  const missing = [];
  for (const tool of requiredTools) {
    try {
      if (IS_WINDOWS) {
        execSync(`where ${tool}`, { stdio: 'ignore', timeout: 2000 });
      } else {
        execSync(`command -v ${tool}`, { stdio: 'ignore', timeout: 2000 });
      }
    } catch {
      missing.push(tool);
    }
  }
  return {
    available: missing.length === 0,
    missing
  };
}

/**
 * Evaluate policy for an operation
 * 
 * @param {string} capabilityId - Capability/operation ID
 * @param {string} role - User role (guest, tech, admin, owner)
 * @param {Object} context - Additional context
 * @returns {Object} Policy evaluation result
 */
function evaluatePolicy(capabilityId, role = 'guest', context = {}) {
  const policiesManifest = loadManifest(POLICIES_MANIFEST_PATH);
  
  if (!policiesManifest || !policiesManifest.rules) {
    // No policies - use default deny
    return {
      allowed: false,
      reason: 'No policy rules configured',
      matchedRule: null,
      defaultPolicy: true
    };
  }

  const capability = getCapability(capabilityId);
  if (!capability) {
    return {
      allowed: false,
      reason: `Unknown capability: ${capabilityId}`,
      matchedRule: null
    };
  }

  // Check each policy rule
  for (const rule of policiesManifest.rules) {
    const conditions = rule.conditions || {};

    // Check if this rule applies to this operation
    if (conditions.action_types && !conditions.action_types.includes(capabilityId)) {
      continue;
    }

    // Check role requirement
    if (conditions.roles && !conditions.roles.includes(role)) {
      continue;
    }

    // Check risk level
    if (conditions.risk_levels && !conditions.risk_levels.includes(capability.risk_level)) {
      continue;
    }

    // Rule matches
    if (rule.action === 'allow') {
      return {
        allowed: true,
        matchedRule: rule.id,
        requirements: rule.requirements || []
      };
    } else if (rule.action === 'allow_with_requirements') {
      return {
        allowed: true,
        matchedRule: rule.id,
        requirements: rule.requirements || []
      };
    } else if (rule.action === 'deny') {
      return {
        allowed: false,
        reason: rule.deny_reason || 'Policy denied this operation',
        matchedRule: rule.id
      };
    }
  }

  // No rule matched - use default policy
  const defaultPolicy = policiesManifest.default_policy || { action: 'deny' };
  return {
    allowed: defaultPolicy.action === 'allow',
    reason: defaultPolicy.deny_reason || 'No matching policy rule found',
    matchedRule: null,
    defaultPolicy: true
  };
}

/**
 * Execute an operation (placeholder - to be implemented per capability)
 * 
 * @param {string} capabilityId - Capability to execute
 * @param {Object} params - Operation parameters
 * @returns {Promise<Object>} Execution result
 */
async function executeOperation(capabilityId, params) {
  const capability = getCapability(capabilityId);
  
  if (!capability) {
    throw new Error(`Unknown capability: ${capabilityId}`);
  }

  // Check required tools
  const toolsCheck = checkToolsAvailable(capability.requires_tools || []);
  if (!toolsCheck.available) {
    throw new Error(`Required tools not available: ${toolsCheck.missing.join(', ')}`);
  }

  // Execute based on capability type
  // Note: This is a framework - actual implementations should be added per capability
  switch (capabilityId) {
    case 'detect_usb_devices':
    case 'detect_android_adb':
    case 'detect_android_fastboot':
    case 'detect_ios_devices':
      // Detection operations - these should use the inspect endpoint instead
      return {
        success: true,
        message: 'Detection operations should use /api/tools/inspect endpoint',
        redirectTo: '/api/tools/inspect'
      };

    case 'device_info':
      // Get device info - placeholder
      return {
        success: false,
        message: 'device_info operation not yet implemented',
        status: 'not_implemented'
      };

    case 'reboot_device':
      // Reboot operation - placeholder
      return {
        success: false,
        message: 'reboot_device operation not yet implemented',
        status: 'not_implemented'
      };

    case 'flash_partition':
    case 'erase_partition':
    case 'unlock_bootloader':
      // Destructive operations - not implemented for safety
      return {
        success: false,
        message: `${capabilityId} is a destructive operation and requires explicit implementation`,
        status: 'not_implemented',
        riskLevel: 'destructive'
      };

    default:
      throw new Error(`Operation ${capabilityId} not implemented`);
  }
}

/**
 * POST /api/operations/execute
 * 
 * Execute an operation with policy enforcement and audit logging.
 * 
 * Request body:
 * {
 *   "operation": "detect_android_adb",
 *   "params": { ... },
 *   "role": "tech",
 *   "correlationId": "optional-correlation-id"
 * }
 */
router.post('/execute', async (req, res) => {
  try {
    const { operation, params = {}, role = 'guest', correlationId } = req.body;

    if (!operation) {
      return res.status(400).json({
        error: 'Missing required field: operation'
      });
    }

    // Get capability
    const capability = getCapability(operation);
    if (!capability) {
      const envelope = createExecuteEnvelope({
        operation,
        success: false,
        result: null,
        error: new Error(`Unknown operation: ${operation}`),
        metadata: {
          requestedOperation: operation
        }
      });
      return res.status(404).json(envelope);
    }

    // Evaluate policy
    const policyResult = evaluatePolicy(operation, role, params);
    
    if (!policyResult.allowed) {
      // Policy denied
      const envelope = createPolicyDenyEnvelope({
        operation,
        reason: policyResult.reason,
        policy: {
          matchedRule: policyResult.matchedRule,
          defaultPolicy: policyResult.defaultPolicy
        },
        metadata: {
          requestedRole: role,
          capability: capability.name
        }
      });

      // Log denial
      const auditLog = createAuditLogFromEnvelope(envelope, {
        role,
        params,
        policyDenied: true
      });
      console.log('[AUDIT]', JSON.stringify(auditLog));

      return res.status(403).json(envelope);
    }

    // Execute operation
    try {
      const result = await executeOperation(operation, params);

      const envelope = createExecuteEnvelope({
        operation,
        success: result.success,
        result,
        metadata: {
          role,
          capability: capability.name,
          riskLevel: capability.risk_level,
          policyRule: policyResult.matchedRule,
          requirements: policyResult.requirements
        }
      });

      // Create audit log
      const auditLog = createAuditLogFromEnvelope(envelope, {
        role,
        params,
        executed: true
      });
      console.log('[AUDIT]', JSON.stringify(auditLog));

      res.json(envelope);
    } catch (execError) {
      // Execution failed
      const envelope = createExecuteEnvelope({
        operation,
        success: false,
        result: null,
        error: execError,
        metadata: {
          role,
          capability: capability.name,
          riskLevel: capability.risk_level
        }
      });

      // Log failure
      const auditLog = createAuditLogFromEnvelope(envelope, {
        role,
        params,
        executionFailed: true,
        error: execError.message
      });
      console.log('[AUDIT]', JSON.stringify(auditLog));

      res.status(500).json(envelope);
    }
  } catch (error) {
    console.error('Operation execution error:', error);

    const envelope = createExecuteEnvelope({
      operation: req.body?.operation || 'unknown',
      success: false,
      result: null,
      error: error,
      metadata: {
        errorType: error.constructor.name
      }
    });

    res.status(500).json(envelope);
  }
});

/**
 * POST /api/operations/simulate
 * 
 * Simulate/dry-run an operation without executing it.
 * Performs policy evaluation and requirement checking.
 * 
 * Request body:
 * {
 *   "operation": "flash_partition",
 *   "params": { ... },
 *   "role": "admin"
 * }
 */
router.post('/simulate', async (req, res) => {
  try {
    const { operation, params = {}, role = 'guest' } = req.body;

    if (!operation) {
      return res.status(400).json({
        error: 'Missing required field: operation'
      });
    }

    // Get capability
    const capability = getCapability(operation);
    if (!capability) {
      const envelope = createSimulateEnvelope({
        operation,
        wouldSucceed: false,
        simulation: {
          error: `Unknown operation: ${operation}`,
          checks: []
        }
      });
      return res.status(404).json(envelope);
    }

    // Perform simulation checks
    const checks = [];

    // 1. Policy check
    const policyResult = evaluatePolicy(operation, role, params);
    checks.push({
      name: 'policy_evaluation',
      passed: policyResult.allowed,
      details: policyResult
    });

    // 2. Tool availability check
    const toolsCheck = checkToolsAvailable(capability.requires_tools || []);
    checks.push({
      name: 'tools_availability',
      passed: toolsCheck.available,
      details: toolsCheck
    });

    // 3. Platform check
    const platformSupported = capability.platforms.includes('all') || 
                              capability.platforms.includes(os.platform());
    checks.push({
      name: 'platform_support',
      passed: platformSupported,
      details: {
        currentPlatform: os.platform(),
        supportedPlatforms: capability.platforms
      }
    });

    // Determine if operation would succeed
    const wouldSucceed = checks.every(check => check.passed);

    const envelope = createSimulateEnvelope({
      operation,
      wouldSucceed,
      simulation: {
        checks,
        capability: {
          name: capability.name,
          category: capability.category,
          riskLevel: capability.risk_level
        },
        requirements: policyResult.requirements || [],
        estimatedDuration: null, // Could be calculated based on operation
        warnings: checks.filter(c => !c.passed).map(c => c.name)
      },
      metadata: {
        role,
        simulationType: 'dry_run'
      }
    });

    // Log simulation
    const auditLog = createAuditLogFromEnvelope(envelope, {
      role,
      params,
      simulated: true
    });
    console.log('[AUDIT]', JSON.stringify(auditLog));

    res.json(envelope);
  } catch (error) {
    console.error('Operation simulation error:', error);

    const envelope = createSimulateEnvelope({
      operation: req.body?.operation || 'unknown',
      wouldSucceed: false,
      simulation: {
        error: error.message,
        checks: []
      }
    });

    res.status(500).json(envelope);
  }
});

export default router;

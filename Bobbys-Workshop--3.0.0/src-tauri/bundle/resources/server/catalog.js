/**
 * Tool Catalog API
 * 
 * Provides the tool catalog manifest with operation capabilities,
 * tool requirements, and policy rules.
 * 
 * All responses use Operation Envelopes for consistency.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInspectEnvelope, createExecuteEnvelope } from '../core/lib/operation-envelope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Paths to manifest files
const RUNTIME_DIR = path.join(__dirname, '..', 'runtime', 'manifests');
const TOOLS_MANIFEST = path.join(RUNTIME_DIR, 'tools.json');
const POLICIES_MANIFEST = path.join(RUNTIME_DIR, 'policies.json');
const WORKFLOWS_MANIFEST = path.join(RUNTIME_DIR, 'workflows.json');

/**
 * Load and parse a manifest file
 * 
 * @param {string} filePath - Path to manifest file
 * @returns {Object|null} Parsed manifest or null if error
 */
function loadManifest(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Manifest file not found: ${filePath}`);
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
 * Validate tool manifest structure
 * 
 * @param {Object} manifest - Tool manifest
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
function validateToolManifest(manifest) {
  const errors = [];

  if (!manifest) {
    return { valid: false, errors: ['Manifest is null or undefined'] };
  }

  if (!manifest.version) {
    errors.push('Missing version field');
  }

  if (!Array.isArray(manifest.capabilities)) {
    errors.push('capabilities must be an array');
  } else {
    manifest.capabilities.forEach((cap, idx) => {
      if (!cap.id) errors.push(`capabilities[${idx}]: missing id`);
      if (!cap.name) errors.push(`capabilities[${idx}]: missing name`);
      if (!cap.category) errors.push(`capabilities[${idx}]: missing category`);
      if (!cap.risk_level) errors.push(`capabilities[${idx}]: missing risk_level`);
    });
  }

  if (!Array.isArray(manifest.tools)) {
    errors.push('tools must be an array');
  } else {
    manifest.tools.forEach((tool, idx) => {
      if (!tool.id) errors.push(`tools[${idx}]: missing id`);
      if (!tool.name) errors.push(`tools[${idx}]: missing name`);
      if (!tool.command) errors.push(`tools[${idx}]: missing command`);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * GET /api/catalog
 * 
 * Get the complete tool catalog including capabilities, tools, and policies.
 * Returns an inspect envelope with catalog data.
 */
router.get('/', (req, res) => {
  try {
    // Load all manifests
    const toolsManifest = loadManifest(TOOLS_MANIFEST);
    const policiesManifest = loadManifest(POLICIES_MANIFEST);
    const workflowsManifest = loadManifest(WORKFLOWS_MANIFEST);

    // Validate tools manifest (critical)
    if (!toolsManifest) {
      const envelope = createInspectEnvelope({
        operation: 'catalog_load',
        available: false,
        details: {
          error: 'Tools manifest not found or could not be loaded',
          path: TOOLS_MANIFEST
        },
        metadata: {
          catalogVersion: null,
          manifestsLoaded: {
            tools: false,
            policies: !!policiesManifest,
            workflows: !!workflowsManifest
          }
        }
      });
      return res.status(500).json(envelope);
    }

    const validation = validateToolManifest(toolsManifest);
    if (!validation.valid) {
      const envelope = createInspectEnvelope({
        operation: 'catalog_load',
        available: false,
        details: {
          error: 'Tools manifest validation failed',
          validationErrors: validation.errors
        },
        metadata: {
          catalogVersion: toolsManifest.version,
          manifestsLoaded: {
            tools: true,
            policies: !!policiesManifest,
            workflows: !!workflowsManifest
          }
        }
      });
      return res.status(500).json(envelope);
    }

    // Build catalog response
    const catalog = {
      version: toolsManifest.version,
      capabilities: toolsManifest.capabilities || [],
      tools: toolsManifest.tools || [],
      policies: policiesManifest ? {
        version: policiesManifest.version,
        rules: policiesManifest.rules || [],
        defaultPolicy: policiesManifest.default_policy
      } : null,
      workflows: workflowsManifest ? {
        version: workflowsManifest.version,
        available: true
      } : null
    };

    // Create success envelope
    const envelope = createInspectEnvelope({
      operation: 'catalog_load',
      available: true,
      details: catalog,
      metadata: {
        catalogVersion: toolsManifest.version,
        manifestsLoaded: {
          tools: true,
          policies: !!policiesManifest,
          workflows: !!workflowsManifest
        },
        capabilityCount: catalog.capabilities.length,
        toolCount: catalog.tools.length,
        policyRuleCount: catalog.policies ? catalog.policies.rules.length : 0
      }
    });

    res.json(envelope);
  } catch (error) {
    console.error('Catalog endpoint error:', error);
    
    const envelope = createInspectEnvelope({
      operation: 'catalog_load',
      available: false,
      details: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      metadata: {
        catalogVersion: null,
        errorType: error.constructor.name
      }
    });
    
    res.status(500).json(envelope);
  }
});

/**
 * GET /api/catalog/capabilities
 * 
 * Get just the capabilities list.
 */
router.get('/capabilities', (req, res) => {
  try {
    const toolsManifest = loadManifest(TOOLS_MANIFEST);

    if (!toolsManifest || !toolsManifest.capabilities) {
      const envelope = createInspectEnvelope({
        operation: 'capabilities_list',
        available: false,
        details: {
          error: 'Capabilities not available',
          capabilities: []
        }
      });
      return res.status(500).json(envelope);
    }

    const envelope = createInspectEnvelope({
      operation: 'capabilities_list',
      available: true,
      details: {
        capabilities: toolsManifest.capabilities
      },
      metadata: {
        count: toolsManifest.capabilities.length,
        version: toolsManifest.version
      }
    });

    res.json(envelope);
  } catch (error) {
    const envelope = createInspectEnvelope({
      operation: 'capabilities_list',
      available: false,
      details: {
        error: error.message,
        capabilities: []
      }
    });
    res.status(500).json(envelope);
  }
});

/**
 * GET /api/catalog/tools
 * 
 * Get just the tools list.
 */
router.get('/tools', (req, res) => {
  try {
    const toolsManifest = loadManifest(TOOLS_MANIFEST);

    if (!toolsManifest || !toolsManifest.tools) {
      const envelope = createInspectEnvelope({
        operation: 'tools_list',
        available: false,
        details: {
          error: 'Tools not available',
          tools: []
        }
      });
      return res.status(500).json(envelope);
    }

    const envelope = createInspectEnvelope({
      operation: 'tools_list',
      available: true,
      details: {
        tools: toolsManifest.tools
      },
      metadata: {
        count: toolsManifest.tools.length,
        version: toolsManifest.version
      }
    });

    res.json(envelope);
  } catch (error) {
    const envelope = createInspectEnvelope({
      operation: 'tools_list',
      available: false,
      details: {
        error: error.message,
        tools: []
      }
    });
    res.status(500).json(envelope);
  }
});

/**
 * GET /api/catalog/policies
 * 
 * Get just the policies.
 */
router.get('/policies', (req, res) => {
  try {
    const policiesManifest = loadManifest(POLICIES_MANIFEST);

    if (!policiesManifest) {
      const envelope = createInspectEnvelope({
        operation: 'policies_list',
        available: false,
        details: {
          error: 'Policies not available',
          policies: null
        }
      });
      return res.status(500).json(envelope);
    }

    const envelope = createInspectEnvelope({
      operation: 'policies_list',
      available: true,
      details: {
        policies: {
          version: policiesManifest.version,
          rules: policiesManifest.rules || [],
          defaultPolicy: policiesManifest.default_policy
        }
      },
      metadata: {
        ruleCount: policiesManifest.rules ? policiesManifest.rules.length : 0,
        version: policiesManifest.version
      }
    });

    res.json(envelope);
  } catch (error) {
    const envelope = createInspectEnvelope({
      operation: 'policies_list',
      available: false,
      details: {
        error: error.message,
        policies: null
      }
    });
    res.status(500).json(envelope);
  }
});

export default router;

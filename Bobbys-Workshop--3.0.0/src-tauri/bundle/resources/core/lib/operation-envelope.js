/**
 * Operation Envelope System
 * 
 * Standardized response format for all operations:
 * - inspect: Tool/device detection results
 * - execute: Operation execution results
 * - simulate: Dry-run/policy evaluation results
 * - policy-deny: Policy rejection results
 * 
 * Core Design:
 * - One consistent shape across all operation types
 * - Built-in audit trail support
 * - Explicit error handling
 * - No placeholders or fake success
 */

/**
 * Envelope types
 */
export const EnvelopeType = {
  INSPECT: 'inspect',
  EXECUTE: 'execute',
  SIMULATE: 'simulate',
  POLICY_DENY: 'policy-deny'
};

/**
 * Operation result statuses
 */
export const OperationStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  DENIED: 'denied',
  PARTIAL: 'partial'
};

/**
 * Create a standardized operation envelope
 * 
 * @param {Object} params
 * @param {string} params.type - Envelope type (inspect|execute|simulate|policy-deny)
 * @param {string} params.operation - Operation identifier (e.g., 'detect_android_adb')
 * @param {string} params.status - Operation status
 * @param {Object} params.data - Operation-specific data
 * @param {Error|string} [params.error] - Error if operation failed
 * @param {Object} [params.metadata] - Additional metadata
 * @param {string} [params.correlationId] - Correlation ID for tracking
 * @returns {Object} Standardized envelope
 */
export function createEnvelope({
  type,
  operation,
  status,
  data = null,
  error = null,
  metadata = {},
  correlationId = null
}) {
  // Validate required fields
  if (!type || !Object.values(EnvelopeType).includes(type)) {
    throw new Error(`Invalid envelope type: ${type}. Must be one of: ${Object.values(EnvelopeType).join(', ')}`);
  }

  if (!operation || typeof operation !== 'string') {
    throw new Error('Operation identifier is required and must be a string');
  }

  if (!status || !Object.values(OperationStatus).includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${Object.values(OperationStatus).join(', ')}`);
  }

  const envelope = {
    envelope: {
      type,
      version: '1.0',
      timestamp: new Date().toISOString(),
      correlationId: correlationId || generateCorrelationId()
    },
    operation: {
      id: operation,
      status
    },
    data,
    metadata: {
      ...metadata,
      processedAt: new Date().toISOString()
    }
  };

  // Add error information if present
  if (error) {
    envelope.operation.error = {
      message: error.message || String(error),
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || null
    };
  }

  return envelope;
}

/**
 * Create an inspect envelope (for tool/device detection)
 * 
 * @param {Object} params
 * @param {string} params.operation - Operation identifier
 * @param {boolean} params.available - Whether tool/device is available
 * @param {Object} params.details - Detection details
 * @param {Object} [params.metadata] - Additional metadata
 * @returns {Object} Inspect envelope
 */
export function createInspectEnvelope({ operation, available, details, metadata = {} }) {
  return createEnvelope({
    type: EnvelopeType.INSPECT,
    operation,
    status: available ? OperationStatus.SUCCESS : OperationStatus.FAILURE,
    data: {
      available,
      details
    },
    metadata: {
      ...metadata,
      inspectionType: 'availability_check'
    }
  });
}

/**
 * Create an execute envelope (for operation execution results)
 * 
 * @param {Object} params
 * @param {string} params.operation - Operation identifier
 * @param {boolean} params.success - Whether operation succeeded
 * @param {Object} params.result - Execution result data
 * @param {Error} [params.error] - Error if operation failed
 * @param {Object} [params.metadata] - Additional metadata
 * @returns {Object} Execute envelope
 */
export function createExecuteEnvelope({ operation, success, result, error = null, metadata = {} }) {
  return createEnvelope({
    type: EnvelopeType.EXECUTE,
    operation,
    status: success ? OperationStatus.SUCCESS : OperationStatus.FAILURE,
    data: {
      success,
      result
    },
    error,
    metadata: {
      ...metadata,
      executionType: 'real_operation'
    }
  });
}

/**
 * Create a simulate envelope (for dry-run/policy evaluation)
 * 
 * @param {Object} params
 * @param {string} params.operation - Operation identifier
 * @param {boolean} params.wouldSucceed - Whether operation would succeed if executed
 * @param {Object} params.simulation - Simulation results
 * @param {Object} [params.metadata] - Additional metadata
 * @returns {Object} Simulate envelope
 */
export function createSimulateEnvelope({ operation, wouldSucceed, simulation, metadata = {} }) {
  return createEnvelope({
    type: EnvelopeType.SIMULATE,
    operation,
    status: wouldSucceed ? OperationStatus.SUCCESS : OperationStatus.FAILURE,
    data: {
      wouldSucceed,
      simulation,
      dryRun: true
    },
    metadata: {
      ...metadata,
      executionType: 'simulation'
    }
  });
}

/**
 * Create a policy-deny envelope (for policy rejections)
 * 
 * @param {Object} params
 * @param {string} params.operation - Operation identifier
 * @param {string} params.reason - Denial reason
 * @param {Object} params.policy - Policy details
 * @param {Object} [params.metadata] - Additional metadata
 * @returns {Object} Policy-deny envelope
 */
export function createPolicyDenyEnvelope({ operation, reason, policy, metadata = {} }) {
  return createEnvelope({
    type: EnvelopeType.POLICY_DENY,
    operation,
    status: OperationStatus.DENIED,
    data: {
      denied: true,
      reason,
      policy
    },
    metadata: {
      ...metadata,
      denialType: 'policy_enforcement'
    }
  });
}

/**
 * Validate an envelope structure
 * 
 * @param {Object} envelope - Envelope to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateEnvelope(envelope) {
  const errors = [];

  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, errors: ['Envelope must be an object'] };
  }

  // Check required top-level fields
  if (!envelope.envelope) {
    errors.push('Missing required field: envelope');
  } else {
    if (!envelope.envelope.type || !Object.values(EnvelopeType).includes(envelope.envelope.type)) {
      errors.push('Invalid envelope.type');
    }
    if (!envelope.envelope.version) {
      errors.push('Missing envelope.version');
    }
    if (!envelope.envelope.timestamp) {
      errors.push('Missing envelope.timestamp');
    }
    if (!envelope.envelope.correlationId) {
      errors.push('Missing envelope.correlationId');
    }
  }

  if (!envelope.operation) {
    errors.push('Missing required field: operation');
  } else {
    if (!envelope.operation.id) {
      errors.push('Missing operation.id');
    }
    if (!envelope.operation.status || !Object.values(OperationStatus).includes(envelope.operation.status)) {
      errors.push('Invalid operation.status');
    }
  }

  if (envelope.data === undefined) {
    errors.push('Missing required field: data');
  }

  if (!envelope.metadata) {
    errors.push('Missing required field: metadata');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate a correlation ID for tracking
 * 
 * @returns {string} Correlation ID
 */
function generateCorrelationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Create audit log entry from envelope
 * 
 * @param {Object} envelope - Operation envelope
 * @param {Object} [additionalContext] - Additional audit context
 * @returns {Object} Audit log entry
 */
export function createAuditLogFromEnvelope(envelope, additionalContext = {}) {
  const validation = validateEnvelope(envelope);
  if (!validation.valid) {
    throw new Error(`Cannot create audit log from invalid envelope: ${validation.errors.join(', ')}`);
  }

  return {
    auditId: `audit-${envelope.envelope.correlationId}`,
    timestamp: envelope.envelope.timestamp,
    envelopeType: envelope.envelope.type,
    operation: envelope.operation.id,
    status: envelope.operation.status,
    success: envelope.operation.status === OperationStatus.SUCCESS,
    data: envelope.data,
    metadata: {
      ...envelope.metadata,
      ...additionalContext
    },
    correlationId: envelope.envelope.correlationId
  };
}

/**
 * Wrap multiple envelopes in a batch response
 * 
 * @param {Object[]} envelopes - Array of envelopes
 * @param {Object} [metadata] - Batch metadata
 * @returns {Object} Batch envelope
 */
export function createBatchEnvelope(envelopes, metadata = {}) {
  if (!Array.isArray(envelopes)) {
    throw new Error('Envelopes must be an array');
  }

  // Validate all envelopes
  const validationResults = envelopes.map(validateEnvelope);
  const invalidEnvelopes = validationResults.filter(r => !r.valid);
  
  if (invalidEnvelopes.length > 0) {
    throw new Error(`Batch contains ${invalidEnvelopes.length} invalid envelopes`);
  }

  return {
    envelope: {
      type: 'batch',
      version: '1.0',
      timestamp: new Date().toISOString(),
      correlationId: generateCorrelationId(),
      count: envelopes.length
    },
    data: {
      envelopes
    },
    metadata: {
      ...metadata,
      batchType: 'multiple_operations',
      processedAt: new Date().toISOString()
    }
  };
}

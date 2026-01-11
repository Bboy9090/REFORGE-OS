// Workflow Validator - Validates workflow JSON schemas
// Ensures workflow definitions are safe and properly structured

const VALID_PLATFORMS = ['android', 'ios', 'universal', 'windows', 'linux', 'macos'];
const VALID_STEP_TYPES = ['command', 'check', 'wait', 'prompt', 'log'];
const VALID_ON_FAILURE = ['abort', 'continue', 'retry'];
const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'destructive'];
const VALID_CATEGORIES = ['diagnostics', 'flash', 'bypass', 'recovery', 'maintenance', 'automation'];

class WorkflowValidator {
  /**
   * Validate a workflow definition
   * @param {Object} workflow - The workflow JSON object
   * @returns {Object} - { valid: boolean, errors: Array<{field: string, message: string}> }
   */
  static validate(workflow) {
    const errors = [];

    if (!workflow || typeof workflow !== 'object') {
      return {
        valid: false,
        errors: [{ field: 'workflow', message: 'Workflow must be an object' }]
      };
    }

    // Required top-level fields
    if (!workflow.id || typeof workflow.id !== 'string') {
      errors.push({ field: 'id', message: 'Workflow must have a string id' });
    }

    if (!workflow.name || typeof workflow.name !== 'string') {
      errors.push({ field: 'name', message: 'Workflow must have a string name' });
    }

    if (!workflow.description || typeof workflow.description !== 'string') {
      errors.push({ field: 'description', message: 'Workflow must have a string description' });
    }

    // Validate platform
    if (!workflow.platform || !VALID_PLATFORMS.includes(workflow.platform)) {
      errors.push({
        field: 'platform',
        message: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`
      });
    }

    // Validate category
    if (!workflow.category || !VALID_CATEGORIES.includes(workflow.category)) {
      errors.push({
        field: 'category',
        message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
      });
    }

    // Validate risk_level
    if (!workflow.risk_level || !VALID_RISK_LEVELS.includes(workflow.risk_level)) {
      errors.push({
        field: 'risk_level',
        message: `Risk level must be one of: ${VALID_RISK_LEVELS.join(', ')}`
      });
    }

    // Validate authorization requirements
    if (workflow.requires_authorization && !workflow.authorization_prompt) {
      errors.push({
        field: 'authorization_prompt',
        message: 'Authorization prompt is required when requires_authorization is true'
      });
    }

    // Validate steps
    if (!Array.isArray(workflow.steps)) {
      errors.push({ field: 'steps', message: 'Workflow must have a steps array' });
    } else {
      const stepIds = new Set();

      workflow.steps.forEach((step, index) => {
        // Validate step id
        if (!step.id) {
          errors.push({
            field: `steps[${index}].id`,
            message: 'Step must have an id'
          });
        } else if (stepIds.has(step.id)) {
          errors.push({
            field: `steps[${index}].id`,
            message: `Duplicate step id: ${step.id}`
          });
        } else {
          stepIds.add(step.id);
        }

        // Validate step name
        if (!step.name) {
          errors.push({
            field: `steps[${index}].name`,
            message: 'Step must have a name'
          });
        }

        // Validate step type
        if (!step.type || !VALID_STEP_TYPES.includes(step.type)) {
          errors.push({
            field: `steps[${index}].type`,
            message: `Step type must be one of: ${VALID_STEP_TYPES.join(', ')}`
          });
        }

        // Validate step action
        if (!step.action && step.type !== 'wait' && step.type !== 'log') {
          errors.push({
            field: `steps[${index}].action`,
            message: 'Step must have an action'
          });
        }

        // Validate step description
        if (!step.description) {
          errors.push({
            field: `steps[${index}].description`,
            message: 'Step must have a description'
          });
        }

        // Validate on_failure
        if (step.on_failure && !VALID_ON_FAILURE.includes(step.on_failure)) {
          errors.push({
            field: `steps[${index}].on_failure`,
            message: `on_failure must be one of: ${VALID_ON_FAILURE.join(', ')}`
          });
        }

        // Validate success_criteria for command steps
        if (step.type === 'command' && !step.success_criteria) {
          errors.push({
            field: `steps[${index}].success_criteria`,
            message: 'Command steps must have success_criteria'
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate and sanitize a workflow, adding defaults
   * @param {Object} workflow - The workflow JSON object
   * @returns {Object} - { success: boolean, workflow: Object, errors: Array }
   */
  static validateAndSanitize(workflow) {
    const validationResult = this.validate(workflow);

    if (!validationResult.valid) {
      return {
        success: false,
        workflow: null,
        errors: validationResult.errors
      };
    }

    // Add default values
    const sanitized = {
      ...workflow,
      requires_authorization: workflow.requires_authorization || false,
      created_at: workflow.created_at || new Date().toISOString(),
      version: workflow.version || '1.0.0',
      steps: workflow.steps.map(step => ({
        ...step,
        timeout: step.timeout || 30,
        on_failure: step.on_failure || 'abort',
        retry_count: step.retry_count || 0,
        retry_delay: step.retry_delay || 1000
      }))
    };

    return {
      success: true,
      workflow: sanitized,
      errors: []
    };
  }
}

export default WorkflowValidator;

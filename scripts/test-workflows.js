// Workflow validation script
// Validates all JSON workflow definitions

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOWS_DIR = path.join(__dirname, '..', 'workflows');

const REQUIRED_FIELDS = ['id', 'name', 'description', 'platform', 'category', 'steps'];
const REQUIRED_STEP_FIELDS = ['id', 'name', 'type'];

async function validateWorkflowFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const workflow = JSON.parse(content);

    // Check required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !workflow[field]);
    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Validate steps
    if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
      return {
        valid: false,
        error: 'Workflow must have at least one step'
      };
    }

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const missingStepFields = REQUIRED_STEP_FIELDS.filter(field => !step[field]);
      
      if (missingStepFields.length > 0) {
        return {
          valid: false,
          error: `Step ${i + 1} missing required fields: ${missingStepFields.join(', ')}`
        };
      }

      // Validate step type
      const validTypes = ['command', 'check', 'wait', 'prompt', 'log', 'calculate', 'manual', 'probe', 'analysis', 'report'];
      if (!validTypes.includes(step.type)) {
        return {
          valid: false,
          error: `Step ${i + 1} has invalid type: ${step.type}`
        };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to parse workflow: ${error.message}`
    };
  }
}

async function findWorkflowFiles(dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await findWorkflowFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.endsWith('-schema.json')) {
        // Skip schema definition files
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

async function validateAllWorkflows() {
  console.log('🔍 Validating workflow definitions...\n');

  const workflowFiles = await findWorkflowFiles(WORKFLOWS_DIR);
  
  if (workflowFiles.length === 0) {
    console.log('⚠️  No workflow files found in', WORKFLOWS_DIR);
    process.exit(1);
  }

  console.log(`Found ${workflowFiles.length} workflow file(s)\n`);

  let validCount = 0;
  let invalidCount = 0;

  for (const file of workflowFiles) {
    const relativePath = path.relative(process.cwd(), file);
    const result = await validateWorkflowFile(file);

    if (result.valid) {
      console.log(`✓ ${relativePath}`);
      validCount++;
    } else {
      console.log(`✗ ${relativePath}`);
      console.log(`  Error: ${result.error}`);
      invalidCount++;
    }
  }

  console.log(`\n📊 Results: ${validCount} valid, ${invalidCount} invalid`);

  if (invalidCount > 0) {
    console.log('\n❌ Workflow validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ All workflows validated successfully');
    process.exit(0);
  }
}

// Run validation
validateAllWorkflows().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

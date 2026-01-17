// Test for Workflow Engine

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowEngine } from '../core/tasks/workflow-engine.js';
import path from 'path';

describe('WorkflowEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new WorkflowEngine({
      workflowsDir: path.join(process.cwd(), 'workflows')
    });
  });

  describe('Workflow Loading', () => {
    it('should load an existing workflow', async () => {
      const result = await engine.loadWorkflow('android', 'adb-diagnostics');
      
      expect(result.success).toBe(true);
      expect(result.workflow).toBeDefined();
      expect(result.workflow.id).toBe('android-adb-diagnostics');
    });

    it('should fail to load non-existent workflow', async () => {
      const result = await engine.loadWorkflow('android', 'non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate workflow schema', async () => {
      const result = await engine.loadWorkflow('android', 'adb-diagnostics');
      
      if (result.success) {
        const validation = engine.validateWorkflow(result.workflow);
        expect(validation.valid).toBe(true);
      }
    });
  });

  describe('Workflow Listing', () => {
    it('should list all available workflows', async () => {
      const result = await engine.listWorkflows();
      
      expect(result.success).toBe(true);
      expect(result.workflows).toBeInstanceOf(Array);
      expect(result.workflows.length).toBeGreaterThan(0);
    });

    it('should include workflow metadata', async () => {
      const result = await engine.listWorkflows();
      
      if (result.workflows.length > 0) {
        const workflow = result.workflows[0];
        expect(workflow).toHaveProperty('id');
        expect(workflow).toHaveProperty('name');
        expect(workflow).toHaveProperty('platform');
        expect(workflow).toHaveProperty('category');
      }
    });
  });

  describe('Workflow Validation', () => {
    it('should validate workflow structure', () => {
      const validWorkflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        platform: 'android',
        category: 'diagnostics',
        risk_level: 'low',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            type: 'command',
            action: 'echo test',
            on_failure: 'continue'
          }
        ]
      };

      const validation = engine.validateWorkflow(validWorkflow);
      expect(validation.valid).toBe(true);
    });

    it('should reject invalid workflows', () => {
      const invalidWorkflow = {
        id: 'test',
        name: 'Test',
        // missing required fields
      };

      const validation = engine.validateWorkflow(invalidWorkflow);
      if (!validation.valid) {
        expect(validation.errors).toBeDefined();
      }
    });
  });

  describe('Step Execution', () => {
    it('should execute wait steps', async () => {
      const step = {
        id: 'wait-test',
        name: 'Wait Test',
        type: 'wait',
        timeout: 1,
        on_failure: 'continue'
      };

      const context = {
        deviceSerial: 'TEST123',
        workflow: { platform: 'android' },
        userId: 'test',
        authorization: null
      };

      const result = await engine.executeWait(step, context);
      expect(result.success).toBe(true);
    });

    it('should execute log steps', async () => {
      const step = {
        id: 'log-test',
        name: 'Log Test',
        type: 'log',
        action: 'test_log',
        log_data: { test: 'data' },
        on_failure: 'continue'
      };

      const context = {
        deviceSerial: 'TEST123',
        workflow: { platform: 'android' },
        userId: 'test',
        authorization: null
      };

      const result = await engine.executeLog(step, context);
      expect(result.success).toBe(true);
    });
  });
});

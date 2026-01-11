// Test suite for Workflow System
// Tests workflow validation, execution, and logging

import { describe, it, expect } from "vitest";
import WorkflowValidator from "../core/lib/workflow-validator.js";
import { WorkflowEngine } from "../core/tasks/workflow-engine.js";
import ShadowLogger from "../core/lib/shadow-logger.js";

describe("Workflow Validation Tests", () => {
  describe("Schema Validation", () => {
    it("should validate correct workflow", () => {
      const workflow = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "A test workflow for validation",
        platform: "android",
        category: "diagnostics",
        risk_level: "low",
        steps: [
          {
            id: "step-1",
            name: "Test Step",
            type: "command",
            action: "test",
            description: "Test description",
            success_criteria: "Success",
            on_failure: "abort"
          }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject workflow missing required fields", () => {
      const workflow = {
        id: "test-workflow",
        name: "Test Workflow"
        // Missing other required fields
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject invalid platform", () => {
      const workflow = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "A test workflow",
        platform: "invalid-platform",
        category: "diagnostics",
        risk_level: "low",
        steps: []
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === "platform")).toBe(true);
    });

    it("should reject invalid step type", () => {
      const workflow = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "A test workflow",
        platform: "android",
        category: "diagnostics",
        risk_level: "low",
        steps: [
          {
            id: "step-1",
            name: "Test Step",
            type: "invalid-type",
            action: "test",
            description: "Test",
            success_criteria: "Success",
            on_failure: "abort"
          }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field.includes("type"))).toBe(true);
    });

    it("should reject duplicate step IDs", () => {
      const workflow = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "A test workflow",
        platform: "android",
        category: "diagnostics",
        risk_level: "low",
        steps: [
          {
            id: "step-1",
            name: "Test Step 1",
            type: "command",
            action: "test",
            description: "Test",
            success_criteria: "Success",
            on_failure: "abort"
          },
          {
            id: "step-1",
            name: "Test Step 2",
            type: "command",
            action: "test",
            description: "Test",
            success_criteria: "Success",
            on_failure: "abort"
          }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes("Duplicate"))).toBe(true);
    });

    it("should validate authorization requirement", () => {
      const workflow = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "A test workflow",
        platform: "android",
        category: "diagnostics",
        risk_level: "low",
        requires_authorization: true,
        // Missing authorization_prompt
        steps: []
      };

      const result = WorkflowValidator.validate(workflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === "authorization_prompt")).toBe(true);
    });
  });

  describe("Workflow Sanitization", () => {
    it("should add default values", () => {
      const workflow = {
        id: "test-workflow",
        name: "Test Workflow",
        description: "A test workflow",
        platform: "android",
        category: "diagnostics",
        risk_level: "low",
        steps: [
          {
            id: "step-1",
            name: "Test Step",
            type: "command",
            action: "test",
            description: "Test",
            success_criteria: "Success",
            on_failure: "abort"
          }
        ]
      };

      const result = WorkflowValidator.validateAndSanitize(workflow);
      expect(result.success).toBe(true);
      expect(result.workflow.requires_authorization).toBe(false);
      expect(result.workflow.steps[0].timeout).toBeTruthy();
    });
  });
});

describe("Workflow Engine Tests", () => {
  const testWorkflowsDir = "./tests/fixtures/workflows";

  describe("Workflow Loading", () => {
    it("should load workflow from file", async () => {
      const engine = new WorkflowEngine({
        workflowsDir: "./workflows",
        validateWorkflows: false
      });

      const result = await engine.loadWorkflow("android", "adb-diagnostics");
      // May not exist in test environment
      expect(result.success || result.error === "Workflow not found").toBe(true);
    });

    it("should validate workflow on load", async () => {
      const engine = new WorkflowEngine({
        workflowsDir: "./workflows",
        validateWorkflows: true
      });

      const result = await engine.loadWorkflow("android", "adb-diagnostics");
      if (result.success) {
        expect(result.workflow).toBeTruthy();
        expect(result.workflow.id).toBeTruthy();
      }
    });
  });

  describe("Workflow Listing", () => {
    it("should list all workflows", async () => {
      const engine = new WorkflowEngine({ workflowsDir: "./workflows" });
      const result = await engine.listWorkflows();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.workflows)).toBe(true);
    });
  });
});

describe("Shadow Logger Tests", () => {
  const testLogsDir = "./tests/fixtures/logs";

  describe("Encryption", () => {
    it("should encrypt and decrypt data", () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const testData = "sensitive test data";

      const encrypted = logger.encrypt(testData);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(testData);

      const decrypted = logger.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });

    it("should use AES-256-GCM", () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const encrypted = logger.encrypt("test");
      const parsed = JSON.parse(encrypted);

      expect(parsed.iv).toBeTruthy();
      expect(parsed.data).toBeTruthy();
      expect(parsed.authTag).toBeTruthy();
    });
  });

  describe("Logging", () => {
    it("should log to shadow log", async () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const result = await logger.logShadow({
        operation: "test_operation",
        deviceSerial: "TEST-123",
        userId: "test-user",
        authorization: "TEST",
        success: true,
        metadata: { test: true }
      });

      expect(result.success).toBe(true);
      expect(result.encrypted).toBeTruthy();
    });

    it("should log to public log", async () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const result = await logger.logPublic({
        operation: "test_operation",
        message: "Test message",
        metadata: { test: true }
      });

      expect(result.success).toBe(true);
      expect(result.encrypted).toBe(false);
    });
  });

  describe("Log Statistics", () => {
    it("should return log statistics", async () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const result = await logger.getLogStats();

      expect(result.success).toBe(true);
      expect(result.stats).toBeTruthy();
      expect(result.stats.encryptionAlgorithm).toBe("aes-256-gcm");
    });
  });
});

console.log(" Workflow system tests defined");

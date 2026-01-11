// Tests for Shadow Logger with AES-256 encryption and tamper detection
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import ShadowLogger from "../core/lib/shadow-logger.js";
import fs from "fs";
import path from "path";

const TEST_LOG_DIR = path.join(process.cwd(), ".test-shadow-logs");
const TEST_PUBLIC_DIR = path.join(process.cwd(), "test-logs");

describe("ShadowLogger", () => {
  let logger;

  beforeEach(() => {
    logger = new ShadowLogger({
      encryptionKey: Buffer.from("test-key-32-bytes-long-exactly!!"),
      retentionDays: 1,
      logsDir: TEST_LOG_DIR,
      publicLogsDir: TEST_PUBLIC_DIR
    });

    process.env.SHADOW_LOG_DIR = TEST_LOG_DIR;
    process.env.PUBLIC_LOG_DIR = TEST_PUBLIC_DIR;
  });

  afterEach(() => {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true, force: true });
    }
    if (fs.existsSync(TEST_PUBLIC_DIR)) {
      fs.rmSync(TEST_PUBLIC_DIR, { recursive: true, force: true });
    }
  });

  describe("Encryption and Decryption", () => {
    it("encrypts and decrypts string data", () => {
      const testData = JSON.stringify({ operation: "test_operation" });

      const encrypted = logger.encrypt(testData);
      expect(typeof encrypted).toBe("string");

      const decrypted = logger.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });
  });

  describe("Shadow Logging", () => {
    it("writes and reads shadow logs", async () => {
      const logEntry = {
        operation: "frp_bypass_test",
        deviceSerial: "DEVICE123",
        userId: "admin",
        authorization: "CONFIRMED",
        success: true,
        metadata: { timestamp: new Date().toISOString() }
      };

      const writeResult = await logger.logShadow(logEntry);
      expect(writeResult.success).toBe(true);

      const date = new Date().toISOString().split("T")[0];
      const readResult = await logger.readShadowLogs(date);

      expect(readResult.success).toBe(true);
      expect(readResult.entries.length).toBeGreaterThanOrEqual(1);
      expect(readResult.entries[0].operation).toBe("frp_bypass_test");
    });
  });

  describe("Public Logging", () => {
    it("logs public operations", async () => {
      const logEntry = {
        operation: "workflow_start",
        message: "Test workflow started",
        metadata: { workflowId: "test-123" }
      };

      const result = await logger.logPublic(logEntry);
      expect(result.success).toBe(true);
    });
  });

  describe("Statistics and Cleanup", () => {
    it("returns log statistics", async () => {
      await logger.logShadow({ operation: "test", success: true });
      await logger.logPublic({ operation: "test", message: "ok" });

      const stats = await logger.getLogStats();
      expect(stats.success).toBe(true);
      expect(stats.stats).toHaveProperty("shadowLogFiles");
      expect(stats.stats).toHaveProperty("publicLogFiles");
    });

    it("cleans up old logs", async () => {
      const result = await logger.cleanupOldLogs();
      expect(result.success).toBe(true);
      expect(result).toHaveProperty("deletedCount");
    });
  });
});

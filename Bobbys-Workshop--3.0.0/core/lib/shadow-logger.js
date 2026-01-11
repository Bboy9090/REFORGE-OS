// Shadow Logger - Encrypted logging for sensitive operations
// Uses AES-256-GCM for encryption with immutable append-only logs

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

class ShadowLogger {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(process.cwd(), 'logs', 'shadow');
    this.publicLogsDir = options.publicLogsDir || path.join(process.cwd(), 'logs', 'public');
    this.retentionDays = options.retentionDays || 90;
    
    // Generate or load encryption key
    // In production, this should be loaded from secure storage
    this.encryptionKey = options.encryptionKey || this._generateKey();
    
    // Ensure log directories exist
    this._ensureDirectories();
  }

  _ensureDirectories() {
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
    if (!existsSync(this.publicLogsDir)) {
      mkdirSync(this.publicLogsDir, { recursive: true });
    }
  }

  _generateKey() {
    // In production, load from secure storage
    const envKey = process.env.SHADOW_LOG_KEY;
    if (envKey) {
      return Buffer.from(envKey, 'hex');
    }
    // Generate a random key for development - logs will not persist across restarts
    // This ensures development mode doesn't use predictable keys
    console.warn('[ShadowLogger] No SHADOW_LOG_KEY set - using random key (logs will not persist)');
    return crypto.randomBytes(KEY_LENGTH);
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string} data - Plain text data to encrypt
   * @returns {string} - JSON string with iv, authTag, and encrypted data
   */
  encrypt(data) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted
    });
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   * @param {string} encryptedJson - JSON string with iv, authTag, and encrypted data
   * @returns {string} - Decrypted plain text
   */
  decrypt(encryptedJson) {
    const { iv, authTag, data } = JSON.parse(encryptedJson);
    
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM, 
      this.encryptionKey, 
      Buffer.from(iv, 'hex'),
      { authTagLength: AUTH_TAG_LENGTH }
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Log sensitive operation to encrypted shadow log
   * @param {Object} entry - Log entry with operation details
   */
  async logShadow(entry) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...entry
      };
      
      const encrypted = this.encrypt(JSON.stringify(logEntry));
      
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logsDir, `shadow-${date}.log`);
      
      // Append to log file (immutable, append-only)
      await fs.appendFile(logFile, encrypted + '\n');
      
      return { success: true, encrypted: true };
    } catch (error) {
      console.error('Shadow log error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log public operation (not encrypted)
   * @param {Object} entry - Log entry
   */
  async logPublic(entry) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...entry
      };
      
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.publicLogsDir, `public-${date}.log`);
      
      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
      
      return { success: true, encrypted: false };
    } catch (error) {
      console.error('Public log error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Read shadow logs for a specific date
   * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
   */
  async readShadowLogs(date) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logsDir, `shadow-${targetDate}.log`);
      
      if (!existsSync(logFile)) {
        return { success: false, error: 'Log file not found', entries: [] };
      }
      
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);
      
      const entries = lines.map(line => {
        try {
          const decrypted = this.decrypt(line);
          return JSON.parse(decrypted);
        } catch (e) {
          return { error: 'Failed to decrypt entry' };
        }
      });
      
      return { success: true, entries };
    } catch (error) {
      console.error('Read shadow logs error:', error);
      return { success: false, error: error.message, entries: [] };
    }
  }

  /**
   * Get log statistics
   */
  async getLogStats() {
    try {
      const shadowFiles = existsSync(this.logsDir) 
        ? (await fs.readdir(this.logsDir)).filter(f => f.startsWith('shadow-'))
        : [];
      
      const publicFiles = existsSync(this.publicLogsDir)
        ? (await fs.readdir(this.publicLogsDir)).filter(f => f.startsWith('public-'))
        : [];
      
      return {
        success: true,
        stats: {
          shadowLogFiles: shadowFiles.length,
          publicLogFiles: publicFiles.length,
          retentionDays: this.retentionDays,
          encryptionAlgorithm: ENCRYPTION_ALGORITHM,
          logsDirectory: this.logsDir
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Compatibility alias for callers expecting getStats()
   */
  async getStats() {
    return this.getLogStats();
  }

  /**
   * Clean up old log files based on retention policy
   */
  async cleanupOldLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      let deleted = 0;
      
      // Clean shadow logs
      if (existsSync(this.logsDir)) {
        const files = await fs.readdir(this.logsDir);
        for (const file of files) {
          const match = file.match(/shadow-(\d{4}-\d{2}-\d{2})\.log/);
          if (match) {
            const fileDate = new Date(match[1]);
            if (fileDate < cutoffDate) {
              await fs.unlink(path.join(this.logsDir, file));
              deleted++;
            }
          }
        }
      }
      
      // Clean public logs
      if (existsSync(this.publicLogsDir)) {
        const files = await fs.readdir(this.publicLogsDir);
        for (const file of files) {
          const match = file.match(/public-(\d{4}-\d{2}-\d{2})\.log/);
          if (match) {
            const fileDate = new Date(match[1]);
            if (fileDate < cutoffDate) {
              await fs.unlink(path.join(this.publicLogsDir, file));
              deleted++;
            }
          }
        }
      }
      
      return { 
        success: true, 
        message: `Cleaned up ${deleted} old log files`,
        deletedCount: deleted 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Compatibility alias for callers expecting rotateLogs()
   * (We map to retention cleanup; this performs a real operation.)
   */
  async rotateLogs() {
    return this.cleanupOldLogs();
  }

  /**
   * Get shadow logs with filtering options
   * @param {Object} options - Filter options
   * @param {string} options.deviceSerial - Filter by device serial
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {string} options.operation - Filter by operation type
   * @param {number} options.limit - Maximum number of entries to return
   */
  async getShadowLogs(options = {}) {
    const { deviceSerial, startDate, endDate, operation, limit = 100 } = options;
    
    try {
      const logs = [];
      const startDateStr = startDate ? startDate.toISOString().split('T')[0] : null;
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : null;
      
      // Determine date range to search
      const datesToSearch = [];
      if (startDateStr && endDateStr) {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          datesToSearch.push(d.toISOString().split('T')[0]);
        }
      } else if (startDateStr) {
        datesToSearch.push(startDateStr);
      } else if (endDateStr) {
        datesToSearch.push(endDateStr);
      } else {
        datesToSearch.push(new Date().toISOString().split('T')[0]);
      }
      
      // Read logs from date range
      for (const date of datesToSearch) {
        const result = await this.readShadowLogs(date);
        if (result.success && result.entries) {
          logs.push(...result.entries);
        }
      }
      
      // Apply filters
      let filtered = logs;
      if (deviceSerial) {
        filtered = filtered.filter(log => log.deviceSerial === deviceSerial);
      }
      if (operation) {
        filtered = filtered.filter(log => log.operation === operation);
      }
      if (startDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
      }
      
      // Sort by timestamp (newest first) and limit
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limited = filtered.slice(0, limit);
      
      return limited;
    } catch (error) {
      console.error('Get shadow logs error:', error);
      return [];
    }
  }

  /**
   * Get analytics for Secret Room operations
   * @param {Object} options - Filter options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   */
  async getAnalytics(options = {}) {
    const { startDate, endDate } = options;
    
    try {
      const logs = await this.getShadowLogs({
        startDate,
        endDate,
        limit: 10000 // Large limit for analytics
      });
      
      const operationsByType = {};
      let successCount = 0;
      let totalExecutionTime = 0;
      const devicesProcessed = new Set();
      
      logs.forEach(log => {
        // Count by operation type
        if (!operationsByType[log.operation]) {
          operationsByType[log.operation] = 0;
        }
        operationsByType[log.operation]++;
        
        // Count successes
        if (log.success) {
          successCount++;
        }
        
        // Track devices
        if (log.deviceSerial && log.deviceSerial !== 'N/A') {
          devicesProcessed.add(log.deviceSerial);
        }
        
        // Extract execution time from metadata if available
        if (log.metadata && log.metadata.duration) {
          totalExecutionTime += log.metadata.duration;
        }
      });
      
      return {
        totalOperations: logs.length,
        operationsByType,
        devicesProcessed: devicesProcessed.size,
        successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
        averageExecutionTime: logs.length > 0 ? totalExecutionTime / logs.length : 0
      };
    } catch (error) {
      console.error('Get analytics error:', error);
      return {
        totalOperations: 0,
        operationsByType: {},
        devicesProcessed: 0,
        successRate: 0,
        averageExecutionTime: 0
      };
    }
  }
}

export default ShadowLogger;

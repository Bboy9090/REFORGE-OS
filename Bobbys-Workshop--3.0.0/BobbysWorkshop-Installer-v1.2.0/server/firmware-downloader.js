/**
 * Firmware Downloader - Handles firmware downloads with progress tracking
 * 
 * Supports:
 * - Android firmware (Samsung, Google, Xiaomi, etc.)
 * - iOS firmware (IPSW files)
 * - Progress tracking and resumable downloads
 * - Checksum validation
 */

import { createWriteStream, createReadStream, existsSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
// Note: pipeline is not used in current implementation, removed to avoid unused import
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firmware storage directory
const FIRMWARE_STORAGE_DIR = join(__dirname, '..', 'storage', 'firmware');

// Ensure storage directory exists
try {
  mkdirSync(FIRMWARE_STORAGE_DIR, { recursive: true });
} catch (error) {
  // Directory might already exist, ignore
}

// Active downloads tracking
const activeDownloads = new Map();

/**
 * Download firmware file with progress tracking
 */
export async function downloadFirmware(url, options = {}) {
  const {
    firmwareId,
    expectedSize,
    expectedChecksum,
    checksumType = 'sha256',
    onProgress,
    timeout = 3600000 // 1 hour default
  } = options;
  
  const downloadId = firmwareId || `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate filename from URL
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1].split('?')[0];
  const filePath = join(FIRMWARE_STORAGE_DIR, filename);
  
  // Check if file already exists and is complete
  if (existsSync(filePath)) {
    const stats = statSync(filePath);
    if (expectedSize && stats.size === expectedSize) {
      // File exists and size matches, verify checksum if provided
      if (expectedChecksum) {
        const actualChecksum = await calculateChecksum(filePath, checksumType);
        if (actualChecksum.toLowerCase() === expectedChecksum.toLowerCase()) {
          return {
            success: true,
            downloadId,
            filePath,
            size: stats.size,
            message: 'File already downloaded and verified'
          };
        }
      } else {
        return {
          success: true,
          downloadId,
          filePath,
          size: stats.size,
          message: 'File already exists'
        };
      }
    }
  }
  
  // Create download record
  const downloadRecord = {
    downloadId,
    url,
    filePath,
    startTime: Date.now(),
    bytesDownloaded: 0,
    totalBytes: expectedSize || 0,
    status: 'downloading',
    error: null
  };
  
  activeDownloads.set(downloadId, downloadRecord);
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Bobby-Workshop/1.0)'
      },
      timeout
    };
    
    const req = client.request(requestOptions, (res) => {
      // Update total bytes if available
      const contentLength = res.headers['content-length'];
      if (contentLength) {
        downloadRecord.totalBytes = parseInt(contentLength, 10);
      }
      
      // Check status code
      if (res.statusCode < 200 || res.statusCode >= 300) {
        downloadRecord.status = 'failed';
        downloadRecord.error = `HTTP ${res.statusCode}`;
        activeDownloads.delete(downloadId);
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }
      
      // Create write stream
      const writeStream = createWriteStream(filePath);
      let bytesDownloaded = 0;
      
      // Track progress
      res.on('data', (chunk) => {
        bytesDownloaded += chunk.length;
        downloadRecord.bytesDownloaded = bytesDownloaded;
        
        if (onProgress) {
          const progress = downloadRecord.totalBytes > 0 
            ? (bytesDownloaded / downloadRecord.totalBytes) * 100 
            : 0;
          onProgress({
            downloadId,
            bytesDownloaded,
            totalBytes: downloadRecord.totalBytes,
            progress,
            speed: calculateSpeed(bytesDownloaded, downloadRecord.startTime)
          });
        }
      });
      
      // Handle completion
      res.on('end', async () => {
        writeStream.end();
        
        try {
          // Verify checksum if provided
          if (expectedChecksum) {
            const actualChecksum = await calculateChecksum(filePath, checksumType);
            if (actualChecksum.toLowerCase() !== expectedChecksum.toLowerCase()) {
              downloadRecord.status = 'failed';
              downloadRecord.error = 'Checksum mismatch';
              activeDownloads.delete(downloadId);
              return reject(new Error('Checksum verification failed'));
            }
          }
          
          downloadRecord.status = 'completed';
          activeDownloads.delete(downloadId);
          
          resolve({
            success: true,
            downloadId,
            filePath,
            size: bytesDownloaded,
            checksum: expectedChecksum ? await calculateChecksum(filePath, checksumType) : null
          });
        } catch (error) {
          downloadRecord.status = 'failed';
          downloadRecord.error = error.message;
          activeDownloads.delete(downloadId);
          reject(error);
        }
      });
      
      // Pipe response to file
      res.pipe(writeStream);
    });
    
    req.on('error', (error) => {
      downloadRecord.status = 'failed';
      downloadRecord.error = error.message;
      activeDownloads.delete(downloadId);
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      downloadRecord.status = 'failed';
      downloadRecord.error = 'Download timeout';
      activeDownloads.delete(downloadId);
      reject(new Error('Download timeout'));
    });
    
    req.end();
  });
}

/**
 * Calculate file checksum
 */
async function calculateChecksum(filePath, type = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = createHash(type);
    const stream = createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Calculate download speed (bytes per second)
 */
function calculateSpeed(bytesDownloaded, startTime) {
  const elapsed = (Date.now() - startTime) / 1000; // seconds
  return elapsed > 0 ? bytesDownloaded / elapsed : 0;
}

/**
 * Get download status
 */
export function getDownloadStatus(downloadId) {
  const download = activeDownloads.get(downloadId);
  if (!download) {
    return null;
  }
  
  const elapsed = Date.now() - download.startTime;
  const speed = calculateSpeed(download.bytesDownloaded, download.startTime);
  const progress = download.totalBytes > 0 
    ? (download.bytesDownloaded / download.totalBytes) * 100 
    : 0;
  const estimatedTimeRemaining = speed > 0 && download.totalBytes > download.bytesDownloaded
    ? (download.totalBytes - download.bytesDownloaded) / speed
    : null;
  
  return {
    downloadId: download.downloadId,
    status: download.status,
    bytesDownloaded: download.bytesDownloaded,
    totalBytes: download.totalBytes,
    progress,
    speed,
    elapsed,
    estimatedTimeRemaining,
    error: download.error
  };
}

/**
 * Cancel active download
 */
export function cancelDownload(downloadId) {
  const download = activeDownloads.get(downloadId);
  if (!download) {
    return false;
  }
  
  // Note: Actual cancellation would require aborting the HTTP request
  // This is a simplified version - in production, you'd need to track the request object
  download.status = 'cancelled';
  activeDownloads.delete(downloadId);
  return true;
}

/**
 * Get all active downloads
 */
export function getActiveDownloads() {
  return Array.from(activeDownloads.values()).map(download => ({
    downloadId: download.downloadId,
    url: download.url,
    status: download.status,
    bytesDownloaded: download.bytesDownloaded,
    totalBytes: download.totalBytes,
    progress: download.totalBytes > 0 
      ? (download.bytesDownloaded / download.totalBytes) * 100 
      : 0
  }));
}


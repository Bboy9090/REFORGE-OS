import express from 'express';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { AuthorizationTriggers } from './authorization-triggers.js';
import catalogRouter from './catalog.js';
import operationsRouter from './operations.js';
import { ensureManagedPlatformTools, getManagedPlatformToolsDir } from './platform-tools.js';
import { auditLogMiddleware } from './middleware/audit-logger.js';
import { correlationIdMiddleware, envelopeMiddleware } from './middleware/api-envelope.js';
import { deprecationWarningMiddleware } from './middleware/api-versioning.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { requireTrapdoorPasscode } from './middleware/trapdoor-auth.js';
import { acquireDeviceLock, releaseDeviceLock, LOCK_TIMEOUT } from './locks.js';
import { getToolPath, isToolAvailable, getToolInfo, getAllToolsInfo, executeTool } from './tools-manager.js';
import { downloadFirmware, getDownloadStatus, cancelDownload, getActiveDownloads } from './firmware-downloader.js';
import { readyHandler } from './routes/v1/ready.js';
import { createRoutesHandler } from './routes/v1/routes.js';
import { systemToolsHandler } from './routes/v1/system-tools.js';
import adbRouter from './routes/v1/adb.js';
import fastbootRouter from './routes/v1/fastboot.js';
import frpRouter from './routes/v1/frp.js';
import mdmRouter from './routes/v1/mdm.js';
import iosRouter from './routes/v1/ios.js';
import monitorRouter from './routes/v1/monitor.js';
import testsRouter from './routes/v1/tests.js';
import firmwareRouter from './routes/v1/firmware.js';
import flashRouter from './routes/v1/flash.js';
import bootforgeusbRouter from './routes/v1/bootforgeusb.js';
import authorizationRouter from './routes/v1/authorization.js';
import standardsRouter from './routes/v1/standards.js';
import hotplugRouter from './routes/v1/hotplug.js';
import performanceMonitorRouter from './routes/v1/monitor/performance.js';
import iosDFURouter from './routes/v1/ios/dfu.js';
import rootDetectionRouter from './routes/v1/security/root-detection.js';
import bootloaderStatusRouter from './routes/v1/security/bootloader-status.js';
import odinRouter from './routes/v1/flash/odin.js';
import mtkRouter from './routes/v1/flash/mtk.js';
import edlRouter from './routes/v1/flash/edl.js';
import iosLibimobiledeviceRouter from './routes/v1/ios/libimobiledevice-full.js';
import adbAdvancedRouter from './routes/v1/adb/advanced.js';
import diagnosticsRouter from './routes/v1/diagnostics/index.js';
import trapdoorRouter from './routes/v1/trapdoor/index.js';

// Initialize logging first
const LOG_DIR = process.env.BW_LOG_DIR || (process.platform === 'win32' 
  ? path.join(process.env.LOCALAPPDATA || process.env.APPDATA || process.cwd(), 'BobbysWorkshop', 'logs')
  : path.join(process.env.HOME || process.cwd(), '.local', 'share', 'bobbys-workshop', 'logs'));
const LOG_FILE = process.env.BW_LOG_FILE || path.join(LOG_DIR, 'backend.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Simple file logger
const logger = {
  info: (msg) => {
    const line = `[${new Date().toISOString()}] INFO: ${msg}\n`;
    try {
      fs.appendFileSync(LOG_FILE, line);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
    console.log(line.trim());
  },
  error: (msg) => {
    const line = `[${new Date().toISOString()}] ERROR: ${msg}\n`;
    try {
      fs.appendFileSync(LOG_FILE, line);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
    console.error(line.trim());
  }
};

const app = express();
const PORT = process.env.PORT || 3001;
const DEMO_MODE = process.env.DEMO_MODE === '1';

logger.info(`Backend starting on port ${PORT}`);
logger.info(`Log directory: ${LOG_DIR}`);
logger.info(`Log file: ${LOG_FILE}`);

app.use(cors());
app.use(express.json());

// Apply middleware in order: correlation ID, envelope, audit logging
app.use(correlationIdMiddleware);
app.use(envelopeMiddleware);
app.use(auditLogMiddleware);

// API versioning: warn on non-v1 routes
app.use('/api', deprecationWarningMiddleware);

// ============================================================================
// API v1 Router
// ============================================================================
const v1Router = express.Router();

// Health and readiness endpoints
v1Router.get('/health', (req, res) => {
  res.sendEnvelope({ status: 'ok', healthy: true });
});

v1Router.get('/ready', readyHandler);

// Route registry (dev-only)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_ROUTE_REGISTRY === '1') {
  v1Router.get('/routes', createRoutesHandler(app));
}

// Mount v1 route modules
v1Router.get('/system-tools', systemToolsHandler);
v1Router.use('/adb', adbRouter);
v1Router.use('/adb/advanced', adbAdvancedRouter);
v1Router.use('/frp', frpRouter);
v1Router.use('/mdm', mdmRouter);
v1Router.use('/ios', iosRouter);
v1Router.use('/ios/dfu', iosDFURouter);
v1Router.use('/ios/libimobiledevice', iosLibimobiledeviceRouter);
v1Router.use('/monitor', monitorRouter);
v1Router.use('/monitor/performance', performanceMonitorRouter);
v1Router.use('/tests', testsRouter);
v1Router.use('/diagnostics', diagnosticsRouter);
v1Router.use('/firmware', firmwareRouter);
v1Router.use('/bootforgeusb', bootforgeusbRouter);
v1Router.use('/standards', standardsRouter);
v1Router.use('/hotplug', hotplugRouter);

// Security endpoints
v1Router.use('/security/root-detection', rootDetectionRouter);
v1Router.use('/security/bootloader-status', bootloaderStatusRouter);

// Catalog, operations routers
v1Router.use('/catalog', catalogRouter);
v1Router.use('/operations', operationsRouter);

// Destructive/sensitive operations with rate limiting
v1Router.use('/fastboot', rateLimiter('fastboot'), fastbootRouter);
v1Router.use('/flash', rateLimiter('flash'), flashRouter);
v1Router.use('/flash/odin', rateLimiter('flash'), odinRouter);
v1Router.use('/flash/mtk', rateLimiter('flash'), mtkRouter);
v1Router.use('/flash/edl', rateLimiter('flash'), edlRouter);
v1Router.use('/authorization', rateLimiter('authorization'), authorizationRouter);

// Trapdoor router with rate limiting and authentication
v1Router.use('/trapdoor', rateLimiter('trapdoor'), requireTrapdoorPasscode, trapdoorRouter);

// Mount v1 router
app.use('/api/v1', v1Router);

const authTriggers = new AuthorizationTriggers();

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/device-events' });
const wssCorrelation = new WebSocketServer({ server, path: '/ws/correlation' });
const wssAnalytics = new WebSocketServer({ server, path: '/ws/analytics' });

const clients = new Set();
const correlationClients = new Set();
const analyticsClients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected (device-events)');
  clients.add(ws);

  const interval = DEMO_MODE
    ? setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          const isConnect = Math.random() > 0.5;
          const platforms = ['android', 'ios', 'unknown'];
          const platform = platforms[Math.floor(Math.random() * platforms.length)];
          const deviceId = `device-${Math.random().toString(36).substr(2, 9)}`;

          const correlationId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          ws.send(JSON.stringify({
            type: isConnect ? 'connected' : 'disconnected',
            device_uid: deviceId,
            platform_hint: platform,
            mode: isConnect ? 'Normal OS (Confirmed)' : 'Disconnected',
            confidence: 0.85 + Math.random() * 0.15,
            timestamp: Date.now(),
            serverTs: new Date().toISOString(),
            apiVersion: 'v1',
            correlationId,
            display_name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Device`,
            matched_tool_ids: Math.random() > 0.5 ? [deviceId] : [],
            correlation_badge: Math.random() > 0.5 ? 'CORRELATED' : 'LIKELY'
          }));
        }
      }, 8000)
    : null;

  if (DEMO_MODE) {
    ws.send(
      JSON.stringify({
        type: 'connected',
        device_uid: 'demo-device-001',
        platform_hint: 'android',
        mode: 'Normal OS (Confirmed)',
        confidence: 0.95,
        timestamp: Date.now(),
        serverTs: new Date().toISOString(),
        apiVersion: 'v1',
        correlationId: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        display_name: 'Demo Android Device',
        matched_tool_ids: ['ABC123XYZ'],
        correlation_badge: 'CORRELATED',
        correlation_notes: ['Per-device correlation present']
      })
    );
  }

  ws.on('close', () => {
    console.log('WebSocket client disconnected (device-events)');
    clients.delete(ws);
    if (interval) clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
    if (interval) clearInterval(interval);
  });
});

wssCorrelation.on('connection', (ws) => {
  console.log('WebSocket client connected (correlation tracking)');
  correlationClients.add(ws);

  // Send hello message with version info
  ws.send(JSON.stringify({
    type: 'hello',
    apiVersion: 'v1',
    serverTs: new Date().toISOString(),
    correlationId: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }));

  const interval = DEMO_MODE
    ? setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          const eventType = Math.random();
          const platforms = ['android', 'ios'];
          const platform = platforms[Math.floor(Math.random() * platforms.length)];
          const deviceId = `device-${Math.random().toString(36).substr(2, 9)}`;
          const confidence = 0.75 + Math.random() * 0.25;
          const hasMatchedIds = Math.random() > 0.4;

          const badges = ['CORRELATED', 'CORRELATED (WEAK)', 'SYSTEM-CONFIRMED', 'LIKELY', 'UNCONFIRMED'];
          let badge;
          let matchedIds = [];
          let notes = [];

          if (hasMatchedIds && confidence >= 0.90) {
            badge = 'CORRELATED';
            matchedIds = [deviceId, `${platform}-${deviceId}`];
            notes = ['Per-device correlation present (matched tool ID(s)).'];
          } else if (hasMatchedIds) {
            badge = 'CORRELATED (WEAK)';
            matchedIds = [deviceId];
            notes = ['Matched tool ID(s) present, but mode not strongly confirmed.'];
          } else if (confidence >= 0.90) {
            badge = 'SYSTEM-CONFIRMED';
            notes = ['System-level confirmation exists, but not mapped to this specific USB record.'];
          } else if (confidence >= 0.75) {
            badge = 'LIKELY';
            notes = [];
          } else {
            badge = 'UNCONFIRMED';
            notes = [];
          }

          if (eventType < 0.33) {
            ws.send(
              JSON.stringify({
                type: 'device_connected',
                deviceId: deviceId,
                device: {
                  id: deviceId,
                  serial: Math.random() > 0.3 ? deviceId.substring(0, 10).toUpperCase() : undefined,
                  platform: platform,
                  mode: `confirmed_${platform}_os`,
                  confidence: confidence,
                  correlationBadge: badge,
                  matchedIds: matchedIds,
                  correlationNotes: notes,
                  vendorId: platform === 'android' ? 0x18d1 : 0x05ac,
                  productId: platform === 'android' ? 0x4ee7 : 0x12a8
                },
                timestamp: Date.now()
              })
            );
          } else if (eventType < 0.66) {
            ws.send(
              JSON.stringify({
                type: 'correlation_update',
                deviceId: deviceId,
                device: {
                  correlationBadge: badge,
                  matchedIds: matchedIds,
                  confidence: confidence,
                  correlationNotes: notes
                },
                timestamp: Date.now()
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: 'device_disconnected',
                deviceId: deviceId,
                timestamp: Date.now()
              })
            );
          }
        }
      }, 5000)
    : null;

  if (DEMO_MODE) {
    ws.send(
      JSON.stringify({
        type: 'batch_update',
        devices: [
          {
            id: 'demo-android-001',
            serial: 'ABC123XYZ',
            platform: 'android',
            mode: 'confirmed_android_os',
            confidence: 0.95,
            correlationBadge: 'CORRELATED',
            matchedIds: ['ABC123XYZ', 'adb-ABC123XYZ'],
            correlationNotes: ['Per-device correlation present (matched tool ID(s)).'],
            vendorId: 0x18d1,
            productId: 0x4ee7
          }
        ],
        timestamp: Date.now()
      })
    );
  }
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
          serverTs: new Date().toISOString(),
          apiVersion: 'v1',
          correlationId: message.correlationId || `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }
    } catch (error) {
      console.error('Failed to parse correlation WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected (correlation tracking)');
    correlationClients.delete(ws);
    if (interval) clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error (correlation):', error);
    correlationClients.delete(ws);
    if (interval) clearInterval(interval);
  });
});

// Analytics WebSocket for Live Analytics Dashboard
wssAnalytics.on('connection', (ws) => {
  console.log('WebSocket client connected (live analytics)');
  analyticsClients.add(ws);

  // Send hello message with version info
  ws.send(JSON.stringify({
    type: 'hello',
    apiVersion: 'v1',
    serverTs: new Date().toISOString(),
    correlationId: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }));

  const analyticsInterval = DEMO_MODE
    ? (() => {
        const mockDevices = [
          {
            deviceId: 'device-001',
            deviceName: 'Android Test Device',
            platform: 'android',
            status: 'online',
            cpuUsage: 45,
            memoryUsage: 62,
            storageUsage: 78,
            temperature: 42,
            batteryLevel: 85,
            networkLatency: 15,
            workflows: { running: 1, completed: 5, failed: 0 }
          },
          {
            deviceId: 'device-002',
            deviceName: 'iOS Test Device',
            platform: 'ios',
            status: 'online',
            cpuUsage: 32,
            memoryUsage: 54,
            storageUsage: 65,
            temperature: 38,
            batteryLevel: 92,
            networkLatency: 12,
            workflows: { running: 0, completed: 3, failed: 0 }
          }
        ];

        mockDevices.forEach(device => {
          ws.send(
            JSON.stringify({
              type: 'device_metrics',
              deviceId: device.deviceId,
              metrics: device
            })
          );
        });

        return setInterval(() => {
          if (ws.readyState === ws.OPEN) {
            mockDevices.forEach(device => {
              const updatedMetrics = {
                ...device,
                cpuUsage: Math.max(5, Math.min(95, device.cpuUsage + (Math.random() - 0.5) * 10)),
                memoryUsage: Math.max(10, Math.min(90, device.memoryUsage + (Math.random() - 0.5) * 5)),
                temperature: Math.max(30, Math.min(70, device.temperature + (Math.random() - 0.5) * 2)),
                networkLatency: Math.max(5, Math.min(100, device.networkLatency + (Math.random() - 0.5) * 10))
              };

              const correlationId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              ws.send(
                JSON.stringify({
                  type: 'device_metrics',
                  deviceId: device.deviceId,
                  metrics: updatedMetrics,
                  timestamp: Date.now(),
                  serverTs: new Date().toISOString(),
                  apiVersion: 'v1',
                  correlationId
                })
              );

              Object.assign(device, updatedMetrics);
            });

            if (Math.random() > 0.7) {
              const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
              const correlationId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              ws.send(
                JSON.stringify({
                  type: 'workflow_event',
                  event: {
                    id: `workflow-${Date.now()}`,
                    workflowName: ['ADB Diagnostics', 'Battery Health Check', 'Storage Analysis'][
                      Math.floor(Math.random() * 3)
                    ],
                    deviceId: device.deviceId,
                    status: ['started', 'running', 'completed'][Math.floor(Math.random() * 3)],
                    progress: Math.floor(Math.random() * 100),
                    currentStep: ['Initializing', 'Running diagnostics', 'Collecting data', 'Analyzing results'][
                      Math.floor(Math.random() * 4)
                    ]
                  },
                  timestamp: Date.now(),
                  serverTs: new Date().toISOString(),
                  apiVersion: 'v1',
                  correlationId
                })
              );
            }
          }
        }, 2000);
      })()
    : null;

  ws.on('close', () => {
    console.log('WebSocket client disconnected (live analytics)');
    analyticsClients.delete(ws);
    if (analyticsInterval) clearInterval(analyticsInterval);
  });

  ws.on('error', (error) => {
    console.error('Analytics WebSocket error:', error);
    analyticsClients.delete(ws);
    if (analyticsInterval) clearInterval(analyticsInterval);
  });
});

function broadcastCorrelation(message) {
  const data = JSON.stringify({
    ...message,
    timestamp: Date.now()
  });
  
  for (const client of correlationClients) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

const IS_WINDOWS = process.platform === 'win32';

function uniqueNonEmptyStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function getAndroidToolDiagnostics(toolBaseName) {
  const exeName = IS_WINDOWS ? `${toolBaseName}.exe` : toolBaseName;
  const envVar = `${toolBaseName.toUpperCase()}_PATH`;

  const androidHome = process.env.ANDROID_HOME || null;
  const androidSdkRoot = process.env.ANDROID_SDK_ROOT || null;
  const explicitPath = process.env[envVar] || null;
  const localAppData = process.env.LOCALAPPDATA || null;
  const userProfile = process.env.USERPROFILE || null;

  const candidateDirs = uniqueNonEmptyStrings([
    getManagedPlatformToolsDir(),
    androidHome ? path.join(androidHome, 'platform-tools') : null,
    androidSdkRoot ? path.join(androidSdkRoot, 'platform-tools') : null,
    localAppData ? path.join(localAppData, 'Android', 'Sdk', 'platform-tools') : null,
    userProfile ? path.join(userProfile, 'AppData', 'Local', 'Android', 'Sdk', 'platform-tools') : null,
    IS_WINDOWS ? 'C:\\Android\\platform-tools' : null
  ]);

  const searchedPaths = candidateDirs.map(dir => path.join(dir, exeName));

  const resolvedFromSdk = searchedPaths.find(p => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }) || null;

  const resolvedFromExplicit = explicitPath && (() => {
    try {
      return fs.existsSync(explicitPath) ? explicitPath : null;
    } catch {
      return null;
    }
  })();

  return {
    platform: process.platform,
    tool: toolBaseName,
    env: {
      ANDROID_HOME: androidHome,
      ANDROID_SDK_ROOT: androidSdkRoot,
      [envVar]: explicitPath
    },
    searchedPaths,
    resolvedPath: resolvedFromExplicit || resolvedFromSdk
  };
}

function resolveToolPath(toolBaseName) {
  return getAndroidToolDiagnostics(toolBaseName).resolvedPath;
}

function getToolCommand(toolBaseName) {
  const resolvedPath = resolveToolPath(toolBaseName);
  if (resolvedPath) {
    return `"${resolvedPath}"`;
  }
  return toolBaseName;
}

function parseUsbVidPidFromPnpDeviceId(pnpDeviceId) {
  if (!pnpDeviceId) return { vid: null, pid: null };
  const vidMatch = pnpDeviceId.match(/VID_([0-9A-Fa-f]{4})/);
  const pidMatch = pnpDeviceId.match(/PID_([0-9A-Fa-f]{4})/);
  return {
    vid: vidMatch ? vidMatch[1].toLowerCase() : null,
    pid: pidMatch ? pidMatch[1].toLowerCase() : null
  };
}

function getConnectedUsbDevices() {
  if (!IS_WINDOWS) {
    return [];
  }

  const ps = [
    "$ErrorActionPreference='SilentlyContinue'",
    "$devs = Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPDeviceID -like 'USB\\VID_*' -and $_.Status -eq 'OK' } | Select-Object Name, PNPDeviceID, Manufacturer",
    "$devs | ConvertTo-Json -Compress"
  ].join('; ');

  const raw = safeExec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${ps}"`);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items
      .filter(Boolean)
      .map(d => {
        const name = d.Name || null;
        const pnpDeviceId = d.PNPDeviceID || null;
        const manufacturer = d.Manufacturer || null;
        const { vid, pid } = parseUsbVidPidFromPnpDeviceId(pnpDeviceId);
        return {
          name,
          manufacturer,
          pnpDeviceId,
          vid,
          pid
        };
      })
      .filter(d => d.pnpDeviceId || d.name);
  } catch {
    return [];
  }
}

function parseAdbDevicesList(devicesRaw) {
  const lines = devicesRaw?.split('\n').slice(1).filter(l => l.trim()) || [];
  return lines
    .map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const state = parts[1];
      const infoStr = parts.slice(2).join(' ');
      return {
        serial,
        state,
        info: infoStr
      };
    })
    .filter(d => d.serial && d.state);
}

function parseFastbootDevicesList(devicesRaw) {
  const lines = devicesRaw?.split('\n').filter(l => l.trim()) || [];
  return lines
    .map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const mode = parts[1] || 'fastboot';
      return {
        serial,
        mode
      };
    })
    .filter(d => d.serial);
}

function commandExists(cmd) {
  const resolvedPath = resolveToolPath(cmd);
  if (resolvedPath) {
    return true;
  }

  try {
    if (IS_WINDOWS) {
      execSync(`where ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    } else {
      execSync(`command -v ${cmd}`, { stdio: "ignore", timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

function getBootForgeUsbCommand() {
  const candidates = ['bootforgeusb', 'bootforgeusb-cli'];
  for (const candidate of candidates) {
    if (commandExists(candidate)) return candidate;
  }
  return null;
}

function runBootForgeUsbScanJson() {
  const cmd = getBootForgeUsbCommand();
  if (!cmd) {
    const err = new Error('BootForgeUSB CLI tool is not installed or not in PATH');
    err.code = 'CLI_NOT_FOUND';
    throw err;
  }

  // New CLI expects: `bootforgeusb scan --json`.
  // If an older/alternate binary exists, prefer it only when detected by getBootForgeUsbCommand.
  const args = cmd === 'bootforgeusb' ? 'scan --json' : '';
  const output = execSync(`${cmd}${args ? ` ${args}` : ''}`, {
    encoding: 'utf-8',
    timeout: 10000,
    maxBuffer: 10 * 1024 * 1024
  });

  const devices = JSON.parse(output);
  return { cmd, devices };
}

// Trapdoor authentication moved to middleware/trapdoor-auth.js

// Legacy /api/health endpoint (deprecated - use /api/v1/health)
app.get('/api/health', (req, res) => {
  res.sendEnvelope({ status: 'ok', healthy: true, deprecated: true, migrateTo: '/api/v1/health' });
});

app.get('/api/system-tools', (req, res) => {
  const rustVersion = safeExec("rustc --version");
  const cargoVersion = safeExec("cargo --version");
  const nodeVersion = safeExec("node --version");
  const npmVersion = safeExec("npm --version");
  const pythonVersion = safeExec("python3 --version");
  const pipVersion = safeExec("pip3 --version");
  const gitVersion = safeExec("git --version");
  const dockerVersion = safeExec("docker --version");
  
  const adbDiagnostics = getAndroidToolDiagnostics('adb');
  const fastbootDiagnostics = getAndroidToolDiagnostics('fastboot');
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");
  
  let adbDevices = null;
  let adbVersion = null;
  if (adbInstalled) {
    const adbCmd = getToolCommand('adb');
    adbDevices = safeExec(`${adbCmd} devices`);
    adbVersion = safeExec(`${adbCmd} --version`);
  }
  
  let fastbootDevices = null;
  if (fastbootInstalled) {
    const fastbootCmd = getToolCommand('fastboot');
    fastbootDevices = safeExec(`${fastbootCmd} devices`);
  }

  const tools = {
    rust: {
      installed: !!rustVersion,
      version: rustVersion,
      cargo: cargoVersion
    },
    node: {
      installed: !!nodeVersion,
      version: nodeVersion,
      npm: npmVersion
    },
    python: {
      installed: !!pythonVersion,
      version: pythonVersion,
      pip: pipVersion
    },
    git: {
      installed: !!gitVersion,
      version: gitVersion
    },
    docker: {
      installed: !!dockerVersion,
      version: dockerVersion
    },
    adb: {
      installed: adbInstalled,
      version: adbVersion,
      devices_raw: adbDevices,
      resolvedPath: adbDiagnostics.resolvedPath,
      diagnostics: adbInstalled ? undefined : adbDiagnostics
    },
    fastboot: {
      installed: fastbootInstalled,
      devices_raw: fastbootDevices,
      resolvedPath: fastbootDiagnostics.resolvedPath,
      diagnostics: fastbootInstalled ? undefined : fastbootDiagnostics
    }
  };

  res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.CODESPACES ? 'codespaces' : 'local',
    tools
  });
});

app.get('/api/system-tools/rust', (req, res) => {
  const rustVersion = safeExec("rustc --version");
  const cargoVersion = safeExec("cargo --version");
  const rustupVersion = safeExec("rustup --version");
  
  res.json({
    installed: !!rustVersion,
    rustc: rustVersion,
    cargo: cargoVersion,
    rustup: rustupVersion
  });
});

app.get('/api/system-tools/android', (req, res) => {
  const adbDiagnostics = getAndroidToolDiagnostics('adb');
  const fastbootDiagnostics = getAndroidToolDiagnostics('fastboot');
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");
  
  let adbDevices = null;
  let adbVersion = null;
  if (adbInstalled) {
    const adbCmd = getToolCommand('adb');
    adbDevices = safeExec(`${adbCmd} devices`);
    adbVersion = safeExec(`${adbCmd} --version`);
  }
  
  let fastbootDevices = null;
  if (fastbootInstalled) {
    const fastbootCmd = getToolCommand('fastboot');
    fastbootDevices = safeExec(`${fastbootCmd} devices`);
  }
  
  res.json({
    adb: {
      installed: adbInstalled,
      version: adbVersion,
      devices_raw: adbDevices,
      resolvedPath: adbDiagnostics.resolvedPath,
      diagnostics: adbInstalled ? undefined : adbDiagnostics
    },
    fastboot: {
      installed: fastbootInstalled,
      devices_raw: fastbootDevices,
      resolvedPath: fastbootDiagnostics.resolvedPath,
      diagnostics: fastbootInstalled ? undefined : fastbootDiagnostics
    },
    managed: {
      platformToolsDir: getManagedPlatformToolsDir(),
      hint: (!adbInstalled || !fastbootInstalled)
        ? 'Call POST /api/system-tools/android/ensure to download Google platform-tools into the managed tools folder (no PATH required).'
        : undefined
    }
  });
});

app.post('/api/system-tools/android/ensure', async (req, res) => {
  try {
    const result = await ensureManagedPlatformTools();

    const adbDiagnostics = getAndroidToolDiagnostics('adb');
    const fastbootDiagnostics = getAndroidToolDiagnostics('fastboot');
    const adbInstalled = commandExists('adb');
    const fastbootInstalled = commandExists('fastboot');

    res.json({
      ok: true,
      result,
      adb: {
        installed: adbInstalled,
        resolvedPath: adbDiagnostics.resolvedPath,
        version: adbInstalled ? safeExec(`${getToolCommand('adb')} --version`) : null
      },
      fastboot: {
        installed: fastbootInstalled,
        resolvedPath: fastbootDiagnostics.resolvedPath
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error?.message || String(error),
      managed: {
        platformToolsDir: getManagedPlatformToolsDir()
      }
    });
  }
});

app.get('/api/system-tools/python', (req, res) => {
  const pythonVersion = safeExec("python3 --version");
  const pipVersion = safeExec("pip3 --version");
  const python2Version = safeExec("python --version");
  
  res.json({
    installed: !!pythonVersion,
    python3: pythonVersion,
    python2: python2Version,
    pip: pipVersion
  });
});

app.get('/api/system-info', (req, res) => {
  const osInfo = safeExec("uname -a");
  const cpuInfo = safeExec("lscpu | grep 'Model name' | cut -d':' -f2");
  const memInfo = safeExec("free -h | grep 'Mem:' | awk '{print $2}'");
  const diskInfo = safeExec("df -h / | tail -1 | awk '{print $2}'");
  const uptime = safeExec("uptime -p");
  const hostname = safeExec("hostname");
  const kernel = safeExec("uname -r");
  
  const usbDevicesCount = safeExec("lsusb 2>/dev/null | wc -l");
  const pciDevicesCount = safeExec("lspci 2>/dev/null | wc -l");
  
  res.json({
    os: osInfo,
    hostname: hostname,
    kernel: kernel,
    cpu: cpuInfo?.trim(),
    memory: memInfo?.trim(),
    disk: diskInfo?.trim(),
    uptime: uptime,
    hardware: {
      usbDevices: usbDevicesCount ? parseInt(usbDevicesCount) : 0,
      pciDevices: pciDevicesCount ? parseInt(pciDevicesCount) : 0
    }
  });
});

app.get('/api/adb/devices', (req, res) => {
  if (!commandExists("adb")) {
    return res.status(404).json({
      error: "ADB not installed",
      hint: "Install Android SDK Platform Tools, ensure adb is on PATH, or set ADB_PATH / ANDROID_HOME / ANDROID_SDK_ROOT.",
      diagnostics: getAndroidToolDiagnostics('adb')
    });
  }
  
  const adbCmd = getToolCommand('adb');
  const devicesRaw = safeExec(`${adbCmd} devices -l`);
  const lines = devicesRaw?.split('\n').slice(1).filter(l => l.trim()) || [];
  
  const devices = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const serial = parts[0];
    const state = parts[1];
    const infoStr = parts.slice(2).join(' ');
    
    const product = infoStr.match(/product:(\S+)/)?.[1] || null;
    const model = infoStr.match(/model:(\S+)/)?.[1] || null;
    const device = infoStr.match(/device:(\S+)/)?.[1] || null;
    const transport = infoStr.match(/transport_id:(\d+)/)?.[1] || null;
    
    let deviceMode = 'unknown';
    let bootloaderMode = null;
    let deviceProperties = {};
    
    if (state === 'device') {
      deviceMode = 'android_os';
      const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
      if (props) {
        const manufacturer = props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1];
        const brand = props.match(/\[ro\.product\.brand\]:\s*\[(.*?)\]/)?.[1];
        const modelProp = props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1];
        const androidVersion = props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1];
        const sdkVersion = props.match(/\[ro\.build\.version\.sdk\]:\s*\[(.*?)\]/)?.[1];
        const buildId = props.match(/\[ro\.build\.id\]:\s*\[(.*?)\]/)?.[1];
        const bootloader = props.match(/\[ro\.boot\.bootloader\]:\s*\[(.*?)\]/)?.[1];
        const secureMode = props.match(/\[ro\.secure\]:\s*\[(.*?)\]/)?.[1];
        const debuggable = props.match(/\[ro\.debuggable\]:\s*\[(.*?)\]/)?.[1];
        
        deviceProperties = {
          manufacturer,
          brand,
          model: modelProp,
          androidVersion,
          sdkVersion,
          buildId,
          bootloader,
          secure: secureMode === '1',
          debuggable: debuggable === '1'
        };
      }
    } else if (state === 'recovery') {
      deviceMode = 'recovery';
    } else if (state === 'sideload') {
      deviceMode = 'sideload';
    } else if (state === 'unauthorized') {
      deviceMode = 'unauthorized';
    } else if (state === 'offline') {
      deviceMode = 'offline';
    } else if (state === 'bootloader') {
      deviceMode = 'bootloader';
    }
    
    return {
      serial,
      state,
      deviceMode,
      bootloaderMode,
      product,
      model,
      device,
      transportId: transport,
      properties: deviceProperties,
      info: infoStr
    };
  }).filter(d => d.serial && d.state);
  
  res.json({
    count: devices.length,
    devices,
    adb: {
      installed: true,
      resolvedPath: resolveToolPath('adb'),
      command: adbCmd
    },
    devices_raw: devicesRaw,
    hint: devices.length === 0
      ? 'ADB is installed but no devices were detected. Ensure USB debugging is enabled, approve the USB debugging prompt, use a data-capable cable, and install the OEM ADB driver (Motorola/Google) so Device Manager shows an ADB Interface.'
      : undefined,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/devices/scan', (req, res) => {
  const scanned = [];
  const seenUids = new Set();

  const adbInstalled = commandExists('adb');
  const fastbootInstalled = commandExists('fastboot');

  if (adbInstalled) {
    const adbCmd = getToolCommand('adb');
    const adbRaw = safeExec(`${adbCmd} devices -l`);
    const adbDevices = parseAdbDevicesList(adbRaw);
    for (const d of adbDevices) {
      const uid = `adb-${d.serial}`;
      seenUids.add(uid);
      scanned.push({
        device_uid: uid,
        platform_hint: 'android',
        mode: d.state === 'device' ? 'Normal OS (Confirmed)' : d.state,
        confidence: d.state === 'device' ? 0.95 : (d.state === 'unauthorized' ? 0.80 : 0.70),
        evidence: {
          source: 'adb',
          serial: d.serial,
          state: d.state,
          info: d.info
        },
        matched_tool_ids: [d.serial, uid],
        correlation_badge: d.state === 'device' ? 'SYSTEM-CONFIRMED' : 'UNCONFIRMED',
        display_name: d.serial
      });
    }
  }

  if (fastbootInstalled) {
    const fastbootCmd = getToolCommand('fastboot');
    const fastbootRaw = safeExec(`${fastbootCmd} devices`);
    const fastbootDevices = parseFastbootDevicesList(fastbootRaw);
    for (const d of fastbootDevices) {
      const uid = `fastboot-${d.serial}`;
      if (seenUids.has(uid) || seenUids.has(`adb-${d.serial}`)) continue;
      seenUids.add(uid);
      scanned.push({
        device_uid: uid,
        platform_hint: 'android',
        mode: 'bootloader',
        confidence: 0.90,
        evidence: {
          source: 'fastboot',
          serial: d.serial,
          mode: d.mode
        },
        matched_tool_ids: [d.serial, uid],
        correlation_badge: 'SYSTEM-CONFIRMED',
        display_name: d.serial
      });
    }
  }

  const usbDevices = getConnectedUsbDevices();
  for (const d of usbDevices) {
    const key = d.pnpDeviceId || d.name;
    const uid = `usb-${Buffer.from(String(key)).toString('base64').replace(/=+$/g, '')}`;
    if (seenUids.has(uid)) continue;
    seenUids.add(uid);
    scanned.push({
      device_uid: uid,
      platform_hint: 'unknown',
      mode: 'usb_connected',
      confidence: 0.50,
      evidence: {
        source: 'usb',
        name: d.name,
        manufacturer: d.manufacturer,
        pnpDeviceId: d.pnpDeviceId,
        vid: d.vid,
        pid: d.pid
      },
      matched_tool_ids: [uid],
      correlation_badge: 'UNCONFIRMED',
      display_name: d.name || d.pnpDeviceId || uid
    });
  }

  res.json({
    devices: scanned,
    count: scanned.length,
    tools: {
      adb: {
        installed: adbInstalled,
        resolvedPath: resolveToolPath('adb')
      },
      fastboot: {
        installed: fastbootInstalled,
        resolvedPath: resolveToolPath('fastboot')
      }
    },
    hint: scanned.length === 0
      ? 'No devices detected. If you are on Windows and your phone shows only as a Portable Device (MTP), install the OEM ADB driver and enable USB debugging to make it appear as an ADB Interface.'
      : undefined,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/adb/trigger-auth', (req, res) => {
  if (!commandExists("adb")) {
    return res.status(404).json({ 
      success: false,
      message: "ADB not installed on system" 
    });
  }
  
  const { serial } = req.body;
  const adbCmd = getToolCommand('adb');

  const resolveSerial = (inputSerial) => {
    if (inputSerial) return inputSerial;
    const devicesRaw = safeExec(`${adbCmd} devices -l`);
    const devices = parseAdbDevicesList(devicesRaw);
    if (devices.length === 1) {
      return devices[0].serial;
    }
    return null;
  };

  const resolvedSerial = resolveSerial(serial);
  if (!resolvedSerial) {
    const devicesRaw = safeExec(`${adbCmd} devices -l`);
    const devices = parseAdbDevicesList(devicesRaw);
    return res.json({
      success: false,
      message: "Device serial is required",
      availableSerials: devices.map(d => d.serial),
      devices_raw: devicesRaw,
      hint: devices.length === 0
        ? "No ADB devices detected. If your phone shows only as a Portable Device (MTP) in Device Manager, you still need an ADB driver/interface and USB debugging enabled."
        : "Multiple devices detected. Pick a serial from availableSerials and retry."
    });
  }
  
  try {
    execSync(`${adbCmd} -s ${resolvedSerial} shell echo "auth_trigger" 2>&1`, { 
      encoding: "utf-8", 
      timeout: 3000 
    });
    
    res.json({
      success: true,
      message: "Authorization request sent. Check your device for the USB debugging dialog.",
      serial: resolvedSerial
    });
  } catch (error) {
    const errorMessage = error.stderr?.toString() || error.message || 'Unknown error';
    
    if (errorMessage.includes('unauthorized')) {
      res.json({
        success: true,
        message: "Authorization dialog triggered on device. Please check your phone and tap 'Allow'.",
        serial: resolvedSerial,
        note: "Device is unauthorized - this is expected. The prompt should appear on the device."
      });
    } else if (errorMessage.includes('device offline')) {
      res.status(400).json({
        success: false,
        message: "Device is offline. Please check USB connection.",
        serial: resolvedSerial
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to trigger authorization: ${errorMessage}`,
        serial: resolvedSerial
      });
    }
  }
});

app.get('/api/fastboot/devices', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const fastbootCmd = getToolCommand('fastboot');
  
  const devicesRaw = safeExec(`${fastbootCmd} devices`);
  const lines = devicesRaw?.split('\n').filter(l => l.trim()) || [];
  
  const devices = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const serial = parts[0];
    const mode = parts[1] || 'fastboot';
    
    let deviceInfo = {};
    const productOutput = safeExec(`${fastbootCmd} -s ${serial} getvar product 2>&1`);
    const variantOutput = safeExec(`${fastbootCmd} -s ${serial} getvar variant 2>&1`);
    const bootloaderOutput = safeExec(`${fastbootCmd} -s ${serial} getvar version-bootloader 2>&1`);
    const basebandOutput = safeExec(`${fastbootCmd} -s ${serial} getvar version-baseband 2>&1`);
    const serialnoOutput = safeExec(`${fastbootCmd} -s ${serial} getvar serialno 2>&1`);
    const secureOutput = safeExec(`${fastbootCmd} -s ${serial} getvar secure 2>&1`);
    const unlockStateOutput = safeExec(`${fastbootCmd} -s ${serial} getvar unlocked 2>&1`);
    
    const extractValue = (output) => {
      if (!output) return null;
      const match = output.match(/:\s*(.+)/);
      return match ? match[1].trim() : null;
    };
    
    const product = extractValue(productOutput);
    const variant = extractValue(variantOutput);
    const bootloaderVersion = extractValue(bootloaderOutput);
    const basebandVersion = extractValue(basebandOutput);
    const serialNumber = extractValue(serialnoOutput);
    const secure = extractValue(secureOutput);
    const unlocked = extractValue(unlockStateOutput);
    
    let bootloaderState = 'unknown';
    if (unlocked === 'yes' || unlocked === 'true') {
      bootloaderState = 'unlocked';
    } else if (unlocked === 'no' || unlocked === 'false') {
      bootloaderState = 'locked';
    }
    
    const isSecure = secure === 'yes' || secure === 'true';
    
    deviceInfo = {
      product,
      variant,
      bootloaderVersion,
      basebandVersion,
      serialNumber,
      secure: isSecure,
      unlocked: bootloaderState === 'unlocked',
      bootloaderState
    };
    
    return {
      serial,
      mode,
      deviceMode: 'bootloader',
      bootloaderMode: mode,
      properties: deviceInfo
    };
  }).filter(d => d.serial);
  
  res.json({
    count: devices.length,
    devices,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/android-devices/all', async (req, res) => {
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");

  const adbCmd = getToolCommand('adb');
  const fastbootCmd = getToolCommand('fastboot');
  
  let adbDevices = [];
  let fastbootDevices = [];
  
  if (adbInstalled) {
    const devicesRaw = safeExec(`${adbCmd} devices -l`);
    const lines = devicesRaw?.split('\n').slice(1).filter(l => l.trim()) || [];
    
    adbDevices = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const state = parts[1];
      const infoStr = parts.slice(2).join(' ');
      
      const product = infoStr.match(/product:(\S+)/)?.[1] || null;
      const model = infoStr.match(/model:(\S+)/)?.[1] || null;
      const device = infoStr.match(/device:(\S+)/)?.[1] || null;
      
      let deviceMode = 'unknown';
      if (state === 'device') deviceMode = 'android_os';
      else if (state === 'recovery') deviceMode = 'recovery';
      else if (state === 'sideload') deviceMode = 'sideload';
      else if (state === 'unauthorized') deviceMode = 'unauthorized';
      else if (state === 'offline') deviceMode = 'offline';
      else if (state === 'bootloader') deviceMode = 'bootloader';
      
      let deviceProperties = {};
      if (state === 'device') {
        const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
        if (props) {
          const manufacturer = props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1];
          const brand = props.match(/\[ro\.product\.brand\]:\s*\[(.*?)\]/)?.[1];
          const modelProp = props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1];
          const androidVersion = props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1];
          
          deviceProperties = {
            manufacturer,
            brand,
            model: modelProp,
            androidVersion
          };
        }
      }
      
      return {
        id: `adb-${serial}`,
        serial,
        state,
        deviceMode,
        source: 'adb',
        product,
        model,
        device,
        properties: deviceProperties
      };
    }).filter(d => d.serial && d.state);
  }
  
  if (fastbootInstalled) {
    const devicesRaw = safeExec(`${fastbootCmd} devices`);
    const lines = devicesRaw?.split('\n').filter(l => l.trim()) || [];
    
    fastbootDevices = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const mode = parts[1] || 'fastboot';
      
      return {
        id: `fastboot-${serial}`,
        serial,
        state: mode,
        deviceMode: 'bootloader',
        bootloaderMode: mode,
        source: 'fastboot',
        properties: {}
      };
    }).filter(d => d.serial);
  }
  
  const allDevices = [...adbDevices, ...fastbootDevices];
  
  const uniqueDevices = allDevices.reduce((acc, device) => {
    const existing = acc.find(d => d.serial === device.serial);
    if (!existing) {
      acc.push(device);
    } else if (device.source === 'adb' && existing.source === 'fastboot') {
      Object.assign(existing, device);
    }
    return acc;
  }, []);
  
  res.json({
    count: uniqueDevices.length,
    devices: uniqueDevices,
    sources: {
      adb: {
        available: adbInstalled,
        count: adbDevices.length
      },
      fastboot: {
        available: fastbootInstalled,
        count: fastbootDevices.length
      }
    },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/adb/command', (req, res) => {
  if (!commandExists("adb")) {
    return res.status(404).json({ error: "ADB not installed" });
  }
  
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "Command required" });
  }
  
  const allowedCommands = ['devices', 'shell getprop', 'get-state', 'get-serialno'];
  const isAllowed = allowedCommands.some(cmd => command.startsWith(cmd));
  
  if (!isAllowed) {
    return res.status(403).json({ error: "Command not allowed for security reasons" });
  }
  
  const output = safeExec(`adb ${command}`);
  res.json({ output });
});

app.post('/api/network/scan', async (req, res) => {
  try {
    const devices = [];
    
    if (commandExists('arp')) {
      const arpOutput = safeExec('arp -a');
      if (arpOutput) {
        const lines = arpOutput.split('\n');
        for (const line of lines) {
          const match = line.match(/\(([\d.]+)\)\s+at\s+([\w:]+)/);
          if (match) {
            devices.push({
              ip: match[1],
              mac: match[2],
              hostname: null,
              vendor: null,
              ports: [],
              services: []
            });
          }
        }
      }
    }
    
    if (commandExists('ip')) {
      const neighbors = safeExec('ip neigh show');
      if (neighbors) {
        const lines = neighbors.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[0].match(/\d+\.\d+\.\d+\.\d+/)) {
            const existing = devices.find(d => d.ip === parts[0]);
            if (!existing) {
              devices.push({
                ip: parts[0],
                mac: parts[4],
                hostname: null,
                vendor: null,
                ports: [],
                services: []
              });
            }
          }
        }
      }
    }
    
    res.json({
      devices,
      count: devices.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Network scan error:', error);
    res.status(500).json({ error: 'Network scan failed' });
  }
});

app.get('/api/fastboot/device-info', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const { serial } = req.query;
  if (!serial) {
    return res.status(400).json({ error: "Serial number required" });
  }

  try {
    const extractValue = (output) => {
      if (!output) return null;
      const match = output.match(/:\s*(.+)/);
      return match ? match[1].trim() : null;
    };

    const product = extractValue(safeExec(`fastboot -s ${serial} getvar product 2>&1`));
    const variant = extractValue(safeExec(`fastboot -s ${serial} getvar variant 2>&1`));
    const bootloaderVersion = extractValue(safeExec(`fastboot -s ${serial} getvar version-bootloader 2>&1`));
    const basebandVersion = extractValue(safeExec(`fastboot -s ${serial} getvar version-baseband 2>&1`));
    const serialNumber = extractValue(safeExec(`fastboot -s ${serial} getvar serialno 2>&1`));
    const secure = extractValue(safeExec(`fastboot -s ${serial} getvar secure 2>&1`));
    const unlocked = extractValue(safeExec(`fastboot -s ${serial} getvar unlocked 2>&1`));
    const maxDownloadSize = extractValue(safeExec(`fastboot -s ${serial} getvar max-download-size 2>&1`));
    const currentSlot = extractValue(safeExec(`fastboot -s ${serial} getvar current-slot 2>&1`));
    const slotCount = extractValue(safeExec(`fastboot -s ${serial} getvar slot-count 2>&1`));

    const bootloaderUnlocked = unlocked === 'yes' || unlocked === 'true';
    const isSecure = secure === 'yes' || secure === 'true';

    res.json({
      product,
      variant,
      bootloaderVersion,
      basebandVersion,
      serialNumber,
      secure: isSecure,
      bootloaderUnlocked,
      maxDownloadSize,
      currentSlot,
      slotCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get device info:', error);
    res.status(500).json({ error: 'Failed to retrieve device information' });
  }
});

// Device lock middleware for destructive operations
function requireDeviceLock(req, res, next) {
  const deviceSerial = req.body?.serial || req.body?.deviceSerial || req.params?.serial;
  
  if (!deviceSerial) {
    // Operations that don't need a device lock can proceed
    return next();
  }

  const operation = req.path.replace('/api/', '').replace(/\//g, '_');
  const lockResult = acquireDeviceLock(deviceSerial, operation);

  if (!lockResult.acquired) {
    return res.status(423).json({
      success: false,
      error: 'Device locked',
      message: lockResult.reason,
      lockedBy: lockResult.lockedBy,
      retryAfter: Math.floor(LOCK_TIMEOUT / 1000) // Convert milliseconds to seconds
    });
  }

  // Release lock when response finishes (success or error)
  const originalEnd = res.end;
  res.end = function(...args) {
    releaseDeviceLock(deviceSerial);
    originalEnd.apply(this, args);
  };

  next();
}

app.post('/api/fastboot/flash', requireDeviceLock, async (req, res) => {
  const { confirmation } = req.body;
  
  // Require confirmation for flash operations
  if (!confirmation || confirmation !== 'FLASH') {
    return res.status(400).json({
      success: false,
      error: 'Confirmation required',
      message: 'You must provide confirmation: "FLASH" to confirm this operation'
    });
  }

  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  try {
    const multer = await import('multer');
    const upload = multer.default({ dest: '/tmp/fastboot-uploads/' });
    
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: 'File upload failed', details: err.message });
      }

      const { serial, partition } = req.body;
      const file = req.file;

      if (!serial || !partition || !file) {
        return res.status(400).json({ error: "Serial, partition, and file are required" });
      }

      try {
        const output = execSync(
          `fastboot -s ${serial} flash ${partition} ${file.path}`,
          { encoding: 'utf-8', timeout: 120000 }
        );

        const fs = require('fs');
        fs.unlinkSync(file.path);

        res.json({
          success: true,
          output: output.trim(),
          message: `Successfully flashed ${partition}`,
          timestamp: new Date().toISOString()
        });
      } catch (flashError) {
        const fs = require('fs');
        if (file.path) {
          try { fs.unlinkSync(file.path); } catch {}
        }
        res.status(500).json({
          success: false,
          error: 'Flash operation failed',
          details: flashError.message
        });
      }
    });
  } catch (error) {
    console.error('Flash setup error:', error);
    res.status(500).json({ error: 'Flash operation setup failed', details: error.message });
  }
});

app.post('/api/fastboot/unlock', requireDeviceLock, (req, res) => {
  const { serial, confirmation } = req.body;
  
  // Require confirmation for unlock operations
  if (!confirmation || confirmation !== 'UNLOCK') {
    return res.status(400).json({
      success: false,
      error: 'Confirmation required',
      message: 'You must type "UNLOCK" to confirm this operation. This will ERASE ALL DATA on the device.'
    });
  }

  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  if (!serial) {
    return res.status(400).json({ error: "Serial number required" });
  }

  try {
    const output = safeExec(`fastboot -s ${serial} oem unlock`);
    res.json({
      success: true,
      output: output,
      message: 'Bootloader unlock initiated. Follow device prompts.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unlock operation failed',
      details: error.message
    });
  }
});

app.post('/api/fastboot/reboot', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const { serial, mode } = req.body;
  if (!serial) {
    return res.status(400).json({ error: "Serial number required" });
  }

  const validModes = ['system', 'bootloader', 'recovery'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: "Invalid reboot mode" });
  }

  try {
    let command;
    if (mode === 'system') {
      command = `fastboot -s ${serial} reboot`;
    } else if (mode === 'bootloader') {
      command = `fastboot -s ${serial} reboot-bootloader`;
    } else if (mode === 'recovery') {
      command = `fastboot -s ${serial} reboot recovery`;
    }

    const output = safeExec(command);
    res.json({
      success: true,
      output: output,
      message: `Rebooting to ${mode}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Reboot operation failed',
      details: error.message
    });
  }
});

app.post('/api/fastboot/erase', requireDeviceLock, (req, res) => {
  const { serial, partition, confirmation } = req.body;
  
  // Require confirmation for erase operations
  const expectedConfirmation = `ERASE ${partition}`.toUpperCase();
  if (!confirmation || confirmation.toUpperCase() !== expectedConfirmation) {
    return res.status(400).json({
      success: false,
      error: 'Confirmation required',
      message: `You must type "${expectedConfirmation}" to confirm erasing partition ${partition}`
    });
  }

  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  if (!serial || !partition) {
    return res.status(400).json({ error: "Serial and partition required" });
  }

  const criticalPartitions = ['boot', 'system', 'vendor', 'bootloader', 'radio', 'aboot', 'vbmeta'];
  if (criticalPartitions.includes(partition)) {
    return res.status(403).json({ error: "Cannot erase critical system partitions for safety" });
  }

  try {
    const output = safeExec(`fastboot -s ${serial} erase ${partition}`);
    res.json({
      success: true,
      output: output,
      message: `Partition ${partition} erased`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erase operation failed',
      details: error.message
    });
  }
});

app.get('/api/bootforgeusb/scan', (req, res) => {
  const useDemoData = req.query.demo === 'true';
  
  const cmd = getBootForgeUsbCommand();
  if (!cmd) {
    if (useDemoData) {
      return res.json(generateDemoBootForgeData());
    }
    
    return res.status(503).json({ 
      error: "BootForgeUSB not available",
      message: "BootForgeUSB CLI tool is not installed or not in PATH",
      installInstructions: "Build and install from libs/bootforgeusb: cargo build --release --bin bootforgeusb && cargo install --path . --bin bootforgeusb",
      available: false
    });
  }

  try {
    const { cmd: usedCmd, devices } = runBootForgeUsbScanJson();
    
    res.json({
      success: true,
      count: devices.length,
      devices,
      timestamp: new Date().toISOString(),
      available: true,
      command: usedCmd
    });
  } catch (error) {
    if (error.code === 'CLI_NOT_FOUND') {
      if (useDemoData) {
        return res.json(generateDemoBootForgeData());
      }
      return res.status(503).json({
        error: "BootForgeUSB not available",
        message: error.message,
        installInstructions: "Build and install from libs/bootforgeusb: cargo build --release --bin bootforgeusb && cargo install --path . --bin bootforgeusb",
        available: false
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'BootForgeUSB scan timeout',
        message: 'Device scan took too long to complete',
        available: true
      });
    }
    
    console.error('BootForgeUSB scan error:', error);
    
    if (useDemoData) {
      return res.json(generateDemoBootForgeData());
    }
    
    res.status(500).json({
      error: 'BootForgeUSB scan failed',
      details: error.message,
      stderr: error.stderr?.toString() || null,
      available: true
    });
  }
});

function generateDemoBootForgeData() {
  const demoDevices = [
    {
      device_uid: "usb-18d1:4ee7-3-2",
      platform_hint: "android",
      mode: "Normal OS (Confirmed)",
      confidence: 0.95,
      evidence: {
        usb: {
          vid: "0x18d1",
          pid: "0x4ee7",
          manufacturer: "Google Inc.",
          product: "Pixel 6",
          serial: "1A2B3C4D5E6F",
          bus: 3,
          address: 2,
          interface_hints: [
            { class: 255, subclass: 66, protocol: 1 },
            { class: 255, subclass: 66, protocol: 3 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: true,
            raw: "1A2B3C4D5E6F device",
            device_ids: ["1A2B3C4D5E6F"]
          },
          fastboot: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID/PID matches Google Android Debug Bridge",
        "ADB tool detected device with serial 1A2B3C4D5E6F",
        "USB interface class 0xFF (Vendor Specific) with ADB-standard protocol",
        "Device confirmed in normal Android OS mode via ADB"
      ],
      matched_tool_ids: ["1A2B3C4D5E6F"],
      correlation_badge: "CORRELATED",
      correlation_notes: ["Per-device correlation present (matched tool ID(s))."]
    },
    {
      device_uid: "usb-05ac:12a8-1-5",
      platform_hint: "ios",
      mode: "Normal OS (Likely)",
      confidence: 0.88,
      evidence: {
        usb: {
          vid: "0x05ac",
          pid: "0x12a8",
          manufacturer: "Apple Inc.",
          product: "iPhone",
          serial: null,
          bus: 1,
          address: 5,
          interface_hints: [
            { class: 255, subclass: 254, protocol: 2 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          fastboot: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID matches Apple Inc. (0x05ac)",
        "PID 0x12a8 is standard iPhone enumeration",
        "No idevice_id tool available to confirm",
        "Classification based on USB evidence only"
      ],
      matched_tool_ids: [],
      correlation_badge: "LIKELY",
      correlation_notes: []
    },
    {
      device_uid: "usb-18d1:d00d-2-7",
      platform_hint: "android",
      mode: "Fastboot (Confirmed)",
      confidence: 0.92,
      evidence: {
        usb: {
          vid: "0x18d1",
          pid: "0xd00d",
          manufacturer: "Google Inc.",
          product: "Fastboot Device",
          serial: "FASTBOOT123ABC",
          bus: 2,
          address: 7,
          interface_hints: [
            { class: 255, subclass: 66, protocol: 3 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          fastboot: {
            present: true,
            seen: true,
            raw: "FASTBOOT123ABC fastboot",
            device_ids: ["FASTBOOT123ABC"]
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID/PID matches Google Fastboot protocol",
        "Fastboot tool detected device with serial FASTBOOT123ABC",
        "Device is in bootloader/fastboot mode",
        "Ready for flashing operations"
      ],
      matched_tool_ids: ["FASTBOOT123ABC"],
      correlation_badge: "CORRELATED",
      correlation_notes: ["Per-device correlation present (matched tool ID(s))."]
    },
    {
      device_uid: "usb-2717:ff48-3-4",
      platform_hint: "android",
      mode: "Normal OS (Likely)",
      confidence: 0.78,
      evidence: {
        usb: {
          vid: "0x2717",
          pid: "0xff48",
          manufacturer: "Xiaomi",
          product: "Mi Device",
          serial: "XIAOMI987654",
          bus: 3,
          address: 4,
          interface_hints: [
            { class: 255, subclass: 66, protocol: 1 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          fastboot: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID matches Xiaomi manufacturer code",
        "Interface class suggests Android ADB protocol",
        "ADB tool present but device not visible (possible USB authorization pending)",
        "Classification confidence reduced due to lack of tool confirmation"
      ],
      matched_tool_ids: [],
      correlation_badge: "LIKELY",
      correlation_notes: []
    }
  ];

  return {
    success: true,
    count: demoDevices.length,
    devices: demoDevices,
    timestamp: new Date().toISOString(),
    available: false,
    demo: true,
    message: "Showing demo data - BootForgeUSB CLI not available"
  };
}

app.get('/api/bootforgeusb/status', (req, res) => {
  const cmd = getBootForgeUsbCommand();
  const cliAvailable = !!cmd;
  const rustcAvailable = commandExists("rustc");
  const cargoAvailable = commandExists("cargo");
  
  let buildPath = null;
  let libInfo = null;
  
  if (rustcAvailable && cargoAvailable) {
    try {
      const manifestPath = '../libs/bootforgeusb/Cargo.toml';
      const fs = require('fs');
      if (fs.existsSync(manifestPath)) {
        buildPath = '../libs/bootforgeusb';
        const manifest = fs.readFileSync(manifestPath, 'utf-8');
        const versionMatch = manifest.match(/version\s*=\s*"([^"]+)"/);
        libInfo = {
          path: buildPath,
          version: versionMatch ? versionMatch[1] : null
        };
      }
    } catch (e) {
    }
  }
  
  const adbAvailable = commandExists("adb");
  const fastbootAvailable = commandExists("fastboot");
  const ideviceAvailable = commandExists("idevice_id");
  
  res.json({
    available: cliAvailable,
    cli: {
      installed: cliAvailable,
      command: cmd || 'bootforgeusb',
      candidates: ['bootforgeusb', 'bootforgeusb-cli']
    },
    buildEnvironment: {
      rust: rustcAvailable,
      cargo: cargoAvailable,
      canBuild: rustcAvailable && cargoAvailable
    },
    library: libInfo,
    systemTools: {
      adb: adbAvailable,
      fastboot: fastbootAvailable,
      idevice_id: ideviceAvailable
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/bootforgeusb/devices/:uid', (req, res) => {
  if (!getBootForgeUsbCommand()) {
    return res.status(503).json({ 
      error: "BootForgeUSB not available",
      available: false
    });
  }

  try {
    const { devices } = runBootForgeUsbScanJson();
    const device = devices.find(d => d.device_uid === req.params.uid);
    
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        uid: req.params.uid
      });
    }
    
    res.json({
      success: true,
      device,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BootForgeUSB device lookup error:', error);
    res.status(500).json({
      error: 'Failed to look up device',
      details: error.message
    });
  }
});

app.get('/api/bootforgeusb/correlate', (req, res) => {
  if (!getBootForgeUsbCommand()) {
    return res.status(503).json({ 
      error: "BootForgeUSB not available",
      available: false
    });
  }

  const adbAvailable = commandExists("adb");
  const fastbootAvailable = commandExists("fastboot");

  try {
    const { devices } = runBootForgeUsbScanJson();
    
    const correlationResults = devices.map(device => {
      const result = {
        device_uid: device.device_uid,
        platform: device.platform_hint,
        mode: device.mode,
        confidence: device.confidence,
        correlation: {
          method: 'none',
          confidence_boost: 0,
          matched_ids: device.matched_tool_ids || [],
          details: []
        }
      };
      
      if (device.matched_tool_ids && device.matched_tool_ids.length > 0) {
        result.correlation.method = 'tool_confirmed';
        result.correlation.confidence_boost = 0.15;
        result.correlation.details.push(`Correlated via ${device.matched_tool_ids.length} tool ID(s)`);
      } else if (device.mode.includes('likely')) {
        result.correlation.method = 'usb_heuristic';
        result.correlation.details.push('USB-only classification, tool confirmation unavailable');
      } else if (device.mode.includes('confirmed')) {
        result.correlation.method = 'system_level';
        result.correlation.details.push('System-level tool confirmation');
      }
      
      return result;
    });
    
    res.json({
      success: true,
      count: correlationResults.length,
      devices: correlationResults,
      tools_available: {
        adb: adbAvailable,
        fastboot: fastbootAvailable
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BootForgeUSB correlation error:', error);
    res.status(500).json({
      error: 'Correlation analysis failed',
      details: error.message
    });
  }
});

app.post('/api/bootforgeusb/build', async (req, res) => {
  if (!commandExists("cargo")) {
    return res.status(503).json({
      error: "Rust toolchain not available",
      message: "cargo command not found in PATH"
    });
  }

  const buildPath = '../libs/bootforgeusb';
  const fs = require('fs');
  
  if (!fs.existsSync(buildPath)) {
    return res.status(404).json({
      error: "BootForgeUSB source not found",
      message: `Expected path: ${buildPath}`
    });
  }

  try {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    });

    res.write(JSON.stringify({ 
      status: 'starting',
      message: 'Building BootForgeUSB CLI...',
      timestamp: new Date().toISOString()
    }) + '\n');

    const buildOutput = execSync(
      'cargo build --release --bin bootforgeusb',
      {
        cwd: buildPath,
        encoding: 'utf-8',
        timeout: 300000,
        maxBuffer: 50 * 1024 * 1024
      }
    );

    res.write(JSON.stringify({
      status: 'installing',
      message: 'Installing CLI tool...',
      timestamp: new Date().toISOString()
    }) + '\n');

    const installOutput = execSync(
      'cargo install --path . --bin bootforgeusb',
      {
        cwd: buildPath,
        encoding: 'utf-8',
        timeout: 60000
      }
    );

    res.write(JSON.stringify({
      status: 'complete',
      message: 'BootForgeUSB CLI built and installed successfully',
      buildOutput: buildOutput.trim(),
      installOutput: installOutput.trim(),
      timestamp: new Date().toISOString()
    }) + '\n');

    res.end();
  } catch (error) {
    res.write(JSON.stringify({
      status: 'failed',
      error: 'Build failed',
      details: error.message,
      stderr: error.stderr?.toString() || null,
      timestamp: new Date().toISOString()
    }) + '\n');
    res.end();
  }
});


let flashHistory = [];
let activeFlashJobs = new Map();
let jobCounter = 1;
let monitoringActive = false;
let testHistory = [];

const wssFlashProgress = new WebSocketServer({ server, path: '/ws/flash-progress' });
const flashProgressClients = new Map();

wssFlashProgress.on('connection', (ws, req) => {
  const pathParts = req.url.split('/');
  const jobId = pathParts[pathParts.length - 1];
  
  if (!jobId || jobId === 'flash-progress') {
    console.log('[Flash WS] Client connected without job ID');
    ws.close();
    return;
  }
  
  console.log(`[Flash WS] Client connected for job ${jobId}`);
  flashProgressClients.set(jobId, ws);
  
  ws.on('close', () => {
    console.log(`[Flash WS] Client disconnected for job ${jobId}`);
    flashProgressClients.delete(jobId);
  });
  
  ws.on('error', (error) => {
    console.error(`[Flash WS] Error for job ${jobId}:`, error);
    flashProgressClients.delete(jobId);
  });
});

function broadcastFlashProgress(jobId, data) {
  const ws = flashProgressClients.get(jobId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

app.get('/api/flash/devices', async (req, res) => {
  try {
    const devices = [];
    
    if (commandExists('adb')) {
      const adbOutput = safeExec('adb devices -l');
      if (adbOutput) {
        const lines = adbOutput.split('\n').slice(1).filter(l => l.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const serial = parts[0];
          const state = parts[1];
          const infoStr = parts.slice(2).join(' ');
          
          if (serial && state && state !== 'unauthorized' && state !== 'offline') {
            const model = infoStr.match(/model:(\S+)/)?.[1] || 'Unknown';
            const product = infoStr.match(/product:(\S+)/)?.[1] || 'Unknown';
            
            devices.push({
              serial,
              brand: 'Android',
              model: model.replace(/_/g, ' '),
              mode: state === 'device' ? 'Normal OS' : state,
              capabilities: state === 'device' 
                ? ['adb-sideload'] 
                : state === 'recovery' 
                ? ['adb-sideload'] 
                : [],
              connectionType: 'usb',
              isBootloader: state === 'bootloader',
              isRecovery: state === 'recovery',
              isDFU: false,
              isEDL: false
            });
          }
        }
      }
    }
    
    if (commandExists('fastboot')) {
      const fastbootOutput = safeExec('fastboot devices');
      if (fastbootOutput) {
        const lines = fastbootOutput.split('\n').filter(l => l.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const serial = parts[0];
          const mode = parts[1] || 'fastboot';
          
          if (serial) {
            const existing = devices.find(d => d.serial === serial);
            if (existing) {
              existing.isBootloader = true;
              existing.capabilities.push('fastboot');
            } else {
              devices.push({
                serial,
                brand: 'Android',
                model: 'Unknown',
                mode: 'Fastboot',
                capabilities: ['fastboot'],
                connectionType: 'usb',
                isBootloader: true,
                isRecovery: false,
                isDFU: false,
                isEDL: false
              });
            }
          }
        }
      }
    }
    
    res.json({
      success: true,
      count: devices.length,
      devices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Flash API] Device scan failed:', error);
    res.status(500).json({
      success: false,
      error: 'Device scan failed',
      devices: [],
      count: 0
    });
  }
});

app.get('/api/flash/devices/:serial', async (req, res) => {
  const { serial } = req.params;
  
  try {
    const adbCmd = getToolCommand('adb');
    const fastbootCmd = getToolCommand('fastboot');

    let deviceInfo = {
      serial,
      found: false
    };
    
    if (commandExists('adb')) {
      const adbDevices = safeExec(`${adbCmd} devices`);
      if (adbDevices && adbDevices.includes(serial)) {
        const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
        if (props) {
          deviceInfo = {
            serial,
            found: true,
            source: 'adb',
            manufacturer: props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1],
            brand: props.match(/\[ro\.product\.brand\]:\s*\[(.*?)\]/)?.[1],
            model: props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1],
            androidVersion: props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1],
            sdkVersion: props.match(/\[ro\.build\.version\.sdk\]:\s*\[(.*?)\]/)?.[1],
            buildId: props.match(/\[ro\.build\.id\]:\s*\[(.*?)\]/)?.[1]
          };
        }
      }
    }
    
    if (!deviceInfo.found && commandExists('fastboot')) {
      const fastbootDevices = safeExec(`${fastbootCmd} devices`);
      if (fastbootDevices && fastbootDevices.includes(serial)) {
        const extractValue = (output) => {
          if (!output) return null;
          const match = output.match(/:\s*(.+)/);
          return match ? match[1].trim() : null;
        };
        
        deviceInfo = {
          serial,
          found: true,
          source: 'fastboot',
          product: extractValue(safeExec(`fastboot -s ${serial} getvar product 2>&1`)),
          variant: extractValue(safeExec(`fastboot -s ${serial} getvar variant 2>&1`)),
          bootloaderVersion: extractValue(safeExec(`fastboot -s ${serial} getvar version-bootloader 2>&1`)),
          unlocked: extractValue(safeExec(`fastboot -s ${serial} getvar unlocked 2>&1`))
        };
      }
    }
    
    if (!deviceInfo.found) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        serial
      });
    }
    
    res.json({
      success: true,
      device: deviceInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Flash API] Get device info failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device info'
    });
  }
});

app.get('/api/flash/devices/:serial/partitions', async (req, res) => {
  const { serial } = req.params;
  
  try {
    const partitions = ['boot', 'system', 'vendor', 'recovery', 'userdata', 
                       'cache', 'vbmeta', 'dtbo', 'persist'];
    
    res.json({
      success: true,
      serial,
      partitions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get partitions'
    });
  }
});

app.post('/api/flash/validate-image', async (req, res) => {
  const { filePath } = req.body;
  
  if (!filePath) {
    return res.status(400).json({
      valid: false,
      error: 'File path required'
    });
  }
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(filePath)) {
      return res.json({
        valid: false,
        error: 'File does not exist'
      });
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const validExtensions = ['.img', '.zip', '.tar', '.bin'];
    if (!validExtensions.includes(ext)) {
      return res.json({
        valid: false,
        error: 'Invalid file type'
      });
    }
    
    res.json({
      valid: true,
      type: ext.substring(1),
      size: stats.size,
      path: filePath
    });
  } catch (error) {
    res.json({
      valid: false,
      error: error.message
    });
  }
});

app.post('/api/flash/start', async (req, res) => {
  const config = req.body;
  
  if (!config.deviceSerial || !config.flashMethod || !config.partitions || config.partitions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: deviceSerial, flashMethod, partitions'
    });
  }
  
  const jobId = `flash-job-${jobCounter++}-${Date.now()}`;
  
  const jobStatus = {
    jobId,
    status: 'queued',
    progress: 0,
    currentStep: 'Initializing',
    totalSteps: config.partitions.length,
    completedSteps: 0,
    bytesWritten: 0,
    totalBytes: config.partitions.reduce((sum, p) => sum + (p.size || 100000000), 0),
    speed: 0,
    timeElapsed: 0,
    timeRemaining: 0,
    logs: [`[${new Date().toISOString()}] Flash job ${jobId} created`],
    startTime: Date.now()
  };
  
  activeFlashJobs.set(jobId, { config, status: jobStatus });
  
  simulateFlashOperation(jobId, config);
  
  res.json({
    success: true,
    jobId,
    status: 'queued',
    deviceSerial: config.deviceSerial,
    startTime: Date.now(),
    message: 'Flash operation queued'
  });
});

// Import shared simulate function
import { simulateFlashOperation as sharedSimulateFlashOperation } from './routes/v1/flash-shared.js';

function simulateFlashOperation(jobId, config) {
  const job = activeFlashJobs.get(jobId);
  if (!job) return;
  
  job.status.status = 'running';
  job.status.logs.push(`[${new Date().toISOString()}] Starting flash operation`);
  job.status.currentStep = `Flashing ${config.partitions[0].name}`;
  
  broadcastFlashProgress(jobId, {
    type: 'progress',
    status: job.status
  });
  
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    const job = activeFlashJobs.get(jobId);
    if (!job) {
      clearInterval(stepInterval);
      return;
    }
    
    job.status.progress += 10;
    job.status.timeElapsed = Math.floor((Date.now() - job.status.startTime) / 1000);
    job.status.speed = Math.floor(Math.random() * 20 + 10);
    
    if (job.status.progress >= 100) {
      job.status.progress = 100;
      job.status.status = 'completed';
      job.status.currentStep = 'Completed';
      job.status.logs.push(`[${new Date().toISOString()}] Flash operation completed successfully`);
      
      flashHistory.unshift({
        jobId,
        deviceSerial: config.deviceSerial,
        deviceBrand: config.deviceBrand,
        flashMethod: config.flashMethod,
        partitions: config.partitions.map(p => p.name),
        status: 'completed',
        startTime: job.status.startTime,
        endTime: Date.now(),
        duration: Math.floor((Date.now() - job.status.startTime) / 1000),
        bytesWritten: job.status.totalBytes,
        averageSpeed: Math.floor(Math.random() * 20 + 10)
      });
      
      if (flashHistory.length > 50) {
        flashHistory = flashHistory.slice(0, 50);
      }
      
      broadcastFlashProgress(jobId, {
        type: 'completed',
        status: job.status
      });
      
      clearInterval(stepInterval);
      setTimeout(() => activeFlashJobs.delete(jobId), 5000);
    } else if (job.status.progress % 30 === 0 && stepIndex < config.partitions.length - 1) {
      stepIndex++;
      job.status.completedSteps = stepIndex;
      job.status.currentStep = `Flashing ${config.partitions[stepIndex].name}`;
      job.status.logs.push(`[${new Date().toISOString()}] Flashing partition: ${config.partitions[stepIndex].name}`);
    }
    
    broadcastFlashProgress(jobId, {
      type: 'progress',
      status: job.status
    });
  }, 1000);
}

app.post('/api/flash/pause/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }
  
  if (job.status.status !== 'running') {
    return res.status(400).json({
      success: false,
      error: 'Job is not running'
    });
  }
  
  job.status.status = 'paused';
  job.status.logs.push(`[${new Date().toISOString()}] Flash operation paused`);
  
  res.json({
    success: true,
    jobId,
    status: 'paused'
  });
});

app.post('/api/flash/resume/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }
  
  if (job.status.status !== 'paused') {
    return res.status(400).json({
      success: false,
      error: 'Job is not paused'
    });
  }
  
  job.status.status = 'running';
  job.status.logs.push(`[${new Date().toISOString()}] Flash operation resumed`);
  
  res.json({
    success: true,
    jobId,
    status: 'running'
  });
});

app.post('/api/flash/cancel/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }
  
  job.status.status = 'cancelled';
  job.status.logs.push(`[${new Date().toISOString()}] Flash operation cancelled`);
  
  broadcastFlashProgress(jobId, {
    type: 'cancelled',
    status: job.status
  });
  
  flashHistory.unshift({
    jobId,
    deviceSerial: job.config.deviceSerial,
    deviceBrand: job.config.deviceBrand,
    flashMethod: job.config.flashMethod,
    partitions: job.config.partitions.map(p => p.name),
    status: 'cancelled',
    startTime: job.status.startTime,
    endTime: Date.now(),
    duration: Math.floor((Date.now() - job.status.startTime) / 1000),
    bytesWritten: 0,
    averageSpeed: 0
  });
  
  activeFlashJobs.delete(jobId);
  
  res.json({
    success: true,
    jobId,
    status: 'cancelled'
  });
});

app.get('/api/flash/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = activeFlashJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }
  
  res.json({
    success: true,
    ...job.status
  });
});

app.get('/api/flash/operations/active', async (req, res) => {
  const operations = Array.from(activeFlashJobs.values()).map(job => job.status);
  
  res.json({
    success: true,
    count: operations.length,
    operations,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/flash/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const limitedHistory = flashHistory.slice(0, limit);
  
  res.json({
    success: true,
    count: limitedHistory.length,
    history: limitedHistory,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/monitor/start', (req, res) => {
  monitoringActive = true;
  res.json({ status: 'monitoring started', active: true });
});

app.post('/api/monitor/stop', (req, res) => {
  monitoringActive = false;
  res.json({ status: 'monitoring stopped', active: false });
});

app.get('/api/monitor/live', (req, res) => {
  // Check if monitoring is active
  if (!monitoringActive) {
    return res.json({
      active: false,
      message: 'Monitoring is not active. Start a flash operation or enable monitoring to collect metrics.',
      timestamp: new Date().toISOString()
    });
  }

  // Get active flash jobs from activeFlashJobs Map
  const activeJobs = Array.from(activeFlashJobs.values())
    .filter(job => {
      const status = job.status?.status;
      return status === 'running' || status === 'queued' || status === 'starting';
    });

  if (activeJobs.length === 0) {
    return res.json({
      active: true,
      monitoring: true,
      message: 'Monitoring active but no flash operations in progress',
      speed: 0,
      cpu: 0,
      memory: 0,
      disk: 0,
      usb: 0,
      timestamp: new Date().toISOString()
    });
  }

  // Get the most recent active flash job
  const activeJob = activeJobs
    .sort((a, b) => (b.status?.startTime || 0) - (a.status?.startTime || 0))[0];

  if (!activeJob || !activeJob.status) {
    return res.json({
      active: true,
      monitoring: true,
      message: 'No active flash operation found',
      speed: 0,
      cpu: 0,
      memory: 0,
      disk: 0,
      usb: 0,
      timestamp: new Date().toISOString()
    });
  }

  const jobStatus = activeJob.status;
  
  // Get transfer speed from job status (already in MB/s or bytes/s)
  let speed = jobStatus.speed || 0;
  if (speed > 0 && speed < 100) {
    // Likely already in MB/s
    speed = speed;
  } else if (speed >= 100) {
    // Convert bytes/s to MB/s if needed
    speed = speed / (1024 * 1024);
  }

  // Calculate estimated USB utilization based on speed (assuming max ~100 MB/s for USB 3.0)
  const estimatedUsbUtilization = speed > 0 ? Math.min(100, (speed / 100) * 100) : 0;

  // For now, return metrics based on active flash job status
  // TODO: Integrate with actual system metrics collection (CPU, memory, disk, USB)
  // This would require:
  // - CPU usage monitoring (using system commands or Node.js os module)
  // - Memory usage monitoring  
  // - Disk I/O monitoring
  // - USB bandwidth monitoring (requires USB library integration)
  
  res.json({
    active: true,
    monitoring: true,
    speed: speed,
    cpu: 0, // TODO: Collect actual CPU usage
    memory: 0, // TODO: Collect actual memory usage
    disk: 0, // TODO: Collect actual disk I/O
    usb: estimatedUsbUtilization,
    flashJobId: jobStatus.jobId,
    progress: jobStatus.progress || 0,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/tests/run', async (req, res) => {
  const { testSuite = 'all', deviceSerial } = req.body;
  
  try {
    const results = {
      testSuite,
      deviceSerial: deviceSerial || null,
      startTime: Date.now(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
    
    // Run basic system tests
    if (testSuite === 'all' || testSuite === 'system') {
      // Test 1: ADB availability
      const adbAvailable = commandExists('adb');
      results.tests.push({
        name: 'ADB Tool Available',
        status: adbAvailable ? 'pass' : 'fail',
        message: adbAvailable ? 'ADB is available' : 'ADB not found in PATH',
        duration: 0
      });
      results.summary.total++;
      if (adbAvailable) results.summary.passed++;
      else results.summary.failed++;
      
      // Test 2: Fastboot availability
      const fastbootAvailable = commandExists('fastboot');
      results.tests.push({
        name: 'Fastboot Tool Available',
        status: fastbootAvailable ? 'pass' : 'fail',
        message: fastbootAvailable ? 'Fastboot is available' : 'Fastboot not found in PATH',
        duration: 0
      });
      results.summary.total++;
      if (fastbootAvailable) results.summary.passed++;
      else results.summary.failed++;
      
      // Test 3: iOS tools availability
      const iosToolsAvailable = commandExists('idevice_id');
      results.tests.push({
        name: 'iOS Tools Available',
        status: iosToolsAvailable ? 'pass' : 'skip',
        message: iosToolsAvailable ? 'libimobiledevice tools available' : 'iOS tools not found (optional)',
        duration: 0
      });
      results.summary.total++;
      if (iosToolsAvailable) results.summary.passed++;
      else results.summary.skipped++;
      
      // Test 4: Backend health
      results.tests.push({
        name: 'Backend Health',
        status: 'pass',
        message: 'Backend is running',
        duration: 0
      });
      results.summary.total++;
      results.summary.passed++;
    }
    
    // Run device-specific tests if deviceSerial provided
    if (deviceSerial && (testSuite === 'all' || testSuite === 'device')) {
      if (commandExists('adb')) {
        const adbCmd = getToolCommand('adb');
        const devicesOutput = safeExec(`${adbCmd} devices`);
        const deviceFound = devicesOutput && devicesOutput.includes(deviceSerial);
        
        results.tests.push({
          name: `Device ${deviceSerial} Connected`,
          status: deviceFound ? 'pass' : 'fail',
          message: deviceFound ? `Device ${deviceSerial} found in ADB devices` : `Device ${deviceSerial} not found`,
          duration: 0
        });
        results.summary.total++;
        if (deviceFound) results.summary.passed++;
        else results.summary.failed++;
      } else {
        results.tests.push({
          name: `Device ${deviceSerial} Connected`,
          status: 'skip',
          message: 'ADB not available, cannot test device connection',
          duration: 0
        });
        results.summary.total++;
        results.summary.skipped++;
      }
    }
    
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    results.success = results.summary.failed === 0;
    
    // Store in test history
    testHistory.unshift(results);
    if (testHistory.length > 50) {
      testHistory = testHistory.slice(0, 50);
    }
    
    res.json(results);
  } catch (error) {
    console.error('[Tests Run] Error:', error);
    res.status(500).json({
      error: 'Test execution failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/tests/results', (req, res) => {
  res.json(testHistory);
});

app.get('/api/standards', (req, res) => {
  const standards = [
    {
      category: 'flash_speed',
      metric: 'Flash Speed',
      levels: [
        { level: 'Optimal', threshold: '> 500 MB/s', description: 'USB 3.2 Gen 2 (Best-in-class)' },
        { level: 'Good', threshold: '200-500 MB/s', description: 'USB 3.1 (Meets standards)' },
        { level: 'Acceptable', threshold: '50-200 MB/s', description: 'USB 3.0 (Below average)' },
        { level: 'Poor', threshold: '< 50 MB/s', description: 'USB 2.0 (Action required)' }
      ]
    },
    {
      category: 'usb_bandwidth',
      metric: 'USB Bandwidth Utilization',
      levels: [
        { level: 'Optimal', threshold: '> 80%', description: 'Maximum throughput achieved' },
        { level: 'Good', threshold: '60-80%', description: 'Efficient bandwidth usage' },
        { level: 'Acceptable', threshold: '40-60%', description: 'Moderate efficiency' },
        { level: 'Poor', threshold: '< 40%', description: 'Bandwidth underutilized' }
      ]
    },
    {
      category: 'random_write_iops',
      metric: 'Random Write IOPS',
      levels: [
        { level: 'Optimal', threshold: '> 10000', description: 'NVMe-class performance' },
        { level: 'Good', threshold: '5000-10000', description: 'High-end eMMC' },
        { level: 'Acceptable', threshold: '1000-5000', description: 'Standard eMMC' },
        { level: 'Poor', threshold: '< 1000', description: 'Legacy storage' }
      ]
    },
    {
      category: 'fastboot_throughput',
      metric: 'Fastboot Flash Throughput',
      levels: [
        { level: 'Optimal', threshold: '> 40 MB/s', description: 'Modern devices' },
        { level: 'Good', threshold: '25-40 MB/s', description: 'Mid-range devices' },
        { level: 'Acceptable', threshold: '15-25 MB/s', description: 'Older devices' },
        { level: 'Poor', threshold: '< 15 MB/s', description: 'Very old/throttled' }
      ]
    }
  ];
  
  res.json({
    standards,
    reference: 'USB-IF, JEDEC, Android Platform Tools',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/hotplug/events', (req, res) => {
  res.json({
    events: [],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/authorization/adb/trigger-usb-debugging', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerADBUSBDebugging(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-file-transfer', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerFileTransferAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-backup', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerBackupAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-screen-capture', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerScreenCaptureAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-install', async (req, res) => {
  const { serial, apkPath } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerADBInstallAuth(serial, apkPath);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-wifi-adb', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerWiFiADBAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/verify-developer-options', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyDeveloperOptions(serial);
  res.json(result);
});

app.post('/api/authorization/adb/check-debugging-status', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.checkUSBDebuggingStatus(serial);
  res.json(result);
});

app.post('/api/authorization/adb/reboot-recovery', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.rebootToRecovery(serial);
  res.json(result);
});

app.post('/api/authorization/adb/reboot-bootloader', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.rebootToBootloader(serial);
  res.json(result);
});

app.post('/api/authorization/adb/reboot-edl', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.rebootToEDL(serial);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-trust-computer', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSTrustComputer(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-pairing', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSPairing(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-backup-encryption', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSBackupEncryption(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-dfu', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerDFURecoveryMode(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-app-install', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSAppInstallAuth(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-developer-trust', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSDeveloperTrust(udid);
  res.json(result);
});

app.post('/api/authorization/fastboot/verify-unlock', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyFastbootUnlock(serial);
  res.json(result);
});

app.post('/api/authorization/fastboot/trigger-oem-unlock', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerFastbootOEMUnlock(serial);
  res.json(result);
});

app.post('/api/authorization/samsung/trigger-download-mode', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerSamsungDownloadMode(serial);
  res.json(result);
});

app.post('/api/authorization/qualcomm/verify-edl', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyQualcommEDL(serial);
  res.json(result);
});

app.post('/api/authorization/mediatek/verify-flash', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyMediatekFlash(serial);
  res.json(result);
});

app.get('/api/authorization/triggers', async (req, res) => {
  const { platform } = req.query;
  const result = await AuthorizationTriggers.getAllAvailableTriggers(platform || 'all');
  res.json(result);
});

app.post('/api/authorization/trigger-all', async (req, res) => {
  const { deviceId, platform } = req.body;
  if (!deviceId || !platform) {
    return res.status(400).json({ 
      success: false, 
      error: 'Device ID and platform required' 
    });
  }
  const result = await AuthorizationTriggers.triggerAllAvailableAuthorizations(deviceId, platform);
  res.json(result);
});

app.get('/api/firmware/database', async (req, res) => {
  try {
    const brands = [
      {
        brand: 'Samsung',
        devices: [
          {
            model: 'SM-G998B',
            codename: 'p3s',
            marketingName: 'Galaxy S21 Ultra',
            releaseYear: 2021,
            firmwares: [
              {
                id: 'samsung-s21u-1',
                version: 'G998BXXU7DVH5',
                buildNumber: 'G998BXXU7DVH5',
                androidVersion: '14',
                releaseDate: '2023-09-15',
                size: '6.2 GB',
                downloadUrl: 'https://example.com/firmware/samsung/s21u/latest.zip',
                checksumMD5: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
                checksumSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                isOfficial: true,
                isSecurityPatch: true,
                region: 'Europe',
                notes: 'Latest security patch with performance improvements'
              }
            ]
          }
        ]
      }
    ];
    
    res.json({ brands, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Firmware API] Database error:', error);
    res.status(500).json({ error: 'Failed to load firmware database' });
  }
});

app.post('/api/firmware/download', async (req, res) => {
  const { downloadUrl, firmwareId, expectedSize, expectedChecksum, checksumType } = req.body;
  
  if (!downloadUrl) {
    return res.status(400).json({
      error: 'Download URL required',
      message: 'Please provide a downloadUrl in the request body'
    });
  }
  
  try {
    // Start download (non-blocking)
    const result = await downloadFirmware(downloadUrl, {
      firmwareId,
      expectedSize,
      expectedChecksum,
      checksumType: checksumType || 'sha256',
      onProgress: (progress) => {
        // Progress updates are tracked in activeDownloads Map
        // Clients can poll /api/firmware/download/:downloadId for status
      }
    });
    
    res.json({
      success: true,
      downloadId: result.downloadId,
      filePath: result.filePath,
      message: result.message || 'Download started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Firmware Download] Error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get download status
app.get('/api/firmware/download/:downloadId', (req, res) => {
  const { downloadId } = req.params;
  const status = getDownloadStatus(downloadId);
  
  if (!status) {
    return res.status(404).json({
      error: 'Download not found',
      message: `Download ID ${downloadId} not found`,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json(status);
});

// Cancel download
app.post('/api/firmware/download/:downloadId/cancel', (req, res) => {
  const { downloadId } = req.params;
  const cancelled = cancelDownload(downloadId);
  
  if (!cancelled) {
    return res.status(404).json({
      error: 'Download not found',
      message: `Download ID ${downloadId} not found`,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    message: 'Download cancelled',
    downloadId,
    timestamp: new Date().toISOString()
  });
});

// Get all active downloads
app.get('/api/firmware/downloads/active', (req, res) => {
  const downloads = getActiveDownloads();
  res.json({
    count: downloads.length,
    downloads,
    timestamp: new Date().toISOString()
  });
});

// iOS Device Detection
app.get('/api/ios/scan', (req, res) => {
  if (!commandExists('idevice_id')) {
    return res.status(503).json({
      error: 'iOS tools not available',
      message: 'libimobiledevice tools (idevice_id) are not installed. Install libimobiledevice to scan iOS devices.',
      devices: [],
      timestamp: new Date().toISOString()
    });
  }

  try {
    const ideviceCmd = 'idevice_id';
    const devicesRaw = safeExec(`${ideviceCmd} -l`);
    
    const devices = [];
    if (devicesRaw) {
      const lines = devicesRaw.split('\n').filter(l => l.trim());
      for (const line of lines) {
        const udid = line.trim();
        if (udid) {
          // Try to get device name if available
          let name = null;
          let productType = null;
          try {
            const nameOutput = safeExec(`${ideviceCmd} -u ${udid} -n 2>/dev/null || ideviceinfo -u ${udid} -k DeviceName 2>/dev/null`);
            if (nameOutput) name = nameOutput.trim();
            const typeOutput = safeExec(`ideviceinfo -u ${udid} -k ProductType 2>/dev/null`);
            if (typeOutput) productType = typeOutput.trim();
          } catch {
            // Ignore errors getting device info
          }

          devices.push({
            udid,
            name: name || undefined,
            productType: productType || undefined,
            mode: 'normal', // Default - could be DFU/recovery if detected
            isDetected: true
          });
        }
      }
    }

    res.json({
      success: true,
      count: devices.length,
      devices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[iOS Scan] Error:', error);
    res.status(500).json({
      error: 'Scan failed',
      message: error.message,
      devices: [],
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/ios/jailbreak', async (req, res) => {
  const { udid, method = 'palera1n' } = req.body;
  
  if (!udid) {
    return res.status(400).json({
      error: 'Device UDID required',
      message: 'Please provide a device UDID for jailbreak operation'
    });
  }
  
  // Check which jailbreak tool is available
  let toolName = null;
  if (method === 'palera1n' && isToolAvailable('palera1n')) {
    toolName = 'palera1n';
  } else if (method === 'checkra1n' && isToolAvailable('checkra1n')) {
    toolName = 'checkra1n';
  } else if (isToolAvailable('palera1n')) {
    toolName = 'palera1n';
  } else if (isToolAvailable('checkra1n')) {
    toolName = 'checkra1n';
  }
  
  if (!toolName) {
    const toolInfo = getAllToolsInfo();
    return res.status(503).json({
      error: 'Jailbreak tool not available',
      message: 'No jailbreak tool (checkra1n or palera1n) found. Please install one in tools/ directory or system PATH.',
      availableTools: {
        checkra1n: toolInfo.checkra1n?.available || false,
        palera1n: toolInfo.palera1n?.available || false
      },
      downloadUrls: {
        checkra1n: toolInfo.checkra1n?.downloadUrl || null,
        palera1n: toolInfo.palera1n?.downloadUrl || null
      },
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    // Execute jailbreak (this is a simplified version - actual jailbreak requires more steps)
    // For safety, we'll return instructions instead of executing directly
    // In production, you'd want more comprehensive jailbreak workflow integration
    
    const toolInfo = getToolInfo(toolName);
    
    res.json({
      success: true,
      message: `Jailbreak tool ${toolName} is available. Jailbreak execution should be performed through the workflow system for safety.`,
      tool: toolName,
      toolPath: toolInfo.path,
      udid,
      instructions: {
        palera1n: 'Use palera1n CLI: palera1n -c -f [options]',
        checkra1n: 'Use checkra1n CLI: checkra1n [options]'
      },
      warning: 'Jailbreaking may void warranty and has risks. Use workflow system for guided execution.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[iOS Jailbreak] Error:', error);
    res.status(500).json({
      error: 'Jailbreak operation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// FRP Detection
app.post('/api/frp/detect', async (req, res) => {
  const { serial } = req.body;
  
  if (!serial) {
    return res.status(400).json({
      error: 'Device serial required',
      message: 'Please provide a device serial number for FRP detection'
    });
  }

  if (!commandExists('adb')) {
    return res.status(503).json({
      error: 'ADB not available',
      message: 'ADB is required for FRP detection',
      serial,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const adbCmd = getToolCommand('adb');
    
    // Check if device is connected
    const devicesOutput = safeExec(`${adbCmd} devices`);
    if (!devicesOutput || !devicesOutput.includes(serial)) {
      return res.status(404).json({
        error: 'Device not found',
        message: `Device with serial ${serial} is not connected via ADB`,
        serial,
        timestamp: new Date().toISOString()
      });
    }

    // Check device state
    const deviceLine = devicesOutput.split('\n').find(l => l.includes(serial));
    const state = deviceLine?.split(/\s+/)[1];
    
    if (state !== 'device') {
      return res.status(400).json({
        error: 'Device not ready',
        message: `Device is in '${state}' state. Device must be in 'device' state for FRP detection.`,
        serial,
        state,
        timestamp: new Date().toISOString()
      });
    }

    // Method 1: Check ro.frp.pst property (most reliable)
    const frpProperty = safeExec(`${adbCmd} -s ${serial} shell getprop ro.frp.pst`);
    const hasFRPProperty = frpProperty && frpProperty.trim() !== '';
    
    // Method 2: Check android_id (if short, likely FRP locked after reset)
    const androidId = safeExec(`${adbCmd} -s ${serial} shell settings get secure android_id`);
    const androidIdShort = androidId && androidId.trim().length < 10;
    
    // Method 3: Check if Google account is present (indicator of FRP status)
    const accountsOutput = safeExec(`${adbCmd} -s ${serial} shell dumpsys account 2>/dev/null || echo ""`);
    const hasGoogleAccount = accountsOutput && accountsOutput.includes('com.google');
    
    // Method 4: Check ro.setupwizard.mode (should be DISABLED if device is set up)
    const setupWizardMode = safeExec(`${adbCmd} -s ${serial} shell getprop ro.setupwizard.mode`);
    const isSetupWizardDisabled = setupWizardMode && setupWizardMode.trim() === 'DISABLED';
    
    // Determine FRP status
    let detected = false;
    let confidence = 'low';
    const indicators = [];
    
    if (hasFRPProperty) {
      detected = true;
      confidence = 'high';
      indicators.push('FRP property (ro.frp.pst) is present');
    }
    
    if (androidIdShort) {
      detected = true;
      confidence = confidence === 'high' ? 'high' : 'medium';
      indicators.push('Android ID is unusually short (possible post-reset state)');
    }
    
    if (!hasGoogleAccount && !isSetupWizardDisabled) {
      detected = true;
      confidence = confidence === 'high' ? 'high' : 'medium';
      indicators.push('No Google account detected and setup wizard may be active');
    }

    // Get additional device info
    const deviceInfo = {};
    try {
      const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
      if (props) {
        deviceInfo.manufacturer = props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1];
        deviceInfo.model = props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1];
        deviceInfo.androidVersion = props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1];
      }
    } catch {
      // Ignore errors getting device info
    }

    res.json({
      detected,
      confidence,
      indicators,
      deviceInfo: Object.keys(deviceInfo).length > 0 ? deviceInfo : undefined,
      serial,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[FRP Detect] Error:', error);
    res.status(500).json({
      error: 'Detection failed',
      message: error.message,
      serial,
      timestamp: new Date().toISOString()
    });
  }
});

// MDM Detection
app.post('/api/mdm/detect', (req, res) => {
  const { serial } = req.body;
  
  if (!serial) {
    return res.status(400).json({
      error: 'Device serial required',
      message: 'Please provide a device serial number for MDM detection'
    });
  }

  if (!commandExists('adb')) {
    return res.status(503).json({
      error: 'ADB not available',
      message: 'ADB is required for MDM detection',
      serial,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const adbCmd = getToolCommand('adb');
    
    // Check if device is connected
    const devicesOutput = safeExec(`${adbCmd} devices`);
    if (!devicesOutput || !devicesOutput.includes(serial)) {
      return res.status(404).json({
        error: 'Device not found',
        message: `Device with serial ${serial} is not connected via ADB`,
        serial,
        timestamp: new Date().toISOString()
      });
    }

    // Check device state
    const deviceLine = devicesOutput.split('\n').find(l => l.includes(serial));
    const state = deviceLine?.split(/\s+/)[1];
    
    if (state !== 'device') {
      return res.status(400).json({
        error: 'Device not ready',
        message: `Device is in '${state}' state. Device must be in 'device' state for MDM detection.`,
        serial,
        state,
        timestamp: new Date().toISOString()
      });
    }

    // Check for MDM profiles using dumpsys device_policy
    const devicePolicyOutput = safeExec(`${adbCmd} -s ${serial} shell dumpsys device_policy 2>/dev/null || echo ""`);
    
    let detected = false;
    let profileName = null;
    let organization = null;
    const restrictions = [];
    
    if (devicePolicyOutput) {
      // Look for active admin components
      const activeAdminMatch = devicePolicyOutput.match(/Active admin components:\s*(.*?)(?:\n|$)/);
      if (activeAdminMatch && activeAdminMatch[1].trim()) {
        detected = true;
        const admins = activeAdminMatch[1].trim().split(/\s+/).filter(a => a);
        if (admins.length > 0) {
          profileName = admins[0].split('/').pop();
        }
      }
      
      // Look for organization info
      const orgMatch = devicePolicyOutput.match(/Organization:\s*(.*?)(?:\n|$)/i);
      if (orgMatch && orgMatch[1].trim()) {
        organization = orgMatch[1].trim();
      }
      
      // Check for common MDM restrictions
      if (devicePolicyOutput.includes('DISALLOW_')) {
        detected = true;
        const restrictionMatches = devicePolicyOutput.match(/DISALLOW_\w+/g);
        if (restrictionMatches) {
          restrictions.push(...new Set(restrictionMatches));
        }
      }
      
      // Check for device owner
      const deviceOwnerMatch = devicePolicyOutput.match(/Device Owner:\s*(.*?)(?:\n|$)/i);
      if (deviceOwnerMatch && deviceOwnerMatch[1].trim() && deviceOwnerMatch[1].trim() !== 'null') {
        detected = true;
        if (!profileName) {
          profileName = deviceOwnerMatch[1].trim().split('/').pop();
        }
      }
      
      // Check for profile owner
      const profileOwnerMatch = devicePolicyOutput.match(/Profile Owner:\s*(.*?)(?:\n|$)/i);
      if (profileOwnerMatch && profileOwnerMatch[1].trim() && profileOwnerMatch[1].trim() !== 'null') {
        detected = true;
        if (!profileName) {
          profileName = profileOwnerMatch[1].trim().split('/').pop();
        }
      }
    }
    
    // Fallback: Check installed packages for common MDM apps
    if (!detected) {
      const packagesOutput = safeExec(`${adbCmd} -s ${serial} shell pm list packages 2>/dev/null || echo ""`);
      if (packagesOutput) {
        const mdmPatterns = [
          /com\.airwatch/i,
          /com\.vmware/i,
          /com\.mobileiron/i,
          /com\.good\.gd/i,
          /com\.soti/i,
          /com\.blackberry/i,
          /com\.intune/i,
          /com\.microsoft\.companyportal/i,
          /com\.citrix/i
        ];
        
        for (const pattern of mdmPatterns) {
          if (pattern.test(packagesOutput)) {
            detected = true;
            const match = packagesOutput.match(new RegExp(pattern.source.replace(/\\/g, ''), 'i'));
            if (match) {
              profileName = match[0].replace(/package:/i, '').trim();
            }
            break;
          }
        }
      }
    }

    res.json({
      detected,
      profileName: profileName || undefined,
      organization: organization || undefined,
      restrictions: restrictions.length > 0 ? restrictions : [],
      serial,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MDM Detect] Error:', error);
    res.status(500).json({
      error: 'Detection failed',
      message: error.message,
      serial,
      timestamp: new Date().toISOString()
    });
  }
});

// Samsung Odin Flash
app.post('/api/odin/flash', async (req, res) => {
  const { deviceSerial, firmwareFiles, options = {} } = req.body;
  
  if (!deviceSerial || !firmwareFiles || !Array.isArray(firmwareFiles) || firmwareFiles.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Please provide deviceSerial and firmwareFiles array'
    });
  }
  
  // Check for Odin or Heimdall (cross-platform alternative)
  let toolName = null;
  if (isToolAvailable('odin')) {
    toolName = 'odin';
  } else if (isToolAvailable('heimdall')) {
    toolName = 'heimdall';
  }
  
  if (!toolName) {
    const toolInfo = getAllToolsInfo();
    return res.status(503).json({
      error: 'Samsung flashing tool not available',
      message: 'No Samsung flashing tool (Odin or Heimdall) found. Please install one in tools/ directory or system PATH.',
      availableTools: {
        odin: toolInfo.odin?.available || false,
        heimdall: toolInfo.heimdall?.available || false
      },
      downloadUrls: {
        odin: toolInfo.odin?.downloadUrl || null,
        heimdall: toolInfo.heimdall?.downloadUrl || null
      },
      note: 'Heimdall is cross-platform and recommended for non-Windows systems',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const toolInfo = getToolInfo(toolName);
    
    // Note: Actual flashing execution would require:
    // - Device detection in download mode
    // - Firmware file validation
    // - Proper command construction for Odin/Heimdall
    // - Progress tracking
    // For now, return tool availability and instructions
    
    res.json({
      success: true,
      message: `Samsung flashing tool ${toolName} is available. Flash execution should be performed through the workflow system for safety.`,
      tool: toolName,
      toolPath: toolInfo.path,
      deviceSerial,
      firmwareFiles: firmwareFiles.map(f => ({
        partition: f.partition || f.name,
        file: f.file || f.path,
        validated: false // Would validate in real implementation
      })),
      instructions: {
        odin: 'Odin requires Windows and Samsung USB drivers. Use Odin3.exe with firmware files.',
        heimdall: 'Use heimdall flash --[partition] [file] for each partition'
      },
      warning: 'Flashing firmware may void warranty and can brick devices. Use workflow system for guided execution.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Odin Flash] Error:', error);
    res.status(500).json({
      error: 'Flash operation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// MediaTek Flash
app.post('/api/mtk/flash', async (req, res) => {
  const { deviceSerial, scatterFile, firmwareFiles, options = {} } = req.body;
  
  if (!deviceSerial || !scatterFile || !firmwareFiles || !Array.isArray(firmwareFiles)) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Please provide deviceSerial, scatterFile, and firmwareFiles array'
    });
  }
  
  // Check for SP Flash Tool
  if (!isToolAvailable('spflashtool')) {
    const toolInfo = getToolInfo('spflashtool');
    return res.status(503).json({
      error: 'MediaTek flashing tool not available',
      message: 'SP Flash Tool not found. Please install it in tools/spflashtool/ directory or system PATH.',
      available: toolInfo?.available || false,
      downloadUrl: toolInfo?.downloadUrl || null,
      requiresDriver: toolInfo?.requiresDriver || false,
      driverName: toolInfo?.driverName || null,
      note: 'SP Flash Tool requires Windows and MediaTek USB drivers',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const toolInfo = getToolInfo('spflashtool');
    
    // Note: Actual flashing execution would require:
    // - Device detection in BROM/preloader mode
    // - Scatter file parsing and validation
    // - Firmware file validation
    // - Proper command construction for SP Flash Tool
    // - Progress tracking
    
    res.json({
      success: true,
      message: 'SP Flash Tool is available. Flash execution should be performed through the workflow system for safety.',
      tool: 'spflashtool',
      toolPath: toolInfo.path,
      deviceSerial,
      scatterFile,
      firmwareFiles: firmwareFiles.map(f => ({
        partition: f.partition || f.name,
        file: f.file || f.path,
        validated: false // Would validate in real implementation
      })),
      instructions: {
        spflashtool: 'Use SP Flash Tool GUI or command-line interface with scatter file and firmware images'
      },
      warning: 'Flashing firmware may void warranty and can brick devices. Use workflow system for guided execution.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MediaTek Flash] Error:', error);
    res.status(500).json({
      error: 'Flash operation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Qualcomm EDL Flash
app.post('/api/edl/flash', async (req, res) => {
  const { deviceSerial, programmerFile, firmwareFiles, options = {} } = req.body;
  
  if (!deviceSerial || !programmerFile || !firmwareFiles || !Array.isArray(firmwareFiles)) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Please provide deviceSerial, programmerFile (firehose), and firmwareFiles array'
    });
  }
  
  // Check for EDL tool (prefer edl, fallback to qfil)
  let toolName = null;
  if (isToolAvailable('edl')) {
    toolName = 'edl';
  } else if (isToolAvailable('qfil')) {
    toolName = 'qfil';
  }
  
  if (!toolName) {
    const toolInfo = getAllToolsInfo();
    return res.status(503).json({
      error: 'EDL flashing tool not available',
      message: 'No Qualcomm EDL tool (edl or qfil) found. Please install one in tools/ directory or system PATH.',
      availableTools: {
        edl: toolInfo.edl?.available || false,
        qfil: toolInfo.qfil?.available || false
      },
      downloadUrls: {
        edl: toolInfo.edl?.downloadUrl || null,
        qfil: toolInfo.qfil?.downloadUrl || null
      },
      note: 'edl is cross-platform, qfil is Windows-only',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const toolInfo = getToolInfo(toolName);
    
    // Note: Actual flashing execution would require:
    // - Device detection in EDL mode (9008 port)
    // - Firehose/programmer file loading
    // - Firmware file validation
    // - Proper command construction for edl/qfil
    // - Progress tracking
    
    res.json({
      success: true,
      message: `EDL flashing tool ${toolName} is available. Flash execution should be performed through the workflow system for safety.`,
      tool: toolName,
      toolPath: toolInfo.path,
      deviceSerial,
      programmerFile,
      firmwareFiles: firmwareFiles.map(f => ({
        partition: f.partition || f.name,
        file: f.file || f.path,
        validated: false // Would validate in real implementation
      })),
      instructions: {
        edl: 'Use edl CLI: edl [options] --load-programmer [file] --flash [partition] [file]',
        qfil: 'Use QFIL GUI or command-line interface with programmer and firmware files'
      },
      warning: 'EDL flashing can brick devices if incorrect files are used. Use workflow system for guided execution.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[EDL Flash] Error:', error);
    res.status(500).json({
      error: 'Flash operation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Tools Management API
app.get('/api/tools', (req, res) => {
  const allTools = getAllToolsInfo();
  res.json({
    tools: allTools,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tools/:toolName', (req, res) => {
  const { toolName } = req.params;
  const toolInfo = getToolInfo(toolName);
  
  if (!toolInfo) {
    return res.status(404).json({
      error: 'Tool not found',
      message: `Tool ${toolName} is not defined`,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json(toolInfo);
});

// Catalog API - Tool catalog and capabilities
app.use('/api/catalog', catalogRouter);

// Operations API - Execute and simulate operations
app.use('/api/operations', operationsRouter);

// Trapdoor API - Secure endpoints for sensitive operations (Bobby's Secret Workshop)
app.use('/api/trapdoor', requireTrapdoorPasscode, trapdoorRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(PORT, '127.0.0.1', () => {
  const startupMsg = `🔧 Pandora Codex API Server running on http://127.0.0.1:${PORT}`;
  logger.info(startupMsg);
  
  const endpoints = [
    `📡 System tools detection: http://127.0.0.1:${PORT}/api/system-tools`,
    `⚡ Flash operations: http://127.0.0.1:${PORT}/api/flash/*`,
    `📊 Performance monitor: http://127.0.0.1:${PORT}/api/monitor/*`,
    `🧪 Automated testing: http://127.0.0.1:${PORT}/api/tests/*`,
    `📐 Standards reference: http://127.0.0.1:${PORT}/api/standards`,
    `🔌 Hotplug events: http://127.0.0.1:${PORT}/api/hotplug/*`,
    `🔐 Authorization triggers (27 endpoints): http://127.0.0.1:${PORT}/api/authorization/*`,
    `📦 Firmware library: http://127.0.0.1:${PORT}/api/firmware/*`,
    `🔓 Trapdoor API (Bobby's Secret Workshop): http://127.0.0.1:${PORT}/api/trapdoor/*`,
    `🌐 WebSocket hotplug: ws://127.0.0.1:${PORT}/ws/device-events`,
    `🔗 WebSocket correlation: ws://127.0.0.1:${PORT}/ws/correlation`,
    `📊 WebSocket analytics: ws://127.0.0.1:${PORT}/ws/analytics`,
    `🏥 Health check: http://127.0.0.1:${PORT}/api/health`
  ];
  
  endpoints.forEach(msg => logger.info(msg));
  
  const readyMsg = `\n✅ All 27 authorization triggers ready for real device probe execution\n✅ Firmware Library with brand-organized downloads available\n✅ Trapdoor API with workflow execution and shadow logging enabled`;
  logger.info(readyMsg);
});

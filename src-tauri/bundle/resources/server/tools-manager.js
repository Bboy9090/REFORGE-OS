/**
 * Tools Manager - Manages bundled external tools
 * 
 * This module handles detection and execution of external tools that may be:
 * 1. Bundled in tools/ directory
 * 2. Available in system PATH
 * 3. Downloadable/installable on demand
 */

import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IS_WINDOWS = os.platform() === 'win32';

// Base tools directory (tools/ in project root)
const TOOLS_BASE_DIR = join(__dirname, '..', 'tools');

/**
 * Tool definitions - configuration for each external tool
 */
const TOOL_DEFINITIONS = {
  // iOS Jailbreak Tools
  checkra1n: {
    name: 'checkra1n',
    description: 'iOS jailbreak tool (checkm8 exploit)',
    platforms: ['darwin', 'linux'], // macOS and Linux only
    executable: IS_WINDOWS ? 'checkra1n.exe' : 'checkra1n',
    downloadUrl: {
      darwin: 'https://checkra.in/releases/beta/latest/macos',
      linux: 'https://checkra.in/releases/beta/latest/linux'
    },
    versionCommand: '--version',
    bundled: true // Can be bundled in tools/
  },
  palera1n: {
    name: 'palera1n',
    description: 'iOS jailbreak tool (supports newer devices)',
    platforms: ['darwin', 'linux'],
    executable: IS_WINDOWS ? 'palera1n.exe' : 'palera1n',
    downloadUrl: {
      darwin: 'https://github.com/palera1n/palera1n/releases/latest',
      linux: 'https://github.com/palera1n/palera1n/releases/latest'
    },
    versionCommand: '--version',
    bundled: true
  },
  
  // Samsung Odin (Windows only)
  odin: {
    name: 'Odin',
    description: 'Samsung firmware flashing tool',
    platforms: ['win32'],
    executable: 'Odin3.exe',
    downloadUrl: {
      win32: 'https://samsungodin.com/download/' // Placeholder - need real source
    },
    bundled: true,
    requiresDriver: true,
    driverName: 'Samsung USB Driver'
  },
  heimdall: {
    name: 'Heimdall',
    description: 'Cross-platform Samsung firmware flashing tool (Odin alternative)',
    platforms: ['darwin', 'linux', 'win32'],
    executable: IS_WINDOWS ? 'heimdall.exe' : 'heimdall',
    downloadUrl: {
      darwin: 'https://github.com/Benjamin-Dobell/Heimdall/releases/latest',
      linux: 'https://github.com/Benjamin-Dobell/Heimdall/releases/latest',
      win32: 'https://github.com/Benjamin-Dobell/Heimdall/releases/latest'
    },
    versionCommand: 'version',
    bundled: true
  },
  
  // MediaTek SP Flash Tool
  spflashtool: {
    name: 'SP Flash Tool',
    description: 'MediaTek device firmware flashing tool',
    platforms: ['win32'],
    executable: 'flash_tool.exe',
    downloadUrl: {
      win32: 'https://spflashtool.com/download/' // Placeholder
    },
    bundled: true,
    requiresDriver: true,
    driverName: 'MediaTek USB Driver'
  },
  
  // Qualcomm EDL Tools
  edl: {
    name: 'Qualcomm EDL Tool',
    description: 'Qualcomm Emergency Download Mode flashing tool',
    platforms: ['darwin', 'linux', 'win32'],
    executable: IS_WINDOWS ? 'edl.exe' : 'edl',
    downloadUrl: {
      darwin: 'https://github.com/bkerler/edl/releases/latest',
      linux: 'https://github.com/bkerler/edl/releases/latest',
      win32: 'https://github.com/bkerler/edl/releases/latest'
    },
    versionCommand: '--version',
    bundled: true
  },
  qfil: {
    name: 'QFIL',
    description: 'Qualcomm Flash Image Loader (official tool)',
    platforms: ['win32'],
    executable: 'QFIL.exe',
    downloadUrl: {
      win32: 'https://www.qualcomm.com/developer/software/flash-image-loader' // Placeholder
    },
    bundled: true,
    requiresDriver: true,
    driverName: 'Qualcomm USB Driver'
  }
};

/**
 * Check if a tool exists at a given path
 */
function toolExists(path) {
  try {
    if (existsSync(path)) {
      const stats = statSync(path);
      return stats.isFile() && (IS_WINDOWS || (stats.mode & parseInt('111', 8)) !== 0); // Executable on Unix
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if a command exists in PATH
 */
function commandExistsInPath(command) {
  try {
    if (IS_WINDOWS) {
      execSync(`where ${command}`, { stdio: 'ignore', timeout: 2000 });
    } else {
      execSync(`command -v ${command}`, { stdio: 'ignore', timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get tool path - checks bundled location, then system PATH
 */
export function getToolPath(toolName) {
  const tool = TOOL_DEFINITIONS[toolName];
  if (!tool) {
    return null;
  }
  
  // Check if platform is supported
  const currentPlatform = os.platform();
  if (!tool.platforms.includes(currentPlatform)) {
    return null;
  }
  
  // 1. Check bundled location (tools/{toolName}/{executable})
  const bundledPath = join(TOOLS_BASE_DIR, toolName, tool.executable);
  if (toolExists(bundledPath)) {
    return bundledPath;
  }
  
  // 2. Check system PATH
  if (commandExistsInPath(tool.executable)) {
    return tool.executable; // Return as-is, system will resolve from PATH
  }
  
  // 3. Check alternative names (for tools with multiple names)
  if (toolName === 'odin' && commandExistsInPath('heimdall')) {
    return 'heimdall'; // Suggest alternative
  }
  
  return null;
}

/**
 * Check if a tool is available
 */
export function isToolAvailable(toolName) {
  const path = getToolPath(toolName);
  return path !== null;
}

/**
 * Get tool information
 */
export function getToolInfo(toolName) {
  const tool = TOOL_DEFINITIONS[toolName];
  if (!tool) {
    return null;
  }
  
  const path = getToolPath(toolName);
  const available = path !== null;
  
  let version = null;
  if (available && tool.versionCommand) {
    try {
      const fullCommand = path.includes('/') || path.includes('\\') 
        ? `"${path}" ${tool.versionCommand}` 
        : `${path} ${tool.versionCommand}`;
      version = execSync(fullCommand, { encoding: 'utf-8', timeout: 5000 }).trim();
    } catch {
      // Version check failed, ignore
    }
  }
  
  return {
    name: tool.name,
    description: tool.description,
    available,
    path: available ? path : null,
    platforms: tool.platforms,
    currentPlatform: os.platform(),
    supported: tool.platforms.includes(os.platform()),
    version,
    requiresDriver: tool.requiresDriver || false,
    driverName: tool.driverName || null,
    downloadUrl: tool.downloadUrl[os.platform()] || null,
    bundled: tool.bundled || false
  };
}

/**
 * Get all available tools
 */
export function getAllToolsInfo() {
  const tools = {};
  for (const toolName of Object.keys(TOOL_DEFINITIONS)) {
    tools[toolName] = getToolInfo(toolName);
  }
  return tools;
}

/**
 * Execute a tool with arguments
 */
export function executeTool(toolName, args = [], options = {}) {
  const path = getToolPath(toolName);
  if (!path) {
    throw new Error(`Tool ${toolName} is not available`);
  }
  
  const fullCommand = path.includes('/') || path.includes('\\')
    ? `"${path}" ${args.join(' ')}`
    : `${path} ${args.join(' ')}`;
  
  const defaultOptions = {
    encoding: 'utf-8',
    timeout: 300000, // 5 minutes default
    maxBuffer: 50 * 1024 * 1024, // 50MB
    ...options
  };
  
  try {
    const result = execSync(fullCommand, defaultOptions);
    return {
      success: true,
      stdout: result,
      stderr: '',
      exitCode: 0
    };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || error.message,
      exitCode: error.status || 1
    };
  }
}

/**
 * Get tools directory structure info
 */
export function getToolsDirectoryInfo() {
  const info = {
    basePath: TOOLS_BASE_DIR,
    exists: existsSync(TOOLS_BASE_DIR),
    tools: {}
  };
  
  if (!info.exists) {
    return info;
  }
  
  // Check each tool directory
  for (const toolName of Object.keys(TOOL_DEFINITIONS)) {
    const toolDir = join(TOOLS_BASE_DIR, toolName);
    if (existsSync(toolDir)) {
      const toolInfo = getToolInfo(toolName);
      info.tools[toolName] = {
        directory: toolDir,
        available: toolInfo?.available || false,
        path: toolInfo?.path || null
      };
    }
  }
  
  return info;
}


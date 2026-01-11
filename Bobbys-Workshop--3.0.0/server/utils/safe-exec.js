/**
 * Safe command execution utilities
 * Uses spawn instead of execSync to avoid shell injection
 */

import { spawn } from 'child_process';
import { promisify } from 'util';

/**
 * Safely execute a command using spawn (no shell interpolation)
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {object} options - Execution options
 * @returns {Promise<{success: boolean, stdout: string, stderr: string, error?: string}>}
 */
export async function safeSpawn(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const timeout = options.timeout || 5000;
    const cwd = options.cwd || process.cwd();
    
    const child = spawn(command, args, {
      cwd,
      timeout,
      encoding: 'utf8',
      ...options
    });

    let stdout = '';
    let stderr = '';
    let timeoutId = null;

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          error: 'Command execution timeout'
        });
      }, timeout);
    }

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        success: code === 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code,
        ...(code !== 0 && { error: `Command exited with code ${code}` })
      });
    });

    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        success: false,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: error.message
      });
    });
  });
}

/**
 * Safely execute a command string by parsing it into command and args
 * WARNING: This still parses a command string, but validates it first
 * For maximum safety, use safeSpawn with explicit args
 */
export async function safeExecString(commandString, options = {}) {
  // Basic validation - reject commands with shell operators
  if (/[;&|`$<>]/.test(commandString)) {
    return {
      success: false,
      stdout: '',
      stderr: '',
      error: 'Invalid characters in command string (shell operators not allowed)'
    };
  }

  // Split command into parts (simple whitespace split, no shell expansion)
  const parts = commandString.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return {
      success: false,
      stdout: '',
      stderr: '',
      error: 'Empty command'
    };
  }

  const [command, ...args] = parts;
  return safeSpawn(command, args, options);
}

/**
 * Check if a command exists (using safeSpawn)
 */
export async function commandExistsSafe(cmd) {
  const checkCmd = process.platform === 'win32' ? 'where' : 'command';
  const checkArg = process.platform === 'win32' ? cmd : '-v';
  const checkArgs = process.platform === 'win32' ? [cmd] : [checkArg, cmd];
  
  const result = await safeSpawn(checkCmd, checkArgs, {
    timeout: 2000,
    stdio: 'ignore'
  });
  
  return result.success;
}


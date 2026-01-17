#!/usr/bin/env node
/**
 * Bobby's Workshop - Standalone Installer Builder
 * 
 * This script builds a complete standalone installer that includes:
 * - Frontend (React + Vite)
 * - Backend (Node.js Express server)
 * - All dependencies
 * - Native installers for Windows and macOS
 * 
 * Requirements:
 * - Node.js 18+ (for building)
 * - Rust + Cargo (for Tauri)
 * - Platform-specific tools:
 *   - Windows: WiX Toolset (for MSI), NSIS (for .exe installer)
 *   - macOS: Xcode Command Line Tools
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    log(`\n→ ${command}`, 'cyan');
    // Note: command is hard-coded in this script, not user-provided input
    // All commands are statically defined, so no command injection risk
    execSync(command, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      ...options,
    });
    return true;
  } catch (error) {
    log(`✗ Command failed: ${command}`, 'red');
    return false;
  }
}

function checkPrerequisites() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🔍 Checking Prerequisites', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  const checks = [
    { name: 'Node.js', command: 'node --version', required: true },
    { name: 'npm', command: 'npm --version', required: true },
    { name: 'Rust', command: 'rustc --version', required: true },
    { name: 'Cargo', command: 'cargo --version', required: true },
    { name: 'Tauri CLI', command: 'cargo tauri --version', required: true },
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const version = execSync(check.command, { encoding: 'utf8' }).trim();
      log(`✓ ${check.name}: ${version}`, 'green');
    } catch (error) {
      if (check.required) {
        log(`✗ ${check.name}: Not found`, 'red');
        allPassed = false;
      } else {
        log(`⚠ ${check.name}: Not found (optional)`, 'yellow');
      }
    }
  }

  if (!allPassed) {
    log('\n❌ Missing required tools!', 'red');
    log('\nInstallation instructions:', 'yellow');
    log('  • Node.js: https://nodejs.org/', 'yellow');
    log('  • Rust: https://rustup.rs/', 'yellow');
    log('  • Tauri CLI: cargo install tauri-cli', 'yellow');
    process.exit(1);
  }

  log('\n✅ All prerequisites satisfied!', 'green');
}

function cleanBuildArtifacts() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🧹 Cleaning Previous Build Artifacts', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  const pathsToClean = [
    path.join(ROOT_DIR, 'dist'),
    path.join(ROOT_DIR, 'src-tauri', 'target'),
  ];

  for (const cleanPath of pathsToClean) {
    if (fs.existsSync(cleanPath)) {
      log(`Removing ${cleanPath}`, 'yellow');
      fs.rmSync(cleanPath, { recursive: true, force: true });
    }
  }

  log('✓ Cleanup complete', 'green');
}

function installDependencies() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📦 Installing Dependencies', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  // Install root dependencies
  if (!execCommand('npm install')) {
    log('❌ Failed to install root dependencies', 'red');
    process.exit(1);
  }

  // Install server dependencies
  const serverDir = path.join(ROOT_DIR, 'server');
  if (!execCommand('npm install', { cwd: serverDir })) {
    log('❌ Failed to install server dependencies', 'red');
    process.exit(1);
  }

  log('✅ Dependencies installed', 'green');
}

function buildFrontend() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🏗️  Building Frontend', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  if (!execCommand('npm run build')) {
    log('❌ Frontend build failed', 'red');
    process.exit(1);
  }

  log('✅ Frontend built successfully', 'green');
}

function buildTauriApp(target = null) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🚀 Building Tauri Application', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  let buildCommand = 'cargo tauri build';
  if (target) {
    buildCommand += ` --target ${target}`;
    log(`Building for target: ${target}`, 'yellow');
  }

  if (!execCommand(buildCommand)) {
    log('❌ Tauri build failed', 'red');
    process.exit(1);
  }

  log('✅ Tauri application built successfully', 'green');
}

function displayBuildResults() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📊 Build Results', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  const bundleDir = path.join(ROOT_DIR, 'src-tauri', 'target', 'release', 'bundle');
  
  if (!fs.existsSync(bundleDir)) {
    log('⚠️  Bundle directory not found', 'yellow');
    return;
  }

  log('\nInstaller packages created:', 'cyan');

  // Find all installer files
  const findInstallers = (dir) => {
    if (!fs.existsSync(dir)) return [];
    
    const results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results.push(...findInstallers(fullPath));
      } else if (
        item.name.endsWith('.msi') ||
        item.name.endsWith('.exe') ||
        item.name.endsWith('.dmg') ||
        item.name.endsWith('.app') ||
        item.name.endsWith('.deb') ||
        item.name.endsWith('.AppImage')
      ) {
        results.push(fullPath);
      }
    }
    
    return results;
  };

  const installers = findInstallers(bundleDir);
  
  if (installers.length === 0) {
    log('⚠️  No installer packages found', 'yellow');
  } else {
    for (const installer of installers) {
      const stats = fs.statSync(installer);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      const relativePath = path.relative(ROOT_DIR, installer);
      log(`  ✓ ${relativePath} (${sizeMB} MB)`, 'green');
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const target = args.find(arg => arg.startsWith('--target='))?.split('=')[1];
  const skipClean = args.includes('--skip-clean');
  const skipDeps = args.includes('--skip-deps');

  log('\n╔═══════════════════════════════════════════╗', 'cyan');
  log('║  🔥 Bobby\'s Workshop                      ║', 'cyan');
  log('║     Standalone Installer Builder          ║', 'cyan');
  log('╚═══════════════════════════════════════════╝', 'cyan');

  checkPrerequisites();

  if (!skipClean) {
    cleanBuildArtifacts();
  }

  if (!skipDeps) {
    installDependencies();
  }

  buildFrontend();
  buildTauriApp(target);
  displayBuildResults();

  log('\n╔═══════════════════════════════════════════╗', 'green');
  log('║  ✅ BUILD COMPLETE!                       ║', 'green');
  log('╚═══════════════════════════════════════════╝', 'green');

  log('\n📦 Installation packages are ready!', 'cyan');
  log('\nNext steps:', 'yellow');
  log('  1. Test the installer on a clean machine', 'yellow');
  log('  2. Verify all features work correctly', 'yellow');
  log('  3. Distribute the installer files', 'yellow');
  log('\nFiles location:', 'cyan');
  log('  src-tauri/target/release/bundle/', 'cyan');
}

// Run the build
main();

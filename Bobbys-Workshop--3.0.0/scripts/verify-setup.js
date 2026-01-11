#!/usr/bin/env node
/**
 * Verify installation script
 * Checks that all dependencies are installed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let allGood = true;

console.log('🔍 Verifying installation...\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✓ Node.js: ${nodeVersion}`);

// Check frontend dependencies
const frontendDeps = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
if (frontendDeps) {
  console.log('✓ Frontend dependencies: installed');
} else {
  console.log('✗ Frontend dependencies: missing');
  console.log('  Run: npm install');
  allGood = false;
}

// Check backend dependencies
const backendDeps = fs.existsSync(path.join(__dirname, '..', 'server', 'node_modules'));
if (backendDeps) {
  console.log('✓ Backend dependencies: installed');
} else {
  console.log('✗ Backend dependencies: missing');
  console.log('  Run: npm run server:install');
  allGood = false;
}

// Check package.json files exist
const frontendPkg = fs.existsSync(path.join(__dirname, '..', 'package.json'));
const backendPkg = fs.existsSync(path.join(__dirname, '..', 'server', 'package.json'));

if (frontendPkg && backendPkg) {
  console.log('✓ Package files: found');
} else {
  console.log('✗ Package files: missing');
  allGood = false;
}

console.log('');

if (allGood) {
  console.log('✅ Installation verified!');
  console.log('   Run "npm run dev" to start development server');
  process.exit(0);
} else {
  console.log('❌ Installation incomplete');
  console.log('   Run "npm run setup" to install all dependencies');
  process.exit(1);
}

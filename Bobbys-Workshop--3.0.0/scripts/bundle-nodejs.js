#!/usr/bin/env node

/**
 * Bundle Node.js runtime for Tauri resources
 * Downloads Node.js for current platform and extracts to src-tauri/bundle/resources/nodejs/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';
import { spawn } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const NODE_VERSION = '18.20.4'; // LTS version
const PLATFORM = process.platform;
const ARCH = process.arch;

// Platform-specific Node.js distribution info
const NODE_DISTROS = {
  'win32-x64': {
    url: `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-x64.zip`,
    filename: `node-v${NODE_VERSION}-win-x64.zip`,
    extractDir: `node-v${NODE_VERSION}-win-x64`,
    executable: 'node.exe'
  },
  'darwin-x64': {
    url: `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-x64.tar.gz`,
    filename: `node-v${NODE_VERSION}-darwin-x64.tar.gz`,
    extractDir: `node-v${NODE_VERSION}-darwin-x64`,
    executable: 'bin/node'
  },
  'darwin-arm64': {
    url: `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-arm64.tar.gz`,
    filename: `node-v${NODE_VERSION}-darwin-arm64.tar.gz`,
    extractDir: `node-v${NODE_VERSION}-darwin-arm64`,
    executable: 'bin/node'
  },
  'linux-x64': {
    url: `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz`,
    filename: `node-v${NODE_VERSION}-linux-x64.tar.xz`,
    extractDir: `node-v${NODE_VERSION}-linux-x64`,
    executable: 'bin/node'
  }
};

const PLATFORM_KEY = `${PLATFORM}-${ARCH}`;
const distro = NODE_DISTROS[PLATFORM_KEY];

if (!distro) {
  console.error(`❌ Unsupported platform: ${PLATFORM_KEY}`);
  console.error(`Supported platforms: ${Object.keys(NODE_DISTROS).join(', ')}`);
  process.exit(1);
}

const RESOURCES_DIR = path.join(ROOT_DIR, 'src-tauri', 'bundle', 'resources');
const NODEJS_DIR = path.join(RESOURCES_DIR, 'nodejs');
const DOWNLOAD_DIR = path.join(ROOT_DIR, '.cache', 'nodejs');
const DOWNLOAD_PATH = path.join(DOWNLOAD_DIR, distro.filename);

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading Node.js ${NODE_VERSION} from ${url}...`);
    
    // Ensure download directory exists
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    
    const file = createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded to ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function extractZip(src, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Extracting ZIP archive...`);
    // Use built-in tools or require adm-zip
    import('adm-zip').then(({ default: AdmZip }) => {
      const zip = new AdmZip(src);
      zip.extractAllTo(dest, true);
      console.log(`✅ Extracted to ${dest}`);
      resolve();
    }).catch(reject);
  });
}

function extractTarGz(src, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Extracting TAR.GZ archive...`);
    const tar = spawn('tar', ['-xzf', src, '-C', dest], { stdio: 'inherit' });
    tar.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Extracted to ${dest}`);
        resolve();
      } else {
        reject(new Error(`tar extraction failed with code ${code}`));
      }
    });
    tar.on('error', reject);
  });
}

function extractTarXz(src, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Extracting TAR.XZ archive...`);
    const tar = spawn('tar', ['-xJf', src, '-C', dest], { stdio: 'inherit' });
    tar.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Extracted to ${dest}`);
        resolve();
      } else {
        reject(new Error(`tar extraction failed with code ${code}`));
      }
    });
    tar.on('error', reject);
  });
}

async function main() {
  try {
    console.log(`🚀 Bundling Node.js ${NODE_VERSION} for ${PLATFORM_KEY}...`);
    
    // Check if already downloaded
    if (!fs.existsSync(DOWNLOAD_PATH)) {
      await downloadFile(distro.url, DOWNLOAD_PATH);
    } else {
      console.log(`⏭️  Using cached download: ${DOWNLOAD_PATH}`);
    }
    
    // Ensure resources directory exists
    fs.mkdirSync(RESOURCES_DIR, { recursive: true });
    
    // Clean existing nodejs directory
    if (fs.existsSync(NODEJS_DIR)) {
      console.log(`🧹 Cleaning existing nodejs directory...`);
      fs.rmSync(NODEJS_DIR, { recursive: true, force: true });
    }
    
    // Create temp extraction directory
    const tempExtractDir = path.join(RESOURCES_DIR, 'nodejs-temp');
    fs.mkdirSync(tempExtractDir, { recursive: true });
    
    // Extract based on file type
    if (distro.filename.endsWith('.zip')) {
      await extractZip(DOWNLOAD_PATH, tempExtractDir);
    } else if (distro.filename.endsWith('.tar.gz')) {
      await extractTarGz(DOWNLOAD_PATH, tempExtractDir);
    } else if (distro.filename.endsWith('.tar.xz')) {
      await extractTarXz(DOWNLOAD_PATH, tempExtractDir);
    } else {
      throw new Error(`Unsupported archive format: ${distro.filename}`);
    }
    
    // Move extracted Node.js to final location
    const extractedNodeDir = path.join(tempExtractDir, distro.extractDir);
    if (!fs.existsSync(extractedNodeDir)) {
      throw new Error(`Expected extraction directory not found: ${extractedNodeDir}`);
    }
    
    console.log(`📁 Moving Node.js to ${NODEJS_DIR}...`);
    fs.renameSync(extractedNodeDir, NODEJS_DIR);
    fs.rmSync(tempExtractDir, { recursive: true, force: true });
    
    // Verify executable exists
    const nodeExe = path.join(NODEJS_DIR, distro.executable);
    if (!fs.existsSync(nodeExe)) {
      throw new Error(`Node.js executable not found: ${nodeExe}`);
    }
    
    // Make executable on Unix
    if (PLATFORM !== 'win32') {
      fs.chmodSync(nodeExe, 0o755);
    }
    
    console.log(`✅ Node.js bundled successfully!`);
    console.log(`   Location: ${NODEJS_DIR}`);
    console.log(`   Executable: ${nodeExe}`);
    
  } catch (error) {
    console.error(`❌ Error bundling Node.js:`, error);
    process.exit(1);
  }
}

main();


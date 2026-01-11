import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const IS_WINDOWS = process.platform === 'win32';

function getDataRootDir() {
  const override = process.env.BOBBYS_WORKSHOP_DATA_DIR;
  if (override) return override;

  const localAppData = process.env.LOCALAPPDATA;
  const appData = process.env.APPDATA;

  if (localAppData) return path.join(localAppData, 'Bobbys-Workshop');
  if (appData) return path.join(appData, 'Bobbys-Workshop');

  return path.join(os.homedir(), '.bobbys-workshop');
}

export function getManagedPlatformToolsDir() {
  return path.join(getDataRootDir(), 'tools', 'android', 'platform-tools');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    ensureDir(path.dirname(destPath));

    const file = fs.createWriteStream(destPath);

    const request = https
      .get(url, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close(() => {
            fs.rmSync(destPath, { force: true });
          });
          return resolve(downloadFile(response.headers.location, destPath));
        }

        if (response.statusCode !== 200) {
          file.close(() => {
            fs.rmSync(destPath, { force: true });
          });
          return reject(new Error(`Download failed: HTTP ${response.statusCode}`));
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        file.close(() => {
          fs.rmSync(destPath, { force: true });
        });
        reject(err);
      });

    request.setTimeout(60_000, () => {
      request.destroy(new Error('Download timed out'));
    });
  });
}

function getPlatformToolsZipUrl() {
  if (IS_WINDOWS) return 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip';
  if (process.platform === 'darwin') return 'https://dl.google.com/android/repository/platform-tools-latest-darwin.zip';
  return 'https://dl.google.com/android/repository/platform-tools-latest-linux.zip';
}

function pathExists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function removeDirIfExists(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

export async function ensureManagedPlatformTools() {
  let AdmZip;
  try {
    AdmZip = require('adm-zip');
  } catch {
    throw new Error("Missing dependency 'adm-zip'. Run: cd server && npm install");
  }

  const platformToolsDir = getManagedPlatformToolsDir();
  const adbName = IS_WINDOWS ? 'adb.exe' : 'adb';
  const fastbootName = IS_WINDOWS ? 'fastboot.exe' : 'fastboot';

  const adbPath = path.join(platformToolsDir, adbName);
  const fastbootPath = path.join(platformToolsDir, fastbootName);

  if (pathExists(adbPath) && pathExists(fastbootPath)) {
    return {
      installed: true,
      alreadyPresent: true,
      platformToolsDir,
      adbPath,
      fastbootPath
    };
  }

  const dataRoot = path.dirname(path.dirname(path.dirname(platformToolsDir)));
  const downloadsDir = path.join(dataRoot, 'downloads');
  const zipPath = path.join(downloadsDir, `platform-tools-${process.platform}.zip`);

  const url = getPlatformToolsZipUrl();
  ensureDir(downloadsDir);

  await downloadFile(url, zipPath);

  // Extract into a temporary folder first, then move into place.
  const tmpExtractDir = path.join(dataRoot, 'tmp', `platform-tools-${Date.now()}`);
  removeDirIfExists(tmpExtractDir);
  ensureDir(tmpExtractDir);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(tmpExtractDir, true);

  // Google zips contain a top-level "platform-tools" folder.
  const extractedPlatformTools = path.join(tmpExtractDir, 'platform-tools');
  if (!pathExists(extractedPlatformTools)) {
    throw new Error('Unexpected platform-tools archive format (missing platform-tools folder)');
  }

  // Replace existing target atomically-ish.
  removeDirIfExists(platformToolsDir);
  ensureDir(path.dirname(platformToolsDir));
  fs.renameSync(extractedPlatformTools, platformToolsDir);

  const finalAdb = path.join(platformToolsDir, adbName);
  const finalFastboot = path.join(platformToolsDir, fastbootName);

  if (!pathExists(finalAdb) || !pathExists(finalFastboot)) {
    throw new Error('platform-tools installed but adb/fastboot were not found after extraction');
  }

  // Cleanup
  removeDirIfExists(tmpExtractDir);

  return {
    installed: true,
    alreadyPresent: false,
    platformToolsDir,
    adbPath: finalAdb,
    fastbootPath: finalFastboot,
    downloadedFrom: url
  };
}

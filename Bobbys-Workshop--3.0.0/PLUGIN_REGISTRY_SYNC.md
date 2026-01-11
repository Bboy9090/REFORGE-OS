# Plugin Registry Sync Implementation

## Overview

Bobby's World now includes a **live plugin registry sync system** that automatically synchronizes with a backend API to keep the plugin marketplace up-to-date with the latest certified plugins, security scans, and updates.

## Architecture

### Components

1. **Plugin Registry API** (`/src/lib/plugin-registry-api.ts`)

   - Core API client for registry communication
   - Handles manifest fetching, plugin search, downloads, and verification
   - Built-in caching with configurable expiry
   - Auto-sync with configurable intervals

2. **Registry Types** (`/src/types/plugin-registry.ts`)

   - `RegistryPlugin`: Full plugin metadata from registry
   - `RegistryManifest`: Complete registry snapshot
   - `RegistrySyncStatus`: Sync operation status
   - `PluginUpdate`: Available update information
   - `RegistryConfig`: Configuration options

3. **React Hooks** (`/src/hooks/use-plugin-registry.ts`)

   - `usePluginRegistry()`: Main registry operations
   - `usePluginDownload()`: Download with progress tracking
   - `usePluginUpdates()`: Automatic update checking

4. **UI Components**

   - `PluginRegistrySync`: Sync status and control panel
   - `PluginRegistryBrowser`: Browse and search registry plugins
   - Integration into `PluginMarketplace`

5. **Mock Server** (`/src/lib/mock-plugin-registry-server.ts`)
   - Development/testing backend simulation
   - Realistic latency and error handling
   - 8 pre-configured certified plugins

## Features

### Live Synchronization

- **Automatic sync** on app start and at configurable intervals (default: 1 hour)
- **Manual sync** via UI button
- **Real-time status updates** (syncing, success, error)
- **Sync metrics**: plugins updated, added, removed

### Plugin Registry Operations

```typescript
// Fetch full manifest
const manifest = await pluginRegistry.fetchManifest();

// Search plugins with filters
const results = await pluginRegistry.searchPlugins("battery", {
  category: "diagnostic",
  platform: "android",
  certified: true,
});

// Check for updates
const updates = await pluginRegistry.checkForUpdates([
  { id: "battery-health-pro", version: "3.2.0" },
]);

// Download plugin with progress
const blob = await pluginRegistry.downloadPlugin(
  "battery-health-pro",
  (progress) => console.log(`${progress}%`),
);

// Verify signature
const isValid = await pluginRegistry.verifyPluginSignature(
  "battery-health-pro",
  "aabbccdd11223344",
);
```

### Caching System

- **Smart caching**: Reduces redundant network requests
- **Configurable expiry**: Default 24 hours
- **Cache invalidation**: Manual clear or automatic on expiry

### Security Features

- **Signature verification**: SHA-256 checksums for all plugins
- **Security scanning**: Automated scan results visible in UI
- **Certified badges**: Visual indicators for verified plugins
- **Publisher verification**: Verified publisher badges

### Search & Filtering

- **Text search**: Name and description matching
- **Category filter**: diagnostic, flash, utility, security, repair
- **Platform filter**: android, ios, cross-platform
- **Certification filter**: Show only certified plugins

## Configuration

### Registry Config Options

```typescript
const config: RegistryConfig = {
  apiUrl: "https://registry.bobbysworld.dev/api", // Registry API base URL
  syncInterval: 3600000, // Auto-sync interval (1 hour)
  autoSync: true, // Enable auto-sync
  allowUncertified: false, // Filter uncertified plugins
  cacheExpiry: 86400000, // Cache expiry (24 hours)
};
```

### Update Configuration

```typescript
import pluginRegistry from "@/lib/plugin-registry-api";

pluginRegistry.updateConfig({
  syncInterval: 1800000, // Change to 30 minutes
  autoSync: true,
});
```

## API Endpoints

The registry API expects the following endpoints:

### GET `/api/manifest`

Returns complete registry manifest:

```json
{
  "version": "1.0.0",
  "generatedAt": "2025-01-10T12:00:00Z",
  "plugins": [...],
  "categories": {
    "diagnostic": 12,
    "flash": 8,
    "utility": 5
  },
  "totalDownloads": 450230
}
```

### GET `/api/plugins/:id`

Returns detailed plugin information:

```json
{
  "id": "battery-health-pro",
  "name": "Battery Health Pro",
  "version": "3.2.1",
  "author": "BobbyTech",
  "description": "Advanced battery health diagnostics",
  "category": "diagnostic",
  "platform": "cross-platform",
  "certified": true,
  "signatureHash": "sha256:...",
  "downloadUrl": "https://...",
  "dependencies": [],
  "permissions": ["USB_READ", "DEVICE_INFO"],
  "lastUpdated": "2025-01-10T12:00:00Z",
  "downloads": 45230,
  "rating": 4.9,
  "reviews": 892,
  "checksum": "aabbccdd11223344",
  "size": 2456789,
  "securityScan": {
    "status": "passed",
    "scannedAt": "2025-01-09T12:00:00Z",
    "issues": []
  }
}
```

### GET `/api/plugins/search?q=:query&category=:cat&platform=:plat&certified=:bool`

Returns filtered plugin list:

```json
[
  {
    "id": "battery-health-pro",
    "name": "Battery Health Pro",
    ...
  }
]
```

### POST `/api/plugins/updates`

Check for available updates:

**Request:**

```json
{
  "installed": [{ "id": "battery-health-pro", "version": "3.2.0" }]
}
```

**Response:**

```json
[
  {
    "pluginId": "battery-health-pro",
    "currentVersion": "3.2.0",
    "latestVersion": "3.2.1",
    "releaseNotes": "Bug fixes and improvements",
    "critical": false
  }
]
```

### GET `/api/plugins/:id/download`

Returns plugin package as blob with `Content-Length` header for progress tracking.

### POST `/api/plugins/:id/verify`

Verify plugin signature:

**Request:**

```json
{
  "checksum": "aabbccdd11223344"
}
```

**Response:**

```json
{
  "valid": true
}
```

## UI Integration

### Plugin Marketplace

The `PluginMarketplace` component now includes:

1. **Registry Sync Panel** at the top

   - Shows last sync time
   - Displays sync status (syncing, success, error)
   - Manual sync button
   - Sync statistics

2. **Registry Browser** below sync panel

   - Search bar with filters
   - Category and platform dropdowns
   - Certified-only checkbox
   - Grid of plugin cards with download buttons

3. **Download Progress**
   - Real-time progress bars
   - Download speed tracking
   - Error handling with retry

### Usage in Components

```typescript
import { usePluginRegistry } from '@/hooks/use-plugin-registry';

function MyComponent() {
  const { syncStatus, sync, fetchManifest, isLoading } = usePluginRegistry();

  // Manual sync
  const handleSync = async () => {
    await sync();
  };

  // Load plugins
  const loadPlugins = async () => {
    const manifest = await fetchManifest();
    console.log(manifest.plugins);
  };

  return (
    <div>
      <p>Status: {syncStatus.status}</p>
      <p>Last sync: {syncStatus.lastSync}</p>
      <button onClick={handleSync} disabled={isLoading}>
        Sync Now
      </button>
    </div>
  );
}
```

## Mock Server for Development

The mock server simulates a real registry API:

- **8 pre-configured plugins** with realistic metadata
- **Random latency** (300-800ms) to simulate network
- **All API endpoints** fully implemented
- **Security scan results** included
- **Update detection** working

### Initialize Mock Server

```typescript
import { setupMockRegistryAPI } from "@/lib/mock-plugin-registry-server";

// Call once on app start
setupMockRegistryAPI();
```

This intercepts fetch requests to `registry.bobbysworld.dev/api` and handles them locally.

## Security Considerations

1. **Signature Verification**: All plugins must have valid SHA-256 checksums
2. **Security Scanning**: Plugins show scan status (passed/failed/pending)
3. **Certified Badge**: Only certified plugins recommended by default
4. **Publisher Verification**: Verified publisher badges for trusted authors
5. **Permission Display**: All required permissions shown before download

## Performance Optimizations

1. **Caching**: Reduces API calls with configurable expiry
2. **Lazy Loading**: Plugins loaded on-demand
3. **Progress Tracking**: Streaming downloads with real-time progress
4. **Auto-sync Intervals**: Configurable to balance freshness vs. bandwidth

## Future Enhancements

- [ ] WebSocket live updates for real-time registry changes
- [ ] Plugin ratings and reviews system
- [ ] Automatic update installation with user approval
- [ ] Plugin rollback capability
- [ ] Community plugin submissions via UI
- [ ] Plugin compatibility matrix
- [ ] Dependency resolution and auto-install
- [ ] Plugin sandboxing and isolation
- [ ] Bandwidth throttling for downloads
- [ ] Mirror support for downloads

## Troubleshooting

### Sync Fails

Check:

1. Registry API URL is correct
2. Network connectivity
3. CORS headers if using real backend
4. API endpoint implementations

### Plugins Not Appearing

Check:

1. Sync completed successfully
2. Filters not excluding plugins
3. Cache not stale (clear and retry)
4. Search query not too restrictive

### Downloads Fail

Check:

1. Plugin ID is correct
2. Download URL is accessible
3. Sufficient storage space
4. Network stability during download

## Example: Complete Integration

```typescript
// App.tsx
import { setupMockRegistryAPI } from '@/lib/mock-plugin-registry-server';

useEffect(() => {
  setupMockRegistryAPI();
  console.log('[App] Mock Plugin Registry initialized');
}, []);

// PluginMarketplace.tsx
import { PluginRegistrySync } from './PluginRegistrySync';
import { PluginRegistryBrowser } from './PluginRegistryBrowser';

export function PluginMarketplace() {
  return (
    <div className="space-y-6">
      <PluginRegistrySync />
      <PluginRegistryBrowser />
    </div>
  );
}
```

## Related Documentation

- [Plugin SDK Guide](./PLUGIN_SDK_GUIDE.md)
- [Plugin API Integration](./PLUGIN_API_INTEGRATION.md)
- [Automated Testing Pipeline](./AUTOMATED_TESTING_PIPELINE.md)
- [Plugin Marketplace](./PLUGIN_MARKETPLACE.md)

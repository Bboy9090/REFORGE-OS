# Live Plugin Installation with Dependency Resolution

## Overview

Bobby's World now features a **comprehensive live plugin installation system** with automatic dependency resolution, conflict detection, and real-time progress tracking. This system ensures that plugins and their dependencies are installed in the correct order with full verification and error handling.

## Architecture

### Core Components

1. **PluginDependencyResolver** (`src/lib/plugin-dependency-resolver.ts`)

   - Resolves dependency trees automatically
   - Detects version conflicts
   - Identifies circular dependencies
   - Calculates installation order
   - Manages download and installation

2. **PluginRegistryAPI** (`src/lib/plugin-registry-api.ts`)

   - Fetches plugin manifests from registry
   - Downloads plugin packages
   - Verifies plugin signatures
   - Manages cache and sync

3. **usePluginDependencies** Hook (`src/hooks/use-plugin-dependencies.ts`)

   - React hook for dependency management
   - Provides reactive state for resolution and installation
   - Handles progress tracking

4. **PluginDependencyInstaller** Component (`src/components/PluginDependencyInstaller.tsx`)
   - Visual installer with 4-step process
   - Real-time progress updates
   - Error handling and recovery

## Installation Flow

### Step 1: Resolution

- **Automatic**: Starts immediately when component mounts
- Analyzes dependency tree for target plugin
- Checks installed plugins for compatibility
- Detects conflicts and circular dependencies
- Calculates total download size

**Visual Indicators:**

- Animated progress indicator
- Step tracker showing current phase
- Error alerts for resolution failures

### Step 2: Confirmation

- **Manual**: Requires user approval
- Displays installation plan with all dependencies
- Shows install order (dependencies first, target last)
- Lists total download size
- Highlights any conflicts or circular dependencies

**User Actions:**

- Review dependencies
- Approve installation
- Cancel if needed

### Step 3: Installation

- **Automatic**: Downloads and installs in order
- For each dependency:
  1. **Download**: Fetch from registry with progress
  2. **Verify**: Check SHA-256 signature
  3. **Install**: Store in KV persistence
  4. **Update**: Mark as installed

**Visual Indicators:**

- Overall progress bar
- Current plugin being processed
- Status badges (downloading, verifying, installing, completed, failed)
- Animated icons matching current status
- Live error messages

### Step 4: Complete

- Shows installation summary
- Lists successfully installed plugins
- Displays any errors encountered
- Provides done button to close

## Dependency Resolution Algorithm

### Version Satisfaction

Supports semantic versioning with:

- Exact: `1.2.3`
- Caret: `^1.2.3` (allows patch and minor updates)
- Tilde: `~1.2.3` (allows patch updates only)
- Greater than: `>=1.2.3`, `>1.2.3`
- Less than: `<=1.2.3`, `<1.2.3`
- Wildcard: `*`, `latest`

### Conflict Detection

Identifies when:

- Multiple plugins require different versions of the same dependency
- Installed plugin version doesn't satisfy new requirements
- Version ranges don't overlap

### Circular Dependency Detection

Uses depth-first search to find dependency cycles:

```
A → B → C → A  (circular)
```

### Installation Order

Topological sort ensures dependencies install before dependents:

```
Installation Order:
1. core-utils (dependency)
2. device-detection (dependency)
3. samsung-diagnostics (target)
```

## Integration with Plugin Marketplace

The `PluginMarketplace` component integrates the installer:

```tsx
// User clicks "Install" on a plugin
const handleInstall = async (plugin: Plugin) => {
  setDependencyInstallDialog({
    open: true,
    pluginId: plugin.id,
    pluginName: plugin.name,
    version: plugin.currentVersion.version,
  });
};

// Dialog with dependency installer
<Dialog open={dependencyInstallDialog?.open}>
  <DialogContent>
    <PluginDependencyInstaller
      pluginId={pluginId}
      pluginName={pluginName}
      version={version}
      onInstallComplete={handleComplete}
      onCancel={handleCancel}
    />
  </DialogContent>
</Dialog>;
```

## Progress Tracking

The system provides detailed progress information:

```typescript
interface InstallProgress {
  current: number; // Current plugin number
  total: number; // Total plugins to install
  currentPlugin: string; // Plugin being processed
  status: "downloading" | "installing" | "verifying" | "completed" | "failed";
  message: string; // Human-readable status
  error?: string; // Error message if failed
}
```

## Error Handling

### Resolution Errors

- Missing dependencies (not found in registry)
- Version conflicts
- Circular dependencies
- Network failures

### Installation Errors

- Download failures
- Signature verification failures
- Storage errors
- Individual plugin installation failures

**Recovery:**

- Clear error messages
- Option to retry
- Partial installations preserved
- Rollback capability

## Security Features

### Signature Verification

Every downloaded plugin is verified:

1. Calculate SHA-256 hash of downloaded package
2. Send hash to registry for verification
3. Reject installation if signature doesn't match

### Safe Storage

Plugins stored in Spark KV with metadata:

```typescript
{
  id: string;
  version: string;
  data: string; // base64-encoded plugin package
  installedAt: string; // ISO timestamp
}
```

## UI/UX Design

### Visual Progress Indicators

**Step Tracker**

```
[✓] Resolve → [●] Confirm → [ ] Install → [ ] Complete
```

**Status Icons**

- 🕐 Clock: Resolving/loading
- ✓ Check: Success
- ✗ Cross: Error
- ⚡ Lightning: Installing
- 📦 Package: Preparing
- 🛡️ Shield: Verifying
- ⬇️ Download: Downloading

### Color Coding

- **Success**: Green (success/20)
- **Primary**: Cyan (primary)
- **Warning**: Amber (warning)
- **Error**: Red (destructive)
- **Muted**: Gray (muted)

### Animations

- **Pulse**: Active installation steps
- **Bounce**: Download indicator
- **Spin**: Resolution/loading

## Example Usage

### Basic Installation

```tsx
import { PluginDependencyInstaller } from "@/components/PluginDependencyInstaller";

function MyComponent() {
  return (
    <PluginDependencyInstaller
      pluginId="samsung-enhanced-diag"
      pluginName="Samsung Enhanced Diagnostics"
      version="2.3.1"
      onInstallComplete={(success) => {
        if (success) {
          console.log("Installation succeeded");
        } else {
          console.log("Installation failed");
        }
      }}
      onCancel={() => {
        console.log("Installation cancelled");
      }}
    />
  );
}
```

### With Hook

```tsx
import { usePluginDependencies } from "@/hooks/use-plugin-dependencies";

function MyComponent() {
  const {
    dependencyStatus,
    installStatus,
    resolveDependencies,
    installWithDependencies,
  } = usePluginDependencies();

  const handleInstall = async () => {
    // Resolve dependencies first
    const resolution = await resolveDependencies("plugin-id", "1.0.0");

    // Check for conflicts
    if (resolution.conflicts.length > 0) {
      console.error("Dependency conflicts detected");
      return;
    }

    // Install with progress tracking
    const result = await installWithDependencies(
      "plugin-id",
      "1.0.0",
      (progress) => {
        console.log(`${progress.status}: ${progress.message}`);
      },
    );

    if (result.success) {
      console.log("Installed:", result.installed);
    } else {
      console.error("Errors:", result.errors);
    }
  };

  return <button onClick={handleInstall}>Install</button>;
}
```

## Configuration

### Registry Configuration

```typescript
const config: RegistryConfig = {
  apiUrl: "https://registry.bobbysworld.dev/api",
  syncInterval: 3600000, // Sync every hour
  autoSync: true, // Auto-sync on start
  allowUncertified: false, // Require certification
  cacheExpiry: 86400000, // Cache for 24 hours
};
```

### Security Policy

```typescript
const policy: PluginSecurityPolicy = {
  allowUncertified: false,
  requireSignature: true,
  allowedRiskLevels: ["safe", "moderate"],
  maxExecutionsPerDay: 100,
  requireUserConfirmationFor: ["high", "critical"],
  blocklist: [],
  allowlist: [],
  sandboxEnabled: true,
  auditLogging: true,
};
```

## Future Enhancements

### Planned Features

- [ ] Rollback capability for failed installations
- [ ] Differential updates (download only changed files)
- [ ] Parallel downloads (multiple dependencies at once)
- [ ] Offline installation from local packages
- [ ] Installation scheduling
- [ ] Bandwidth throttling
- [ ] P2P distribution for common plugins
- [ ] Delta compression for updates

### Performance Optimizations

- [ ] Aggressive caching of dependency trees
- [ ] Pre-resolution for popular plugins
- [ ] Background downloads
- [ ] Progressive installation (usable before complete)

## Troubleshooting

### Common Issues

**"Dependency conflicts detected"**

- Different plugins require incompatible versions
- Solution: Update plugins to use compatible versions

**"Circular dependencies detected"**

- Plugins depend on each other in a cycle
- Solution: Break the cycle or use interface plugins

**"Signature verification failed"**

- Downloaded package doesn't match registry hash
- Solution: Retry download or report to plugin author

**"Installation failed: storage error"**

- KV storage quota exceeded
- Solution: Uninstall unused plugins

## API Reference

See the TypeScript definitions in:

- `src/types/plugin-sdk.ts` - Plugin manifest and SDK types
- `src/types/plugin-registry.ts` - Registry types
- `src/lib/plugin-dependency-resolver.ts` - Resolver implementation
- `src/lib/plugin-registry-api.ts` - Registry API client

## Support

For issues or questions:

- Check the plugin dependency graph visualization
- Review the audit logs in the plugin manager
- Contact the plugin author
- File an issue in Bobby's World repository

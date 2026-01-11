# Bobby Dev Arsenal 🔧

Private Creator Arsenal for Pandora Codex Development Environment

## What is this?

The Bobby Dev Arsenal is your complete development environment setup for the Pandora Codex project, running inside GitHub Codespaces/Spark. It provides:

- **Automated Environment Setup** - Rust, Python, Node.js, ADB/Fastboot tools
- **Dev Dashboard UI** - Visual status monitoring of all tools
- **CLI Scripts** - Quick environment checks and tool status
- **Integrated Workflow** - Seamless development across Phoenix Key, BootForge, and frontend

## Quick Start

### 1. Open in Codespaces

When you open this repo in GitHub Codespaces or Spark, the devcontainer will automatically:

- Install Node.js dependencies
- Set up Rust toolchain
- Install ADB/Fastboot for device work
- Build any Rust components (like BootForge USB layer)

### 2. Run the Development Server

```bash
npm run dev
```

Visit the forwarded port to see your Bobby Dev Arsenal Dashboard.

### 3. Check Your Environment

```bash
# See full environment status
npm run arsenal:status

# Check specific tools
npm run check:rust
npm run check:android-tools
```

## Available Commands

### Frontend Development

```bash
npm run dev          # Start Vite dev server
npm run build        # Build production bundle
npm run preview      # Preview production build
```

### Arsenal Tools

```bash
npm run arsenal:status        # Full environment snapshot (JSON)
npm run check:rust           # Verify Rust toolchain
npm run check:android-tools  # Verify ADB/Fastboot
```

### Phoenix Key (Python)

```bash
npm run phoenix:dev    # Run Phoenix Key app
npm run phoenix:build  # Build Python package
```

### BootForge (Rust USB Driver Layer)

```bash
npm run bootforge:build  # Build release binary
npm run bootforge:test   # Run Rust tests
```

## Components

### BobbyDevPanel

The main development panel showing quick actions, security status, analysis tools, and system alerts.

### BobbyDevArsenalDashboard

Real-time environment monitoring showing status of:

- Rust Toolchain
- Node.js
- Python 3
- ADB (Android Debug Bridge)
- Fastboot

## File Structure

```
.devcontainer/
  ├── devcontainer.json       # Codespaces configuration
  └── setup.sh                # Auto-setup script

scripts/
  ├── check-rust.js           # Rust toolchain check
  ├── check-android-tools.js  # ADB/Fastboot check
  └── dev-arsenal-status.js   # Full environment status

src/components/
  ├── BobbyDevPanel.tsx            # Main dev panel UI
  └── BobbyDevArsenalDashboard.tsx # Arsenal status dashboard
```

## Ports

The devcontainer forwards these ports:

- **5173** - Vite dev server (default)
- **3000** - Alternative dev port
- **4000** - Backend API (if needed)
- **8000** - Python services
- **5000** - Additional services

## Next Steps

1. **Wire the Backend API** - The Arsenal Dashboard expects `/api/dev-arsenal/status` endpoint. You can:

   - Create a simple Express server that runs `npm run arsenal:status`
   - Use the JSON output from the scripts directly
   - Comment out the fetch call and pass data via props

2. **Add More Tools** - Extend the scripts to check for other tools you need:

   - Docker
   - Git configurations
   - Custom build tools

3. **Custom Actions** - Add buttons to the dashboard for common operations:
   - Quick device flashing
   - BootForge builds
   - Phoenix Key launches

## TypeScript Fix Applied

✅ Fixed: `BobbyDevPanel.tsx` now uses `<Wrench />` instead of `<Tool />`

- Import kept: `import { Play, Lock, Unlock, Search, Wrench, Shield, AlertTriangle } from 'lucide-react';`
- Usage fixed: `<Wrench className="w-5 h-5 inline mr-2" />`

## Troubleshooting

### Rust not found

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

### ADB not found

```bash
sudo apt-get update
sudo apt-get install -y android-sdk-platform-tools
```

### Build failing

Check that all tools are installed:

```bash
npm run arsenal:status
```

---

**Built for private creator workflows. Keep it secret. Keep it safe.** 🔐

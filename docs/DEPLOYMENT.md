# Deployment Guide - Bobby's World Tools (Pandora Codex)

**Version**: 1.0  
**Date**: December 17, 2024  
**Audience**: DevOps, System Administrators, Technical Users

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying Bobby's World Tools (Pandora Codex) in various environments, from single-user workstations to enterprise deployments.

**Deployment Models:**

1. **Single-User Workstation** - Developer or repair technician
2. **Shared Workstation** - Repair shop with multiple users
3. **Enterprise Deployment** - Fleet management with centralized backend

---

## ⚙️ System Requirements

### Minimum Requirements

| Component   | Specification                         |
| ----------- | ------------------------------------- |
| **OS**      | Ubuntu 20.04+, macOS 11+, Windows 10+ |
| **CPU**     | 2 cores, 2.0 GHz                      |
| **RAM**     | 4 GB                                  |
| **Storage** | 10 GB free space                      |
| **USB**     | USB 2.0 ports for device connections  |
| **Node.js** | 20.x LTS or higher                    |
| **npm**     | 9.x or higher                         |

### Recommended Requirements

| Component   | Specification                  |
| ----------- | ------------------------------ |
| **OS**      | Ubuntu 22.04 LTS               |
| **CPU**     | 4+ cores, 3.0+ GHz             |
| **RAM**     | 8+ GB                          |
| **Storage** | 50+ GB SSD                     |
| **USB**     | USB 3.0 ports with hub support |
| **Node.js** | 20.x LTS                       |
| **npm**     | 10.x                           |

---

## 📦 Dependencies

### Core Dependencies

#### Linux (Ubuntu/Debian)

```bash
# Update package lists
sudo apt update

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Android tools
sudo apt install -y android-tools-adb android-tools-fastboot

# Install iOS tools
sudo apt install -y libimobiledevice-utils usbmuxd

# Install Rust toolchain (for BootForge USB)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Optional: Firejail for trapdoor sandboxing
sudo apt install -y firejail

# Verify installations
node --version  # Should be v20.x
npm --version   # Should be 9.x or 10.x
adb version
fastboot --version
idevice_id --version
cargo --version
```

#### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Install Android platform tools
brew install android-platform-tools

# Install iOS tools
brew install libimobiledevice usbmuxd

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Verify installations
node --version
npm --version
adb version
idevice_id --version
cargo --version
```

#### Windows

```powershell
# Install via Chocolatey
choco install nodejs-lts -y
choco install adb -y

# Install Rust from https://rustup.rs/
# Download and run rustup-init.exe

# iOS support limited on Windows - requires iTunes
# Download from: https://www.apple.com/itunes/
```

---

## 🚀 Deployment Steps

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Bboy9090/Bobbys_World_Tools.git
cd Bobbys_World_Tools

# Verify repository structure
ls -la
```

### 2. Install Frontend Dependencies

```bash
# Install frontend dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Install Backend Dependencies

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Return to root
cd ..
```

### 4. Build BootForge USB (Optional but Recommended)

```bash
# Build Rust components
cd crates/bootforge-usb
cargo build --release

# Return to root
cd ../..
```

### 5. Configure Environment

Create `.env` file in root directory:

```bash
# Backend Configuration
PORT=3001
HOST=localhost

# Admin API Key (change in production!)
ADMIN_API_KEY=your-secure-admin-key-here

# Logging
LOG_LEVEL=info

# Device Detection
AUTO_REFRESH_INTERVAL=5000

# Storage
SNAPSHOT_DIR=/var/lib/pandora-codex/snapshots
EVIDENCE_DIR=/var/lib/pandora-codex/evidence
LOG_DIR=/var/log/pandora-codex
```

Create directories:

```bash
# Create data directories
sudo mkdir -p /var/lib/pandora-codex/{snapshots,evidence}
sudo mkdir -p /var/log/pandora-codex

# Set permissions
sudo chown -R $USER:$USER /var/lib/pandora-codex
sudo chown -R $USER:$USER /var/log/pandora-codex
```

### 6. Start Backend Services

#### Development Mode

```bash
# Start backend server
cd server
npm run dev
```

#### Production Mode

```bash
# Start backend server
cd server
npm start
```

### 7. Start Frontend

#### Development Mode

```bash
# In a new terminal, from root directory
npm run dev
```

Frontend will be available at: `http://localhost:5000`

#### Production Build

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

---

## 🐳 Docker Deployment (Alternative)

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Docker Compose Deployment

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5000:5000"
    environment:
      - VITE_API_URL=http://localhost:3001
    depends_on:
      - backend

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - ADMIN_API_KEY=${ADMIN_API_KEY}
    volumes:
      - snapshots:/var/lib/pandora-codex/snapshots
      - evidence:/var/lib/pandora-codex/evidence
      - logs:/var/log/pandora-codex
    privileged: true
    devices:
      - /dev/bus/usb:/dev/bus/usb

volumes:
  snapshots:
  evidence:
  logs:
```

Deploy:

```bash
# Create .env file with ADMIN_API_KEY
echo "ADMIN_API_KEY=your-secure-key" > .env

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 🔒 Security Hardening

### 1. Change Default Admin Key

```bash
# Generate secure admin key
openssl rand -hex 32

# Update .env file
ADMIN_API_KEY=generated-key-here
```

### 2. Enable Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3001/tcp  # Backend API
sudo ufw allow 5000/tcp  # Frontend (dev)
sudo ufw enable
```

### 3. Configure USB Permissions

```bash
# Add user to plugdev group (Linux)
sudo usermod -aG plugdev $USER

# Create udev rules for device access
sudo tee /etc/udev/rules.d/51-android.rules << 'EOF'
SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", MODE="0666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTR{idVendor}=="05ac", MODE="0666", GROUP="plugdev"
EOF

# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### 4. Enable HTTPS (Production)

Use nginx as reverse proxy:

```bash
# Install nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure nginx
sudo tee /etc/nginx/sites-available/pandora-codex << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/pandora-codex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Health Checks

### Backend Health

```bash
# Check backend status
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":1234567890}
```

### Device Detection

```bash
# Test ADB detection
curl http://localhost:3001/api/android-devices/all

# Test iOS detection
curl http://localhost:3001/api/ios/scan
```

---

## 🔧 Troubleshooting

### Backend Won't Start

**Symptom**: Backend fails to start or crashes immediately

**Solution**:

```bash
# Check logs
cat /var/log/pandora-codex/server.log

# Verify dependencies
cd server
npm install

# Check port availability
lsof -i :3001
```

### Frontend Shows Demo Mode

**Symptom**: Banner shows "Demo Mode - Backend API Unavailable"

**Solution**:

```bash
# Verify backend is running
curl http://localhost:3001/health

# Check backend logs
cd server
npm run dev

# Verify frontend API URL
grep VITE_API_URL .env
```

### Device Not Detected

**Symptom**: Connected device not showing in UI

**Solution**:

```bash
# Test ADB directly
adb devices

# Test libimobiledevice
idevice_id -l

# Check USB permissions
ls -la /dev/bus/usb

# Restart udev (Linux)
sudo systemctl restart udev
```

---

## 🔄 Updating

### Pull Latest Changes

```bash
# Stop services
cd server
npm run kill  # or Ctrl+C

# Pull updates
git pull origin main

# Update dependencies
npm install
cd server
npm install
cd ..

# Rebuild frontend
npm run build

# Restart services
cd server
npm start &
cd ..
npm run preview
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend health check passes (`/health` returns `200`)
- [ ] Frontend accessible at configured URL
- [ ] ADB device detection works (`/api/android-devices/all`)
- [ ] iOS device detection works (`/api/ios/scan`)
- [ ] WebSocket connections establish (`/ws/device-events`)
- [ ] Admin API key changed from default
- [ ] Firewall rules configured
- [ ] USB permissions set correctly
- [ ] HTTPS enabled (production)
- [ ] Log directories writable
- [ ] Snapshot directories created
- [ ] Evidence directories created
- [ ] Monitoring/alerting configured (if applicable)

---

## 📞 Support

**Documentation**: See `docs/` directory

- `OPERATIONS.md` - Day-to-day operations guide
- `SECURITY.md` - Security best practices
- `docs/audits/` - Audit reports and compliance docs

**Issues**: https://github.com/Bboy9090/Bobbys_World_Tools/issues

---

**Deployment Guide Version**: 1.0  
**Last Updated**: December 17, 2024  
**Maintained By**: Pandora Codex Team

---

_"Deploy confidently. Scale reliably. Operate securely."_  
— **Pandora Codex Deployment Standards**

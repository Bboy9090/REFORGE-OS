# Operations Guide - Bobby's World Tools (Pandora Codex)

**Version**: 1.0  
**Date**: December 17, 2024  
**Audience**: System Administrators, DevOps, Support Staff

---

## 🎯 Overview

This guide covers day-to-day operations, monitoring, maintenance, and troubleshooting for Bobby's World Tools (Pandora Codex) deployments.

**Topics Covered:**

- Service management
- Monitoring and health checks
- Log management
- Backup and recovery
- Common troubleshooting scenarios
- Performance tuning

---

## 🚀 Service Management

### Starting Services

#### Manual Start (Development)

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

#### Production Start

```bash
# Start backend
cd server
npm start &

# Start frontend (production build)
npm run preview &
```

#### SystemD Service (Linux Production)

Create service file `/etc/systemd/system/pandora-backend.service`:

```ini
[Unit]
Description=Pandora Codex Backend API
After=network.target

[Service]
Type=simple
User=pandora
Group=pandora
WorkingDirectory=/opt/Bobbys_World_Tools/server
Environment="NODE_ENV=production"
Environment="PORT=3001"
EnvironmentFile=/etc/pandora-codex/backend.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Create service file `/etc/systemd/system/pandora-frontend.service`:

```ini
[Unit]
Description=Pandora Codex Frontend
After=network.target pandora-backend.service

[Service]
Type=simple
User=pandora
Group=pandora
WorkingDirectory=/opt/Bobbys_World_Tools
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable pandora-backend
sudo systemctl enable pandora-frontend

# Start services
sudo systemctl start pandora-backend
sudo systemctl start pandora-frontend

# Check status
sudo systemctl status pandora-backend
sudo systemctl status pandora-frontend
```

### Stopping Services

```bash
# Stop via systemd
sudo systemctl stop pandora-backend
sudo systemctl stop pandora-frontend

# Or kill manually
npm run server:kill
npm run kill
```

### Restarting Services

```bash
# Restart via systemd
sudo systemctl restart pandora-backend
sudo systemctl restart pandora-frontend

# Or graceful restart
sudo systemctl reload pandora-backend
```

---

## 📊 Monitoring

### Health Checks

#### Backend Health Endpoint

```bash
# Check backend health
curl -s http://localhost:3001/health | jq

# Expected output:
# {
#   "status": "ok",
#   "timestamp": 1234567890
# }
```

#### System Tools Check

```bash
# Check ADB
curl -s http://localhost:3001/api/system-tools | jq '.adb'

# Check all tools
curl -s http://localhost:3001/api/system-tools | jq
```

### Service Status Monitoring

#### Using SystemD

```bash
# Check service status
systemctl status pandora-backend
systemctl status pandora-frontend

# View service logs
journalctl -u pandora-backend -f
journalctl -u pandora-frontend -f
```

#### Monitor Script

Create `/usr/local/bin/pandora-monitor.sh`:

```bash
#!/bin/bash
# Pandora Codex Service Monitor

check_backend() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
    if [ "$response" != "200" ]; then
        echo "❌ Backend health check failed (HTTP $response)"
        return 1
    fi
    echo "✅ Backend healthy"
    return 0
}

check_frontend() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
    if [ "$response" != "200" ]; then
        echo "❌ Frontend not responding (HTTP $response)"
        return 1
    fi
    echo "✅ Frontend healthy"
    return 0
}

check_devices() {
    devices=$(curl -s http://localhost:3001/api/android-devices/all | jq '. | length')
    echo "📱 Detected devices: $devices"
}

echo "🔍 Pandora Codex Health Check - $(date)"
echo "=========================================="
check_backend
check_frontend
check_devices
echo ""
```

Make executable and run:

```bash
sudo chmod +x /usr/local/bin/pandora-monitor.sh
/usr/local/bin/pandora-monitor.sh
```

### Performance Monitoring

#### Resource Usage

```bash
# CPU and memory usage
ps aux | grep node

# Detailed process info
top -p $(pgrep -f "node.*server")

# Memory usage
free -h

# Disk usage
df -h /var/lib/pandora-codex
df -h /var/log/pandora-codex
```

#### WebSocket Connections

```bash
# Count active WebSocket connections
ss -an | grep :3001 | grep -i established | wc -l

# List WebSocket connections
ss -an | grep :3001 | grep -i established
```

---

## 📝 Log Management

### Log Locations

| Component          | Log Location                               |
| ------------------ | ------------------------------------------ |
| Backend API        | `/var/log/pandora-codex/api.log`           |
| Flash Operations   | `/var/log/pandora-codex/flash.log`         |
| Authorization      | `/var/log/pandora-codex/authorization.log` |
| Errors             | `/var/log/pandora-codex/error.log`         |
| SystemD (Backend)  | `journalctl -u pandora-backend`            |
| SystemD (Frontend) | `journalctl -u pandora-frontend`           |

### Viewing Logs

```bash
# Tail backend logs
tail -f /var/log/pandora-codex/api.log

# Tail with filter
tail -f /var/log/pandora-codex/api.log | grep ERROR

# View last 100 lines
tail -n 100 /var/log/pandora-codex/api.log

# View logs with timestamps
journalctl -u pandora-backend --since "1 hour ago"
```

### Log Rotation

Create `/etc/logrotate.d/pandora-codex`:

```
/var/log/pandora-codex/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 pandora pandora
    sharedscripts
    postrotate
        systemctl reload pandora-backend > /dev/null 2>&1 || true
    endscript
}
```

Test log rotation:

```bash
sudo logrotate -d /etc/logrotate.d/pandora-codex
sudo logrotate -f /etc/logrotate.d/pandora-codex
```

---

## 💾 Backup and Recovery

### What to Backup

1. **Configuration Files**

   - `.env` files
   - SystemD service files
   - Nginx configuration (if used)

2. **Data Directories**

   - `/var/lib/pandora-codex/snapshots/`
   - `/var/lib/pandora-codex/evidence/`
   - `/var/log/pandora-codex/` (optional)

3. **Application Code**
   - Entire repository (or use git)

### Backup Script

Create `/usr/local/bin/pandora-backup.sh`:

```bash
#!/bin/bash
# Pandora Codex Backup Script

BACKUP_DIR="/backup/pandora-codex"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/pandora-$DATE"

echo "📦 Starting Pandora Codex backup - $(date)"

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Backup configuration
echo "📄 Backing up configuration..."
cp /etc/pandora-codex/*.env "$BACKUP_PATH/" 2>/dev/null || true
cp /etc/systemd/system/pandora-*.service "$BACKUP_PATH/" 2>/dev/null || true

# Backup data directories
echo "💾 Backing up data directories..."
tar -czf "$BACKUP_PATH/snapshots.tar.gz" /var/lib/pandora-codex/snapshots/
tar -czf "$BACKUP_PATH/evidence.tar.gz" /var/lib/pandora-codex/evidence/

# Backup logs (last 7 days)
echo "📝 Backing up logs..."
find /var/log/pandora-codex/ -name "*.log" -mtime -7 -exec tar -czf "$BACKUP_PATH/logs.tar.gz" {} +

# Create checksum
echo "🔒 Creating checksums..."
cd "$BACKUP_PATH"
sha256sum * > checksums.txt

echo "✅ Backup complete: $BACKUP_PATH"
du -sh "$BACKUP_PATH"
```

Make executable and run:

```bash
sudo chmod +x /usr/local/bin/pandora-backup.sh
sudo /usr/local/bin/pandora-backup.sh
```

### Automated Backups

Add to crontab:

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/pandora-backup.sh >> /var/log/pandora-codex/backup.log 2>&1
```

### Recovery Procedure

```bash
# Stop services
sudo systemctl stop pandora-backend pandora-frontend

# Restore data
cd /backup/pandora-codex/pandora-20241217_020000/
tar -xzf snapshots.tar.gz -C /
tar -xzf evidence.tar.gz -C /

# Restore configuration
cp *.env /etc/pandora-codex/
cp pandora-*.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Start services
sudo systemctl start pandora-backend pandora-frontend

# Verify
sudo systemctl status pandora-backend
curl http://localhost:3001/health
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Backend Won't Start

**Symptoms:**

- Service fails to start
- Health check returns connection error

**Diagnosis:**

```bash
# Check service status
sudo systemctl status pandora-backend

# Check logs
journalctl -u pandora-backend -n 50

# Check port availability
sudo lsof -i :3001
```

**Resolution:**

```bash
# Kill any process using port 3001
sudo kill $(sudo lsof -t -i:3001)

# Restart service
sudo systemctl restart pandora-backend
```

#### Issue: High Memory Usage

**Symptoms:**

- System becomes slow
- OOM killer terminates processes

**Diagnosis:**

```bash
# Check memory usage
free -h
ps aux | grep node | awk '{sum+=$6} END {print sum/1024 " MB"}'
```

**Resolution:**

```bash
# Restart services to free memory
sudo systemctl restart pandora-backend

# Configure memory limits in systemd
sudo systemctl edit pandora-backend

# Add:
[Service]
MemoryMax=2G
MemoryHigh=1.5G
```

#### Issue: Device Not Detected

**Symptoms:**

- Connected device not showing
- Empty device list

**Diagnosis:**

```bash
# Test ADB directly
adb devices

# Test iOS
idevice_id -l

# Check USB permissions
ls -la /dev/bus/usb

# Check udev rules
cat /etc/udev/rules.d/51-android.rules
```

**Resolution:**

```bash
# Restart ADB server
adb kill-server
adb start-server

# Restart udev
sudo systemctl restart udev

# Re-plug device
```

#### Issue: WebSocket Connection Fails

**Symptoms:**

- Real-time updates not working
- "Demo Mode" banner appears

**Diagnosis:**

```bash
# Check WebSocket endpoint
wscat -c ws://localhost:3001/ws/device-events

# Check nginx config (if using reverse proxy)
sudo nginx -t
```

**Resolution:**

```bash
# Ensure WebSocket upgrade headers in nginx
sudo nano /etc/nginx/sites-available/pandora-codex

# Add:
location /ws {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Reload nginx
sudo systemctl reload nginx
```

---

## ⚡ Performance Tuning

### Backend Optimization

Edit `.env` or systemd service:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096"

# Enable production optimizations
NODE_ENV=production
```

### Database Tuning (Future)

When database is added:

```sql
-- Optimize evidence queries
CREATE INDEX idx_evidence_timestamp ON evidence_bundles(timestamp);
CREATE INDEX idx_evidence_device ON evidence_bundles(device_id);

-- Optimize authorization logs
CREATE INDEX idx_auth_timestamp ON authorization_logs(timestamp);
```

### Caching Strategy

Configure nginx caching for static assets:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 📊 Metrics and Alerting

### Prometheus Metrics (Optional)

Install prometheus-client:

```bash
cd server
npm install prom-client
```

Add to `server/index.js`:

```javascript
const promClient = require("prom-client");
const register = new promClient.Registry();

// Collect default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});
register.registerMetric(httpRequestDuration);

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

### Alert Rules

Example alerts for monitoring system:

```yaml
# Prometheus alert rules
groups:
  - name: pandora_codex
    rules:
      - alert: BackendDown
        expr: up{job="pandora-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Pandora backend is down"

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 2000000000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
```

---

## 📞 Support and Escalation

### Support Tiers

1. **Tier 1: User Support**

   - Device detection issues
   - Basic troubleshooting
   - Documentation questions

2. **Tier 2: System Administration**

   - Service failures
   - Performance issues
   - Configuration changes

3. **Tier 3: Development Team**
   - Code bugs
   - Feature requests
   - Architecture changes

### Escalation Procedure

1. Check this operations guide
2. Review logs and health checks
3. Attempt standard troubleshooting
4. If unresolved, create GitHub issue with:
   - Error logs
   - System information
   - Steps to reproduce
   - Expected vs actual behavior

---

## 📝 Maintenance Schedule

### Daily

- ✅ Monitor health checks
- ✅ Review error logs
- ✅ Check disk usage

### Weekly

- ✅ Review performance metrics
- ✅ Verify backups completed
- ✅ Check for updates

### Monthly

- ✅ Review and archive old logs
- ✅ Clean up old snapshots (retention policy)
- ✅ Verify disaster recovery procedures
- ✅ Review security audit logs

### Quarterly

- ✅ Update dependencies
- ✅ Review and update documentation
- ✅ Conduct security audit
- ✅ Test backup restoration

---

**Operations Guide Version**: 1.0  
**Last Updated**: December 17, 2024  
**Next Review**: March 17, 2025

---

_"Monitor actively. Respond quickly. Document thoroughly."_  
— **Pandora Codex Operations Standards**

# API Migration Status - /api/v1 Implementation

**Current Phase:** Core Infrastructure + Critical Endpoints

---

## ✅ Completed Migrations

### Core Infrastructure
- ✅ API Envelope middleware (`server/middleware/api-envelope.js`)
- ✅ Correlation ID middleware
- ✅ API versioning middleware (`server/middleware/api-versioning.js`)
- ✅ /api/v1 router structure
- ✅ GET /api/v1/health
- ✅ GET /api/v1/ready
- ✅ GET /api/v1/routes (dev-only)

### Critical Endpoints (v1)
- ✅ GET /api/v1/system-tools
- ✅ GET /api/v1/adb/devices
- ✅ POST /api/v1/adb/command
- ✅ GET /api/v1/adb/device-info
- ✅ GET /api/v1/fastboot/devices
- ✅ GET /api/v1/fastboot/device-info
- ✅ POST /api/v1/fastboot/unlock (with policy checks)
- ✅ POST /api/v1/fastboot/flash (with confirmation)
- ✅ POST /api/v1/fastboot/erase (with confirmation + policy)
- ✅ POST /api/v1/fastboot/reboot

### Detection Endpoints (v1)
- ✅ POST /api/v1/frp/detect
- ✅ POST /api/v1/mdm/detect
- ✅ GET /api/v1/ios/scan

### Placeholder Endpoints (v1 - NOT_IMPLEMENTED envelopes)
- ✅ GET /api/v1/monitor/live
- ✅ POST /api/v1/monitor/start
- ✅ POST /api/v1/monitor/stop
- ✅ POST /api/v1/tests/run
- ✅ GET /api/v1/tests/results
- ✅ GET /api/v1/firmware/brands
- ✅ GET /api/v1/firmware/:brand
- ✅ POST /api/v1/firmware/download

### Router Mounts (v1)
- ✅ /api/v1/catalog (from catalogRouter)
- ✅ /api/v1/operations (from operationsRouter)
- ✅ /api/v1/trapdoor (from trapdoorRouter)

---

## ⏳ Remaining Migrations

### Legacy Endpoints (Still on /api/*, need v1 migration)
- ⏳ /api/system-tools → /api/v1/system-tools ✅ (already migrated)
- ⏳ /api/adb/* → /api/v1/adb/* ✅ (already migrated)
- ⏳ /api/fastboot/* → /api/v1/fastboot/* ✅ (already migrated)
- ⏳ /api/flash/* → /api/v1/flash/*
- ⏳ /api/bootforgeusb/* → /api/v1/bootforgeusb/*
- ⏳ /api/authorization/* → /api/v1/authorization/*
- ⏳ /api/hotplug/* → /api/v1/hotplug/*
- ⏳ /api/standards → /api/v1/standards
- ⏳ /api/system-info → /api/v1/system-info
- ⏳ /api/tools/* → /api/v1/tools/*

### Endpoints Still Using Legacy Format (need envelope)
All remaining endpoints in server/index.js that use `res.json()` directly need to:
1. Be migrated to v1 router
2. Use `res.sendEnvelope()` or `res.sendError()`
3. Include correlation IDs
4. Follow envelope format

---

## 📋 Migration Checklist

### Phase 1: Core ✅
- [x] Envelope middleware
- [x] Correlation ID middleware
- [x] Versioning middleware
- [x] /ready endpoint
- [x] /routes endpoint

### Phase 2: Critical Endpoints ✅
- [x] System tools
- [x] ADB endpoints
- [x] Fastboot endpoints
- [x] FRP/MDM/iOS detection

### Phase 3: Placeholders ✅
- [x] Monitor endpoints (NOT_IMPLEMENTED)
- [x] Tests endpoints (NOT_IMPLEMENTED)
- [x] Firmware endpoints (NOT_IMPLEMENTED)

### Phase 4: Remaining Migrations ⏳
- [ ] Flash operation endpoints
- [ ] BootForge USB endpoints
- [ ] Authorization trigger endpoints
- [ ] Hotplug endpoints
- [ ] Standards endpoint
- [ ] System info endpoint
- [ ] Tools management endpoints

### Phase 5: Frontend Updates ⏳
- [ ] Update apiConfig.ts to use /api/v1
- [ ] Create envelope parsing utilities
- [ ] Update all API clients
- [ ] Add version compatibility checking
- [ ] Update error handling

### Phase 6: WebSocket Reliability ⏳
- [ ] Add apiVersion to WS messages
- [ ] Add correlation IDs to WS events
- [ ] Implement ping/pong heartbeats
- [ ] Update frontend WS hooks

### Phase 7: Security & Testing ⏳
- [ ] Replace execSync with spawn
- [ ] Add rate limiting
- [ ] Contract tests
- [ ] Route mount verification

---

## Next Steps

1. Continue migrating remaining endpoints to v1
2. Update frontend API config
3. Add WebSocket reliability
4. Security pass
5. Testing


# REFORGE OS — Master Implementation Plan
## Bobby's Workshop 3.0 — Complete System Build

**Status:** 🚀 EXECUTING  
**Date:** 2025-01-10  
**Goal:** Merge all three legendary layers into one unified, compliance-first platform

---

## 🎯 THE THREE LAYERS (FINAL ARCHITECTURE)

### Layer 1: Bobby's Workshop (Public UI)
- **Location:** `apps/workshop-ui/`
- **Tech:** Tauri + React + TypeScript
- **Theme:** Bronx Night (Super Mario-inspired: neon cyan #2DD4FF, magenta #FF3DBB, dark backgrounds)
- **Purpose:** Trust, education, UX, community, certification

### Layer 2: ForgeWorks Core (Compliance Spine)
- **Location:** `services/` (Rust) + `api/` (FastAPI bridge)
- **Tech:** Rust microservices + FastAPI orchestrator
- **Purpose:** Device analysis, ownership verification, legal classification, audit logging, authority routing

### Layer 3: Pandora Codex (Internal Vault)
- **Location:** `internal/pandora-codex/`
- **Tech:** Markdown knowledge base + Rust risk models
- **Purpose:** R&D knowledge vault, risk modeling, language shaping
- **RULE:** NEVER SHIPS PUBLICLY

---

## 📋 IDENTIFIED JOBS (FROM THREAD ANALYSIS)

### Job Cluster 1: Frontend-Backend Wiring
- [ ] Wire DeviceOverview.tsx → `/api/v1/device/analyze`
- [ ] Wire ComplianceSummary.tsx → `/api/v1/compliance/summary`
- [ ] Wire LegalClassification.tsx → `/api/v1/legal/classify`
- [ ] Wire CustodianVaultGate.tsx → `/api/v1/interpretive/review` (gated)
- [ ] Wire CertificationDashboard.tsx → `/api/v1/certification/status`
- [ ] Wire OpsDashboard.tsx → `/api/v1/ops/metrics`
- [ ] Wire AuditLogTab.tsx → `/api/v1/audit/events`
- [ ] Wire EvidenceBundleTab.tsx → `/api/v1/evidence/export`

### Job Cluster 2: Backend API Implementation
- [ ] Create FastAPI endpoints for all ForgeWorks services
- [ ] Integrate Rust services via FFI or HTTP
- [ ] Implement Python worker HTTP server (`python/app/main.py`)
- [ ] Wire Python worker to Rust services
- [ ] Add ownership verification gates to all endpoints
- [ ] Add audit logging to all actions
- [ ] Add jurisdiction-aware routing

### Job Cluster 3: Design & Branding
- [ ] Generate SVG icons (app-icon, shield-analysis, vault-mark, workshop-mark)
- [ ] Generate splash screens (dark/light variants)
- [ ] Apply Bronx Night theme (neon cyan/magenta) to all UI
- [ ] Create dark/light theme toggle
- [ ] Add safe animations (fade, slide, pulse - no action triggers)
- [ ] Wire PDF export with branding

### Job Cluster 4: Custodian Vault (Bobby's Secret Room)
- [ ] Implement interpretive mode (analysis-only)
- [ ] Add ownership confidence gating (≥85)
- [ ] Add role-based access (Custodian role)
- [ ] Wire to Pandora Codex risk models (internal only)
- [ ] Generate compliance documentation
- [ ] Add external authority routing
- [ ] Ensure all actions are logged

### Job Cluster 5: Pandora Codex Integration
- [ ] Ensure all tool lists are properly framed (internal only)
- [ ] Wire capability-awareness service to Pandora knowledge
- [ ] Use Pandora for risk scoring only (never instructions)
- [ ] Verify no Pandora content leaks to public APIs
- [ ] Add CI guardrails to prevent leaks

### Job Cluster 6: Python Bundling & Tauri Integration
- [ ] Bundle Python runtime into Tauri resources
- [ ] Implement Tauri auto-launcher (`src-tauri/src/launcher.rs`)
- [ ] Wire health check gating in UI
- [ ] Test end-to-end lifecycle (launch → health → UI → shutdown)

### Job Cluster 7: Documentation & Compliance
- [ ] Generate final README for each layer
- [ ] Create launch checklist
- [ ] Generate app store submission notes
- [ ] Create regulator briefing materials
- [ ] Final compliance disclaimers

---

## 🔧 IMPLEMENTATION ORDER (CRITICAL PATH)

### Phase 1: Backend Foundation (DO FIRST)
1. Create FastAPI server that integrates Rust services
2. Implement all required API endpoints
3. Add Python worker HTTP server
4. Wire health checks and readiness gates

### Phase 2: Frontend Wiring (DO SECOND)
1. Update API client with all new endpoints
2. Wire each page component to backend
3. Add loading states and error handling
4. Test data flow end-to-end

### Phase 3: Design Polish (DO THIRD)
1. Generate icons and splash screens
2. Apply Bronx Night theme
3. Add animations
4. Wire PDF export

### Phase 4: Custodian Vault (DO FOURTH)
1. Implement gating logic
2. Wire to Pandora Codex (internal)
3. Add interpretive mode UI
4. Test access controls

### Phase 5: Final Polish (DO LAST)
1. Documentation
2. Testing
3. Deployment prep

---

## 🎨 DESIGN SYSTEM (BRONX NIGHT / SUPER MARIO THEME)

### Color Palette
- **Primary Accent:** Neon Cyan `#2DD4FF` (spray-cyan)
- **Secondary Accent:** Neon Magenta `#FF3DBB` (spray-magenta)
- **Background:** Midnight `#0F1114` (midnight-room)
- **Surface:** Workbench Steel `#161A1F` (workbench-steel)
- **Text:** Soft Ash `#E8EAED` (ink-primary)
- **Status Ready:** CRT Green `#35FF9A` (state-ready)
- **Status Warning:** Tape Yellow `#FFD400` (state-warning)
- **Status Danger:** Red `#E11D48` (state-danger)

### Typography
- **Body:** System sans-serif
- **Mono:** SF Mono, Monaco, Fira Code
- **Headers:** Bold, slightly condensed

### Effects
- **Neon Glow:** `box-shadow: 0 0 12px rgba(45, 212, 255, 0.55)`
- **Magenta Glow:** `box-shadow: 0 0 14px rgba(255, 61, 187, 0.45)`
- **Animations:** Fade, slide, pulse (safe, non-action)

---

## 🔒 COMPLIANCE RULES (NON-NEGOTIABLE)

### Language Rules
✅ **Use:**
- Analyze, Interpret, Classify, Route
- External authorization required
- Logged for compliance

❌ **Never Use:**
- Bypass, Unlock, Jailbreak, Root
- Apply, Remove, Execute
- Works on, Supported exploit

### API Rules
✅ **Allowed Endpoints:**
- `/device/analyze`
- `/ownership/verify`
- `/legal/classify`
- `/route/authority`
- `/audit/log`

❌ **Forbidden Endpoints:**
- `/execute`
- `/bypass`
- `/unlock`
- `/root`
- `/jailbreak`

### Pandora Codex Rules
- ✅ May inform risk scoring
- ✅ May shape language
- ✅ May influence classification
- ❌ Never surfaces instructions
- ❌ Never surfaces tools
- ❌ Never surfaces automation

---

## 📦 DELIVERABLES CHECKLIST

### Backend
- [ ] FastAPI server with all endpoints
- [ ] Rust service integration
- [ ] Python worker HTTP server
- [ ] Health/readiness endpoints
- [ ] Audit logging system
- [ ] Ownership verification gates

### Frontend
- [ ] All pages wired to backend
- [ ] API client complete
- [ ] Error handling
- [ ] Loading states
- [ ] Theme system (dark/light)
- [ ] Animations

### Design Assets
- [ ] App icon (SVG + PNG variants)
- [ ] Splash screens (dark/light)
- [ ] Shield analysis icon
- [ ] Vault mark icon
- [ ] Workshop mark icon
- [ ] PDF template with branding

### Documentation
- [ ] README for each layer
- [ ] API documentation
- [ ] Launch checklist
- [ ] App store notes
- [ ] Regulator briefing

### Testing
- [ ] End-to-end flow test
- [ ] Health gate test
- [ ] Ownership gate test
- [ ] Audit log test
- [ ] PDF export test

---

## 🚀 EXECUTION STATUS

**Current Phase:** Phase 1 - Backend Foundation  
**Next Action:** Create FastAPI server integrating Rust services

---

**This is the master plan. All work follows this structure.**
# UI/UX Overhaul Implementation Plan
## Bobby's Workshop & His World of Secrets and Traps

**Status:** Foundation Complete — Ready for Component Migration

---

## ✅ COMPLETED FOUNDATION

### 1. Design Token System
- **File:** `src/styles/design-tokens.css`
- **Status:** Complete with all canon colors, surfaces, states, motion
- **Tailwind Config:** `tailwind.config.js` — Full token mapping

### 2. Core Components Created
- `WorkbenchDeviceStack` — Device pile list (not sterile table)
- `ToolboxDangerLever` — Hold-to-confirm for destructive ops
- `TrapdoorEntryGate` — Secret Rooms ritual entry

### 3. Component Naming Convention
**Pattern:** `[Domain][Surface][Role]`

**Domains:**
- `Workbench*` — Main work surfaces
- `Toolbox*` — Interactive controls
- `Terminal*` — Logs, commands, serials
- `Trapdoor*` — Secret Rooms
- `Overlay*` — Modals, drawers
- `Ornament*` — Environmental elements

---

## 📋 NEXT STEPS (Priority Order)

### Phase 1: Core Layout Migration (Week 1)
1. **Update DashboardLayout**
   - Apply design tokens
   - Implement workbench surfaces
   - Add "What's up, doc?" greeting
   - Wire backend health status

2. **Create Loading/Splash Pages**
   - Loading: Wires & Pulse (Concept A)
   - Splash: The Wall (Concept A)
   - Cover: Graffiti Blueprint (Concept A)

3. **Migrate Device Components**
   - Convert device lists to `WorkbenchDeviceStack`
   - Add correlation badges
   - Implement hotplug animations

### Phase 2: Secret Rooms Implementation (Week 2)
1. **Trapdoor Flow**
   - Complete `TrapdoorEntryGate` integration
   - Create room navigation (door plaques)
   - Implement ritual sequences

2. **Unlock Chamber**
   - Bootloader unlock with full confirmation
   - FRP bypass interface
   - Command preview panels

3. **Shadow Archive**
   - Encrypted log viewer
   - Analytics dashboard
   - Export functionality

### Phase 3: Flashing & Operations (Week 3)
1. **Flash Panels**
   - Universal flash with heavy confirmations
   - Multi-brand flash (Odin/MTK/EDL)
   - Flash history & status

2. **Command Preview**
   - Always-visible command preview
   - Impact analysis (partitions affected)
   - Expected output preview

### Phase 4: Polish & Integration (Week 4)
1. **Frontend↔Backend Integrity**
   - Single API client with envelope parsing
   - WebSocket integration (3 endpoints)
   - State management (health, locks, operations)

2. **Micro-interactions**
   - Shake on denial
   - Flicker on warnings
   - Snap transitions

3. **Audio System** (Optional)
   - OFF by default
   - Instrumentals only
   - Context-aware ducking

---

## 🎨 SCREEN MOCKUP SPECS

### 1. Dashboard
**Layout:**
- Header: Logo + "What's up, doc?" + Backend status
- Sidebar: Device list (collapsible)
- Workbench: Quick actions + System status
- Terminal: Recent logs (bottom, collapsible)

**Components:**
- `WorkbenchQuickActions`
- `WorkbenchSystemStatus`
- `TerminalLogStream` (collapsible)

**Tokens:**
- Surface: `midnight-room` / `workbench-steel`
- Accent: `spray-cyan` (active items)
- Border: `panel`

---

### 2. Devices
**Layout:**
- Header: Scan button + Filter
- Main: `WorkbenchDeviceStack` (device pile)
- Sidebar: Selected device details

**Components:**
- `WorkbenchDeviceStack`
- `WorkbenchDeviceDetails`
- `OrnamentCableRun` (visual divider)

**Tokens:**
- Surface: `workbench-steel`
- Accent: `spray-cyan` (selected)
- State: `state-ready` (connected)

---

### 3. Flashing
**Layout:**
- Header: Active jobs count
- Main: Job list + History
- Sidebar: Device selector + Partition list
- Modal: Flash confirmation (heavy gates)

**Components:**
- `WorkbenchFlashJobs`
- `WorkbenchFlashHistory`
- `ToolboxDangerLever` (confirmation)
- `TerminalCommandPreview`

**Tokens:**
- Surface: `workbench-steel`
- Accent: `tape-yellow` (warning)
- State: `state-danger` (destructive)

---

### 4. Secret Rooms
**Layout:**
- Gate: `TrapdoorEntryGate` (full screen)
- Inside: Door plaques (left) + Workbench (right)
- Alarm strip: System status + Locks + Active ops

**Components:**
- `TrapdoorEntryGate`
- `TrapdoorRoomNavigation`
- `TrapdoorUnlockChamber`
- `TrapdoorShadowArchive`

**Tokens:**
- Surface: `drawer-hidden` (gate) / `basement-concrete` (inside)
- Accent: `spray-magenta` (entry edges)
- State: `state-danger` (warnings)

---

## 🔌 INTEGRATION CHECKLIST

### API Client
- [ ] Single `useApiClient` hook
- [ ] Envelope parsing (`{ok, data, meta}`)
- [ ] Error normalization
- [ ] Retry logic (safe requests only)
- [ ] Timeout & cancellation

### WebSockets
- [ ] `ws://localhost:3001/ws/device-events`
- [ ] `ws://localhost:3001/ws/correlation`
- [ ] `ws://localhost:3001/ws/analytics`
- [ ] Auto-reconnect with exponential backoff
- [ ] Connection state indicators

### State Management
- [ ] Backend health (single source)
- [ ] Catalog loaded state
- [ ] Device locks (per device)
- [ ] Active operations (flash jobs, etc.)

### UI↔Backend Integrity
- [ ] All endpoints match `/api/v1/*` exactly
- [ ] No hardcoded tool lists (use catalog)
- [ ] All responses use envelope format
- [ ] Device locking UI reflects backend state
- [ ] Graceful degraded mode when backend offline

---

## 🎯 COMPONENT MIGRATION MAP

### Existing → New
- `DeviceDetectionPanel` → `WorkbenchDeviceStack`
- `FastbootFlashingPanel` → `WorkbenchFlashForge`
- `ConfirmationDialog` → `ToolboxDangerLever` + `TerminalCommandPreview`
- `ShadowLogsViewer` → `TerminalShadowLog`
- `TrapdoorControlPanel` → `TrapdoorEntryGate` + Room navigation

### New Components Needed
- `WorkbenchQuickActions`
- `WorkbenchSystemStatus`
- `TerminalLogStream`
- `TerminalCommandPreview`
- `TrapdoorRoomNavigation`
- `TrapdoorUnlockChamber`
- `TrapdoorWorkflowForge`
- `TrapdoorShadowArchive`
- `OrnamentGraffitiTag`
- `OrnamentCableRun`
- `OverlayDrawer`

---

## 📝 "WHAT'S UP, DOC?" IMPLEMENTATION

**Rules:**
- Never block UI (no modal, no splash delay)
- Once per session (default)
- Auto-fade after 3-5s
- Suppressed during: flashing, unlocking, destructive ops, Secret Room rituals

**Placement:**
- Header status strip OR first terminal boot line

**Variants:**
- Clean: "What's up, doc?"
- Devices connected: "What's up, doc? You're wired in."
- Warning: "Ehhh… what's up, doc? Something's off."
- Secret room pre-gate: "What's up, doc… tread carefully."

**Settings Toggle:**
- Show greeting on startup (default ON)
- Always show greeting (advanced)
- Disable greeting

---

## 🚀 READY TO SHIP

Foundation is complete. Next:
1. Create loading/splash/cover pages
2. Migrate DashboardLayout
3. Implement Secret Rooms flow
4. Wire frontend↔backend integrity

**The lights are on. The doorbell might ring.**


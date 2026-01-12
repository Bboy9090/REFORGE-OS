# Architecture Analysis
## Bobby's Workshop 3.0 - Repair Shop Management System

**Analysis Date**: 2025-01-XX

---

## A) APP IDENTITY (From Documentation)

### App Name
**Bobby's Workshop 3.0** (also referred to as "ForgeWorks" and "REFORGE OS")

### Purpose
A compliance-first device repair shop management platform that provides device analysis, authorized diagnostics, recovery guidance, and evidence bundle generation. The platform emphasizes analysis and documentation over device modification, with strict policy gates preventing circumvention.

### Target Users
- Repair shop technicians
- Device repair professionals
- Case managers

### Core Problems Solved
1. **Device Analysis** - Safe, read-only device diagnostics
2. **Case Management** - Track repair jobs from intake to completion
3. **Compliance** - Policy-gated operations with immutable audit trails
4. **Recovery Guidance** - Official OEM firmware sources and recovery steps
5. **Evidence Collection** - Generate support bundles for OEM/carrier requests

### MVP Features Status

| Feature | Status | Location |
|---------|--------|----------|
| Case Management | ✅ Complete | `cases/manager.py`, API endpoints |
| Device Detection | ✅ Complete | `device_detection/detector.py` |
| Policy Gates | ✅ Complete | `policy_gates/gates.py` |
| Authorized Diagnostics | ✅ Complete | `diagnostics/workflow.py` |
| Recovery Guidance | ✅ Complete | `recovery/recovery_guidance.py` |
| Evidence Bundles | ✅ Complete | `recovery/evidence_bundles.py` |
| Audit Logging | ✅ Complete | `audit/logger.py` |
| FastAPI Backend | ✅ Complete | `api/main.py` |
| React Frontend | ⏳ Partial | `apps/workshop-ui/src/` |
| **UI/API Integration** | ❌ **MISSING** | **NEEDS IMPLEMENTATION** |

---

## B) SOURCE-OF-TRUTH MAP

### Key Markdown Files

1. **REPO_GENESIS.md** - Project constitution, core principles, three-layer architecture (Bobby's Workshop, ForgeWorks Core, Pandora Codex)
2. **LEGITIMATE_IMPLEMENTATION_GUIDE.md** - Implementation guidelines, policy gates, compliance rules
3. **CURSOR_RULES.md** - AI assistant directives for development
4. **README.md** - Public-facing overview
5. **IMPLEMENTATION_STATUS.md** - Current implementation status
6. **PHASE4_5_INTEGRATION_SUMMARY.md** - Recovery and audit components summary

### Key Code Entry Points

1. **Frontend Root**: `apps/workshop-ui/src/main.tsx`
2. **Frontend App**: `apps/workshop-ui/src/App.tsx`
3. **Pages**: `apps/workshop-ui/src/pages/`
   - `IntakeTab.tsx` - Case intake (uses Tauri invokes, needs API integration)
   - `DiagnosticsTab.tsx` - Diagnostics (placeholder, needs full implementation)
4. **API Root**: `api/main.py` - FastAPI service (port 8001)
5. **Case Management**: `cases/manager.py`
6. **Device Detection**: `device_detection/detector.py`
7. **Diagnostics**: `diagnostics/workflow.py`
8. **Policy Gates**: `policy_gates/gates.py`
9. **Recovery**: `recovery/` modules
10. **Audit**: `audit/logger.py`

### Current Architecture

- **Backend**: FastAPI (Python) - `api/main.py`
- **Frontend**: React + TypeScript + Tauri - `apps/workshop-ui/`
- **Storage**: JSON files in `storage/` directory
- **Communication**: Currently uses Tauri `invoke()` for backend calls, needs HTTP API integration

---

## C) IMPLEMENTATION PLAN

### Critical Gap Identified
The React frontend (`apps/workshop-ui`) currently uses Tauri `invoke()` calls, but the new FastAPI service (`api/main.py`) provides REST endpoints. These need to be integrated.

### Implementation Tasks

1. ✅ **Create API Client Utility** (`apps/workshop-ui/src/lib/api-client.ts`)
   - HTTP client for FastAPI endpoints
   - Error handling
   - Type definitions

2. ✅ **Update IntakeTab.tsx**
   - Replace Tauri invokes with API calls
   - Use `/api/v1/cases` endpoints
   - Add device detection integration

3. ✅ **Implement DiagnosticsTab.tsx**
   - Policy gates UI (ownership checkbox, confirmation)
   - Device selection
   - Diagnostics workflow integration
   - Results display
   - Report viewing

4. ✅ **Add Environment Configuration**
   - API base URL configuration
   - Environment variables

5. ✅ **Test Integration**
   - Verify API connectivity
   - Test case creation flow
   - Test diagnostics workflow

---

## D) IMPLEMENTATION

Starting implementation...

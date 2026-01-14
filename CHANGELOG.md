# Changelog

All notable changes to REFORGE OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-01-XX

### Added
- **Trapdoor API Backend**: Complete admin/secret room API with 8 endpoints
  - FRP bypass workflow execution
  - Bootloader unlock workflow
  - Custom workflow execution
  - Batch command execution
  - Shadow logging system with AES-256-GCM encryption
  - Log rotation and statistics
- **Custodial Closet Solutions Database**: Expanded from 4 to 18 solutions
  - Linux solutions (3): GRUB recovery, disk cleanup, service troubleshooting
  - Windows solutions (4): Boot loop, BSOD, performance, network
  - Mac solutions (3): Recovery mode, NVRAM reset, battery issues
  - Android solutions (4): Boot loop, charging, app crashes, performance
  - iOS solutions (4): Power issues, recovery mode, touch screen, overheating
- **REFORGE Professional Theme**: Complete theme consistency across all 29 pages
  - Dark blue-grey surfaces with metallic gold/bronze accents
  - Steel blue highlights
  - Consistent CSS variable system
- **New App Icon**: Updated to REFORGE Professional Theme colors (steel blue on dark blue-grey)
- **API Client Enhancements**: 
  - Retry logic with exponential backoff
  - Comprehensive error handling
  - Trapdoor API integration
  - Custodial Closet API integration

### Changed
- **Theme System**: Migrated from Bronx Night theme to REFORGE Professional Theme
- **Solutions Database**: Expanded coverage across all device types
- **Backend Architecture**: Integrated Trapdoor API into main API server
- **Icon Assets**: Updated to match active theme colors

### Fixed
- ComplianceSummaryNew: Fixed missing `exporting` state variable
- Theme consistency: All 29 pages now use REFORGE Professional Theme
- API client: Proper error handling and retry logic

### Security
- **Shadow Logging**: AES-256-GCM encryption for sensitive operations
- **Tamper Detection**: SHA-256 hashing for log integrity verification
- **API Authentication**: X-API-Key header authentication for Trapdoor endpoints
- **Authorization Checks**: Required for high-risk workflows

### Documentation
- Added `BACKEND_IMPLEMENTATION_COMPLETE.md`
- Added `RELEASE_PREPARATION.md`
- Added `MONOREPO_STRUCTURE.md`
- Updated architecture documentation

---

## [2.0.0] - Previous Release

### Added
- Initial Tauri/React application structure
- Core device analysis modules
- Compliance-first architecture
- Pandora Codex internal knowledge base

---

## [1.0.0] - Initial Release

### Added
- Basic platform structure
- Three-layer architecture (Workshop, ForgeWorks, Pandora Codex)
- Initial Rust services
- FastAPI backend

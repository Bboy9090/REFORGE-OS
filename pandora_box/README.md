# Pandora Box

Hidden modules and advanced device operation tools.

## ⚠️ WARNING: AUTHORIZED USE ONLY ⚠️

This directory contains powerful device exploitation and bypass tools intended **ONLY** for:

- Devices you personally own
- Devices with explicit written owner authorization
- Professional repair contexts with proper documentation

Unauthorized access to devices is **ILLEGAL** under:

- Computer Fraud and Abuse Act (CFAA) - United States
- Computer Misuse Act - United Kingdom
- Similar laws in most jurisdictions

## Structure

- **modules/** - Advanced operation modules
- **binaries/** - Tool executables (NOT committed to git)
- **configs/** - Tool configurations
- **manifests/** - Tool manifests with signatures

## Security

- All tools are signature-verified before execution
- Operations run in Firejail sandbox (no network, no root)
- Full audit logging to shadow logs
- Requires admin-level authorization

## Tools

Available tool categories:

- iOS Tools (A5-A11): checkra1n, palera1n, lockra1n
- iOS Tools (A12+): MinaCriss, iRemovalTools
- Android Tools: FRP helpers, Magisk, TWRP
- System Tools: EFI unlockers

See `TRAPDOOR_CLI_USAGE.md` for complete documentation.

## Legal Notice

The developers assume **NO LIABILITY** for misuse of this software.
Use responsibly. Repair ethically. Respect the law.

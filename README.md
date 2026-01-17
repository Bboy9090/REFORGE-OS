🧠 REFORGE OS — reforge-os/README.md

Reforge OS

Professional Repair, Diagnostics, and System Recovery Platform

Overview

Reforge OS is a clean, enterprise-ready platform for diagnosing, recovering, and reviving systems across computers and devices. It is designed for repair shops, IT teams, and enterprises that need reliable, auditable workflows.

Capabilities
	•	System diagnostics (Windows, macOS, Linux)
	•	Android & iOS device state detection
	•	Boot repair and OS recovery
	•	OS installation and reinstallation
	•	Evidence and report generation
	•	Case and device tracking
	•	Immutable audit logging
	•	Bulk deployment and licensing

Architecture

Reforge OS
→ Phoenix Core
→ libbootforge
→ BootForge USB
→ Hardware

Supported Platforms
	•	Windows PCs
	•	macOS (Intel & Apple Silicon)
	•	Linux workstations
	•	Android devices (ADB/Fastboot)
	•	iOS devices (state detection)

Design Principles
	•	Compliance-first
	•	Fully auditable
	•	Analysis over automation
	•	Professional, defensible workflows

Reforge OS is the public, sellable flagship.
⸻
📦 SHARED CORE — bootforge-core/README.md

BootForge Core Stack

BootForge Core is the shared infrastructure used by all Bobby platforms. It is not an app and has no UI.

Components
	•	BootForge USB — Rust hardware & boot engine
	•	libbootforge — Cross-platform abstraction bridge
	•	Phoenix Core — State, policy, and Phoenix Key intelligence
	•	Phoenix Key — Physical recovery USB built on this stack

What It Does
	•	Enumerates USB devices across Windows, macOS, Linux
	•	Detects device states (normal, recovery, DFU, fastboot, bootloader)
	•	Handles storage, imaging, and bootable media creation
	•	Normalizes hardware data for higher-level apps
	•	Generates and validates Phoenix Keys for trusted recovery workflows

What It Does Not Do
	•	No UI
	•	No policy decisions
	•	No workflow execution
	•	No cloud dependency

This stack observes, normalizes, and enables. Applications decide how it’s used.

⸻
🔑 PHOENIX KEY — phoenix-key/README.md

Phoenix Key

Portable System Recovery & Revival USB

Definition

Phoenix Key is a physical recovery USB that can be inserted into a computer or laptop at any system state to diagnose, recover, revive, or reinstall operating systems. It operates independently of the host OS.

Capabilities
	•	Independent boot into recovery environments
	•	System state detection and snapshotting
	•	Boot repair and revival
	•	OS installation/reinstallation (Windows, Linux; macOS where supported)

Built With
	•	BootForge USB
	•	libbootforge
	•	Phoenix Core

Used By
	•	Reforge OS
	•	
🔗 FINAL STACK (REFERENCE)

Super Bobby’s World of Warp Pipes
              ↓
       Bobby’s Secret Workshop
              ↓
            Reforge OS
              ↓
         Phoenix Core
              ↓
         libbootforge
              ↓
         BootForge USB
              ↓
            Hardware


⸻


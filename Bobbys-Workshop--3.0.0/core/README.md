# Core Backend APIs

This directory contains the core backend APIs, libraries, and task management for Bobby's Secret Workshop.

## Structure

- **api/** - API handlers for REST endpoints (Express/Fastify)
- **lib/** - Core libraries for device interaction (ADB, Fastboot, iOS tools)
- **tasks/** - Background task definitions for workflow execution (BullMQ/Redis)

## Purpose

The core module provides the foundational infrastructure for:

- Device detection and management
- Workflow execution and orchestration
- Secure command execution with authorization
- Real-time progress tracking via WebSockets

## Security

All operations require proper authorization. Sensitive operations are logged to shadow logs with encryption.

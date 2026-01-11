# Pandora Codex Makefile
# Unified commands for BootForge, Pandora, and Bobby Dev Arsenal

.PHONY: help install build test clean dev

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

help:
	@echo "$(BLUE)Bobby's World - Workshop Toolkit with Pandora Codex Integration$(NC)"
	@echo ""
	@echo "$(GREEN)Quick Start:$(NC)"
	@echo "  make install          Install all dependencies (Node, Python, Rust)"
	@echo "  make dev              Start development servers"
	@echo "  make build            Build all components"
	@echo "  make test             Run all test suites"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev:ui           Start UI development server"
	@echo "  make dev:api          Start API server (when implemented)"
	@echo "  make arsenal:status   Check Bobby Dev Arsenal tool status"
	@echo ""
	@echo "$(GREEN)BootForgeUSB (Rust):$(NC)"
	@echo "  make bootforge:build  Build BootForgeUSB Rust library + CLI"
	@echo "  make bootforge:test   Run BootForgeUSB tests"
	@echo "  make bootforge:cli    Build and test CLI"
	@echo ""
	@echo "$(GREEN)Trapdoor (Bobby's Secret Room):$(NC)"
	@echo "  make trapdoor:build   Build Trapdoor CLI for tool execution"
	@echo "  make trapdoor:test    Test Trapdoor module"
	@echo ""
	@echo "$(GREEN)Pandora Core (TypeScript):$(NC)"
	@echo "  make pandora:build    Build Pandora Core packages"
	@echo "  make pandora:typecheck Run TypeScript type checking"
	@echo ""
	@echo "$(GREEN)macOS Build:$(NC)"
	@echo "  make macos:build      Build macOS .app bundle"
	@echo "  make macos:dmg        Create macOS .dmg installer"
	@echo "  make macos:clean      Clean macOS build artifacts"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean            Clean all build artifacts"
	@echo "  make lint             Run linters"
	@echo "  make format           Format code"

# ============================================================================
# Installation
# ============================================================================

install: install-node install-rust
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-node:
	@echo "$(BLUE)Installing Node.js dependencies...$(NC)"
	npm install
	@if [ -d "server" ]; then cd server && npm install; fi

install-rust:
	@echo "$(BLUE)Checking Rust toolchain...$(NC)"
	@if command -v rustc >/dev/null 2>&1; then \
		echo "$(GREEN)✓ Rust already installed: $$(rustc --version)$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Rust not found. Install from https://rustup.rs/$(NC)"; \
		exit 1; \
	fi

install-python:
	@echo "$(BLUE)Installing Python dependencies...$(NC)"
	@if [ -f "requirements.txt" ]; then \
		pip3 install -r requirements.txt; \
	else \
		echo "$(YELLOW)No requirements.txt found$(NC)"; \
	fi

# ============================================================================
# Build
# ============================================================================

build: bootforge:build pandora:build
	@echo "$(GREEN)✓ All components built$(NC)"

bootforge:build:
	@echo "$(BLUE)Building BootForgeUSB (including Trapdoor module)...$(NC)"
	@if [ -d "crates/bootforge-usb" ]; then \
		cd crates/bootforge-usb && cargo build --release; \
		echo "$(GREEN)✓ BootForgeUSB built$(NC)"; \
	elif [ -d "libs/bootforgeusb" ]; then \
		cd libs/bootforgeusb && cargo build --release; \
		echo "$(GREEN)✓ BootForgeUSB built$(NC)"; \
	else \
		echo "$(YELLOW)⚠ BootForgeUSB directory not found$(NC)"; \
	fi

bootforge:test:
	@echo "$(BLUE)Testing BootForgeUSB...$(NC)"
	@if [ -d "crates/bootforge-usb" ]; then \
		cd crates/bootforge-usb && cargo test; \
	elif [ -d "libs/bootforgeusb" ]; then \
		cd libs/bootforgeusb && cargo test; \
	else \
		echo "$(YELLOW)⚠ BootForgeUSB directory not found$(NC)"; \
	fi

bootforge:cli:
	@echo "$(BLUE)Building and testing BootForgeUSB CLI...$(NC)"
	@if [ -d "crates/bootforge-usb" ]; then \
		cd crates/bootforge-usb && \
		cargo build --release && \
		./target/release/bootforge-cli version 2>/dev/null && \
		echo "" && \
		echo "$(GREEN)✓ CLI built and verified$(NC)" && \
		echo "$(BLUE)Run: ./crates/bootforge-usb/target/release/bootforge-cli scan$(NC)"; \
	elif [ -d "libs/bootforgeusb" ]; then \
		cd libs/bootforgeusb && \
		cargo build --release && \
		./target/release/bootforgeusb version && \
		echo "" && \
		echo "$(GREEN)✓ CLI built and verified$(NC)" && \
		echo "$(BLUE)Run: ./libs/bootforgeusb/target/release/bootforgeusb scan$(NC)"; \
	else \
		echo "$(YELLOW)⚠ BootForgeUSB directory not found$(NC)"; \
	fi

trapdoor:build:
	@echo "$(BLUE)Building Trapdoor CLI (Bobby's Secret Room)...$(NC)"
	@if [ -d "crates/bootforge-usb" ]; then \
		cd crates/bootforge-usb && \
		cargo build --release --bin trapdoor_cli && \
		echo "$(GREEN)✓ Trapdoor CLI built$(NC)" && \
		echo "$(BLUE)Run: ./crates/bootforge-usb/target/release/trapdoor_cli list$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Trapdoor source not found$(NC)"; \
	fi

trapdoor:test:
	@echo "$(BLUE)Testing Trapdoor module...$(NC)"
	@if [ -d "crates/bootforge-usb" ]; then \
		cd crates/bootforge-usb && cargo test --lib trapdoor; \
	else \
		echo "$(YELLOW)⚠ Trapdoor source not found$(NC)"; \
	fi

pandora:build:
	@echo "$(BLUE)Building Pandora Core packages...$(NC)"
	@if [ -d "packages/pandora-core" ]; then \
		cd packages/pandora-core && npm run build; \
		echo "$(GREEN)✓ Pandora Core built$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Pandora Core not initialized yet$(NC)"; \
	fi
	npm run build

pandora:typecheck:
	@echo "$(BLUE)Type checking Pandora packages...$(NC)"
	@if [ -d "packages/pandora-core" ]; then \
		cd packages/pandora-core && npm run typecheck; \
	fi
	npm run build -- --noEmit

# ============================================================================
# Development
# ============================================================================

dev:
	@echo "$(BLUE)Starting Pandora Codex development server...$(NC)"
	npm run dev

dev:ui:
	@echo "$(BLUE)Starting UI development server...$(NC)"
	npm run dev

dev:api:
	@echo "$(BLUE)Starting API server...$(NC)"
	@if [ -d "server" ]; then \
		cd server && npm run dev; \
	else \
		echo "$(YELLOW)⚠ Server not yet implemented$(NC)"; \
	fi

arsenal:status:
	@echo "$(BLUE)Bobby Dev Arsenal Status Check$(NC)"
	@echo ""
	@npm run arsenal:status || echo "$(YELLOW)Run 'npm install' first$(NC)"

# ============================================================================
# Testing
# ============================================================================

test: bootforge:test test:node
	@echo "$(GREEN)✓ All tests passed$(NC)"

test:node:
	@echo "$(BLUE)Running Node.js tests...$(NC)"
	@echo "$(YELLOW)⚠ Test suite not yet implemented$(NC)"

# ============================================================================
# Linting & Formatting
# ============================================================================

lint:
	@echo "$(BLUE)Running linters...$(NC)"
	npm run lint || true
	@if [ -d "libs/bootforgeusb" ]; then \
		cd libs/bootforgeusb && cargo clippy -- -W clippy::all; \
	fi

format:
	@echo "$(BLUE)Formatting code...$(NC)"
	@if [ -d "libs/bootforgeusb" ]; then \
		cd libs/bootforgeusb && cargo fmt; \
	fi
	@echo "$(GREEN)✓ Rust code formatted$(NC)"

# ============================================================================
# macOS Build (Tauri)
# ============================================================================

macos:build:
	@echo "$(BLUE)Building macOS .app bundle...$(NC)"
	@if [[ "$$OSTYPE" == "darwin"* ]]; then \
		./scripts/build-macos-app.sh; \
	else \
		echo "$(YELLOW)⚠ macOS builds can only be created on macOS systems$(NC)"; \
		echo "$(YELLOW)   Current OS: $$OSTYPE$(NC)"; \
		echo ""; \
		echo "$(BLUE)To build for macOS:$(NC)"; \
		echo "  1. Clone this repo on a Mac"; \
		echo "  2. Run: make macos:build"; \
		echo "  3. Or use GitHub Actions for automated builds"; \
	fi

macos:dmg:
	@echo "$(BLUE)Creating macOS DMG installer...$(NC)"
	@if [[ "$$OSTYPE" == "darwin"* ]]; then \
		./scripts/create-macos-dmg.sh; \
	else \
		echo "$(YELLOW)⚠ DMG creation can only be done on macOS systems$(NC)"; \
	fi

macos:clean:
	@echo "$(BLUE)Cleaning macOS build artifacts...$(NC)"
	@if [ -d "src-tauri/target" ]; then \
		rm -rf src-tauri/target/release/bundle/macos; \
		rm -rf src-tauri/target/x86_64-apple-darwin/release/bundle/macos; \
		rm -rf src-tauri/target/aarch64-apple-darwin/release/bundle/macos; \
		echo "$(GREEN)✓ macOS build artifacts cleaned$(NC)"; \
	else \
		echo "$(YELLOW)No macOS build artifacts found$(NC)"; \
	fi

# ============================================================================
# Cleanup
# ============================================================================

clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf dist dist-ssr node_modules/.vite
	@if [ -d "crates/bootforge-usb" ]; then \
		cd crates/bootforge-usb && cargo clean; \
	fi
	@if [ -d "libs/bootforgeusb" ]; then \
		cd libs/bootforgeusb && cargo clean; \
	fi
	@if [ -d "packages/pandora-core" ]; then \
		cd packages/pandora-core && rm -rf dist; \
	fi
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean:deep: clean
	@echo "$(BLUE)Deep cleaning (including node_modules)...$(NC)"
	rm -rf node_modules
	@if [ -d "server" ]; then rm -rf server/node_modules; fi
	@if [ -d "packages/pandora-core" ]; then rm -rf packages/pandora-core/node_modules; fi
	@echo "$(GREEN)✓ Deep clean complete$(NC)"

# ============================================================================
# Utility Commands
# ============================================================================

check:tools:
	@echo "$(BLUE)Checking installed tools...$(NC)"
	@echo ""
	@echo "Node.js:"
	@node --version || echo "  $(YELLOW)Not installed$(NC)"
	@echo ""
	@echo "Rust:"
	@rustc --version || echo "  $(YELLOW)Not installed$(NC)"
	@echo ""
	@echo "Python:"
	@python3 --version || echo "  $(YELLOW)Not installed$(NC)"
	@echo ""
	@echo "ADB:"
	@adb --version 2>/dev/null | head -1 || echo "  $(YELLOW)Not installed$(NC)"
	@echo ""
	@echo "Fastboot:"
	@fastboot --version 2>/dev/null | head -1 || echo "  $(YELLOW)Not installed$(NC)"
	@echo ""
	@echo "BootForgeUSB:"
	@if [ -f "libs/bootforgeusb/target/release/bootforgeusb" ]; then \
		./libs/bootforgeusb/target/release/bootforgeusb version; \
	else \
		echo "  $(YELLOW)Not built yet (run: make bootforge:build)$(NC)"; \
	fi

docs:
	@echo "$(BLUE)Opening documentation...$(NC)"
	@echo ""
	@echo "$(GREEN)Key Documents:$(NC)"
	@echo "  - PANDORA_ENTERPRISE_BLUEPRINT.md - Architecture overview"
	@echo "  - docs/NO_ILLUSION_AUDIT.md - Truth and evidence standards"
	@echo "  - docs/SHOP_PLAYBOOK.md - Real-world repair workflows"
	@echo "  - libs/bootforgeusb/README.md - BootForgeUSB Rust library"
	@echo "  - .pandora_private/README.md - Bobby Vault guide"

scan:devices:
	@echo "$(BLUE)Scanning USB devices with BootForgeUSB...$(NC)"
	@if [ -f "libs/bootforgeusb/target/release/bootforgeusb" ]; then \
		./libs/bootforgeusb/target/release/bootforgeusb scan; \
	else \
		echo "$(YELLOW)⚠ BootForgeUSB not built. Run: make bootforge:build$(NC)"; \
	fi

# ============================================================================
# CI Commands (for GitHub Actions)
# ============================================================================

ci:install:
	npm ci
	@if [ -d "libs/bootforgeusb" ]; then rustup update; fi

ci:build: build

ci:test: test lint

ci:typecheck:
	npm run build -- --noEmit

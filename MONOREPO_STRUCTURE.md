# REFORGE OS Monorepo Structure

## Target Structure

```
REFORGE-OS/
├── apps/
│   └── workshop-ui/          # Tauri/React frontend
│       ├── src/              # React components
│       ├── src-tauri/        # Rust backend
│       └── assets/           # Icons, images
│
├── services/                  # Rust microservices
│   ├── device-analysis/
│   ├── ownership-verification/
│   ├── legal-classification/
│   ├── audit-logging/
│   ├── authority-routing/
│   ├── capability-awareness/
│   └── risk-language-engine/
│
├── api/                       # FastAPI backend
│   ├── main.py               # Main API server
│   ├── trapdoor_api.py       # Trapdoor API
│   └── requirements.txt
│
├── solutions/                # Solutions database
│   └── database.py
│
├── internal/                 # Internal R&D
│   └── pandora-codex/       # Risk models, knowledge base
│
├── docs/                     # Documentation
│   ├── public/              # Public-facing docs
│   └── *.md                 # Architecture, guides
│
├── storage/                  # Data storage
│   ├── solutions/           # Solutions JSON
│   └── shadow-logs/          # Encrypted logs
│
├── governance/              # Compliance policies
│
├── manufacturing/           # Hardware specs
│
├── ops/                     # Operations scripts
│
├── Cargo.toml              # Rust workspace
├── package.json            # Node.js root (if needed)
├── README.md               # Main readme
└── CHANGELOG.md            # Version history

```

## Cleanup Actions

1. **Remove Duplicates**
   - `Bobbys-Workshop--3.0.0/` - appears to be duplicate/old structure
   - Consolidate any overlapping files

2. **Organize Documentation**
   - Move all `.md` files to `docs/` or appropriate subdirectories
   - Keep only essential files in root

3. **Clean Build Artifacts**
   - Ensure `target/`, `dist/`, `node_modules/` in .gitignore
   - Remove any committed build artifacts

4. **Standardize Naming**
   - Use consistent naming conventions
   - Remove version numbers from directory names

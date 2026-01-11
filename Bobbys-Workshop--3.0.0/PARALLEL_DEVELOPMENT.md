# Parallel Development Architecture

## Overview

This document outlines the parallel development strategy for Bobby's World Tools, enabling multiple teams to work simultaneously on different features while maintaining code quality and integration integrity.

## Architecture Components

### 1. Modular Core Libraries (`core/lib/`)

The foundation of our parallel development strategy is a set of modular, well-defined libraries that can be developed and tested independently.

#### Core Libraries

1. **`adb.js`** - Android Debug Bridge Operations

   - Device detection and management
   - Command execution
   - FRP detection
   - Status queries

2. **`fastboot.js`** - Fastboot Device Management

   - Bootloader operations
   - Partition flashing
   - Device unlocking
   - Variable queries

3. **`ios.js`** - iOS Device Operations

   - libimobiledevice integration
   - Device mode detection
   - Recovery operations
   - DFU mode handling

4. **`shadow-logger.js`** - Encrypted Logging Infrastructure
   - AES-256-GCM encryption
   - Append-only audit logs
   - Retention policy management
   - Compliance logging

### 2. Workflow Engine (`core/tasks/`)

JSON-defined workflows enable parallel development of device operation sequences without code changes.

#### Workflow Categories

- **`workflows/android/`** - Android-specific workflows
- **`workflows/ios/`** - iOS-specific workflows
- **`workflows/bypass/`** - Security bypass workflows (with authorization)
- **`workflows/mobile/`** - Universal mobile workflows

#### Workflow Schema

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "platform": "android|ios|universal",
  "category": "string",
  "risk_level": "safe|medium|high|destructive",
  "requires_authorization": boolean,
  "steps": [
    {
      "id": "string",
      "name": "string",
      "type": "command|check|wait|prompt|log|calculate|manual",
      "action": "string",
      "success_criteria": "string",
      "on_failure": "abort|retry|continue"
    }
  ]
}
```

### 3. Trapdoor API (`core/api/`)

Secure REST API for sensitive operations with admin-only access.

#### API Endpoints

```
POST   /api/trapdoor/frp           - FRP bypass workflow
POST   /api/trapdoor/unlock        - Bootloader unlock workflow
POST   /api/trapdoor/workflow/execute - Execute custom workflow
GET    /api/trapdoor/workflows     - List available workflows
GET    /api/trapdoor/logs/shadow   - Access shadow logs
```

#### Security Features

- API key authentication (`X-API-Key` header)
- Request rate limiting
- Shadow logging for all operations
- Authorization prompts for destructive operations
- Encrypted audit trails

### 4. Frontend Components (`src/components/`)

React components for user interaction with modular design.

#### Key Components

- **Trapdoor Control Panel** - Execute sensitive operations
- **Workflow Execution Console** - Browse and run workflows
- **Shadow Logs Viewer** - View encrypted audit logs
- **DevModePanel** - Device mode detection and workflow launcher
- **Workflow Visualizer** - Real-time workflow execution display

## Parallel Development Strategy

### Team Structure

#### Team A: Trapdoor API (`feature/trapdoor-api`)

**Responsibilities:**

- Enhance API endpoints
- Improve authentication and authorization
- Add rate limiting
- Security hardening
- API documentation

**Dependencies:**

- Core libraries (`adb.js`, `fastboot.js`, `ios.js`, `shadow-logger.js`)
- Workflow engine

**Minimal Conflicts:**

- Works primarily in `core/api/`
- Limited frontend interaction
- Independent testing

#### Team B: Workflow System (`feature/workflow-system`)

**Responsibilities:**

- Add new workflow definitions
- Enhance workflow engine
- Implement execution logging
- Create workflow validation tools
- Workflow testing framework

**Dependencies:**

- Core libraries
- Workflow engine schema

**Minimal Conflicts:**

- Works primarily in `workflows/` and `core/tasks/`
- Can add workflows without code changes
- Independent JSON definitions

#### Team C: Frontend Dashboard (`feature/frontend-dashboard`)

**Responsibilities:**

- Create workflow visualizer
- Implement log viewer UI
- Add device interaction components
- Real-time execution monitor
- Dashboard enhancements

**Dependencies:**

- Trapdoor API endpoints
- Workflow definitions
- WebSocket infrastructure

**Minimal Conflicts:**

- Works primarily in `src/components/`
- Uses API contracts, not implementations
- Independent UI testing

### Development Phases

#### Phase 1: Foundation (Week 1)

- ✅ Set up core libraries
- ✅ Define API contracts
- ✅ Create workflow schema
- ✅ Establish testing framework
- ✅ Configure CI/CD pipeline

#### Phase 2: Parallel Development (Weeks 2-4)

- **Team A**: Enhance Trapdoor API

  - Add new endpoints
  - Implement security features
  - Create API documentation

- **Team B**: Expand Workflow System

  - Add workflow definitions
  - Enhance execution engine
  - Build validation tools

- **Team C**: Build Frontend Dashboard
  - Create UI components
  - Implement visualizers
  - Add real-time monitoring

#### Phase 3: Integration (Week 5)

- Merge feature branches
- Integration testing
- Performance testing
- Security audit
- Documentation updates

#### Phase 4: Quality Assurance (Week 6)

- End-to-end testing
- User acceptance testing
- Bug fixes
- Final documentation
- Production preparation

## Integration Points

### API Contracts

Teams work against stable API contracts, not implementations:

```javascript
// Contract: Workflow execution
POST /api/trapdoor/workflow/execute
Request: {
  category: string,
  workflowId: string,
  deviceSerial: string,
  authorization?: object
}
Response: {
  success: boolean,
  workflow: string,
  results: array
}
```

### Workflow Definitions

Workflow definitions are JSON files that can be added/modified without code changes:

```bash
workflows/
├── android/
│   ├── adb-diagnostics.json
│   ├── fastboot-unlock.json
│   └── partition-mapping.json
├── ios/
│   └── device-restore.json
├── bypass/
│   └── frp-bypass.json
└── mobile/
    ├── quick-diagnostics.json
    └── battery-health.json
```

### Component Props

Frontend components use typed props for clear interfaces:

```typescript
interface WorkflowVisualizerProps {
  workflowId: string;
  onComplete: (result: WorkflowResult) => void;
  onError: (error: Error) => void;
}
```

## Testing Strategy

### Unit Tests

- Test individual functions in isolation
- Mock external dependencies
- Fast execution (< 5 seconds)
- Run on every commit

### Integration Tests

- Test component interactions
- Use test database/mocked services
- Moderate execution (< 30 seconds)
- Run on PR creation

### End-to-End Tests

- Test complete workflows
- Use mocked device environment
- Slower execution (< 5 minutes)
- Run before merge

### Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: 60%+ coverage
- E2E tests: Critical paths covered

## CI/CD Pipeline

### Automated Checks

```yaml
On Push/PR: ├── Lint Check
  ├── Unit Tests
  ├── Integration Tests
  ├── Build Verification
  ├── Workflow Validation
  └── Security Scan

On Merge to Main: ├── All above checks
  ├── E2E Tests
  ├── Performance Tests
  └── Production Build
```

### Branch Protection

Main branch is protected:

- ✅ All CI checks must pass
- ✅ At least 1 approval required
- ✅ Branch must be up to date
- ✅ No force pushes
- ✅ Signed commits (optional)

## Conflict Resolution

### Minimizing Conflicts

1. **Clear Boundaries**: Each team works in distinct directories
2. **API Contracts**: Changes to contracts require team discussion
3. **Regular Syncs**: Daily standup to discuss potential conflicts
4. **Early Integration**: Merge frequently to detect issues early

### Handling Conflicts

```bash
# Update your branch regularly
git checkout feature/your-feature
git fetch origin
git merge origin/main

# Resolve conflicts
# Edit conflicted files
git add .
git commit -m "merge: resolve conflicts with main"
```

## Communication Channels

### Synchronous

- Daily standup meetings
- Slack/Discord for quick questions
- Pair programming sessions

### Asynchronous

- GitHub Issues for feature requests
- Pull Request reviews
- Documentation updates
- Design documents

## Success Metrics

### Development Velocity

- Feature branches merged per week
- Average PR cycle time
- Code review turnaround time

### Code Quality

- Test coverage percentage
- Number of bugs post-merge
- CI/CD success rate
- Code review feedback density

### Collaboration Health

- Number of merge conflicts
- Time to resolve conflicts
- Team satisfaction surveys

## Best Practices

### For All Teams

1. **Commit Often**: Small, atomic commits
2. **Test First**: Write tests before implementation
3. **Document Changes**: Update docs with code
4. **Review Thoroughly**: Provide constructive feedback
5. **Communicate Early**: Raise concerns immediately

### For API Team

1. Version API endpoints if breaking changes needed
2. Maintain backward compatibility
3. Document all endpoints
4. Provide example requests/responses

### For Workflow Team

1. Validate JSON before committing
2. Test workflows in isolation
3. Document workflow purpose and usage
4. Include authorization requirements

### For Frontend Team

1. Follow component design patterns
2. Use TypeScript for type safety
3. Test components in isolation
4. Document prop interfaces

## Tools & Infrastructure

### Version Control

- Git with feature branch workflow
- GitHub for hosting and PRs
- Branch protection rules

### Testing

- Vitest for unit/integration tests
- Mocked device environments
- Coverage reporting

### CI/CD

- GitHub Actions for automation
- Automated testing on all branches
- Security scanning (CodeQL, npm audit)

### Documentation

- Markdown for all docs
- JSDoc for code documentation
- OpenAPI for API specs

## Conclusion

This parallel development architecture enables Bobby's World Tools to scale development across multiple teams while maintaining code quality, security, and integration integrity. By following these guidelines, teams can work independently on their features while ensuring smooth integration and delivery.

---

**Questions?** Check [CONTRIBUTING.md](./CONTRIBUTING.md) or open a GitHub Discussion.

# Contributing to Bobby's World Tools

Welcome to Bobby's World Tools! This guide will help you understand our parallel development workflow and contribution process.

## 🌿 Branch Strategy for Parallel Development

We use a feature branch workflow to enable multiple developers to work on different features simultaneously without conflicts.

### Main Branches

- **`main`**: Production-ready code. Protected branch requiring PR reviews.
- **Feature branches**: Individual features developed in isolation.

### Feature Branch Naming Convention

```
feature/<feature-name>
```

**Active Feature Branches:**

1. **`feature/trapdoor-api`** - Trapdoor API enhancements

   - Focus: Secure admin-only API endpoints
   - Lead: Backend team
   - Status: Active development

2. **`feature/workflow-system`** - Workflow system improvements

   - Focus: JSON-defined workflows with execution logging
   - Lead: DevOps team
   - Status: Active development

3. **`feature/frontend-dashboard`** - React dashboard enhancements
   - Focus: Dynamic device interactions and workflow visualizers
   - Lead: Frontend team
   - Status: Active development

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Bboy9090/Bobbys_World_Tools.git
cd Bobbys_World_Tools
```

### 2. Set Up Your Development Environment

#### Frontend Setup

```bash
npm install
npm run dev
```

#### Backend Setup

```bash
cd server
npm install
npm start
```

#### Rust Components (Optional)

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build BootForge USB
npm run bootforge:build
```

### 3. Create Your Feature Branch

```bash
# From main branch
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name
```

## 🛠️ Development Workflow

### Working on a Feature

1. **Make changes in your feature branch**

   ```bash
   git checkout feature/your-feature-name
   # Make your changes
   ```

2. **Commit frequently with clear messages**

   ```bash
   git add .
   git commit -m "feat: add device detection for workflow system"
   ```

3. **Keep your branch up to date**

   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git merge main
   # Resolve conflicts if any
   ```

4. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

### Testing Your Changes

Before creating a pull request, ensure all tests pass:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Validate workflows
npm run test:workflows

# Check code quality
npm run lint
```

### Creating a Pull Request

1. **Push your feature branch to GitHub**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**

   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select `feature/your-feature-name` → `main`
   - Fill in the PR template with:
     - Description of changes
     - Related issues
     - Testing performed
     - Screenshots (if UI changes)

3. **PR Review Process**
   - Automated CI/CD checks must pass
   - At least one code review approval required
   - All comments must be resolved
   - Branch must be up to date with main

## 📋 Code Standards

### JavaScript/TypeScript

- Use ES6+ features
- Follow ESLint configuration
- Write meaningful variable names
- Add JSDoc comments for functions

```javascript
/**
 * Execute ADB command on device
 * @param {string} serial - Device serial number
 * @param {string} command - ADB command to execute
 * @returns {Promise<Object>} Command result
 */
async executeCommand(serial, command) {
  // Implementation
}
```

### Workflow Definitions

All workflows must follow this structure:

```json
{
  "id": "unique-workflow-id",
  "name": "Human Readable Name",
  "description": "What this workflow does",
  "platform": "android|ios|universal",
  "category": "diagnostics|bypass|restore",
  "risk_level": "safe|medium|high|destructive",
  "requires_authorization": true|false,
  "steps": [
    {
      "id": "step-id",
      "name": "Step Name",
      "type": "command|check|wait|prompt|log",
      "action": "action to perform",
      "success_criteria": "what indicates success",
      "on_failure": "abort|retry|continue"
    }
  ]
}
```

### Testing Standards

- **Unit tests**: Test individual functions/modules in isolation
- **Integration tests**: Test multiple components working together
- **E2E tests**: Test complete workflows end-to-end
- Aim for 80%+ code coverage
- Mock external dependencies (ADB, Fastboot, iOS tools)

## 🔄 Merge Strategy

### Feature Branch Lifecycle

1. **Development Phase**

   - Active development on feature branch
   - Regular commits and pushes
   - Keep branch updated with main

2. **Testing Phase**

   - All automated tests passing
   - Manual testing completed
   - Code review requested

3. **Review Phase**

   - Code review by team members
   - Address feedback
   - Update PR as needed

4. **Merge Phase**
   - All checks green ✅
   - Approved by reviewers
   - Squash and merge to main
   - Delete feature branch

### Handling Merge Conflicts

```bash
# Update main
git checkout main
git pull origin main

# Merge main into your feature
git checkout feature/your-feature-name
git merge main

# Resolve conflicts
# Edit conflicted files
git add .
git commit -m "merge: resolve conflicts with main"
git push origin feature/your-feature-name
```

## 🔐 Security Guidelines

### For Trapdoor API Development

- Never commit API keys or secrets
- Use environment variables for sensitive data
- All destructive operations require explicit authorization
- Log all sensitive operations to shadow logs
- Use AES-256 encryption for audit logs

### For Workflow Development

- Validate all user inputs
- Require authorization for risky operations
- Add legal notices for bypass workflows
- Document compliance requirements
- Never bypass security on devices without owner consent

## 📚 Module Documentation

When adding new modules, include:

1. **README.md** in module directory
2. **JSDoc comments** for all public functions
3. **Usage examples** in documentation
4. **API documentation** for endpoints

## 🧪 CI/CD Pipeline

Our automated pipeline runs on all branches:

### On Push/PR

1. **Linting** - ESLint, TypeScript checks
2. **Testing** - Unit, integration, and E2E tests
3. **Build** - Frontend and backend builds
4. **Security** - Dependency scanning, CodeQL analysis
5. **Workflow Validation** - JSON schema validation

### Status Checks

All these must pass before merge:

- ✅ Lint check
- ✅ Unit tests
- ✅ Integration tests
- ✅ Build successful
- ✅ Security scan clean
- ✅ Code review approved

## 🤝 Communication

- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Pull Requests**: Propose code changes
- **Code Reviews**: Provide constructive feedback

## 📖 Additional Resources

- [README.md](./README.md) - Project overview
- [BOBBY_SECRET_WORKSHOP.md](./BOBBY_SECRET_WORKSHOP.md) - Workflow system guide
- [TRAPDOOR_CLI_USAGE.md](./TRAPDOOR_CLI_USAGE.md) - Trapdoor CLI documentation
- [SECURITY.md](./SECURITY.md) - Security policies

## ⚖️ Legal Compliance

All contributions must:

- Respect device ownership and authorization
- Include proper legal disclaimers for bypass features
- Comply with CFAA and similar laws
- Maintain audit trails for sensitive operations

---

**Thank you for contributing to Bobby's World Tools!**

_Professional repair diagnostics - Use responsibly. Repair ethically. Respect the law._

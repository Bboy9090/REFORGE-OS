# Branch Protection Configuration

This repository uses GitHub Rulesets to enforce branch protection rules and prevent "fake green" scenarios where code is merged without passing required status checks.

## Overview

Branch protection is configured through a ruleset file located at `.github/rulesets/main-branch-protection.json`. This configuration ensures that all code merged into the `main` branch meets our quality standards.

## Protected Branches

- **main** - Primary production branch with full protection

## Required Status Checks

Before any pull request can be merged into `main`, the following status checks must pass:

### 1. Test Summary

- **Workflow**: CI - Parallel Test Suite
- **Purpose**: Aggregates results from all parallel test jobs
- **Jobs included**:
  - Test Trapdoor API
  - Test Workflow System
  - Lint and Build Frontend
  - Test Backend Components
  - Security Audit
  - Code Quality Checks

### 2. CodeQL Advanced

- **Workflow**: CodeQL Advanced
- **Purpose**: Security vulnerability scanning
- **Languages analyzed**:
  - JavaScript/TypeScript
  - Python
  - Rust

### 3. rust-clippy analyze

- **Workflow**: rust-clippy analyze
- **Purpose**: Rust code quality and best practices checking

## Protection Rules

The following rules are enforced on the `main` branch:

1. **Required Pull Request Reviews**

   - At least 1 approving review required
   - Stale reviews dismissed when new commits are pushed
   - Review threads must be resolved before merging

2. **Required Status Checks**

   - All status checks listed above must pass
   - Branches must be up to date with base branch before merging (strict mode)
   - Prevents "fake green" where outdated branches appear to pass

3. **Branch Deletion Prevention**

   - The `main` branch cannot be deleted

4. **No Force Pushes**

   - Force pushes to `main` are blocked
   - Maintains complete git history

5. **Required Linear History**
   - Prevents merge commits that would create a non-linear history
   - Allows only squash merging or rebase merging
   - Ensures a clean, linear commit history on the main branch

## Bypass Permissions

Repository administrators (actor_id: 5, RepositoryRole: Admin) can bypass these rules when necessary for emergency fixes or repository maintenance. This is a standard GitHub configuration that allows admins to:

- Merge critical hotfixes without waiting for all checks
- Perform repository maintenance operations
- Resolve stuck merge situations

All bypass actions are logged in the repository's audit log for accountability.

## Setup Instructions

### For Repository Administrators

To apply this ruleset to your repository:

1. Navigate to **Settings** → **Rules** → **Rulesets** in your GitHub repository
2. Click **Import a ruleset**
3. Select the file `.github/rulesets/main-branch-protection.json`
4. Review the configuration
5. Click **Create** to activate the ruleset

### Verifying Status Checks

Status checks will appear in the branch protection settings only after they have run at least once. To verify:

1. Push a commit to trigger the workflows
2. Wait for all workflows to complete
3. Check the pull request to see the status check results

## Troubleshooting

### Status checks not appearing

If status checks don't appear in your pull request:

1. Verify the workflow has run at least once on the repository
2. Check that the workflow is configured to run on pull requests
3. Ensure the job names match exactly (case-sensitive)

### Workflows failing

If workflows are consistently failing:

1. Check the workflow run logs in the **Actions** tab
2. Review recent changes that may have broken the build
3. Run tests locally before pushing

### Emergency merges

In case of critical production issues:

1. Repository administrators can bypass branch protection
2. Document the bypass reason in the pull request
3. Create a follow-up issue to address any skipped checks

## Maintenance

When adding new workflows or status checks:

1. Update the `.github/rulesets/main-branch-protection.json` file
2. Add the new check to the `required_status_checks` array
3. Re-import the ruleset in repository settings
4. Update this documentation

## Benefits

This branch protection configuration provides:

- ✅ **No Fake Green**: Code cannot be merged without passing all checks
- ✅ **Quality Assurance**: All tests, security scans, and code quality checks run before merge
- ✅ **Code Review**: Ensures peer review of all changes
- ✅ **History Integrity**: Prevents force pushes and branch deletion
- ✅ **Up-to-date Branches**: Requires branches to be current with main before merging

## Optional: Merge Queue

For repositories on GitHub plans that support it, consider enabling merge queue for additional benefits:

1. Navigate to **Settings** → **General** → **Pull Requests**
2. Enable **Merge queue**
3. Configure queue settings as needed

Merge queue provides:

- Automatic serialization of merges
- Testing of merged result before final merge
- Prevention of broken builds from race conditions

## References

- [GitHub Documentation: Managing Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [GitHub Documentation: Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [GitHub Ruleset Recipes](https://github.com/github/ruleset-recipes)

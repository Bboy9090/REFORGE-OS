# Auto-merge Feature

This repository has auto-merge functionality enabled for pull requests. This feature automatically merges PRs once all required conditions are met, eliminating the need to manually monitor PRs waiting for checks to complete.

## How It Works

When a pull request is opened, the auto-merge workflow automatically enables GitHub's auto-merge feature on the PR. The PR will then automatically merge when:

1. ✅ All required status checks pass
2. ✅ All required reviews/approvals are in place
3. ✅ Branch protection rules are satisfied
4. ✅ The PR is not in draft mode

## Benefits

- **No Babysitting Required**: PRs merge automatically once ready
- **Faster Merges**: Reduces time between approval and merge
- **Consistent Process**: Every PR follows the same merge process
- **Safety**: Still subject to all branch protection rules and required checks

## Workflow Triggers

The auto-merge workflow is triggered on:

- Pull request opened, synchronized (new commits pushed), reopened, or marked ready for review
- Pull request reviews submitted
- Check suites completed
- Status updates

## Merge Strategy

The workflow attempts to merge using:

1. **Squash merge** (preferred) - Creates a single commit with all changes
2. **Standard merge** (fallback) - If squash is not available
3. If both fail, assumes auto-merge is already enabled or cannot be enabled

## Manual Control

You can still manually control auto-merge:

### Disable auto-merge

```bash
gh pr merge <PR_NUMBER> --disable-auto-merge
```

### Enable auto-merge manually

```bash
gh pr merge <PR_NUMBER> --auto --squash
```

## Branch Protection

Auto-merge respects all branch protection rules configured for the repository. PRs will only merge when all protection requirements are satisfied.

**Security Note**: Auto-merge is only enabled for PRs from branches within the same repository, not for PRs from forks. This prevents external contributors from auto-merging their own PRs.

## Troubleshooting

If auto-merge doesn't work:

- Check that branch protection rules allow auto-merge
- Verify all required checks are passing
- Ensure required approvals are in place
- Check that the PR is not in draft mode
- Verify the repository plan supports auto-merge (available on all GitHub plans)

## Configuration

The auto-merge workflow is located at `.github/workflows/auto-merge.yml`.

To modify the merge strategy or behavior, edit this file. Common customizations:

- Change merge method (squash, merge, rebase)
- Add conditions or filters
- Customize the bot comment message

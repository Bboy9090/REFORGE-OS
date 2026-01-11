# Workflows

JSON-defined modular workflows for device operations.

## Structure

- **android/** - Android-specific workflows (ADB diagnostics, FRP bypass, Fastboot unlock, partition mapping)
- **ios/** - iOS-specific workflows (restore, DFU detection, diagnostics)
- **bypass/** - Security bypass operations (FRP, bootloader unlock)
- **diagnostics/** - General diagnostic workflows

## Workflow Format

Each workflow is a JSON file with the following structure:

```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "description": "Workflow description",
  "platform": "android|ios|universal",
  "category": "diagnostics|bypass|unlock|restore",
  "risk_level": "low|medium|high|destructive",
  "requires_authorization": true,
  "steps": [
    {
      "id": "step-1",
      "name": "Step Name",
      "type": "command|check|wait|prompt",
      "action": "command to execute or check to perform",
      "success_criteria": "what defines success",
      "on_failure": "continue|abort|retry"
    }
  ],
  "metadata": {
    "status": "backlog|in_progress|review|done",
    "pr_link": "URL to related pull request (optional)",
    "placeholder_found": false,
    "version": "1.0.0",
    "author": "Author name",
    "created_at": 1700000000000,
    "updated_at": 1734426000000,
    "tags": ["tag1", "tag2"]
  }
}
```

## Metadata Fields

All workflows now include a `metadata` section with the following fields:

- **status**: Current workflow development status

  - `backlog` - Planned but not started
  - `in_progress` - Currently being developed
  - `review` - Under review/testing
  - `done` - Completed and production-ready

- **pr_link**: Optional URL linking to the pull request where this workflow was added or modified

- **placeholder_found**: Boolean flag indicating if the workflow contains placeholder/mock data that needs to be replaced with real implementation

- **version**: Semantic version of the workflow (e.g., "1.0.0")

- **author**: Name of the workflow creator/maintainer

- **created_at**: Unix timestamp (milliseconds) when workflow was created

- **updated_at**: Unix timestamp (milliseconds) when workflow was last modified

- **tags**: Array of relevant tags for categorization and search

## Usage

Workflows are executed by the workflow engine in `core/tasks/`. Each step is logged with full audit trail.

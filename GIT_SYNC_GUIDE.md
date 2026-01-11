# Git Sync Guide for REFORGE-OS

This guide will help you sync your local repository with the remote GitHub repository.

## Repository Information

- **Remote URL**: https://github.com/Bboy9090/REFORGE-OS.git
- **Default Branch**: main
- **Current Local Branch**: main

## Quick Sync (Automated)

Run the PowerShell script:

```powershell
.\sync-with-github.ps1
```

## Manual Sync Commands

If git is not in your PATH, you'll need to either:

1. **Install Git**: Download from https://git-scm.com/download/win
2. **Add Git to PATH**: Add Git's `bin` directory to your system PATH
3. **Use Git from full path**: Use the full path to git.exe in commands

### Step-by-Step Manual Sync

#### 1. Check Current Status

```bash
git status
```

#### 2. Fetch Latest Changes from Remote

```bash
git fetch origin
```

#### 3. Check for Uncommitted Changes

```bash
git status --short
```

If you have uncommitted changes you want to save:

```bash
git stash push -m "Stashed before sync"
```

#### 4. Rebase Local Changes on Top of Remote

```bash
git rebase origin/main
```

If conflicts occur:
- Resolve conflicts in the affected files
- Stage resolved files: `git add <file>`
- Continue rebase: `git rebase --continue`
- Or abort: `git rebase --abort`

#### 5. Pull Latest Changes

```bash
git pull origin main --rebase
```

#### 6. Push Local Changes to Remote

```bash
git push origin main
```

If this is a new branch or first push:

```bash
git push -u origin main
```

#### 7. Verify Sync Status

```bash
git status
git log --oneline --graph --all --decorate -10
```

## Complete Sync Command Sequence

Here's the complete sequence you can copy-paste:

```bash
# 1. Fetch latest
git fetch origin

# 2. Stash any uncommitted changes (optional)
git stash push -m "Stashed before sync"

# 3. Rebase on top of remote
git rebase origin/main

# 4. Pull latest (if needed)
git pull origin main --rebase

# 5. Push local changes
git push origin main

# 6. Restore stashed changes (if you stashed)
git stash pop
```

## Troubleshooting

### Git Not Found in PATH

If you get "git is not recognized":

1. **Install Git**: https://git-scm.com/download/win
2. **Or use full path**: Find git.exe and use full path
   - Common locations:
     - `C:\Program Files\Git\cmd\git.exe`
     - `C:\Program Files (x86)\Git\cmd\git.exe`
     - `C:\Users\<YourName>\AppData\Local\Programs\Git\cmd\git.exe`

### Authentication Issues

If you get authentication errors:

1. **Use Personal Access Token**: GitHub requires tokens instead of passwords
   - Generate token: https://github.com/settings/tokens
   - Use token as password when prompted

2. **Or configure SSH**: Set up SSH keys for passwordless authentication

### Conflicts During Rebase

If you encounter conflicts:

1. Check conflicted files: `git status`
2. Open files and resolve conflicts (look for `<<<<<<<`, `=======`, `>>>>>>>` markers)
3. Stage resolved files: `git add <file>`
4. Continue: `git rebase --continue`
5. Or abort: `git rebase --abort`

## Current Repository State

Based on git configuration:
- Remote: origin → https://github.com/Bboy9090/REFORGE-OS.git
- Local branch: main
- Tracking: origin/main

## Notes

- Always commit or stash changes before syncing
- Rebase preserves a linear history (preferred)
- If you prefer merge instead of rebase, use `git pull origin main` (without --rebase)
- Force push is disabled for main branch (for safety)

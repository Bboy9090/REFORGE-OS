# Post-Merge Verification Checklist

This checklist ensures the GitHub × AI Operating System is functioning correctly after merging.

## Immediate Verification (Within 1 Hour)

### GitHub UI Tests

- [ ] **Issue Templates Visible**

  - Go to: https://github.com/Bboy9090/Bobbys-Workshop-/issues/new/choose
  - Verify all 4 templates appear:
    - 🐛 Bug Report (Agent-Ready)
    - ✨ Feature Request (Agent-Ready)
    - 🔴 CI/Build Failure
    - 🔍 Audit Plan
  - Create a test issue with one template
  - Verify all fields render correctly

- [ ] **PR Template Visible**
  - Create a test PR from a branch
  - Verify `.github/PULL_REQUEST_TEMPLATE.md` content appears
  - Verify all checklists render correctly
  - Verify markdown formatting is correct

### CI/CD Tests

- [ ] **CI Guardrails Workflow Runs**

  - Create a test PR (can be the merge PR itself)
  - Wait for `ci-guardrails.yml` workflow to run
  - Verify all 4 jobs execute:
    - `no-placeholders`
    - `no-build-artifacts` ⭐ NEW
    - `dangerous-patterns` ⭐ NEW
    - `node-python-ci` (if applicable)
  - Check job logs for clarity and correctness

- [ ] **Test Placeholder Detection**

  - Create a branch with `TODO:` in src/ file
  - Push and create PR
  - Verify `no-placeholders` job fails
  - Close PR and delete branch

- [ ] **Test Build Artifact Blocking**
  - Create a branch, add a file to `dist/` or `build/`
  - Push and create PR
  - Verify `no-build-artifacts` job fails
  - Close PR and delete branch

### Documentation Tests

- [ ] **GITHUB_AI_OS_SUMMARY.md Readable**

  - View: https://github.com/Bboy9090/Bobbys-Workshop-/blob/main/GITHUB_AI_OS_SUMMARY.md
  - Verify markdown renders correctly
  - Verify all sections present
  - Verify links work (if any internal links)

- [ ] **Agent Files Readable**
  - Spot-check 2-3 agent files in `.github/agents/`
  - Verify markdown renders correctly
  - Verify structure is consistent

## Short-Term Verification (Within 1 Week)

### Real-World Usage

- [ ] **Create Real Issue Using Template**

  - Use bug template for actual bug
  - Verify template helps structure report
  - Note any improvements needed

- [ ] **Create Real PR Using Template**

  - Use PR template for actual change
  - Fill out all sections
  - Verify template helps with completeness
  - Note any improvements needed

- [ ] **CI Catches Real Issue**
  - Wait for CI to catch a real placeholder or build artifact
  - Verify error message is clear and actionable
  - Verify fix is straightforward

### Agent Testing

- [ ] **Test Agent Assignment**

  - Create issue, assign to specific agent (use labels)
  - Example: "agent:security-guard" label
  - Verify agent guidance is helpful

- [ ] **Agent Collaboration**
  - Create issue requiring multiple agents
  - Example: Security issue needing Audit + Security Guard
  - Verify collaboration workflow works

## Long-Term Verification (Within 1 Month)

### Metrics Collection

- [ ] **Track Placeholder Detection**

  - Count how many times `no-placeholders` catches issues
  - Track false positives (if any)
  - Adjust patterns if needed

- [ ] **Track Build Artifact Blocking**

  - Count how many times `no-build-artifacts` catches issues
  - Verify .gitignore is sufficient

- [ ] **Track Agent Usage**

  - Count issues/PRs per agent
  - Identify most/least used agents
  - Consider adjustments

- [ ] **Track CI Success Rate**
  - Monitor workflow success/failure rates
  - Identify flaky checks
  - Optimize as needed

### Improvements

- [ ] **Refine Templates Based on Feedback**

  - Gather feedback from team
  - Adjust templates for clarity
  - Add/remove fields as needed

- [ ] **Add Pre-Commit Hooks**

  - Implement local secret scanning
  - Implement local placeholder detection
  - Prevent issues before push

- [ ] **Create Agent Dashboard**
  - Track agent activity
  - Show metrics per agent
  - Visualize impact

## Rollback Plan (If Needed)

If the GitHub × AI Operating System causes issues:

### Quick Rollback (Revert Commits)

```bash
# Identify commit to revert
git log --oneline

# Revert the governance commits
git revert 12062e6  # Summary doc
git revert 82d55ef  # Formatting
git revert b270d3f  # Main governance files

# Push reverts
git push origin main
```

### Selective Rollback (Disable Components)

If only certain components are problematic:

**Disable CI Guardrails:**

```yaml
# Comment out problematic jobs in .github/workflows/ci-guardrails.yml
# jobs:
#   no-build-artifacts:
#     runs-on: ubuntu-latest
#     steps:
#       - run: echo "Temporarily disabled"
```

**Remove Issue Templates:**

```bash
# Temporarily move templates out
git mv .github/ISSUE_TEMPLATE .github/ISSUE_TEMPLATE.disabled
git commit -m "Temporarily disable issue templates"
git push
```

**Remove PR Template:**

```bash
# Temporarily move template out
git mv .github/PULL_REQUEST_TEMPLATE.md .github/PULL_REQUEST_TEMPLATE.md.disabled
git commit -m "Temporarily disable PR template"
git push
```

## Success Criteria

The GitHub × AI Operating System is considered successfully installed when:

1. ✅ All templates render correctly in GitHub UI
2. ✅ CI guardrails run on every PR
3. ✅ At least 1 real issue caught by CI
4. ✅ At least 5 issues created using templates
5. ✅ At least 5 PRs created using template
6. ✅ No team complaints about friction
7. ✅ Measurable improvement in PR quality
8. ✅ Zero false positives in CI checks (or very low rate)

## Support

If you encounter issues:

1. **Check Documentation**

   - Read `GITHUB_AI_OS_SUMMARY.md`
   - Review agent definitions in `.github/agents/`
   - Check instructions in `.github/instructions/`

2. **Create Issue**

   - Use appropriate template (bug, CI failure, etc.)
   - Tag with `github-ai-os` label
   - Assign to relevant agent

3. **Emergency Contact**
   - If system is blocking critical work, contact repo admin
   - Use rollback plan above if needed

## Notes

- Add notes here as you verify each item
- Document any issues encountered
- Track improvements needed
- Share feedback with team

---

**Verification Started:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Verified By:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Status:** 🟡 In Progress → 🟢 Complete

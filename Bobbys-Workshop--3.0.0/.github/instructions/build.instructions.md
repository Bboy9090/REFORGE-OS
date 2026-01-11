---
applyTo: ".devcontainer/**,.github/workflows/**,**/Dockerfile,build*.sh,build*.bat,build_exe.py,launch_app.py"
---

# Build/CI Rules

- CI must be truthful: tests must actually run.
- Do not "greenwash" by skipping failing commands.
- Keep build changes minimal and reversible.
- Do not modify dist/build artifacts unless the task is explicitly packaging.

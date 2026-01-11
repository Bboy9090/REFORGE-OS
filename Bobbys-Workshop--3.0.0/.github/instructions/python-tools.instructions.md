---
applyTo:
  - "**/*.py"
---

# Python Tools Rules

## Explicit, Production-Ready Python

Python scripts and tools must be robust, explicit, and production-ready from day one.

### Core Requirements

1. **Explicit Errors** — Never return `True`, `None`, or empty values to indicate success when an operation failed
2. **No Silent Success** — Always log meaningful output or raise exceptions
3. **Platform Guards** — Handle Windows/macOS/Linux differences explicitly
4. **Type Hints** — Use type annotations for function signatures (Python 3.5+)
5. **Error Context** — Include actionable context in error messages

### Error Handling Patterns

```python
# BAD: Silent failure
def read_config(path):
    try:
        with open(path) as f:
            return json.load(f)
    except:
        return {}  # WRONG: Silent failure masks the problem

# GOOD: Explicit error with context
def read_config(path: str) -> dict:
    """Read JSON configuration file.

    Args:
        path: Absolute path to config file

    Returns:
        Parsed configuration dictionary

    Raises:
        FileNotFoundError: Config file not found
        JSONDecodeError: Config file is not valid JSON
    """
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Configuration file not found: {path}\n"
            f"  Expected location: {os.path.abspath(path)}\n"
            f"  Hint: Copy .env.example to .env"
        )
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Invalid JSON in configuration file: {path}\n"
            f"  Line {e.lineno}, column {e.colno}: {e.msg}\n"
            f"  Hint: Validate JSON at https://jsonlint.com/"
        )
```

### Return Values

```python
# BAD: Ambiguous return values
def check_prerequisites():
    if not shutil.which('node'):
        return False  # WRONG: What's missing? How to fix?
    return True

# GOOD: Explicit results with details
def check_prerequisites() -> dict[str, bool | str]:
    """Check if required tools are installed.

    Returns:
        Dictionary with tool names as keys and status/path as values
    """
    results = {}

    node_path = shutil.which('node')
    if node_path:
        results['node'] = node_path
        print(f"✓ Node.js found: {node_path}")
    else:
        results['node'] = False
        print("✗ Node.js not found")
        print("  Install from: https://nodejs.org/")

    return results
```

### Platform-Specific Code

```python
import platform
import sys
from pathlib import Path

def get_platform_cache_dir() -> Path:
    """Get platform-specific cache directory.

    Returns:
        Path to cache directory

    Raises:
        RuntimeError: Unsupported platform
    """
    system = platform.system()

    if system == 'Darwin':
        # macOS
        return Path.home() / 'Library' / 'Caches' / 'BobbysWorkshop'
    elif system == 'Linux':
        # Linux (XDG Base Directory)
        xdg_cache = os.environ.get('XDG_CACHE_HOME')
        if xdg_cache:
            return Path(xdg_cache) / 'bobbys-workshop'
        return Path.home() / '.cache' / 'bobbys-workshop'
    elif system == 'Windows':
        # Windows
        appdata = os.environ.get('LOCALAPPDATA')
        if appdata:
            return Path(appdata) / 'BobbysWorkshop' / 'Cache'
        return Path.home() / 'AppData' / 'Local' / 'BobbysWorkshop' / 'Cache'
    else:
        raise RuntimeError(
            f"Unsupported platform: {system}\n"
            f"  This tool supports Windows, macOS, and Linux only."
        )
```

### Subprocess Execution

```python
import subprocess
from typing import Tuple

def run_command(
    cmd: list[str],
    cwd: str | None = None,
    timeout: int = 300
) -> Tuple[int, str, str]:
    """Execute command and return result.

    Args:
        cmd: Command and arguments as list
        cwd: Working directory (optional)
        timeout: Timeout in seconds (default: 300)

    Returns:
        Tuple of (exit_code, stdout, stderr)

    Raises:
        TimeoutError: Command exceeded timeout
        FileNotFoundError: Command not found
    """
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False  # Don't raise on non-zero exit
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        raise TimeoutError(
            f"Command timed out after {timeout}s: {' '.join(cmd)}"
        )
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Command not found: {cmd[0]}\n"
            f"  Full command: {' '.join(cmd)}\n"
            f"  Hint: Ensure {cmd[0]} is installed and in PATH"
        )
```

### Logging Best Practices

```python
import logging
import sys

# Configure logging at module level
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

# Use throughout module
logger.info("Starting build process...")
logger.warning("Deprecated API detected, migrate to v2")
logger.error("Build failed: %s", error_message)
logger.debug("Detailed trace: %s", trace_info)
```

### Input Validation

```python
from pathlib import Path

def validate_project_path(path: str) -> Path:
    """Validate and normalize project path.

    Args:
        path: Project path (relative or absolute)

    Returns:
        Absolute Path object

    Raises:
        ValueError: Invalid or non-existent path
    """
    project_path = Path(path).resolve()

    if not project_path.exists():
        raise ValueError(
            f"Project path does not exist: {path}\n"
            f"  Resolved to: {project_path}"
        )

    if not project_path.is_dir():
        raise ValueError(
            f"Project path is not a directory: {path}\n"
            f"  Resolved to: {project_path}"
        )

    # Check for required files
    package_json = project_path / 'package.json'
    if not package_json.exists():
        raise ValueError(
            f"Not a valid Node.js project: {path}\n"
            f"  Missing: package.json\n"
            f"  Hint: Ensure you're in the project root directory"
        )

    return project_path
```

### Prohibited Patterns

**Never do these:**

```python
# WRONG: Bare except
try:
    do_something()
except:
    pass  # Silent failure

# WRONG: Catching BaseException
try:
    do_something()
except BaseException:
    pass  # Catches KeyboardInterrupt, SystemExit

# WRONG: Shell injection vulnerability
subprocess.run(f"rm -rf {user_input}", shell=True)  # DANGER!

# WRONG: Eval with user input
result = eval(user_input)  # DANGER!

# WRONG: Returning False for different errors
if error_type_1:
    return False
if error_type_2:
    return False  # Can't distinguish error types!
```

## AI Guidelines for Python Modifications

- **Always** use type hints for function signatures
- **Always** include docstrings with Args/Returns/Raises sections
- **Never** use bare `except:` clauses
- **Never** execute shell commands with `shell=True` and user input
- **Never** return ambiguous success/failure indicators (True/False/None)
- **Always** provide actionable error messages with next steps
- **Always** validate inputs before processing
- **Prefer** raising exceptions over returning error codes
- **Test** platform-specific code on Windows/macOS/Linux when possible

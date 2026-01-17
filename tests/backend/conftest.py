"""
Pytest configuration and fixtures
"""

import pytest
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

@pytest.fixture(scope="session")
def test_data_dir():
    """Directory for test data files"""
    return Path(__file__).parent / "fixtures"

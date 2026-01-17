"""
Unit Tests - Phoenix Key Authentication
"""

import pytest
from backend.modules.auth.phoenix import PhoenixKeyAuth


def test_generate_token():
    """Test token generation"""
    auth = PhoenixKeyAuth()
    token = auth.generate_token()
    
    assert token is not None
    assert len(token) > 0
    assert token in auth.sessions


def test_validate_token():
    """Test token validation"""
    auth = PhoenixKeyAuth()
    token = auth.generate_token()
    
    assert auth.validate_token(token) is True
    assert auth.validate_token("invalid_token") is False


def test_validate_sequence():
    """Test secret sequence validation"""
    auth = PhoenixKeyAuth(secret_sequence="TEST_SEQUENCE")
    
    assert auth.validate_sequence("TEST_SEQUENCE") is True
    assert auth.validate_sequence("WRONG_SEQUENCE") is False


def test_token_expiration():
    """Test token expiration"""
    auth = PhoenixKeyAuth()
    auth.session_timeout = __import__('datetime').timedelta(seconds=1)
    
    token = auth.generate_token()
    assert auth.validate_token(token) is True
    
    # Wait for expiration
    import time
    time.sleep(2)
    
    assert auth.validate_token(token) is False


def test_revoke_token():
    """Test token revocation"""
    auth = PhoenixKeyAuth()
    token = auth.generate_token()
    
    assert auth.validate_token(token) is True
    auth.revoke_token(token)
    assert auth.validate_token(token) is False

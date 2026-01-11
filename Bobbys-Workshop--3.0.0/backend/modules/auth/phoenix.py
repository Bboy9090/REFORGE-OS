"""
Phoenix Key - Authentication System
Secret gesture/sequence authentication for Bobby's Workshop
"""

import secrets
import hashlib
import time
from typing import Optional, Dict
from datetime import datetime, timedelta


class PhoenixKeyAuth:
    """Phoenix Key authentication manager"""
    
    def __init__(self, secret_sequence: Optional[str] = None):
        """
        Initialize Phoenix Key system
        
        Args:
            secret_sequence: Secret sequence (default: generate new)
        """
        # Default secret sequence (can be overridden)
        self.secret_sequence = secret_sequence or "PHOENIX_RISES_2025"
        self.sessions: Dict[str, Dict] = {}
        self.session_timeout = timedelta(hours=2)  # 2 hour timeout
    
    def generate_token(self, user_id: Optional[str] = None) -> str:
        """
        Generate authentication token
        
        Args:
            user_id: Optional user identifier
            
        Returns:
            Authentication token
        """
        token_data = f"{secrets.token_urlsafe(32)}_{int(time.time())}"
        token_hash = hashlib.sha256(token_data.encode()).hexdigest()
        
        # Store session
        self.sessions[token_hash] = {
            "created": datetime.now(),
            "last_activity": datetime.now(),
            "user_id": user_id,
            "authenticated": True
        }
        
        return token_hash
    
    def validate_token(self, token: str) -> bool:
        """
        Validate authentication token
        
        Args:
            token: Token to validate
            
        Returns:
            True if valid
        """
        if token not in self.sessions:
            return False
        
        session = self.sessions[token]
        
        # Check timeout
        if datetime.now() - session["last_activity"] > self.session_timeout:
            del self.sessions[token]
            return False
        
        # Update last activity
        session["last_activity"] = datetime.now()
        
        return session.get("authenticated", False)
    
    def validate_sequence(self, sequence: str) -> bool:
        """
        Validate secret sequence
        
        Args:
            sequence: Sequence to validate
            
        Returns:
            True if matches secret sequence
        """
        # Hash comparison for security
        provided_hash = hashlib.sha256(sequence.encode()).hexdigest()
        secret_hash = hashlib.sha256(self.secret_sequence.encode()).hexdigest()
        
        return provided_hash == secret_hash
    
    def revoke_token(self, token: str):
        """Revoke authentication token"""
        if token in self.sessions:
            del self.sessions[token]
    
    def cleanup_expired(self):
        """Remove expired sessions"""
        now = datetime.now()
        expired = [
            token for token, session in self.sessions.items()
            if now - session["last_activity"] > self.session_timeout
        ]
        for token in expired:
            del self.sessions[token]


# Global instance
_phoenix_auth: Optional[PhoenixKeyAuth] = None


def get_phoenix_auth() -> PhoenixKeyAuth:
    """Get or create global Phoenix Key instance"""
    global _phoenix_auth
    if _phoenix_auth is None:
        _phoenix_auth = PhoenixKeyAuth()
    return _phoenix_auth

"""
Ghost Codex - Burner Persona Generator
Create temporary identities (emails, phone numbers)
"""

import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Optional
import json


class PersonaGenerator:
    """Generate burner personas"""
    
    def __init__(self):
        self.personas = {}
    
    def generate_email(
        self,
        expires_in_hours: int = 24,
        domain: str = "temp-mail.org"
    ) -> Dict:
        """
        Generate temporary email address
        
        Args:
            expires_in_hours: Hours until expiration
            domain: Email domain to use
            
        Returns:
            dict with email and metadata
        """
        # Generate random email
        username = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(12))
        email = f"{username}@{domain}"
        
        persona_id = secrets.token_urlsafe(16)
        
        persona = {
            "id": persona_id,
            "email": email,
            "created": datetime.now().isoformat(),
            "expires": (datetime.now() + timedelta(hours=expires_in_hours)).isoformat(),
            "status": "active"
        }
        
        self.personas[persona_id] = persona
        
        return persona
    
    def generate_phone(
        self,
        expires_in_days: int = 7,
        country_code: str = "+1"
    ) -> Dict:
        """
        Generate temporary phone number
        
        Args:
            expires_in_days: Days until expiration
            country_code: Country code prefix
            
        Returns:
            dict with phone and metadata
        """
        # Generate random phone number
        area_code = f"{secrets.randbelow(800) + 200:03d}"  # 200-999
        exchange = f"{secrets.randbelow(800) + 200:03d}"   # 200-999
        number = f"{secrets.randbelow(10000):04d}"         # 0000-9999
        
        phone = f"{country_code}-{area_code}-{exchange}-{number}"
        
        persona_id = secrets.token_urlsafe(16)
        
        persona = {
            "id": persona_id,
            "phone": phone,
            "created": datetime.now().isoformat(),
            "expires": (datetime.now() + timedelta(days=expires_in_days)).isoformat(),
            "status": "active"
        }
        
        self.personas[persona_id] = persona
        
        return persona
    
    def get_persona(self, persona_id: str) -> Optional[Dict]:
        """Get persona by ID"""
        return self.personas.get(persona_id)
    
    def list_personas(self) -> list:
        """List all personas"""
        return list(self.personas.values())
    
    def delete_persona(self, persona_id: str) -> bool:
        """Delete persona"""
        if persona_id in self.personas:
            del self.personas[persona_id]
            return True
        return False


# Global instance
_persona_generator: Optional[PersonaGenerator] = None


def get_persona_generator() -> PersonaGenerator:
    """Get or create global persona generator"""
    global _persona_generator
    if _persona_generator is None:
        _persona_generator = PersonaGenerator()
    return _persona_generator

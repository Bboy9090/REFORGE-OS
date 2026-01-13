"""Policy mode handler (mirror-only, never escalation)."""

class PolicyMirror:
    """Policy mode - mirrors Rust policy, never overrides."""
    
    def __init__(self, mode='public'):
        self.mode = mode
    
    def set_mode(self, mode: str):
        """Set policy mode"""
        self.mode = mode
    
    def allow_inspect(self) -> bool:
        """Check if inspect operations are allowed"""
        if self.mode == 'public':
            return True
        return False
    
    def allow_logs(self) -> bool:
        """Check if log collection is allowed"""
        if self.mode == 'public':
            return True
        return False
    
    def allows(self, action: str) -> bool:
        """
        Check if action is allowed.
        This is a mirror of Rust policy - Python never escalates.
        """
        if self.mode == 'public':
            # Public mode allows only read-only operations
            allowed = {
                'inspect_basic': True,
                'inspect_deep': True,
                'logs_collect': True,
                'report_format': True,
            }
            return allowed.get(action, False)
        
        # Other modes still restricted
        return False

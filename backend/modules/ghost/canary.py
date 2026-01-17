"""
Ghost Codex - Canary Token Generator
Creates bait files that alert when accessed
"""

from pathlib import Path
from typing import Dict
import json
from datetime import datetime


def generate_bait_file(token_id: str, filename: str, callback_url: str) -> str:
    """
    Generate a bait HTML file that calls back when opened
    
    Args:
        token_id: Unique token identifier
        filename: Name for the bait file
        callback_url: URL to call when file is accessed
        
    Returns:
        Path to created bait file
    """
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Private Archive - Authorized Access Only</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background: #1a1a1a;
            color: #fff;
            padding: 50px;
            text-align: center;
        }}
        h2 {{
            color: #ff6b6b;
        }}
    </style>
</head>
<body>
    <h2>Private Archive - Authorized Access Only</h2>
    <p>Loading encrypted data...</p>
    <p style="color: #888; font-size: 12px;">Please wait while we verify your credentials...</p>
    <!-- Hidden beacon - triggers callback -->
    <img src="{callback_url}" style="display:none; width:1px; height:1px;" alt="" />
</body>
</html>
"""
    
    # Save bait file
    bait_path = Path(filename)
    with open(bait_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return str(bait_path)


def log_canary_alert(token_id: str, ip: str, user_agent: str, log_file: str = "ghost_codex_alerts.json") -> None:
    """
    Log canary token trigger
    
    Args:
        token_id: Token that was triggered
        ip: IP address of requester
        user_agent: User agent string
        log_file: Path to log file
    """
    alert = {
        "token": token_id,
        "ip": ip,
        "device_info": user_agent,
        "time": datetime.now().isoformat(),
        "status": "COMPROMISED"
    }
    
    # Append to log file
    log_path = Path(log_file)
    alerts = []
    
    if log_path.exists():
        with open(log_path, 'r') as f:
            try:
                alerts = json.load(f)
            except json.JSONDecodeError:
                alerts = []
    
    alerts.append(alert)
    
    with open(log_path, 'w') as f:
        json.dump(alerts, f, indent=2)

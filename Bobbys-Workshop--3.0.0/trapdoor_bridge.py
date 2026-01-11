#!/usr/bin/env python3
"""
Trapdoor Bridge - Python wrapper for Rust trapdoor CLI
Provides Python-friendly interface to the trapdoor_cli Rust binary
"""

import json
import subprocess
import os
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any


class TrapdoorBridge:
    """Python bridge to Rust trapdoor implementation"""
    
    def __init__(self, cli_path: Optional[str] = None, tools_dir: Optional[str] = None):
        """
        Initialize the trapdoor bridge
        
        Args:
            cli_path: Path to trapdoor_cli binary (auto-detected if None)
            tools_dir: Path to tools directory (uses env var if None)
        """
        self.cli_path = cli_path or self._find_cli_binary()
        self.tools_dir = tools_dir or os.environ.get('TRAPDOOR_TOOLS_DIR', './tools')
        
        if not self.cli_path:
            raise RuntimeError("trapdoor_cli binary not found. Please build it first.")
    
    def _find_cli_binary(self) -> Optional[str]:
        """Find the trapdoor_cli binary"""
        import shutil
        
        # Check common locations
        possible_paths = [
            './bootforge/target/release/trapdoor_cli',
            './bootforge/target/debug/trapdoor_cli',
        ]
        
        for path in possible_paths:
            if os.path.isfile(path) and os.access(path, os.X_OK):
                return path
        
        # Try with PATH lookup using shutil.which (more secure)
        path_binary = shutil.which('trapdoor_cli')
        if path_binary:
            return path_binary
        
        return None
    
    def execute_tool(self, tool: str, args: List[str], 
                    env_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute a tool with arguments
        
        Args:
            tool: Tool name (e.g., 'palera1n')
            args: List of arguments for the tool
            env_path: Optional custom path to the tool binary
            
        Returns:
            Dictionary with 'success', 'output', and optional 'error' keys
        """
        request = {
            'tool': tool,
            'args': args,
            'env_path': env_path
        }
        
        cmd = [self.cli_path]
        if self.tools_dir:
            cmd.extend(['--tools-dir', self.tools_dir])
        cmd.append('execute')
        
        try:
            result = subprocess.run(
                cmd,
                input=json.dumps(request),
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            response = json.loads(result.stdout)
            return response
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': 'Tool execution timed out'
            }
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'output': '',
                'error': f'Failed to parse response: {e}'
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e)
            }
    
    def check_tool(self, tool: str) -> bool:
        """
        Check if a tool is available
        
        Args:
            tool: Tool name
            
        Returns:
            True if tool is available, False otherwise
        """
        cmd = [self.cli_path]
        if self.tools_dir:
            cmd.extend(['--tools-dir', self.tools_dir])
        cmd.extend(['check', tool])
        
        try:
            result = subprocess.run(cmd, capture_output=True)
            return result.returncode == 0
        except Exception:
            return False
    
    def get_tool_info(self, tool: str) -> Dict[str, Any]:
        """
        Get information about a tool
        
        Args:
            tool: Tool name
            
        Returns:
            Dictionary with tool information
        """
        cmd = [self.cli_path]
        if self.tools_dir:
            cmd.extend(['--tools-dir', self.tools_dir])
        cmd.extend(['info', tool])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return json.loads(result.stdout)
        except Exception:
            return {
                'name': tool,
                'category': 'unknown',
                'available': False
            }
    
    def list_available_tools(self) -> List[Dict[str, Any]]:
        """
        List all available tools
        
        Returns:
            List of tool information dictionaries
        """
        cmd = [self.cli_path]
        if self.tools_dir:
            cmd.extend(['--tools-dir', self.tools_dir])
        cmd.append('list')
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return json.loads(result.stdout)
        except Exception:
            return []


def main():
    """CLI interface for testing"""
    if len(sys.argv) < 2:
        print("Usage: trapdoor_bridge.py <command> [args...]")
        print("Commands: check, info, list, execute")
        sys.exit(1)
    
    bridge = TrapdoorBridge()
    command = sys.argv[1]
    
    if command == 'check':
        if len(sys.argv) < 3:
            print("Usage: trapdoor_bridge.py check <tool>")
            sys.exit(1)
        available = bridge.check_tool(sys.argv[2])
        print(f"Tool available: {available}")
        sys.exit(0 if available else 1)
    
    elif command == 'info':
        if len(sys.argv) < 3:
            print("Usage: trapdoor_bridge.py info <tool>")
            sys.exit(1)
        info = bridge.get_tool_info(sys.argv[2])
        print(json.dumps(info, indent=2))
    
    elif command == 'list':
        tools = bridge.list_available_tools()
        print(json.dumps(tools, indent=2))
    
    elif command == 'execute':
        if len(sys.argv) < 3:
            print("Usage: trapdoor_bridge.py execute <tool> [args...]")
            sys.exit(1)
        tool = sys.argv[2]
        args = sys.argv[3:] if len(sys.argv) > 3 else []
        result = bridge.execute_tool(tool, args)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result['success'] else 1)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == '__main__':
    main()

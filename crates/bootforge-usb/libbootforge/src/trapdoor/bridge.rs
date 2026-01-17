/// Bridge module for integrating trapdoor with bobby_dev Python/TypeScript layers
/// This provides FFI-friendly interfaces for cross-language communication

use super::{TrapdoorTool, TrapdoorRunner, TrapdoorConfig};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// JSON-serializable tool execution request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolRequest {
    pub tool: String,
    pub args: Vec<String>,
    pub env_path: Option<String>,
}

/// JSON-serializable tool execution response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResponse {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
}

/// JSON-serializable tool info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInfo {
    pub name: String,
    pub category: String,
    pub available: bool,
}

/// Bridge for bobby_dev integration
pub struct BobbyDevBridge {
    runner: TrapdoorRunner,
}

impl BobbyDevBridge {
    /// Create a new bridge with default configuration
    pub fn new() -> Self {
        Self {
            runner: TrapdoorRunner::new(),
        }
    }
    
    /// Create a new bridge with custom tools directory
    pub fn with_tools_dir(tools_dir: PathBuf) -> Self {
        let config = TrapdoorConfig {
            tools_dir,
            ..Default::default()
        };
        Self {
            runner: TrapdoorRunner::with_config(config),
        }
    }
    
    /// Execute a tool from JSON request
    pub async fn execute_tool_json(&self, request_json: &str) -> String {
        let request: ToolRequest = match serde_json::from_str(request_json) {
            Ok(r) => r,
            Err(e) => {
                let response = ToolResponse {
                    success: false,
                    output: String::new(),
                    error: Some(format!("Invalid request JSON: {}", e)),
                };
                return serde_json::to_string(&response).unwrap();
            }
        };
        
        self.execute_tool(request).await
    }
    
    /// Execute a tool from structured request
    pub async fn execute_tool(&self, request: ToolRequest) -> String {
        // Parse tool name to TrapdoorTool enum
        let tool = match self.parse_tool(&request.tool) {
            Some(t) => t,
            None => {
                let response = ToolResponse {
                    success: false,
                    output: String::new(),
                    error: Some(format!("Unknown tool: {}", request.tool)),
                };
                return serde_json::to_string(&response).unwrap();
            }
        };
        
        // Convert args to &str slice
        let args: Vec<&str> = request.args.iter().map(|s| s.as_str()).collect();
        
        // Convert env_path to Path
        let env_path = request.env_path.as_ref().map(PathBuf::from);
        
        // Execute tool
        match self.runner.run_tool(tool, &args, env_path.as_deref()).await {
            Ok(output) => {
                let response = ToolResponse {
                    success: true,
                    output,
                    error: None,
                };
                serde_json::to_string(&response).unwrap()
            }
            Err(e) => {
                let response = ToolResponse {
                    success: false,
                    output: String::new(),
                    error: Some(e.to_string()),
                };
                serde_json::to_string(&response).unwrap()
            }
        }
    }
    
    /// Get tool information as JSON
    pub fn get_tool_info_json(&self, tool_name: &str) -> String {
        if let Some(tool) = self.parse_tool(tool_name) {
            let info = ToolInfo {
                name: tool.name().to_string(),
                category: tool.category().to_string(),
                available: self.runner.is_tool_available(&tool, None),
            };
            serde_json::to_string(&info).unwrap()
        } else {
            let info = ToolInfo {
                name: tool_name.to_string(),
                category: "unknown".to_string(),
                available: false,
            };
            serde_json::to_string(&info).unwrap()
        }
    }
    
    /// List all available tools as JSON
    pub fn list_available_tools_json(&self) -> String {
        let tools = self.runner.list_available_tools();
        let infos: Vec<ToolInfo> = tools.iter().map(|tool| {
            ToolInfo {
                name: tool.name().to_string(),
                category: tool.category().to_string(),
                available: true,
            }
        }).collect();
        
        serde_json::to_string(&infos).unwrap()
    }
    
    // Helper to parse tool name string to TrapdoorTool enum
    fn parse_tool(&self, name: &str) -> Option<TrapdoorTool> {
        match name.to_lowercase().as_str() {
            "palera1n" => Some(TrapdoorTool::Palera1n),
            "checkra1n" => Some(TrapdoorTool::Checkra1n),
            "lockra1n" => Some(TrapdoorTool::Lockra1n),
            "openbypass" => Some(TrapdoorTool::OpenBypass),
            "minacriss" => Some(TrapdoorTool::MinaCriss),
            "iremovaltools" => Some(TrapdoorTool::IRemovalTools),
            "brique_ramdisk" | "briqueramdisk" => Some(TrapdoorTool::BriqueRamdisk),
            "frp_bypass" | "frphelper" | "frp_helper" => Some(TrapdoorTool::FrpHelper),
            "magisk" => Some(TrapdoorTool::Magisk),
            "twrp" => Some(TrapdoorTool::Twrp),
            "apk_helpers" | "apkhelpers" => Some(TrapdoorTool::ApkHelpers),
            "efi_unlocker" | "efiunlocker" => Some(TrapdoorTool::EfiUnlocker),
            _ => Some(TrapdoorTool::Custom(name.to_string())),
        }
    }
}

impl Default for BobbyDevBridge {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_tool() {
        let bridge = BobbyDevBridge::new();
        assert!(matches!(bridge.parse_tool("palera1n"), Some(TrapdoorTool::Palera1n)));
        assert!(matches!(bridge.parse_tool("checkra1n"), Some(TrapdoorTool::Checkra1n)));
        assert!(matches!(bridge.parse_tool("frp_bypass"), Some(TrapdoorTool::FrpHelper)));
    }
    
    #[test]
    fn test_tool_info_json() {
        let bridge = BobbyDevBridge::new();
        let json = bridge.get_tool_info_json("palera1n");
        assert!(json.contains("palera1n"));
        assert!(json.contains("ios_old"));
    }
}

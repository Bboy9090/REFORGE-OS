pub mod bridge;
pub mod verification;
pub mod downloader;

use crate::Result;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;

pub use bridge::{BobbyDevBridge, ToolRequest, ToolResponse, ToolInfo};
pub use verification::{ToolSignature, SignatureDatabase, compute_file_hash, verify_tool};
pub use downloader::{ToolSource, ToolDownloader};

/// Trapdoor tools for device exploitation and bypass
/// This module provides the unified interface for bobby_dev tools
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum TrapdoorTool {
    // iOS Tools (A5-A11)
    Palera1n,
    Checkra1n,
    Lockra1n,
    OpenBypass,
    
    // iOS Tools (A12+)
    MinaCriss,
    IRemovalTools,
    BriqueRamdisk,
    
    // Android Tools
    FrpHelper,
    Magisk,
    Twrp,
    ApkHelpers,
    
    // System Tools
    EfiUnlocker,
    
    // Custom tool with name
    Custom(String),
}

impl TrapdoorTool {
    /// Get the tool name as a string
    pub fn name(&self) -> &str {
        match self {
            TrapdoorTool::Palera1n => "palera1n",
            TrapdoorTool::Checkra1n => "checkra1n",
            TrapdoorTool::Lockra1n => "lockra1n",
            TrapdoorTool::OpenBypass => "openbypass",
            TrapdoorTool::MinaCriss => "minacriss",
            TrapdoorTool::IRemovalTools => "iremovaltools",
            TrapdoorTool::BriqueRamdisk => "brique_ramdisk",
            TrapdoorTool::FrpHelper => "frp_bypass",
            TrapdoorTool::Magisk => "magisk",
            TrapdoorTool::Twrp => "twrp",
            TrapdoorTool::ApkHelpers => "apk_helpers",
            TrapdoorTool::EfiUnlocker => "efi_unlocker",
            TrapdoorTool::Custom(name) => name,
        }
    }
    
    /// Get the tool's category
    pub fn category(&self) -> &str {
        match self {
            TrapdoorTool::Palera1n | TrapdoorTool::Checkra1n | TrapdoorTool::Lockra1n 
            | TrapdoorTool::OpenBypass => "ios_old",
            TrapdoorTool::MinaCriss | TrapdoorTool::IRemovalTools | TrapdoorTool::BriqueRamdisk => "ios_new",
            TrapdoorTool::FrpHelper | TrapdoorTool::Magisk | TrapdoorTool::Twrp 
            | TrapdoorTool::ApkHelpers => "android",
            TrapdoorTool::EfiUnlocker => "system",
            TrapdoorTool::Custom(_) => "custom",
        }
    }
}

/// Configuration for trapdoor tool execution
#[derive(Debug, Clone)]
pub struct TrapdoorConfig {
    /// Base directory for tools
    pub tools_dir: PathBuf,
    /// Assets directory
    pub assets_dir: PathBuf,
    /// Enable sandboxing
    pub sandbox: bool,
    /// Timeout in seconds
    pub timeout: u64,
}

impl Default for TrapdoorConfig {
    fn default() -> Self {
        Self {
            tools_dir: PathBuf::from("./tools"),
            assets_dir: PathBuf::from("./assets"),
            sandbox: true,
            timeout: 300,
        }
    }
}

/// Trapdoor tool runner - unified interface for bobby_dev
pub struct TrapdoorRunner {
    config: TrapdoorConfig,
    signature_db: verification::SignatureDatabase,
}

impl TrapdoorRunner {
    /// Create a new runner with default configuration
    pub fn new() -> Self {
        Self {
            config: TrapdoorConfig::default(),
            signature_db: verification::SignatureDatabase::new(),
        }
    }
    
    /// Create a new runner with custom configuration
    pub fn with_config(config: TrapdoorConfig) -> Self {
        Self { 
            config,
            signature_db: verification::SignatureDatabase::new(),
        }
    }
    
    /// Verify a tool's signature
    pub fn verify_tool_signature(&self, tool: &TrapdoorTool, version: &str) -> Result<bool> {
        let tool_path = self.get_tool_path(tool, None);
        
        if let Some(signature) = self.signature_db.get_signature(tool.name(), version) {
            verification::verify_tool(&tool_path, &signature.sha256)
        } else {
            log::warn!("No signature found for {} version {}", tool.name(), version);
            Ok(false)
        }
    }
    
    /// Execute a trapdoor tool with arguments
    pub async fn run_tool(
        &self,
        tool: TrapdoorTool,
        args: &[&str],
        env_path: Option<&Path>,
    ) -> Result<String> {
        log::info!("Executing trapdoor tool: {} with args: {:?}", tool.name(), args);
        
        // Check if tool is available
        if !self.is_tool_available(&tool, env_path) {
            return Err(crate::BootforgeError::Trapdoor(
                format!("Tool {} not found or not available", tool.name())
            ));
        }
        
        // Build the tool path
        let tool_path = self.get_tool_path(&tool, env_path);
        
        // Execute with sandboxing if enabled
        let output = if self.config.sandbox {
            self.run_sandboxed(&tool_path, args).await?
        } else {
            self.run_direct(&tool_path, args).await?
        };
        
        Ok(output)
    }
    
    /// Check if a tool is available
    pub fn is_tool_available(&self, tool: &TrapdoorTool, env_path: Option<&Path>) -> bool {
        let tool_path = self.get_tool_path(tool, env_path);
        tool_path.exists() && tool_path.is_file()
    }
    
    /// Get the full path to a tool
    pub fn get_tool_path(&self, tool: &TrapdoorTool, env_path: Option<&Path>) -> PathBuf {
        if let Some(path) = env_path {
            return path.to_path_buf();
        }
        
        // Default path: tools_dir/category/tool_name
        self.config.tools_dir
            .join(tool.category())
            .join(tool.name())
    }
    
    /// Get tool information and usage guide
    pub fn get_tool_info(&self, tool: &TrapdoorTool) -> String {
        format!(
            "Tool: {}\nCategory: {}\nAvailable: {}",
            tool.name(),
            tool.category(),
            self.is_tool_available(tool, None)
        )
    }
    
    /// List all available tools
    pub fn list_available_tools(&self) -> Vec<TrapdoorTool> {
        let all_tools = vec![
            TrapdoorTool::Palera1n,
            TrapdoorTool::Checkra1n,
            TrapdoorTool::Lockra1n,
            TrapdoorTool::OpenBypass,
            TrapdoorTool::MinaCriss,
            TrapdoorTool::IRemovalTools,
            TrapdoorTool::BriqueRamdisk,
            TrapdoorTool::FrpHelper,
            TrapdoorTool::Magisk,
            TrapdoorTool::Twrp,
            TrapdoorTool::ApkHelpers,
            TrapdoorTool::EfiUnlocker,
        ];
        
        all_tools.into_iter()
            .filter(|tool| self.is_tool_available(tool, None))
            .collect()
    }
    
    // Private helper methods
    
    async fn run_sandboxed(&self, tool_path: &Path, args: &[&str]) -> Result<String> {
        // Try to use firejail for sandboxing
        if self.is_firejail_available() {
            log::info!("Running tool with firejail sandboxing");
            self.run_with_firejail(tool_path, args).await
        } else {
            log::warn!("Firejail not available, falling back to direct execution");
            self.run_direct(tool_path, args).await
        }
    }
    
    fn is_firejail_available(&self) -> bool {
        // Check if firejail is installed and available
        Command::new("which")
            .arg("firejail")
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }
    
    async fn run_with_firejail(&self, tool_path: &Path, args: &[&str]) -> Result<String> {
        // Build firejail command with security restrictions
        let mut cmd = Command::new("firejail");
        
        // Add security profiles
        cmd.arg("--noprofile")          // Don't use default profile
            .arg("--private")            // Use private home directory
            .arg("--private-tmp")        // Private /tmp
            .arg("--noroot")             // No root privileges
            .arg("--net=none")           // No network access (can be overridden if needed)
            .arg("--seccomp")            // Enable seccomp filter
            .arg("--caps.drop=all")      // Drop all capabilities
            .arg("--nonewprivs")         // No new privileges
            .arg("--nogroups");          // Clear supplementary groups
        
        // Add the tool to execute
        cmd.arg(tool_path);
        cmd.args(args);
        
        let output = cmd.output()
            .map_err(|e| crate::BootforgeError::Trapdoor(format!("Failed to execute with firejail: {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(crate::BootforgeError::Trapdoor(
                format!("Sandboxed tool execution failed: {}", stderr)
            ));
        }
        
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
    
    async fn run_direct(&self, tool_path: &Path, args: &[&str]) -> Result<String> {
        let output = Command::new(tool_path)
            .args(args)
            .output()
            .map_err(|e| crate::BootforgeError::Trapdoor(format!("Failed to execute: {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(crate::BootforgeError::Trapdoor(
                format!("Tool execution failed: {}", stderr)
            ));
        }
        
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}

impl Default for TrapdoorRunner {
    fn default() -> Self {
        Self::new()
    }
}

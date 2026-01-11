/// Automatic tool downloader module
/// Downloads and installs trapdoor tools from configured sources

use crate::Result;
use super::TrapdoorTool;
use std::path::PathBuf;
use std::fs;

/// Tool download source
#[derive(Debug, Clone)]
pub struct ToolSource {
    pub tool: TrapdoorTool,
    pub url: String,
    pub version: String,
    pub sha256: Option<String>,
}

/// Tool downloader
pub struct ToolDownloader {
    download_dir: PathBuf,
    sources: Vec<ToolSource>,
}

impl ToolDownloader {
    /// Create a new downloader with specified download directory
    pub fn new(download_dir: PathBuf) -> Self {
        Self {
            download_dir,
            sources: Self::default_sources(),
        }
    }
    
    /// Get default tool sources
    fn default_sources() -> Vec<ToolSource> {
        // In a real implementation, these would be loaded from a configuration file
        // or a secure registry. For now, we provide an empty list.
        vec![]
    }
    
    /// Add a custom tool source
    pub fn add_source(&mut self, source: ToolSource) {
        self.sources.push(source);
    }
    
    /// Get source for a tool
    pub fn get_source(&self, tool: &TrapdoorTool) -> Option<&ToolSource> {
        self.sources.iter().find(|source| &source.tool == tool)
    }
    
    /// Download a tool (placeholder for actual implementation)
    pub async fn download_tool(&self, tool: &TrapdoorTool) -> Result<PathBuf> {
        let source = self.get_source(tool).ok_or_else(|| 
            crate::BootforgeError::Trapdoor(format!("No source found for tool: {}", tool.name()))
        )?;
        
        log::info!("Downloading tool {} from {}", tool.name(), source.url);
        
        // Create category directory
        let category_dir = self.download_dir.join(tool.category());
        fs::create_dir_all(&category_dir)
            .map_err(|e| crate::BootforgeError::Trapdoor(format!("Failed to create directory: {}", e)))?;
        
        // NOTE: Actual download implementation would use reqwest or similar
        // For security reasons, this is left as a stub that needs to be
        // implemented with proper authentication, verification, and progress tracking
        
        log::warn!("Download functionality not yet implemented - tool must be manually installed");
        
        Err(crate::BootforgeError::Trapdoor(
            "Automatic download not yet implemented. Please install tools manually.".to_string()
        ))
    }
    
    /// Check if a tool is already downloaded
    pub fn is_downloaded(&self, tool: &TrapdoorTool) -> bool {
        let tool_path = self.download_dir
            .join(tool.category())
            .join(tool.name());
        tool_path.exists()
    }
    
    /// Get the expected path for a downloaded tool
    pub fn get_tool_path(&self, tool: &TrapdoorTool) -> PathBuf {
        self.download_dir
            .join(tool.category())
            .join(tool.name())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    
    #[test]
    fn test_downloader_creation() {
        let temp_dir = TempDir::new().unwrap();
        let downloader = ToolDownloader::new(temp_dir.path().to_path_buf());
        
        assert_eq!(downloader.download_dir, temp_dir.path());
    }
    
    #[test]
    fn test_add_source() {
        let temp_dir = TempDir::new().unwrap();
        let mut downloader = ToolDownloader::new(temp_dir.path().to_path_buf());
        
        let source = ToolSource {
            tool: TrapdoorTool::Palera1n,
            url: "https://example.com/palera1n".to_string(),
            version: "1.0.0".to_string(),
            sha256: Some("abc123".to_string()),
        };
        
        downloader.add_source(source);
        
        let found = downloader.get_source(&TrapdoorTool::Palera1n);
        assert!(found.is_some());
        assert_eq!(found.unwrap().version, "1.0.0");
    }
    
    #[test]
    fn test_is_downloaded() {
        let temp_dir = TempDir::new().unwrap();
        let downloader = ToolDownloader::new(temp_dir.path().to_path_buf());
        
        // Tool not downloaded yet
        assert!(!downloader.is_downloaded(&TrapdoorTool::Palera1n));
        
        // Create the tool file
        let tool_dir = temp_dir.path().join("ios_old");
        fs::create_dir_all(&tool_dir).unwrap();
        fs::write(tool_dir.join("palera1n"), b"fake tool").unwrap();
        
        // Now it should be detected
        assert!(downloader.is_downloaded(&TrapdoorTool::Palera1n));
    }
    
    #[test]
    fn test_get_tool_path() {
        let temp_dir = TempDir::new().unwrap();
        let downloader = ToolDownloader::new(temp_dir.path().to_path_buf());
        
        let path = downloader.get_tool_path(&TrapdoorTool::Palera1n);
        assert_eq!(path, temp_dir.path().join("ios_old").join("palera1n"));
    }
}

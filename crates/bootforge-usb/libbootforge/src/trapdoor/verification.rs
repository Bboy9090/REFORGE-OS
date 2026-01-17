/// Tool signature verification module
/// Verifies tool integrity using SHA-256 checksums

use crate::Result;
use sha2::{Sha256, Digest};
use std::fs::File;
use std::io::Read;
use std::path::Path;

/// Tool signature information
#[derive(Debug, Clone)]
pub struct ToolSignature {
    pub tool_name: String,
    pub version: String,
    pub sha256: String,
}

/// Signature database for known tools
pub struct SignatureDatabase {
    signatures: Vec<ToolSignature>,
}

impl SignatureDatabase {
    /// Create a new signature database with default known signatures
    pub fn new() -> Self {
        Self {
            signatures: Self::default_signatures(),
        }
    }
    
    /// Get default known tool signatures
    fn default_signatures() -> Vec<ToolSignature> {
        vec![
            // Add known tool signatures here
            // These would normally be loaded from a configuration file
            // For now, we provide an empty list that can be extended
        ]
    }
    
    /// Add a signature to the database
    pub fn add_signature(&mut self, signature: ToolSignature) {
        self.signatures.push(signature);
    }
    
    /// Get signature for a tool
    pub fn get_signature(&self, tool_name: &str, version: &str) -> Option<&ToolSignature> {
        self.signatures.iter().find(|sig| 
            sig.tool_name == tool_name && sig.version == version
        )
    }
}

impl Default for SignatureDatabase {
    fn default() -> Self {
        Self::new()
    }
}

/// Compute SHA-256 hash of a file
pub fn compute_file_hash(path: &Path) -> Result<String> {
    let mut file = File::open(path)
        .map_err(|e| crate::BootforgeError::Trapdoor(format!("Failed to open file: {}", e)))?;
    
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];
    
    loop {
        let n = file.read(&mut buffer)
            .map_err(|e| crate::BootforgeError::Trapdoor(format!("Failed to read file: {}", e)))?;
        
        if n == 0 {
            break;
        }
        
        hasher.update(&buffer[..n]);
    }
    
    Ok(format!("{:x}", hasher.finalize()))
}

/// Verify a tool against a known signature
pub fn verify_tool(path: &Path, expected_hash: &str) -> Result<bool> {
    let computed_hash = compute_file_hash(path)?;
    Ok(computed_hash == expected_hash)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;
    
    #[test]
    fn test_compute_file_hash() {
        // SHA-256 of "test content"
        const EXPECTED_HASH: &str = "6ae8a75555209fd6c44157c0aed8016e763ff435a19cf186f76863140143ff72";
        
        let mut temp_file = NamedTempFile::new().unwrap();
        temp_file.write_all(b"test content").unwrap();
        temp_file.flush().unwrap();
        
        let hash = compute_file_hash(temp_file.path()).unwrap();
        assert_eq!(hash, EXPECTED_HASH);
    }
    
    #[test]
    fn test_verify_tool() {
        // SHA-256 of "test content"
        const EXPECTED_HASH: &str = "6ae8a75555209fd6c44157c0aed8016e763ff435a19cf186f76863140143ff72";
        
        let mut temp_file = NamedTempFile::new().unwrap();
        temp_file.write_all(b"test content").unwrap();
        temp_file.flush().unwrap();
        
        assert!(verify_tool(temp_file.path(), EXPECTED_HASH).unwrap());
        assert!(!verify_tool(temp_file.path(), "wrong_hash").unwrap());
    }
    
    #[test]
    fn test_signature_database() {
        let mut db = SignatureDatabase::new();
        
        let sig = ToolSignature {
            tool_name: "test_tool".to_string(),
            version: "1.0.0".to_string(),
            sha256: "abcd1234".to_string(),
        };
        
        db.add_signature(sig);
        
        let found = db.get_signature("test_tool", "1.0.0");
        assert!(found.is_some());
        assert_eq!(found.unwrap().sha256, "abcd1234");
        
        let not_found = db.get_signature("test_tool", "2.0.0");
        assert!(not_found.is_none());
    }
}

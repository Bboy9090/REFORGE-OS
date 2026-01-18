//! Unified Device State JSON Schema
//! 
//! This module defines the canonical device state representation
//! used across all BootForge components.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Unified Device State - The single source of truth for device information
/// 
/// This schema is used by:
/// - BootForge USB (device detection)
/// - Phoenix Core (deployment decisions)
/// - ForgeWorks API (compliance tracking)
/// - Workshop UI (display)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedDeviceState {
    /// Schema version for compatibility
    pub schema_version: String,
    
    /// Unique device identifier (generated from hardware identifiers)
    pub device_uid: String,
    
    /// When this state was captured
    pub timestamp: String,
    
    /// Platform identification
    pub platform: PlatformInfo,
    
    /// Connection information
    pub connection: ConnectionInfo,
    
    /// Hardware identifiers
    pub hardware: HardwareInfo,
    
    /// Current device mode/state
    pub mode: DeviceModeInfo,
    
    /// Security and trust state
    pub security: SecurityInfo,
    
    /// Capabilities and restrictions
    pub capabilities: CapabilityInfo,
    
    /// Compliance classification
    pub compliance: ComplianceInfo,
    
    /// Raw evidence from detection tools
    pub evidence: EvidenceInfo,
    
    /// Additional metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Platform identification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformInfo {
    /// Platform family: android, ios, windows, macos, linux
    pub family: String,
    
    /// Specific OS version
    pub os_version: Option<String>,
    
    /// Build number/ID
    pub build_id: Option<String>,
    
    /// Manufacturer/OEM
    pub manufacturer: Option<String>,
    
    /// Device model
    pub model: Option<String>,
    
    /// Device codename (for Android)
    pub codename: Option<String>,
    
    /// Product name
    pub product: Option<String>,
}

/// Connection information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionInfo {
    /// Connection type: usb, wifi_adb, network
    pub connection_type: String,
    
    /// USB bus number (if USB)
    pub usb_bus: Option<u8>,
    
    /// USB device address (if USB)
    pub usb_address: Option<u8>,
    
    /// USB port path
    pub usb_port_path: Option<String>,
    
    /// Network address (if network)
    pub network_address: Option<String>,
    
    /// Connection speed
    pub speed: Option<String>,
    
    /// Is connection active
    pub active: bool,
    
    /// Last seen timestamp
    pub last_seen: String,
}

/// Hardware identifiers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareInfo {
    /// Serial number (if available)
    pub serial: Option<String>,
    
    /// IMEI (for phones)
    pub imei: Option<String>,
    
    /// MEID (for CDMA phones)
    pub meid: Option<String>,
    
    /// MAC addresses
    pub mac_addresses: HashMap<String, String>,
    
    /// USB Vendor ID
    pub usb_vid: Option<String>,
    
    /// USB Product ID
    pub usb_pid: Option<String>,
    
    /// Unique device identifiers from OS
    pub udid: Option<String>,
    
    /// Hardware revision
    pub hw_revision: Option<String>,
    
    /// Storage capacity in bytes
    pub storage_bytes: Option<u64>,
    
    /// RAM capacity in bytes
    pub ram_bytes: Option<u64>,
}

/// Device mode/state information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceModeInfo {
    /// Current mode
    pub current_mode: DeviceMode,
    
    /// Confidence in mode detection (0.0 - 1.0)
    pub confidence: f32,
    
    /// Available modes this device can enter
    pub available_modes: Vec<DeviceMode>,
    
    /// Is device in a bootloader/recovery state
    pub is_recovery_mode: bool,
    
    /// Is device in DFU/download mode
    pub is_dfu_mode: bool,
    
    /// Is device booted to normal OS
    pub is_normal_mode: bool,
    
    /// Mode detection notes
    pub notes: Vec<String>,
}

/// Device operating modes
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DeviceMode {
    // Android modes
    AndroidAdb,
    AndroidFastboot,
    AndroidRecovery,
    AndroidSideload,
    AndroidDownload, // Samsung Odin mode
    
    // iOS modes
    IosNormal,
    IosRecovery,
    IosDfu,
    
    // Desktop modes
    WindowsNormal,
    WindowsRecovery,
    WindowsSafeMode,
    MacosNormal,
    MacosRecovery,
    LinuxNormal,
    LinuxRecovery,
    
    // Special modes
    Bootloader,
    Fastboot,
    Unknown,
}

/// Security and trust state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityInfo {
    /// Is device locked (FRP, iCloud, etc.)
    pub is_locked: Option<bool>,
    
    /// Lock type if locked
    pub lock_type: Option<String>,
    
    /// Is bootloader unlocked
    pub bootloader_unlocked: Option<bool>,
    
    /// Is device rooted/jailbroken
    pub is_rooted: Option<bool>,
    
    /// ADB authorization status
    pub adb_authorized: Option<bool>,
    
    /// USB debugging enabled
    pub usb_debugging: Option<bool>,
    
    /// Device encryption status
    pub encryption_status: Option<String>,
    
    /// Secure boot status
    pub secure_boot: Option<bool>,
    
    /// Verified boot state
    pub verified_boot_state: Option<String>,
    
    /// SELinux/security policy status
    pub security_policy: Option<String>,
    
    /// Trust level (0-100)
    pub trust_score: u8,
}

/// Device capabilities and restrictions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityInfo {
    /// What operations are available
    pub available_operations: Vec<String>,
    
    /// What operations are blocked
    pub blocked_operations: Vec<String>,
    
    /// Reason for any blocks
    pub block_reasons: HashMap<String, String>,
    
    /// Required authorizations
    pub required_auth: Vec<String>,
    
    /// Capability class
    pub capability_class: String,
}

/// Compliance classification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceInfo {
    /// Overall classification
    pub classification: ComplianceClassification,
    
    /// Risk level
    pub risk_level: RiskLevel,
    
    /// Jurisdiction (if applicable)
    pub jurisdiction: Option<String>,
    
    /// Ownership confidence (0.0 - 1.0)
    pub ownership_confidence: f32,
    
    /// Required authorizations for operations
    pub required_authorizations: Vec<String>,
    
    /// Routing recommendation
    pub routing: RoutingRecommendation,
    
    /// Compliance notes
    pub notes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ComplianceClassification {
    Permitted,
    ConditionallyPermitted,
    RequiresAuthorization,
    Prohibited,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    VeryHigh,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingRecommendation {
    /// Where to route this device
    pub route_to: String,
    
    /// Recommended authority
    pub authority: Option<String>,
    
    /// Required documentation
    pub required_docs: Vec<String>,
    
    /// Routing notes
    pub notes: Option<String>,
}

/// Raw evidence from detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceInfo {
    /// USB evidence
    pub usb: Option<UsbEvidence>,
    
    /// Tool-specific evidence
    pub tools: HashMap<String, ToolEvidence>,
    
    /// Raw output from detection commands
    pub raw_outputs: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsbEvidence {
    pub vid: String,
    pub pid: String,
    pub manufacturer: Option<String>,
    pub product: Option<String>,
    pub serial: Option<String>,
    pub bus: u8,
    pub address: u8,
    pub interfaces: Vec<InterfaceInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterfaceInfo {
    pub class: u8,
    pub subclass: u8,
    pub protocol: u8,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolEvidence {
    pub tool_name: String,
    pub tool_present: bool,
    pub device_seen: bool,
    pub raw_output: String,
    pub parsed_data: HashMap<String, serde_json::Value>,
    pub detected_at: String,
}

impl UnifiedDeviceState {
    /// Create a new device state with defaults
    pub fn new(device_uid: String, platform_family: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        
        Self {
            schema_version: "1.0.0".to_string(),
            device_uid,
            timestamp: now.clone(),
            platform: PlatformInfo {
                family: platform_family,
                os_version: None,
                build_id: None,
                manufacturer: None,
                model: None,
                codename: None,
                product: None,
            },
            connection: ConnectionInfo {
                connection_type: "usb".to_string(),
                usb_bus: None,
                usb_address: None,
                usb_port_path: None,
                network_address: None,
                speed: None,
                active: true,
                last_seen: now.clone(),
            },
            hardware: HardwareInfo {
                serial: None,
                imei: None,
                meid: None,
                mac_addresses: HashMap::new(),
                usb_vid: None,
                usb_pid: None,
                udid: None,
                hw_revision: None,
                storage_bytes: None,
                ram_bytes: None,
            },
            mode: DeviceModeInfo {
                current_mode: DeviceMode::Unknown,
                confidence: 0.0,
                available_modes: vec![],
                is_recovery_mode: false,
                is_dfu_mode: false,
                is_normal_mode: false,
                notes: vec![],
            },
            security: SecurityInfo {
                is_locked: None,
                lock_type: None,
                bootloader_unlocked: None,
                is_rooted: None,
                adb_authorized: None,
                usb_debugging: None,
                encryption_status: None,
                secure_boot: None,
                verified_boot_state: None,
                security_policy: None,
                trust_score: 0,
            },
            capabilities: CapabilityInfo {
                available_operations: vec![],
                blocked_operations: vec![],
                block_reasons: HashMap::new(),
                required_auth: vec![],
                capability_class: "Unknown".to_string(),
            },
            compliance: ComplianceInfo {
                classification: ComplianceClassification::Unknown,
                risk_level: RiskLevel::Unknown,
                jurisdiction: None,
                ownership_confidence: 0.0,
                required_authorizations: vec![],
                routing: RoutingRecommendation {
                    route_to: "Pending".to_string(),
                    authority: None,
                    required_docs: vec![],
                    notes: None,
                },
                notes: vec![],
            },
            evidence: EvidenceInfo {
                usb: None,
                tools: HashMap::new(),
                raw_outputs: HashMap::new(),
            },
            metadata: HashMap::new(),
        }
    }
    
    /// Validate the device state
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut errors = vec![];
        
        if self.device_uid.is_empty() {
            errors.push("device_uid is required".to_string());
        }
        
        if self.platform.family.is_empty() {
            errors.push("platform.family is required".to_string());
        }
        
        if self.mode.confidence < 0.0 || self.mode.confidence > 1.0 {
            errors.push("mode.confidence must be between 0.0 and 1.0".to_string());
        }
        
        if self.compliance.ownership_confidence < 0.0 || self.compliance.ownership_confidence > 1.0 {
            errors.push("compliance.ownership_confidence must be between 0.0 and 1.0".to_string());
        }
        
        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
    
    /// Generate a summary for display
    pub fn summary(&self) -> String {
        format!(
            "{} {} ({}) - {} [{}]",
            self.platform.manufacturer.as_deref().unwrap_or("Unknown"),
            self.platform.model.as_deref().unwrap_or("Unknown Model"),
            self.platform.family,
            self.mode.current_mode.as_str(),
            self.compliance.classification.as_str()
        )
    }
}

impl DeviceMode {
    pub fn as_str(&self) -> &'static str {
        match self {
            DeviceMode::AndroidAdb => "android_adb",
            DeviceMode::AndroidFastboot => "android_fastboot",
            DeviceMode::AndroidRecovery => "android_recovery",
            DeviceMode::AndroidSideload => "android_sideload",
            DeviceMode::AndroidDownload => "android_download",
            DeviceMode::IosNormal => "ios_normal",
            DeviceMode::IosRecovery => "ios_recovery",
            DeviceMode::IosDfu => "ios_dfu",
            DeviceMode::WindowsNormal => "windows_normal",
            DeviceMode::WindowsRecovery => "windows_recovery",
            DeviceMode::WindowsSafeMode => "windows_safe_mode",
            DeviceMode::MacosNormal => "macos_normal",
            DeviceMode::MacosRecovery => "macos_recovery",
            DeviceMode::LinuxNormal => "linux_normal",
            DeviceMode::LinuxRecovery => "linux_recovery",
            DeviceMode::Bootloader => "bootloader",
            DeviceMode::Fastboot => "fastboot",
            DeviceMode::Unknown => "unknown",
        }
    }
}

impl ComplianceClassification {
    pub fn as_str(&self) -> &'static str {
        match self {
            ComplianceClassification::Permitted => "permitted",
            ComplianceClassification::ConditionallyPermitted => "conditionally_permitted",
            ComplianceClassification::RequiresAuthorization => "requires_authorization",
            ComplianceClassification::Prohibited => "prohibited",
            ComplianceClassification::Unknown => "unknown",
        }
    }
}

impl RiskLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            RiskLevel::Low => "low",
            RiskLevel::Medium => "medium",
            RiskLevel::High => "high",
            RiskLevel::VeryHigh => "very_high",
            RiskLevel::Unknown => "unknown",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_create_device_state() {
        let state = UnifiedDeviceState::new(
            "test-device-123".to_string(),
            "android".to_string()
        );
        
        assert_eq!(state.device_uid, "test-device-123");
        assert_eq!(state.platform.family, "android");
        assert_eq!(state.schema_version, "1.0.0");
    }
    
    #[test]
    fn test_validate_device_state() {
        let state = UnifiedDeviceState::new(
            "test-device".to_string(),
            "android".to_string()
        );
        
        assert!(state.validate().is_ok());
    }
    
    #[test]
    fn test_serialize_device_state() {
        let state = UnifiedDeviceState::new(
            "test-device".to_string(),
            "ios".to_string()
        );
        
        let json = serde_json::to_string_pretty(&state).unwrap();
        assert!(json.contains("\"device_uid\": \"test-device\""));
        assert!(json.contains("\"family\": \"ios\""));
    }
}

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceRecord {
    pub device_uid: String,
    pub platform_hint: String,
    pub mode: String,
    pub confidence: f32,
    pub evidence: Evidence,
    pub notes: Vec<String>,
    pub matched_tool_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub usb: UsbEvidence,
    pub tools: HashMap<String, ToolEvidence>,
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
    pub interface_class: Option<u8>,
    pub interface_hints: Vec<InterfaceHint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterfaceHint {
    pub class: u8,
    pub subclass: u8,
    pub protocol: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolEvidence {
    pub present: bool,
    pub seen: bool,
    pub raw: String,
    pub device_ids: Vec<String>,
}

impl ToolEvidence {
    pub fn missing() -> Self {
        Self {
            present: false,
            seen: false,
            raw: "missing".to_string(),
            device_ids: vec![],
        }
    }

    pub fn present_not_seen() -> Self {
        Self {
            present: true,
            seen: false,
            raw: String::new(),
            device_ids: vec![],
        }
    }

    pub fn confirmed(raw: String, device_ids: Vec<String>) -> Self {
        Self {
            present: true,
            seen: !device_ids.is_empty(),
            raw,
            device_ids,
        }
    }
}

#[derive(Debug, Clone)]
pub enum DeviceMode {
    IosNormalLikely,
    IosRecoveryLikely,
    IosDfuLikely,
    AndroidAdbConfirmed,
    AndroidFastbootConfirmed,
    AndroidRecoveryAdbConfirmed,
    UnknownUsb,
}

impl DeviceMode {
    pub fn as_str(&self) -> &'static str {
        match self {
            DeviceMode::IosNormalLikely => "ios_normal_likely",
            DeviceMode::IosRecoveryLikely => "ios_recovery_likely",
            DeviceMode::IosDfuLikely => "ios_dfu_likely",
            DeviceMode::AndroidAdbConfirmed => "android_adb_confirmed",
            DeviceMode::AndroidFastbootConfirmed => "android_fastboot_confirmed",
            DeviceMode::AndroidRecoveryAdbConfirmed => "android_recovery_adb_confirmed",
            DeviceMode::UnknownUsb => "unknown_usb",
        }
    }
}

#[derive(Debug, Clone)]
pub struct Classification {
    pub mode: DeviceMode,
    pub confidence: f32,
    pub notes: Vec<String>,
}

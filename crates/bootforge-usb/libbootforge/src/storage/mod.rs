//! Storage Health Module
//!
//! Provides SMART data reading and storage health assessment for drives.
//! Supports both mobile device storage and external drives for imaging.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StorageType {
    Emmc,
    Ufs,
    Nvme,
    Sata,
    Usb,
    SdCard,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HealthStatus {
    Excellent,
    Good,
    Fair,
    Degraded,
    Critical,
    Failed,
}

impl HealthStatus {
    pub fn from_percentage(pct: u8) -> Self {
        match pct {
            90..=100 => HealthStatus::Excellent,
            70..=89 => HealthStatus::Good,
            50..=69 => HealthStatus::Fair,
            30..=49 => HealthStatus::Degraded,
            1..=29 => HealthStatus::Critical,
            0 => HealthStatus::Failed,
            _ => HealthStatus::Good,
        }
    }

    pub fn is_safe_for_imaging(&self) -> bool {
        !matches!(self, HealthStatus::Critical | HealthStatus::Failed)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartAttribute {
    pub id: u8,
    pub name: String,
    pub current: u16,
    pub worst: u16,
    pub threshold: u16,
    pub raw_value: u64,
    pub status: SmartAttributeStatus,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SmartAttributeStatus {
    Ok,
    Warning,
    Failed,
}

impl SmartAttribute {
    pub fn new(id: u8, name: &str, current: u16, worst: u16, threshold: u16, raw: u64) -> Self {
        let status = if current <= threshold {
            SmartAttributeStatus::Failed
        } else if current < threshold + 10 {
            SmartAttributeStatus::Warning
        } else {
            SmartAttributeStatus::Ok
        };

        Self {
            id,
            name: name.to_string(),
            current,
            worst,
            threshold,
            raw_value: raw,
            status,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageInfo {
    pub device_path: String,
    pub model: String,
    pub serial: String,
    pub firmware: String,
    pub storage_type: StorageType,
    pub capacity_bytes: u64,
    pub block_size: u32,
    pub rotation_rate: Option<u16>,
}

impl StorageInfo {
    pub fn capacity_gb(&self) -> f64 {
        self.capacity_bytes as f64 / (1024.0 * 1024.0 * 1024.0)
    }

    pub fn is_ssd(&self) -> bool {
        matches!(self.storage_type, StorageType::Nvme | StorageType::Ufs)
            || self.rotation_rate == Some(0)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartData {
    pub device_info: StorageInfo,
    pub attributes: Vec<SmartAttribute>,
    pub power_on_hours: u64,
    pub power_cycle_count: u64,
    pub temperature_celsius: Option<f32>,
    pub reallocated_sectors: u64,
    pub pending_sectors: u64,
    pub uncorrectable_errors: u64,
    pub overall_health: HealthStatus,
    pub health_percentage: u8,
    pub wear_level_count: Option<u8>,
    pub timestamp: u64,
}

impl SmartData {
    pub fn calculate_health(&self) -> u8 {
        let mut score = 100i32;

        if self.reallocated_sectors > 0 {
            score -= (self.reallocated_sectors.min(20) * 2) as i32;
        }

        if self.pending_sectors > 0 {
            score -= (self.pending_sectors.min(10) * 3) as i32;
        }

        if self.uncorrectable_errors > 0 {
            score -= (self.uncorrectable_errors.min(10) * 5) as i32;
        }

        if let Some(wear) = self.wear_level_count {
            let wear_penalty = (100 - wear as i32) / 5;
            score -= wear_penalty;
        }

        if self.power_on_hours > 50000 {
            score -= 5;
        }

        score.clamp(0, 100) as u8
    }

    pub fn get_critical_attributes(&self) -> Vec<&SmartAttribute> {
        self.attributes
            .iter()
            .filter(|a| a.status == SmartAttributeStatus::Failed)
            .collect()
    }

    pub fn get_warning_attributes(&self) -> Vec<&SmartAttribute> {
        self.attributes
            .iter()
            .filter(|a| a.status == SmartAttributeStatus::Warning)
            .collect()
    }
}

pub const CRITICAL_SMART_IDS: &[u8] = &[
    1,   // Raw Read Error Rate
    5,   // Reallocated Sector Count
    7,   // Seek Error Rate
    10,  // Spin Retry Count
    196, // Reallocation Event Count
    197, // Current Pending Sector Count
    198, // Offline Uncorrectable
    199, // UDMA CRC Error Count
];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageHealthReport {
    pub device_id: String,
    pub smart_data: SmartData,
    pub recommendations: Vec<String>,
    pub safe_for_imaging: bool,
    pub estimated_remaining_life: Option<String>,
}

impl StorageHealthReport {
    pub fn generate(device_id: String, smart_data: SmartData) -> Self {
        let mut recommendations = Vec::new();

        if smart_data.reallocated_sectors > 5 {
            recommendations.push(format!(
                "High reallocated sector count ({}). Consider backup and replacement.",
                smart_data.reallocated_sectors
            ));
        }

        if smart_data.pending_sectors > 0 {
            recommendations.push(format!(
                "Pending sectors detected ({}). Run surface scan.",
                smart_data.pending_sectors
            ));
        }

        if let Some(temp) = smart_data.temperature_celsius {
            if temp > 50.0 {
                recommendations.push(format!(
                    "High temperature ({:.1}°C). Improve cooling before imaging.",
                    temp
                ));
            }
        }

        if smart_data.power_on_hours > 40000 {
            recommendations.push(format!(
                "Extended usage ({} hours). Monitor closely.",
                smart_data.power_on_hours
            ));
        }

        if let Some(wear) = smart_data.wear_level_count {
            if wear < 50 {
                recommendations.push(format!(
                    "SSD wear level at {}%. Plan for replacement.",
                    wear
                ));
            }
        }

        let safe_for_imaging = smart_data.overall_health.is_safe_for_imaging()
            && smart_data.pending_sectors < 10
            && smart_data.uncorrectable_errors < 5;

        let estimated_remaining_life = if let Some(wear) = smart_data.wear_level_count {
            let daily_writes = 20.0; // Assume 20GB/day average
            let capacity_gb = smart_data.device_info.capacity_gb();
            let tbw = capacity_gb * 600.0; // Assume 600 P/E cycles typical
            let used_tbw = tbw * (1.0 - wear as f64 / 100.0);
            let remaining_tbw = tbw - used_tbw;
            let remaining_days = (remaining_tbw * 1000.0 / daily_writes) as u64;
            
            if remaining_days > 365 {
                Some(format!("{:.1} years", remaining_days as f64 / 365.0))
            } else {
                Some(format!("{} days", remaining_days))
            }
        } else {
            None
        };

        Self {
            device_id,
            smart_data,
            recommendations,
            safe_for_imaging,
            estimated_remaining_life,
        }
    }
}

pub struct SmartParser;

impl SmartParser {
    pub fn parse_smartctl_output(output: &str) -> Option<HashMap<String, String>> {
        let mut data = HashMap::new();

        for line in output.lines() {
            let line = line.trim();

            if line.starts_with("Model Family:") || line.starts_with("Device Model:") {
                if let Some(val) = line.split(':').nth(1) {
                    data.insert("model".to_string(), val.trim().to_string());
                }
            }

            if line.starts_with("Serial Number:") {
                if let Some(val) = line.split(':').nth(1) {
                    data.insert("serial".to_string(), val.trim().to_string());
                }
            }

            if line.starts_with("User Capacity:") {
                if let Some(val) = line.split(':').nth(1) {
                    data.insert("capacity".to_string(), val.trim().to_string());
                }
            }

            if let Some(attr) = Self::parse_attribute_line(line) {
                data.insert(format!("attr_{}", attr.id), format!("{}", attr.raw_value));
            }
        }

        if data.is_empty() {
            None
        } else {
            Some(data)
        }
    }

    fn parse_attribute_line(line: &str) -> Option<SmartAttribute> {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 10 {
            return None;
        }

        let id: u8 = parts[0].parse().ok()?;
        let name = parts[1];
        let current: u16 = parts[3].parse().ok()?;
        let worst: u16 = parts[4].parse().ok()?;
        let threshold: u16 = parts[5].parse().ok()?;
        let raw: u64 = parts[9].parse().ok()?;

        Some(SmartAttribute::new(id, name, current, worst, threshold, raw))
    }

    pub fn parse_android_storage_info(output: &str) -> Option<StorageInfo> {
        let mut model = String::new();
        let mut capacity: u64 = 0;

        for line in output.lines() {
            if line.contains("UFS") || line.contains("eMMC") {
                if line.contains("UFS") {
                    model = "UFS Storage".to_string();
                } else {
                    model = "eMMC Storage".to_string();
                }
            }

            if let Some(cap_str) = line.split("size:").nth(1) {
                if let Ok(cap) = cap_str.trim().split_whitespace().next()
                    .unwrap_or("0").parse::<u64>() 
                {
                    capacity = cap;
                }
            }
        }

        if model.is_empty() {
            return None;
        }

        Some(StorageInfo {
            device_path: "/dev/block/sda".to_string(),
            model,
            serial: String::new(),
            firmware: String::new(),
            storage_type: if output.contains("UFS") { StorageType::Ufs } else { StorageType::Emmc },
            capacity_bytes: capacity,
            block_size: 4096,
            rotation_rate: Some(0),
        })
    }

    pub fn android_storage_commands() -> Vec<&'static str> {
        vec![
            "cat /sys/block/sda/device/model",
            "cat /sys/block/sda/size",
            "cat /proc/partitions",
            "dumpsys diskstats",
            "ls -la /dev/block/by-name/",
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_health_status() {
        assert_eq!(HealthStatus::from_percentage(95), HealthStatus::Excellent);
        assert_eq!(HealthStatus::from_percentage(75), HealthStatus::Good);
        assert_eq!(HealthStatus::from_percentage(55), HealthStatus::Fair);
        assert_eq!(HealthStatus::from_percentage(35), HealthStatus::Degraded);
        assert_eq!(HealthStatus::from_percentage(15), HealthStatus::Critical);
        assert_eq!(HealthStatus::from_percentage(0), HealthStatus::Failed);
    }

    #[test]
    fn test_safe_for_imaging() {
        assert!(HealthStatus::Excellent.is_safe_for_imaging());
        assert!(HealthStatus::Good.is_safe_for_imaging());
        assert!(HealthStatus::Fair.is_safe_for_imaging());
        assert!(HealthStatus::Degraded.is_safe_for_imaging());
        assert!(!HealthStatus::Critical.is_safe_for_imaging());
        assert!(!HealthStatus::Failed.is_safe_for_imaging());
    }

    #[test]
    fn test_storage_capacity() {
        let info = StorageInfo {
            device_path: "/dev/sda".to_string(),
            model: "Test Drive".to_string(),
            serial: "ABC123".to_string(),
            firmware: "1.0".to_string(),
            storage_type: StorageType::Nvme,
            capacity_bytes: 512 * 1024 * 1024 * 1024,
            block_size: 512,
            rotation_rate: Some(0),
        };

        assert!((info.capacity_gb() - 512.0).abs() < 0.1);
        assert!(info.is_ssd());
    }

    #[test]
    fn test_smart_attribute() {
        let attr = SmartAttribute::new(5, "Reallocated_Sector_Ct", 100, 100, 10, 0);
        assert_eq!(attr.status, SmartAttributeStatus::Ok);

        let attr_warning = SmartAttribute::new(5, "Reallocated_Sector_Ct", 15, 15, 10, 5);
        assert_eq!(attr_warning.status, SmartAttributeStatus::Warning);

        let attr_failed = SmartAttribute::new(5, "Reallocated_Sector_Ct", 5, 5, 10, 50);
        assert_eq!(attr_failed.status, SmartAttributeStatus::Failed);
    }
}

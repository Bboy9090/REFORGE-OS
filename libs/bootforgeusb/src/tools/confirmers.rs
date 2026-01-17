use crate::model::{Classification, DeviceMode, ToolEvidence};
use std::process::Command;

pub struct ToolConfirmers {
    pub adb: ToolEvidence,
    pub fastboot: ToolEvidence,
    pub idevice_id: ToolEvidence,
}

impl ToolConfirmers {
    pub fn new() -> Self {
        Self {
            adb: check_adb(),
            fastboot: check_fastboot(),
            idevice_id: check_idevice_id(),
        }
    }

    pub fn confirm_device(&self, serial: Option<&str>, classification: &mut Classification) -> Vec<String> {
        let mut matched_ids = Vec::new();
        
        if let Some(serial_num) = serial {
            if self.adb.present && self.adb.device_ids.iter().any(|id| id == serial_num) {
                classification.confidence = (classification.confidence + 0.15).min(0.95);
                classification.notes.push("Correlated: adb device id matches USB serial".to_string());
                matched_ids.push(serial_num.to_string());
                
                if matches!(classification.mode, DeviceMode::UnknownUsb) {
                    classification.mode = DeviceMode::AndroidAdbConfirmed;
                }
            }
            
            if self.fastboot.present && self.fastboot.device_ids.iter().any(|id| id == serial_num) {
                classification.confidence = (classification.confidence + 0.15).min(0.95);
                classification.notes.push("Correlated: fastboot device id matches USB serial".to_string());
                classification.mode = DeviceMode::AndroidFastbootConfirmed;
                matched_ids.push(serial_num.to_string());
            }
            
            if self.idevice_id.present && self.idevice_id.device_ids.iter().any(|id| id == serial_num) {
                classification.confidence = (classification.confidence + 0.15).min(0.95);
                classification.notes.push("Correlated: idevice UDID matches".to_string());
                matched_ids.push(serial_num.to_string());
            }
        }
        
        matched_ids
    }
}

fn parse_adb_ids(stdout: &str) -> Vec<String> {
    stdout
        .lines()
        .filter_map(|line| {
            let line = line.trim();
            if line.is_empty() || line.starts_with("List of devices") {
                return None;
            }
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let state = parts[1];
                if state == "device" || state == "sideload" || state == "recovery" {
                    return Some(parts[0].to_string());
                }
            }
            None
        })
        .collect()
}

fn parse_fastboot_ids(stdout: &str) -> Vec<String> {
    stdout
        .lines()
        .filter_map(|line| {
            let line = line.trim();
            if line.is_empty() {
                return None;
            }
            let parts: Vec<&str> = line.split_whitespace().collect();
            if !parts.is_empty() {
                Some(parts[0].to_string())
            } else {
                None
            }
        })
        .collect()
}

fn parse_idevice_ids(stdout: &str) -> Vec<String> {
    stdout
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .map(|l| l.to_string())
        .collect()
}

fn check_adb() -> ToolEvidence {
    if !is_tool_available("adb") {
        return ToolEvidence::missing();
    }
    
    match Command::new("adb").args(["devices", "-l"]).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let device_ids = parse_adb_ids(&stdout);
            let raw = format!("STDOUT:\n{}\nSTDERR:\n{}", 
                stdout.trim(), 
                String::from_utf8_lossy(&output.stderr).trim());
            
            ToolEvidence::confirmed(raw, device_ids)
        }
        Err(e) => ToolEvidence {
            present: true,
            seen: false,
            raw: format!("error: {}", e),
            device_ids: vec![],
        },
    }
}

fn check_fastboot() -> ToolEvidence {
    if !is_tool_available("fastboot") {
        return ToolEvidence::missing();
    }
    
    match Command::new("fastboot").arg("devices").output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let device_ids = parse_fastboot_ids(&stdout);
            let raw = format!("STDOUT:\n{}\nSTDERR:\n{}", 
                stdout.trim(), 
                String::from_utf8_lossy(&output.stderr).trim());
            
            ToolEvidence::confirmed(raw, device_ids)
        }
        Err(e) => ToolEvidence {
            present: true,
            seen: false,
            raw: format!("error: {}", e),
            device_ids: vec![],
        },
    }
}

fn check_idevice_id() -> ToolEvidence {
    if !is_tool_available("idevice_id") {
        return ToolEvidence::missing();
    }
    
    match Command::new("idevice_id").arg("-l").output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let device_ids = parse_idevice_ids(&stdout);
            let raw = format!("STDOUT:\n{}\nSTDERR:\n{}", 
                stdout.trim(), 
                String::from_utf8_lossy(&output.stderr).trim());
            
            ToolEvidence::confirmed(raw, device_ids)
        }
        Err(e) => ToolEvidence {
            present: true,
            seen: false,
            raw: format!("error: {}", e),
            device_ids: vec![],
        },
    }
}

fn is_tool_available(tool: &str) -> bool {
    #[cfg(target_os = "windows")]
    let which_cmd = "where";
    
    #[cfg(not(target_os = "windows"))]
    let which_cmd = "which";
    
    Command::new(which_cmd)
        .arg(tool)
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tool_availability() {
        let confirmers = ToolConfirmers::new();
        
        println!("ADB present: {}", confirmers.adb.present);
        println!("Fastboot present: {}", confirmers.fastboot.present);
        println!("idevice_id present: {}", confirmers.idevice_id.present);
    }
}

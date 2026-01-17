pub mod model;
pub mod usb_scan;
pub mod classify;
pub mod tools;

use model::{DeviceRecord, Evidence};
use std::collections::HashMap;

pub fn scan() -> Result<Vec<DeviceRecord>, Box<dyn std::error::Error>> {
    let usb_devices = usb_scan::scan_usb_devices()?;
    let confirmers = tools::confirmers::ToolConfirmers::new();
    
    let mut results = Vec::new();
    
    for usb in &usb_devices {
        let device_uid = format!(
            "usb:{}:{}:bus{}:addr{}",
            usb.vid, usb.pid, usb.bus, usb.address
        );
        
        let (classification, matched_tool_ids) = classify::classify_with_correlation(
            usb,
            &usb_devices,
            &confirmers,
        );
        
        let platform_hint = match classification.mode.as_str() {
            s if s.starts_with("ios_") => "ios",
            s if s.starts_with("android_") => "android",
            _ => "unknown",
        };
        
        let mut tool_evidence = HashMap::new();
        tool_evidence.insert("adb".to_string(), confirmers.adb.clone());
        tool_evidence.insert("fastboot".to_string(), confirmers.fastboot.clone());
        tool_evidence.insert("idevice_id".to_string(), confirmers.idevice_id.clone());
        
        let record = DeviceRecord {
            device_uid,
            platform_hint: platform_hint.to_string(),
            mode: classification.mode.as_str().to_string(),
            confidence: classification.confidence,
            evidence: Evidence {
                usb: usb.clone(),
                tools: tool_evidence,
            },
            notes: classification.notes,
            matched_tool_ids,
        };
        
        results.push(record);
    }
    
    Ok(results)
}

#[cfg(feature = "python")]
use pyo3::prelude::*;

#[cfg(feature = "python")]
#[pyfunction]
fn scan_py() -> PyResult<Vec<PyObject>> {
    Python::with_gil(|py| {
        let devices = scan().map_err(|e| {
            pyo3::exceptions::PyRuntimeError::new_err(format!("Scan failed: {}", e))
        })?;
        
        let json_devices: Vec<PyObject> = devices
            .iter()
            .map(|d| {
                let json_str = serde_json::to_string(d).unwrap();
                let dict = py.eval(&format!("__import__('json').loads('{}')", 
                    json_str.replace('\'', "\\'")
                ), None, None)?;
                Ok(dict.to_object(py))
            })
            .collect::<PyResult<Vec<_>>>()?;
        
        Ok(json_devices)
    })
}

#[cfg(feature = "python")]
#[pymodule]
fn bootforgeusb(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(scan_py, m)?)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_full_scan() {
        let result = scan();
        assert!(result.is_ok(), "Scan should not panic");
        
        if let Ok(devices) = result {
            println!("\n=== BootForgeUSB Scan Results ===");
            println!("Found {} devices\n", devices.len());
            
            for device in devices {
                println!("Device: {}", device.device_uid);
                println!("  Platform: {}", device.platform_hint);
                println!("  Mode: {}", device.mode);
                println!("  Confidence: {:.2}%", device.confidence * 100.0);
                println!("  USB: VID:{} PID:{}", device.evidence.usb.vid, device.evidence.usb.pid);
                if let Some(product) = &device.evidence.usb.product {
                    println!("  Product: {}", product);
                }
                println!("  Notes:");
                for note in &device.notes {
                    println!("    - {}", note);
                }
                println!();
            }
        }
    }
}

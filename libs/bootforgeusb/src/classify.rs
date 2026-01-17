use crate::model::{Classification, DeviceMode, UsbEvidence, InterfaceHint};
use crate::tools::confirmers::ToolConfirmers;

pub fn classify_device(usb: &UsbEvidence) -> Classification {
    let vid = usb.vid.as_str();
    let pid = usb.pid.as_str();
    
    if vid == "05ac" {
        return classify_apple_device(pid, usb);
    }
    
    if is_android_vendor(vid) {
        return classify_android_device(pid, usb);
    }
    
    Classification {
        mode: DeviceMode::UnknownUsb,
        confidence: 0.5,
        notes: vec!["USB device detected but not classified as mobile device".to_string()],
    }
}

pub fn classify_with_correlation(
    usb: &UsbEvidence,
    all_usb: &[UsbEvidence],
    tools: &ToolConfirmers,
) -> (Classification, Vec<String>) {
    let mut classification = classify_device(usb);
    let mut matched_tool_ids = Vec::new();
    
    if let Some(serial) = &usb.serial {
        matched_tool_ids = tools.confirm_device(Some(serial), &mut classification);
    }
    
    if matched_tool_ids.is_empty() {
        matched_tool_ids.extend(try_single_candidate_correlation(usb, all_usb, tools, &mut classification));
    }
    
    (classification, matched_tool_ids)
}

fn try_single_candidate_correlation(
    usb: &UsbEvidence,
    all_usb: &[UsbEvidence],
    tools: &ToolConfirmers,
    classification: &mut Classification,
) -> Vec<String> {
    let mut matched = Vec::new();
    
    if is_android_likely(usb) && tools.adb.device_ids.len() == 1 {
        let android_count = all_usb.iter().filter(|d| is_android_likely(d)).count();
        if android_count == 1 {
            classification.confidence = 0.90;
            classification.mode = if tools.adb.raw.to_lowercase().contains("sideload") 
                || tools.adb.raw.to_lowercase().contains("recovery") {
                DeviceMode::AndroidRecoveryAdbConfirmed
            } else {
                DeviceMode::AndroidAdbConfirmed
            };
            classification.notes.push(
                "Correlated: single likely-Android USB device + single adb device id present (heuristic)".to_string()
            );
            matched.push(tools.adb.device_ids[0].clone());
        }
    }
    
    if is_android_likely(usb) && tools.fastboot.device_ids.len() == 1 {
        let android_count = all_usb.iter().filter(|d| is_android_likely(d)).count();
        if android_count == 1 {
            classification.confidence = 0.90;
            classification.mode = DeviceMode::AndroidFastbootConfirmed;
            classification.notes.push(
                "Correlated: single likely-Android USB device + single fastboot device id present (heuristic)".to_string()
            );
            matched.push(tools.fastboot.device_ids[0].clone());
        }
    }
    
    if is_apple(usb) && tools.idevice_id.device_ids.len() == 1 {
        let apple_count = all_usb.iter().filter(|d| is_apple(d)).count();
        if apple_count == 1 {
            classification.confidence = 0.95;
            classification.mode = DeviceMode::IosNormalLikely;
            classification.notes.push(
                "Correlated: single idevice_id UDID + single Apple USB device present".to_string()
            );
            matched.push(tools.idevice_id.device_ids[0].clone());
        }
    }
    
    matched
}

fn has_vendor_interface(hints: &[InterfaceHint]) -> bool {
    hints.iter().any(|h| h.class == 0xff)
}

fn is_apple(usb: &UsbEvidence) -> bool {
    usb.vid.eq_ignore_ascii_case("05ac")
}

fn is_android_likely(usb: &UsbEvidence) -> bool {
    if is_apple(usb) {
        return false;
    }
    is_android_vendor(&usb.vid) || has_vendor_interface(&usb.interface_hints)
}

fn classify_apple_device(pid: &str, usb: &UsbEvidence) -> Classification {
    let missing_strings = usb.product.is_none() && usb.serial.is_none();
    
    match pid {
        "1227" => Classification {
            mode: DeviceMode::IosDfuLikely,
            confidence: 0.86,
            notes: vec![
                "Apple VID with minimal descriptors + vendor interface pattern suggests DFU-like state".to_string(),
                "USB signature matches Apple DFU mode (VID:05AC PID:1227)".to_string(),
            ],
        },
        "1281" => Classification {
            mode: DeviceMode::IosRecoveryLikely,
            confidence: 0.82,
            notes: vec![
                "Apple VID suggests Recovery/Restore-like state".to_string(),
                "USB signature matches Apple Recovery mode (VID:05AC PID:1281)".to_string(),
            ],
        },
        "12a8" | "12ab" => Classification {
            mode: DeviceMode::IosNormalLikely,
            confidence: 0.75,
            notes: vec![
                format!("USB signature matches iOS device in normal mode (VID:05AC PID:{})", pid),
                "Confirm via system tools or idevice_id".to_string(),
            ],
        },
        _ => {
            if missing_strings && has_vendor_interface(&usb.interface_hints) {
                Classification {
                    mode: DeviceMode::IosDfuLikely,
                    confidence: 0.86,
                    notes: vec![
                        "Apple VID with minimal descriptors + vendor interface suggests DFU-like state".to_string(),
                    ],
                }
            } else if usb.product.as_ref().map(|p| p.contains("iPhone") || p.contains("iPad")).unwrap_or(false) {
                Classification {
                    mode: DeviceMode::IosNormalLikely,
                    confidence: 0.70,
                    notes: vec![
                        format!("Apple device with unknown PID:{} but product string suggests iOS", pid),
                    ],
                }
            } else {
                Classification {
                    mode: DeviceMode::IosRecoveryLikely,
                    confidence: 0.75,
                    notes: vec![
                        format!("Apple device with unrecognized PID:{}", pid),
                        "Confirm via system tools".to_string(),
                    ],
                }
            }
        }
    }
}

fn classify_android_device(_pid: &str, usb: &UsbEvidence) -> Classification {
    if has_vendor_interface(&usb.interface_hints) {
        return Classification {
            mode: DeviceMode::UnknownUsb,
            confidence: 0.70,
            notes: vec![
                "Likely Android-related USB device (vendor interface/VID)".to_string(),
                "Confirm via adb/fastboot".to_string(),
            ],
        };
    }
    
    Classification {
        mode: DeviceMode::UnknownUsb,
        confidence: 0.60,
        notes: vec!["Android vendor ID detected but mode unclear - run adb/fastboot to confirm".to_string()],
    }
}

fn is_android_vendor(vid: &str) -> bool {
    matches!(
        vid,
        "18d1" |  // Google
        "04e8" |  // Samsung
        "2a70" |  // OnePlus
        "2717" |  // Xiaomi
        "0bb4" |  // HTC
        "12d1" |  // Huawei
        "0fce" |  // Sony
        "19d2" |  // ZTE
        "1004" |  // LG
        "0e8d" |  // MediaTek
        "2a45" |  // Meizu
        "1ebf" |  // ASUS
        "0502" |  // Acer
        "1782" |  // Lenovo
        "22b8"    // Motorola
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_classify_apple_dfu() {
        let usb = UsbEvidence {
            vid: "05ac".to_string(),
            pid: "1227".to_string(),
            manufacturer: Some("Apple Inc.".to_string()),
            product: None,
            serial: None,
            bus: 1,
            address: 5,
            interface_class: None,
            interface_hints: vec![],
        };
        
        let classification = classify_device(&usb);
        assert_eq!(classification.mode.as_str(), "ios_dfu_likely");
        assert!(classification.confidence > 0.8);
    }

    #[test]
    fn test_classify_google_android() {
        let usb = UsbEvidence {
            vid: "18d1".to_string(),
            pid: "4ee7".to_string(),
            manufacturer: Some("Google".to_string()),
            product: Some("Pixel 6".to_string()),
            serial: Some("ABC123".to_string()),
            bus: 1,
            address: 3,
            interface_class: Some(0xff),
            interface_hints: vec![InterfaceHint {
                class: 0xff,
                subclass: 0x42,
                protocol: 0x01,
            }],
        };
        
        let classification = classify_device(&usb);
        assert!(classification.confidence > 0.6);
    }
}

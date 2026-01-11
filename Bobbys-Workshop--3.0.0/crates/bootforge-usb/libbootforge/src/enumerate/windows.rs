use crate::types::UsbDeviceInfo;
use anyhow::Result;

/// Enrich USB device information with Windows-specific data
///
/// This is a placeholder for future Windows implementation using SetupAPI.
/// Future implementation will:
/// - Use SetupDiGetClassDevs to enumerate USB devices
/// - Match libusb devices with Windows device instances
/// - Extract driver information, device paths, and hardware IDs
/// - Populate PlatformHint with Windows-specific paths
#[cfg(target_os = "windows")]
pub fn enrich_windows(devices: &mut [UsbDeviceInfo]) -> Result<()> {
    log::debug!("Windows enrichment called (placeholder - not yet implemented)");

    // TODO: Implement Windows enrichment using SetupAPI
    // Example approach:
    // 1. Call SetupDiGetClassDevs with GUID_DEVINTERFACE_USB_DEVICE
    // 2. Iterate through device instances with SetupDiEnumDeviceInfo
    // 3. Get device properties with SetupDiGetDeviceRegistryProperty
    // 4. Match with existing devices by VID/PID or other identifiers
    // 5. Populate platform_hint.device_path with device instance path

    for device in devices.iter_mut() {
        // Placeholder: Set device path format that will be filled in later
        device.platform_hint.device_path = Some(format!(
            "\\\\?\\USB#VID_{:04X}&PID_{:04X}#...",
            device.vendor_id, device.product_id
        ));
    }

    Ok(())
}

/// Non-Windows platforms: no-op
#[cfg(not(target_os = "windows"))]
pub fn enrich_windows(_devices: &mut [UsbDeviceInfo]) -> Result<()> {
    // No-op on non-Windows platforms
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::UsbDeviceInfo;

    #[test]
    fn test_enrich_windows_placeholder() {
        let mut devices = vec![UsbDeviceInfo::new(0x1234, 0x5678)];
        let result = enrich_windows(&mut devices);
        assert!(result.is_ok());
    }
}

use crate::types::UsbDeviceInfo;
use anyhow::Result;

/// Enrich USB device information with macOS-specific data
///
/// This is a placeholder for future macOS implementation using IOKit.
/// Future implementation will:
/// - Use IOServiceMatching to find USB devices
/// - Match libusb devices with IORegistry entries
/// - Extract device paths and additional properties
/// - Populate PlatformHint with IORegistry paths
#[cfg(target_os = "macos")]
pub fn enrich_macos(devices: &mut [UsbDeviceInfo]) -> Result<()> {
    log::debug!("macOS enrichment called (placeholder - not yet implemented)");

    // TODO: Implement macOS enrichment using IOKit
    // Example approach:
    // 1. Call IOServiceMatching("IOUSBDevice") or IOServiceMatching("IOUSBHostDevice")
    // 2. Use IOServiceGetMatchingServices to get device iterator
    // 3. Iterate through services with IOIteratorNext
    // 4. Get properties with IORegistryEntryCreateCFProperties
    // 5. Match with existing devices by VID/PID or location ID
    // 6. Populate platform_hint.ioregistry_path with IORegistry path

    for device in devices.iter_mut() {
        // Placeholder: Set IORegistry path format that will be filled in later
        device.platform_hint.ioregistry_path = Some(format!(
            "IOService:/IOResources/IOUSBDevice@{:04x}{:04x}",
            device.vendor_id, device.product_id
        ));
    }

    Ok(())
}

/// Non-macOS platforms: no-op
#[cfg(not(target_os = "macos"))]
pub fn enrich_macos(_devices: &mut [UsbDeviceInfo]) -> Result<()> {
    // No-op on non-macOS platforms
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::UsbDeviceInfo;

    #[test]
    fn test_enrich_macos_placeholder() {
        let mut devices = vec![UsbDeviceInfo::new(0x1234, 0x5678)];
        let result = enrich_macos(&mut devices);
        assert!(result.is_ok());
    }
}

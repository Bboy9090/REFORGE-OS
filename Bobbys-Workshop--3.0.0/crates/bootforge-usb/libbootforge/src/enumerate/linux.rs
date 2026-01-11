use crate::types::UsbDeviceInfo;
use anyhow::{Context, Result};
use log::debug;
use std::fs;
use std::path::PathBuf;

/// Enrich USB device information with Linux-specific data
///
/// This implementation provides basic Linux enrichment using sysfs.
/// Future enhancements may include:
/// - Full udev integration for more detailed device information
/// - Driver information from sysfs
/// - Power management details
/// - Interface-specific information
#[cfg(target_os = "linux")]
pub fn enrich_linux(devices: &mut [UsbDeviceInfo]) -> Result<()> {
    debug!("Linux enrichment called");

    for device in devices.iter_mut() {
        // Try to find the sysfs path for this device
        let sysfs_path = find_sysfs_path(device.bus_number, device.device_address);

        if let Some(path) = sysfs_path {
            device.platform_hint.sysfs_path = Some(path.to_string_lossy().to_string());

            // Try to read additional information from sysfs if available
            enrich_from_sysfs(device, &path);
        }
    }

    Ok(())
}

/// Find the sysfs path for a USB device given its bus and device number
#[cfg(target_os = "linux")]
fn find_sysfs_path(bus_number: u8, device_address: u8) -> Option<PathBuf> {
    let sysfs_base = PathBuf::from("/sys/bus/usb/devices");

    if !sysfs_base.exists() {
        return None;
    }

    // Try to find device by matching bus and device number
    // Device naming format is typically: usb<bus>/<bus>-<port>...
    if let Ok(entries) = fs::read_dir(&sysfs_base) {
        for entry in entries.flatten() {
            let path = entry.path();

            // Read busnum and devnum files to match
            if let (Ok(bus), Ok(dev)) = (
                read_sysfs_number(&path, "busnum"),
                read_sysfs_number(&path, "devnum"),
            ) {
                if bus == bus_number && dev == device_address {
                    return Some(path);
                }
            }
        }
    }

    None
}

/// Read a numeric value from a sysfs file
#[cfg(target_os = "linux")]
fn read_sysfs_number(device_path: &std::path::Path, filename: &str) -> Result<u8> {
    let file_path = device_path.join(filename);
    let content = fs::read_to_string(&file_path)
        .with_context(|| format!("Failed to read {}", file_path.display()))?;
    let value = content.trim().parse().with_context(|| {
        format!(
            "Failed to parse {} from {} as number",
            content.trim(),
            file_path.display()
        )
    })?;
    Ok(value)
}

/// Enrich device information from sysfs files
#[cfg(target_os = "linux")]
fn enrich_from_sysfs(device: &mut UsbDeviceInfo, sysfs_path: &std::path::Path) {
    // Try to read manufacturer from sysfs if not already set
    if device.manufacturer.is_none() {
        if let Ok(content) = fs::read_to_string(sysfs_path.join("manufacturer")) {
            device.manufacturer = Some(content.trim().to_string());
        }
    }

    // Try to read product from sysfs if not already set
    if device.product.is_none() {
        if let Ok(content) = fs::read_to_string(sysfs_path.join("product")) {
            device.product = Some(content.trim().to_string());
        }
    }

    // Try to read serial number from sysfs if not already set
    if device.serial_number.is_none() {
        if let Ok(content) = fs::read_to_string(sysfs_path.join("serial")) {
            device.serial_number = Some(content.trim().to_string());
        }
    }
}

/// Non-Linux platforms: no-op
#[cfg(not(target_os = "linux"))]
pub fn enrich_linux(_devices: &mut [UsbDeviceInfo]) -> Result<()> {
    // No-op on non-Linux platforms
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::UsbDeviceInfo;

    #[test]
    fn test_enrich_linux_placeholder() {
        let mut devices = vec![UsbDeviceInfo::new(0x1234, 0x5678)];
        let result = enrich_linux(&mut devices);
        assert!(result.is_ok());
    }
}

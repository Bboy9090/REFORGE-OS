use crate::types::UsbDeviceInfo;
use anyhow::Result;
use log::info;

mod libusb;
mod linux;
mod macos;
mod windows;

pub use libusb::enumerate_libusb;
pub use linux::enrich_linux;
pub use macos::enrich_macos;
pub use windows::enrich_windows;

/// Enumerate all USB devices on the system
///
/// This is the main entry point for USB device enumeration. It:
/// 1. Uses libusb (rusb) for cross-platform base enumeration
/// 2. Enriches device information with platform-specific data
/// 3. Returns a vector of normalized USB device information
///
/// # Example
///
/// ```no_run
/// use bootforge_usb::enumerate_all;
///
/// match enumerate_all() {
///     Ok(devices) => {
///         for device in devices {
///             println!("Found: {}", device);
///         }
///     }
///     Err(e) => eprintln!("Error enumerating devices: {}", e),
/// }
/// ```
pub fn enumerate_all() -> Result<Vec<UsbDeviceInfo>> {
    info!("Starting USB device enumeration");

    // Step 1: Get base enumeration from libusb
    let mut devices = enumerate_libusb()?;

    info!("Base enumeration found {} devices", devices.len());

    // Step 2: Enrich with platform-specific information
    #[cfg(target_os = "windows")]
    {
        info!("Applying Windows-specific enrichment");
        enrich_windows(&mut devices)?;
    }

    #[cfg(target_os = "macos")]
    {
        info!("Applying macOS-specific enrichment");
        enrich_macos(&mut devices)?;
    }

    #[cfg(target_os = "linux")]
    {
        info!("Applying Linux-specific enrichment");
        enrich_linux(&mut devices)?;
    }

    info!("Enumeration complete, returning {} devices", devices.len());
    Ok(devices)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enumerate_all() {
        // Test that enumerate_all doesn't panic
        // Actual device enumeration may fail due to permissions or lack of devices
        let result = enumerate_all();
        match result {
            Ok(devices) => {
                println!("Successfully enumerated {} devices", devices.len());
            }
            Err(e) => {
                println!(
                    "Enumeration failed (may be expected in test environment): {}",
                    e
                );
            }
        }
    }
}

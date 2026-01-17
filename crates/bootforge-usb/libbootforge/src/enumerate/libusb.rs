use crate::types::{PlatformHint, UsbBusType, UsbDeviceInfo};
use anyhow::{Context, Result};
use log::{debug, warn};
use rusb::UsbContext;

/// Enumerate all USB devices using libusb (rusb)
pub fn enumerate_libusb() -> Result<Vec<UsbDeviceInfo>> {
    debug!("Starting USB enumeration with libusb");

    let mut devices = Vec::new();

    // Initialize libusb context
    let context = rusb::Context::new().context("Failed to initialize libusb context")?;

    // Get list of devices
    let device_list = context.devices().context("Failed to get USB device list")?;

    for device in device_list.iter() {
        match enumerate_device(&device) {
            Ok(device_info) => {
                debug!(
                    "Found device: {:04x}:{:04x}",
                    device_info.vendor_id, device_info.product_id
                );
                devices.push(device_info);
            }
            Err(e) => {
                warn!("Failed to enumerate device: {}", e);
                // Continue with other devices even if one fails
            }
        }
    }

    debug!("Found {} USB devices", devices.len());
    Ok(devices)
}

/// Enumerate a single USB device
fn enumerate_device(device: &rusb::Device<rusb::Context>) -> Result<UsbDeviceInfo> {
    let device_desc = device
        .device_descriptor()
        .context("Failed to get device descriptor")?;

    let mut device_info = UsbDeviceInfo::new(device_desc.vendor_id(), device_desc.product_id());

    // Fill in basic device descriptor information
    device_info.class = device_desc.class_code();
    device_info.subclass = device_desc.sub_class_code();
    device_info.protocol = device_desc.protocol_code();

    // USB uses BCD (Binary-Coded Decimal) format: 0xJJMN where JJ.M.N is the version
    // rusb::Version provides major, minor, sub_minor components
    // Each BCD digit occupies 4 bits, so 0x0210 = 2.1.0
    let usb_ver = device_desc.usb_version();
    device_info.usb_version = ((usb_ver.major() as u16) << 8)
        | ((usb_ver.minor() as u16) << 4)
        | (usb_ver.sub_minor() as u16);

    let dev_ver = device_desc.device_version();
    device_info.device_version = ((dev_ver.major() as u16) << 8)
        | ((dev_ver.minor() as u16) << 4)
        | (dev_ver.sub_minor() as u16);

    device_info.num_configurations = device_desc.num_configurations();

    // Get bus and device address
    device_info.bus_number = device.bus_number();
    device_info.device_address = device.address();

    // Set bus type (libusb can't distinguish virtual vs physical easily)
    device_info.bus_type = UsbBusType::Standard;

    // Try to open device and get string descriptors
    // This may fail due to permissions, which is okay
    if let Ok(handle) = device.open() {
        // Get timeout for string operations
        let timeout = std::time::Duration::from_secs(1);
        let languages = handle.read_languages(timeout);

        if let Ok(languages) = languages {
            if let Some(language) = languages.first() {
                // Try to read manufacturer string
                if let Ok(manufacturer) =
                    handle.read_manufacturer_string(*language, &device_desc, timeout)
                {
                    device_info.manufacturer = Some(manufacturer);
                }

                // Try to read product string
                if let Ok(product) = handle.read_product_string(*language, &device_desc, timeout) {
                    device_info.product = Some(product);
                }

                // Try to read serial number string
                if let Ok(serial) =
                    handle.read_serial_number_string(*language, &device_desc, timeout)
                {
                    device_info.serial_number = Some(serial);
                }
            }
        }
    } else {
        debug!(
            "Could not open device {:04x}:{:04x} (may require elevated permissions)",
            device_desc.vendor_id(),
            device_desc.product_id()
        );
    }

    // Initialize platform hint (will be enriched by platform-specific code)
    device_info.platform_hint = PlatformHint::default();

    Ok(device_info)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enumerate_libusb() {
        // This test may fail on systems without USB devices or proper permissions
        // so we just check that it doesn't panic
        let result = enumerate_libusb();
        match result {
            Ok(devices) => {
                println!("Found {} USB devices", devices.len());
                for device in devices {
                    println!("  - {:04x}:{:04x}", device.vendor_id, device.product_id);
                }
            }
            Err(e) => {
                println!("Enumeration failed (may be expected): {}", e);
            }
        }
    }
}

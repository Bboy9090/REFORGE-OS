use crate::model::{UsbEvidence, InterfaceHint};
use rusb::{Context, Device, UsbContext};

pub fn scan_usb_devices() -> Result<Vec<UsbEvidence>, Box<dyn std::error::Error>> {
    let context = Context::new()?;
    let devices = context.devices()?;
    
    let mut results = Vec::new();
    
    for device in devices.iter() {
        if let Ok(evidence) = extract_usb_evidence(&device) {
            results.push(evidence);
        }
    }
    
    Ok(results)
}

fn extract_usb_evidence<T: UsbContext>(device: &Device<T>) -> Result<UsbEvidence, Box<dyn std::error::Error>> {
    let device_desc = device.device_descriptor()?;
    let bus = device.bus_number();
    let address = device.address();
    
    let vid = format!("{:04x}", device_desc.vendor_id());
    let pid = format!("{:04x}", device_desc.product_id());
    
    let handle = device.open();
    
    let manufacturer = handle.as_ref()
        .ok()
        .and_then(|h| h.read_manufacturer_string_ascii(&device_desc).ok());
    
    let product = handle.as_ref()
        .ok()
        .and_then(|h| h.read_product_string_ascii(&device_desc).ok());
    
    let serial = handle.as_ref()
        .ok()
        .and_then(|h| h.read_serial_number_string_ascii(&device_desc).ok());
    
    let (interface_class, interface_hints) = get_interface_info(device);
    
    Ok(UsbEvidence {
        vid,
        pid,
        manufacturer,
        product,
        serial,
        bus,
        address,
        interface_class,
        interface_hints,
    })
}

fn get_interface_info<T: UsbContext>(device: &Device<T>) -> (Option<u8>, Vec<InterfaceHint>) {
    let mut hints = Vec::new();
    let mut first_class = None;
    
    if let Ok(config_desc) = device.config_descriptor(0) {
        for interface in config_desc.interfaces() {
            for desc in interface.descriptors() {
                if first_class.is_none() {
                    first_class = Some(desc.class_code());
                }
                hints.push(InterfaceHint {
                    class: desc.class_code(),
                    subclass: desc.sub_class_code(),
                    protocol: desc.protocol_code(),
                });
            }
        }
    }
    
    (first_class, hints)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_devices() {
        let result = scan_usb_devices();
        assert!(result.is_ok(), "USB scan should not panic");
        
        if let Ok(devices) = result {
            println!("Found {} USB devices", devices.len());
            for device in devices {
                println!("  VID:PID {}:{} - {:?}", device.vid, device.pid, device.product);
            }
        }
    }
}

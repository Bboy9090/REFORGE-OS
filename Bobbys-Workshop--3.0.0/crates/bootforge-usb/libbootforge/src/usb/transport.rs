use crate::Result;
use crate::BootforgeError;
use super::detect::UsbDeviceInfo;

#[derive(Debug, Clone)]
pub struct UsbEndpoint {
    pub address: u8,
    pub is_in: bool,
    pub is_bulk: bool,
    pub max_packet_size: u16,
}

#[derive(Debug)]
pub struct UsbTransport {
    pub device: UsbDeviceInfo,
    pub endpoints: Vec<UsbEndpoint>,
}

impl UsbTransport {
    pub fn new(device: UsbDeviceInfo) -> Self {
        UsbTransport {
            device,
            endpoints: Vec::new(),
        }
    }

    pub fn add_endpoint(&mut self, ep: UsbEndpoint) {
        self.endpoints.push(ep);
    }

    pub async fn send(&self, data: &[u8]) -> Result<usize> {
        log::warn!("USB send not yet implemented (attempted {} bytes)", data.len());
        // TODO: Implement actual USB write using libusb or rusb
        // For now, return error to prevent silent failure
        Err(BootforgeError::Usb("USB transport not yet implemented. Cannot send data to device.".to_string()))
    }

    pub async fn receive(&self, max_len: usize) -> Result<Vec<u8>> {
        log::warn!("USB receive not yet implemented (requested {} bytes)", max_len);
        // TODO: Implement actual USB read using libusb or rusb
        // For now, return error instead of empty data
        Err(BootforgeError::Usb("USB transport not yet implemented. Cannot receive data from device.".to_string()))
    }
}

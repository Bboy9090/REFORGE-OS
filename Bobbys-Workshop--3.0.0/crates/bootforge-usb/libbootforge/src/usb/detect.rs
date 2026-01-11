use crate::{BootforgeError, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DevicePlatform {
    Unknown,
    Apple,
    Android,
    Samsung,
    Qualcomm,
    Mediatek,
    Xiaomi,
    OnePlus,
    Huawei,
    LG,
    Sony,
    Motorola,
    Nokia,
    Asus,
    Oppo,
    Vivo,
    Realme,
    Google,
    WindowsPc,
    Mac,
    LinuxPc,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum DeviceMode {
    Normal,
    Recovery,
    Fastboot,
    Download,
    DFU,
    Sideload,
    MTP,
    PTP,
    Charging,
    Unknown,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum DeviceState {
    Attached,
    Identified,
    Probed,
    Ready,
    Disconnected,
    Error,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ProtocolType {
    ADB,
    Fastboot,
    DFU,
    AppleLockdown,
    MTP,
    PTP,
    EDL,
    Odin,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsbDeviceInfo {
    pub id: Uuid,
    pub vendor_id: u16,
    pub product_id: u16,
    pub serial: Option<String>,
    pub manufacturer: Option<String>,
    pub product: Option<String>,
    pub platform: DevicePlatform,
    pub mode: DeviceMode,
    pub state: DeviceState,
    pub protocol: ProtocolType,
    pub bus: Option<u8>,
    pub port: Option<u8>,
    pub speed: Option<String>,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
}

impl UsbDeviceInfo {
    pub fn unique_key(&self) -> String {
        format!("{:04x}:{:04x}:{}", 
            self.vendor_id, 
            self.product_id, 
            self.serial.as_deref().unwrap_or("unknown")
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceEvent {
    Connected(UsbDeviceInfo),
    Disconnected { id: Uuid, serial: Option<String> },
    ModeChanged { id: Uuid, old_mode: DeviceMode, new_mode: DeviceMode },
    StateChanged { id: Uuid, old_state: DeviceState, new_state: DeviceState },
    ProtocolDetected { id: Uuid, protocol: ProtocolType },
}

pub fn detect_devices() -> Result<Vec<UsbDeviceInfo>> {
    log::info!("[BootForge] Scanning USB devices with nusb...");
    
    let mut devices = Vec::new();
    let now = Utc::now();
    
    match nusb::list_devices() {
        Ok(device_list) => {
            for device_info in device_list {
                let vendor_id = device_info.vendor_id();
                let product_id = device_info.product_id();
                
                let platform = super::vendor_map::map_vendor_to_platform(vendor_id, product_id);
                let mode = detect_device_mode(vendor_id, product_id);
                let protocol = detect_protocol(vendor_id, product_id, &mode);
                
                let serial = device_info.serial_number().map(|s| s.to_string());
                let manufacturer = device_info.manufacturer_string().map(|s| s.to_string());
                let product = device_info.product_string().map(|s| s.to_string());
                
                let speed = match device_info.speed() {
                    Some(nusb::Speed::Low) => Some("Low (1.5 Mbps)".to_string()),
                    Some(nusb::Speed::Full) => Some("Full (12 Mbps)".to_string()),
                    Some(nusb::Speed::High) => Some("High (480 Mbps)".to_string()),
                    Some(nusb::Speed::Super) => Some("SuperSpeed (5 Gbps)".to_string()),
                    Some(nusb::Speed::SuperPlus) => Some("SuperSpeed+ (10 Gbps)".to_string()),
                    _ => None,
                };
                
                let info = UsbDeviceInfo {
                    id: Uuid::new_v4(),
                    vendor_id,
                    product_id,
                    serial,
                    manufacturer,
                    product,
                    platform,
                    mode,
                    state: DeviceState::Identified,
                    protocol,
                    bus: Some(device_info.bus_number()),
                    port: None,
                    speed,
                    first_seen: now,
                    last_seen: now,
                };
                
                log::info!(
                    "[BootForge] Found: {:04x}:{:04x} {} ({:?}/{:?})",
                    vendor_id, product_id,
                    info.product.as_deref().unwrap_or("Unknown"),
                    platform, mode
                );
                
                devices.push(info);
            }
        }
        Err(e) => {
            log::error!("[BootForge] USB enumeration failed: {}", e);
            return Err(BootforgeError::Usb(format!("Failed to enumerate USB devices: {}", e)));
        }
    }
    
    log::info!("[BootForge] Found {} USB devices", devices.len());
    Ok(devices)
}

pub fn detect_mobile_devices() -> Result<Vec<UsbDeviceInfo>> {
    let all_devices = detect_devices()?;
    Ok(all_devices.into_iter().filter(|d| {
        matches!(d.platform, 
            DevicePlatform::Apple | 
            DevicePlatform::Android | 
            DevicePlatform::Samsung |
            DevicePlatform::Google |
            DevicePlatform::Xiaomi |
            DevicePlatform::OnePlus |
            DevicePlatform::Huawei |
            DevicePlatform::Motorola |
            DevicePlatform::LG |
            DevicePlatform::Sony |
            DevicePlatform::Nokia |
            DevicePlatform::Asus |
            DevicePlatform::Oppo |
            DevicePlatform::Vivo |
            DevicePlatform::Realme |
            DevicePlatform::Qualcomm |
            DevicePlatform::Mediatek
        )
    }).collect())
}

pub fn detect_device_by_serial(serial: &str) -> Result<Option<UsbDeviceInfo>> {
    let devices = detect_devices()?;
    Ok(devices.into_iter().find(|d| {
        d.serial.as_ref().map_or(false, |s| s == serial)
    }))
}

fn detect_device_mode(vendor_id: u16, product_id: u16) -> DeviceMode {
    match (vendor_id, product_id) {
        (0x05ac, 0x1227) => DeviceMode::DFU,
        (0x05ac, 0x1281) => DeviceMode::Recovery,
        (0x05ac, 0x12a8) => DeviceMode::Normal,
        (0x18d1, 0x4ee0) => DeviceMode::Fastboot,
        (0x18d1, 0xd001) => DeviceMode::Sideload,
        (0x18d1, 0x4ee1) => DeviceMode::Normal,
        (0x18d1, 0x4ee2) => DeviceMode::Normal,
        (0x04e8, 0x6860) => DeviceMode::MTP,
        (0x04e8, 0x685d) => DeviceMode::Download,
        (0x04e8, 0x685e) => DeviceMode::Download,
        (0x22b8, 0x2e76) => DeviceMode::Fastboot,
        (0x22b8, 0x2e81) => DeviceMode::MTP,
        (0x2717, 0xff40) => DeviceMode::Fastboot,
        (0x2717, 0xff48) => DeviceMode::MTP,
        (0x2a70, 0x9011) => DeviceMode::Fastboot,
        (0x2a70, 0x4ee7) => DeviceMode::MTP,
        (0x05c6, 0x9008) => DeviceMode::Download,
        (0x05c6, 0x9025) => DeviceMode::Fastboot,
        (0x0e8d, 0x0003) => DeviceMode::Download,
        (0x0e8d, 0x2000) => DeviceMode::Download,
        _ => DeviceMode::Unknown,
    }
}

fn detect_protocol(vendor_id: u16, _product_id: u16, mode: &DeviceMode) -> ProtocolType {
    match mode {
        DeviceMode::DFU => ProtocolType::DFU,
        DeviceMode::Fastboot => ProtocolType::Fastboot,
        DeviceMode::Download => {
            match vendor_id {
                0x04e8 => ProtocolType::Odin,
                0x05c6 => ProtocolType::EDL,
                0x0e8d => ProtocolType::EDL,
                _ => ProtocolType::Unknown,
            }
        }
        DeviceMode::Recovery | DeviceMode::Normal | DeviceMode::Sideload => {
            match vendor_id {
                0x05ac => ProtocolType::AppleLockdown,
                _ => ProtocolType::ADB,
            }
        }
        DeviceMode::MTP => ProtocolType::MTP,
        DeviceMode::PTP => ProtocolType::PTP,
        _ => ProtocolType::Unknown,
    }
}

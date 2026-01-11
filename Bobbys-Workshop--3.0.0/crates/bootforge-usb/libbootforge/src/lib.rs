pub mod usb;
pub mod imaging;
pub mod drivers;
pub mod trapdoor;
pub mod utils;
pub mod bridge;
pub mod thermal;
pub mod storage;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum BootforgeError {
    #[error("USB error: {0}")]
    Usb(String),
    #[error("Imaging error: {0}")]
    Imaging(String),
    #[error("Driver error: {0}")]
    Driver(String),
    #[error("Trapdoor error: {0}")]
    Trapdoor(String),
    #[error("Bridge error: {0}")]
    Bridge(String),
    #[error("Thermal error: {0}")]
    Thermal(String),
    #[error("Storage error: {0}")]
    Storage(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Other: {0}")]
    Other(String),
}

pub type Result<T> = std::result::Result<T, BootforgeError>;

pub use usb::{
    UsbDeviceInfo,
    DevicePlatform,
    DeviceMode,
    DeviceState,
    ProtocolType,
    DeviceEvent,
    DeviceWatcher,
    WatcherConfig,
    detect_devices,
    detect_mobile_devices,
};

pub use thermal::{
    ThermalZone,
    ThermalState,
    ThermalReading,
    ThermalSnapshot,
    ThermalConfig,
    ThermalMonitor,
    ThermalEvent,
    ThermalEventType,
};

pub use storage::{
    StorageType,
    HealthStatus,
    SmartAttribute,
    SmartAttributeStatus,
    StorageInfo,
    SmartData,
    StorageHealthReport,
    SmartParser,
};

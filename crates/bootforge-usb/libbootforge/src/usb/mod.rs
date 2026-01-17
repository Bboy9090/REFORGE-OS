pub mod detect;
pub mod transport;
pub mod vendor_map;
pub mod watcher;

pub use detect::{
    detect_devices, 
    detect_mobile_devices,
    detect_device_by_serial,
    UsbDeviceInfo, 
    DevicePlatform,
    DeviceMode,
    DeviceState,
    ProtocolType,
    DeviceEvent,
};
pub use transport::{UsbTransport, UsbEndpoint};
pub use vendor_map::{
    map_vendor_to_platform, 
    get_vendor_name, 
    device_class_name,
    get_vendor_profile,
    is_mobile_device,
    VendorProfile,
    VENDOR_PROFILES,
};
pub use watcher::{DeviceWatcher, WatcherConfig};

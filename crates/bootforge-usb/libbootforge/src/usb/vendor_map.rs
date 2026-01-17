use super::detect::{DevicePlatform, DeviceMode};

pub fn map_vendor_to_platform(vendor_id: u16, product_id: u16) -> DevicePlatform {
    match vendor_id {
        0x05ac => DevicePlatform::Apple,
        
        0x18d1 => DevicePlatform::Google,
        
        0x04e8 => DevicePlatform::Samsung,
        
        0x2717 | 0x2d95 => DevicePlatform::Xiaomi,
        
        0x2a70 | 0x22d9 => DevicePlatform::OnePlus,
        
        0x12d1 | 0x3108 => DevicePlatform::Huawei,
        
        0x1004 => DevicePlatform::LG,
        
        0x0fce => DevicePlatform::Sony,
        
        0x22b8 => {
            match product_id {
                0x2e76..=0x2eff => DevicePlatform::Motorola,
                _ => DevicePlatform::Motorola,
            }
        }
        
        0x05c6 => DevicePlatform::Qualcomm,
        
        0x0421 | 0x0489 => DevicePlatform::Nokia,
        
        0x0b05 => DevicePlatform::Asus,
        
        0x2ae5 | 0x22d4 => DevicePlatform::Oppo,
        
        0x2d01 => DevicePlatform::Vivo,
        
        0x2ae6 => DevicePlatform::Realme,
        
        0x0e8d => DevicePlatform::Mediatek,
        
        0x1949 => DevicePlatform::Android,
        0x1d6b => DevicePlatform::Android,
        0x0bb4 => DevicePlatform::Android,
        0x2a45 => DevicePlatform::Android,
        0x0414 => DevicePlatform::Android,
        0x2916 => DevicePlatform::Android,
        0x1bbb => DevicePlatform::Android,
        0x17ef => DevicePlatform::Android,
        0x0502 => DevicePlatform::Android,
        0x2207 => DevicePlatform::Android,
        0x271d => DevicePlatform::Android,
        0x2c7c => DevicePlatform::Android,
        0x413c => DevicePlatform::Android,
        0x0409 => DevicePlatform::Android,
        0x2b0e => DevicePlatform::Android,
        0x201e => DevicePlatform::Android,
        0x2970 => DevicePlatform::Android,
        0x29e4 => DevicePlatform::Android,
        0x1782 => DevicePlatform::Android,
        0x2836 => DevicePlatform::Android,
        
        _ => DevicePlatform::Unknown,
    }
}

pub fn get_vendor_name(vendor_id: u16) -> &'static str {
    match vendor_id {
        0x05ac => "Apple Inc.",
        0x18d1 => "Google Inc.",
        0x04e8 => "Samsung Electronics",
        0x2717 => "Xiaomi Inc.",
        0x2d95 => "Xiaomi Communications",
        0x2a70 => "OnePlus Technology",
        0x22d9 => "OnePlus (OPPO)",
        0x12d1 => "Huawei Technologies",
        0x3108 => "Huawei Device",
        0x1004 => "LG Electronics",
        0x0fce => "Sony Mobile",
        0x22b8 => "Motorola PCS",
        0x0421 => "Nokia Corporation",
        0x0489 => "Foxconn (Nokia)",
        0x0b05 => "ASUSTek Computer",
        0x2ae5 => "OPPO Electronics",
        0x22d4 => "OPPO Digital",
        0x2d01 => "vivo Mobile",
        0x2ae6 => "realme Mobile",
        0x05c6 => "Qualcomm Inc.",
        0x0e8d => "MediaTek Inc.",
        0x0bb4 => "HTC Corporation",
        0x2a45 => "Meizu Technology",
        0x1949 => "Amazon Lab126",
        0x17ef => "Lenovo Mobile",
        0x2207 => "Fuzhou Rockchip",
        0x271d => "Essential Products",
        0x1bbb => "T-Mobile USA",
        0x2916 => "Yota Devices",
        0x413c => "Dell Inc.",
        0x2970 => "WIKO",
        0x29e4 => "Fairphone",
        0x1d6b => "Linux Foundation",
        _ => "Unknown Vendor",
    }
}

pub fn device_class_name(platform: &DevicePlatform, mode: &DeviceMode) -> String {
    let platform_str = match platform {
        DevicePlatform::Apple => "Apple",
        DevicePlatform::Google => "Google Pixel",
        DevicePlatform::Samsung => "Samsung Galaxy",
        DevicePlatform::Xiaomi => "Xiaomi/Redmi",
        DevicePlatform::OnePlus => "OnePlus",
        DevicePlatform::Huawei => "Huawei/Honor",
        DevicePlatform::LG => "LG",
        DevicePlatform::Sony => "Sony Xperia",
        DevicePlatform::Motorola => "Motorola/Lenovo",
        DevicePlatform::Nokia => "Nokia/HMD",
        DevicePlatform::Asus => "ASUS ROG/ZenFone",
        DevicePlatform::Oppo => "OPPO",
        DevicePlatform::Vivo => "vivo",
        DevicePlatform::Realme => "realme",
        DevicePlatform::Qualcomm => "Qualcomm Device",
        DevicePlatform::Mediatek => "MediaTek Device",
        DevicePlatform::Android => "Android Device",
        DevicePlatform::WindowsPc => "Windows PC",
        DevicePlatform::Mac => "macOS",
        DevicePlatform::LinuxPc => "Linux System",
        DevicePlatform::Unknown => "Unknown",
    };
    
    let mode_str = match mode {
        DeviceMode::Normal => "",
        DeviceMode::Recovery => " (Recovery)",
        DeviceMode::Fastboot => " (Fastboot)",
        DeviceMode::Download => " (Download Mode)",
        DeviceMode::DFU => " (DFU)",
        DeviceMode::Sideload => " (Sideload)",
        DeviceMode::MTP => " (MTP)",
        DeviceMode::PTP => " (PTP)",
        DeviceMode::Charging => " (Charging Only)",
        DeviceMode::Unknown => "",
    };
    
    format!("{}{}", platform_str, mode_str)
}

pub struct VendorProfile {
    pub vendor_id: u16,
    pub name: &'static str,
    pub adb_vid: Option<u16>,
    pub fastboot_vid: Option<u16>,
    pub download_vid: Option<u16>,
    pub normal_pids: &'static [u16],
    pub fastboot_pids: &'static [u16],
    pub recovery_pids: &'static [u16],
    pub download_pids: &'static [u16],
}

pub static VENDOR_PROFILES: &[VendorProfile] = &[
    VendorProfile {
        vendor_id: 0x05ac,
        name: "Apple",
        adb_vid: None,
        fastboot_vid: None,
        download_vid: Some(0x05ac),
        normal_pids: &[0x12a8, 0x12a0, 0x1294, 0x1292, 0x1297, 0x12ab],
        fastboot_pids: &[],
        recovery_pids: &[0x1281, 0x1282, 0x1283],
        download_pids: &[0x1227],
    },
    VendorProfile {
        vendor_id: 0x18d1,
        name: "Google",
        adb_vid: Some(0x18d1),
        fastboot_vid: Some(0x18d1),
        download_vid: None,
        normal_pids: &[0x4ee1, 0x4ee2, 0x4ee3, 0x4ee4, 0x4ee5, 0x4ee6, 0x4ee7],
        fastboot_pids: &[0x4ee0, 0xd001],
        recovery_pids: &[0xd001],
        download_pids: &[],
    },
    VendorProfile {
        vendor_id: 0x04e8,
        name: "Samsung",
        adb_vid: Some(0x04e8),
        fastboot_vid: Some(0x04e8),
        download_vid: Some(0x04e8),
        normal_pids: &[0x6860, 0x6861, 0x6862, 0x6863, 0x6864, 0x6865, 0x6866],
        fastboot_pids: &[0x6890],
        recovery_pids: &[0x685e],
        download_pids: &[0x685d, 0x685e],
    },
    VendorProfile {
        vendor_id: 0x2717,
        name: "Xiaomi",
        adb_vid: Some(0x2717),
        fastboot_vid: Some(0x18d1),
        download_vid: Some(0x05c6),
        normal_pids: &[0xff48, 0xff40, 0xff68],
        fastboot_pids: &[0xff40],
        recovery_pids: &[0xff18],
        download_pids: &[],
    },
    VendorProfile {
        vendor_id: 0x22b8,
        name: "Motorola",
        adb_vid: Some(0x22b8),
        fastboot_vid: Some(0x22b8),
        download_vid: None,
        normal_pids: &[0x2e81, 0x2e82, 0x2e83, 0x2e84, 0x2e85],
        fastboot_pids: &[0x2e76, 0x2e77],
        recovery_pids: &[0x2e80],
        download_pids: &[],
    },
    VendorProfile {
        vendor_id: 0x2a70,
        name: "OnePlus",
        adb_vid: Some(0x2a70),
        fastboot_vid: Some(0x2a70),
        download_vid: Some(0x05c6),
        normal_pids: &[0x4ee7, 0x9011, 0x9012],
        fastboot_pids: &[0x9011],
        recovery_pids: &[0x4ee0],
        download_pids: &[],
    },
    VendorProfile {
        vendor_id: 0x05c6,
        name: "Qualcomm",
        adb_vid: Some(0x05c6),
        fastboot_vid: Some(0x05c6),
        download_vid: Some(0x05c6),
        normal_pids: &[0x9024, 0x9025],
        fastboot_pids: &[0x9025, 0x9026],
        recovery_pids: &[],
        download_pids: &[0x9008, 0x9006, 0x9001],
    },
    VendorProfile {
        vendor_id: 0x0e8d,
        name: "MediaTek",
        adb_vid: Some(0x0e8d),
        fastboot_vid: Some(0x0e8d),
        download_vid: Some(0x0e8d),
        normal_pids: &[0x2008],
        fastboot_pids: &[0x0c03],
        recovery_pids: &[],
        download_pids: &[0x0003, 0x2000, 0x2001],
    },
];

pub fn get_vendor_profile(vendor_id: u16) -> Option<&'static VendorProfile> {
    VENDOR_PROFILES.iter().find(|p| p.vendor_id == vendor_id)
}

pub fn is_mobile_device(vendor_id: u16) -> bool {
    matches!(map_vendor_to_platform(vendor_id, 0),
        DevicePlatform::Apple |
        DevicePlatform::Google |
        DevicePlatform::Samsung |
        DevicePlatform::Xiaomi |
        DevicePlatform::OnePlus |
        DevicePlatform::Huawei |
        DevicePlatform::LG |
        DevicePlatform::Sony |
        DevicePlatform::Motorola |
        DevicePlatform::Nokia |
        DevicePlatform::Asus |
        DevicePlatform::Oppo |
        DevicePlatform::Vivo |
        DevicePlatform::Realme |
        DevicePlatform::Android |
        DevicePlatform::Qualcomm |
        DevicePlatform::Mediatek
    )
}

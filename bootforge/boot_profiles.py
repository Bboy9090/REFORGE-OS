"""
BootForge USB - OS-Specific Boot Profiles

Defines boot configurations for different operating systems.
Handles UEFI/Legacy, Secure Boot, and platform-specific requirements.
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, asdict, field


class BootMode(str, Enum):
    """Boot modes."""
    UEFI = "uefi"
    LEGACY_BIOS = "legacy_bios"
    UEFI_CSM = "uefi_csm"


class PartitionScheme(str, Enum):
    """Partition schemes."""
    GPT = "gpt"
    MBR = "mbr"


class FileSystem(str, Enum):
    """File systems."""
    NTFS = "ntfs"
    FAT32 = "fat32"
    EXT4 = "ext4"
    APFS = "apfs"
    HFS_PLUS = "hfs+"
    EXFAT = "exfat"


class SecureBootState(str, Enum):
    """Secure Boot states."""
    ENABLED = "enabled"
    DISABLED = "disabled"
    OPTIONAL = "optional"


@dataclass
class BootPartition:
    """Boot partition configuration."""
    name: str
    size_mb: int
    filesystem: FileSystem
    bootable: bool
    mount_point: Optional[str]
    flags: List[str] = field(default_factory=list)


@dataclass
class BootProfile:
    """
    OS-specific boot profile.
    
    Defines everything needed to make a bootable USB for a specific OS.
    """
    profile_id: str
    name: str
    os_family: str  # windows, linux, macos, recovery
    os_version: str
    boot_mode: BootMode
    partition_scheme: PartitionScheme
    secure_boot: SecureBootState
    partitions: List[BootPartition]
    boot_files: List[str]
    boot_loader: str
    boot_loader_config: Dict[str, Any]
    kernel_params: List[str]
    requires_drivers: bool
    driver_injection_point: Optional[str]
    post_install_scripts: List[str]
    compatibility_notes: List[str]
    min_usb_size_gb: float
    
    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result["partitions"] = [asdict(p) for p in self.partitions]
        return result


# Pre-defined Boot Profiles
BOOT_PROFILES: Dict[str, BootProfile] = {
    # Windows 11 UEFI
    "windows_11_uefi": BootProfile(
        profile_id="windows_11_uefi",
        name="Windows 11 UEFI Installation",
        os_family="windows",
        os_version="11",
        boot_mode=BootMode.UEFI,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.ENABLED,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=512,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp", "boot"]
            ),
            BootPartition(
                name="INSTALL",
                size_mb=0,  # Use remaining space
                filesystem=FileSystem.NTFS,
                bootable=False,
                mount_point=None,
                flags=[]
            )
        ],
        boot_files=[
            "/efi/boot/bootx64.efi",
            "/efi/microsoft/boot/bcd",
            "/sources/boot.wim",
            "/sources/install.wim"
        ],
        boot_loader="Windows Boot Manager",
        boot_loader_config={
            "timeout": 30,
            "default": "Windows Setup"
        },
        kernel_params=[],
        requires_drivers=True,
        driver_injection_point="/sources/boot.wim",
        post_install_scripts=[],
        compatibility_notes=[
            "Requires TPM 2.0 and Secure Boot",
            "CPU must support SSE4.2",
            "Minimum 4GB RAM, 64GB storage"
        ],
        min_usb_size_gb=8.0
    ),
    
    # Windows 10 UEFI
    "windows_10_uefi": BootProfile(
        profile_id="windows_10_uefi",
        name="Windows 10 UEFI Installation",
        os_family="windows",
        os_version="10",
        boot_mode=BootMode.UEFI,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.OPTIONAL,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=512,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp", "boot"]
            ),
            BootPartition(
                name="INSTALL",
                size_mb=0,
                filesystem=FileSystem.NTFS,
                bootable=False,
                mount_point=None,
                flags=[]
            )
        ],
        boot_files=[
            "/efi/boot/bootx64.efi",
            "/efi/microsoft/boot/bcd",
            "/sources/boot.wim",
            "/sources/install.wim"
        ],
        boot_loader="Windows Boot Manager",
        boot_loader_config={"timeout": 30},
        kernel_params=[],
        requires_drivers=True,
        driver_injection_point="/sources/boot.wim",
        post_install_scripts=[],
        compatibility_notes=[
            "TPM and Secure Boot optional",
            "Minimum 2GB RAM, 32GB storage"
        ],
        min_usb_size_gb=8.0
    ),
    
    # Windows 10 Legacy BIOS
    "windows_10_legacy": BootProfile(
        profile_id="windows_10_legacy",
        name="Windows 10 Legacy BIOS Installation",
        os_family="windows",
        os_version="10",
        boot_mode=BootMode.LEGACY_BIOS,
        partition_scheme=PartitionScheme.MBR,
        secure_boot=SecureBootState.DISABLED,
        partitions=[
            BootPartition(
                name="INSTALL",
                size_mb=0,
                filesystem=FileSystem.NTFS,
                bootable=True,
                mount_point=None,
                flags=["boot"]
            )
        ],
        boot_files=[
            "/bootmgr",
            "/boot/bcd",
            "/sources/boot.wim",
            "/sources/install.wim"
        ],
        boot_loader="bootmgr",
        boot_loader_config={"timeout": 30},
        kernel_params=[],
        requires_drivers=True,
        driver_injection_point="/sources/boot.wim",
        post_install_scripts=[],
        compatibility_notes=[
            "For older systems without UEFI",
            "No Secure Boot support"
        ],
        min_usb_size_gb=8.0
    ),
    
    # Ubuntu 24.04 LTS UEFI
    "ubuntu_24_uefi": BootProfile(
        profile_id="ubuntu_24_uefi",
        name="Ubuntu 24.04 LTS UEFI Live/Install",
        os_family="linux",
        os_version="24.04",
        boot_mode=BootMode.UEFI,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.ENABLED,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=512,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp", "boot"]
            ),
            BootPartition(
                name="UBUNTU",
                size_mb=0,
                filesystem=FileSystem.EXT4,
                bootable=False,
                mount_point="/",
                flags=[]
            )
        ],
        boot_files=[
            "/efi/boot/bootx64.efi",
            "/efi/boot/grubx64.efi",
            "/casper/vmlinuz",
            "/casper/initrd",
            "/casper/filesystem.squashfs"
        ],
        boot_loader="GRUB",
        boot_loader_config={
            "timeout": 10,
            "default": "Ubuntu",
            "theme": "ubuntu"
        },
        kernel_params=[
            "quiet",
            "splash",
            "---"
        ],
        requires_drivers=False,
        driver_injection_point=None,
        post_install_scripts=[],
        compatibility_notes=[
            "Signed kernel for Secure Boot",
            "Minimum 4GB RAM for live session"
        ],
        min_usb_size_gb=8.0
    ),
    
    # Ubuntu 22.04 LTS UEFI
    "ubuntu_22_uefi": BootProfile(
        profile_id="ubuntu_22_uefi",
        name="Ubuntu 22.04 LTS UEFI Live/Install",
        os_family="linux",
        os_version="22.04",
        boot_mode=BootMode.UEFI,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.ENABLED,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=512,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp", "boot"]
            ),
            BootPartition(
                name="UBUNTU",
                size_mb=0,
                filesystem=FileSystem.EXT4,
                bootable=False,
                mount_point="/",
                flags=[]
            )
        ],
        boot_files=[
            "/efi/boot/bootx64.efi",
            "/efi/boot/grubx64.efi",
            "/casper/vmlinuz",
            "/casper/initrd"
        ],
        boot_loader="GRUB",
        boot_loader_config={"timeout": 10},
        kernel_params=["quiet", "splash"],
        requires_drivers=False,
        driver_injection_point=None,
        post_install_scripts=[],
        compatibility_notes=["Signed kernel for Secure Boot"],
        min_usb_size_gb=4.0
    ),
    
    # Debian 12 UEFI
    "debian_12_uefi": BootProfile(
        profile_id="debian_12_uefi",
        name="Debian 12 Bookworm UEFI Install",
        os_family="linux",
        os_version="12",
        boot_mode=BootMode.UEFI,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.OPTIONAL,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=512,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp", "boot"]
            ),
            BootPartition(
                name="DEBIAN",
                size_mb=0,
                filesystem=FileSystem.EXT4,
                bootable=False,
                mount_point="/",
                flags=[]
            )
        ],
        boot_files=[
            "/efi/boot/bootx64.efi",
            "/install.amd/vmlinuz",
            "/install.amd/initrd.gz"
        ],
        boot_loader="GRUB",
        boot_loader_config={"timeout": 5},
        kernel_params=[],
        requires_drivers=False,
        driver_injection_point=None,
        post_install_scripts=[],
        compatibility_notes=["Stable release with LTS kernel"],
        min_usb_size_gb=4.0
    ),
    
    # macOS Recovery
    "macos_recovery": BootProfile(
        profile_id="macos_recovery",
        name="macOS Recovery USB",
        os_family="macos",
        os_version="recovery",
        boot_mode=BootMode.UEFI,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.ENABLED,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=200,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp"]
            ),
            BootPartition(
                name="RECOVERY",
                size_mb=0,
                filesystem=FileSystem.HFS_PLUS,
                bootable=False,
                mount_point="/",
                flags=[]
            )
        ],
        boot_files=[
            "/System/Library/CoreServices/boot.efi",
            "/com.apple.recovery.boot/BaseSystem.dmg"
        ],
        boot_loader="Apple Boot Manager",
        boot_loader_config={},
        kernel_params=[],
        requires_drivers=False,
        driver_injection_point=None,
        post_install_scripts=[],
        compatibility_notes=[
            "Requires Apple hardware or compatible system",
            "T2 chip requires special handling",
            "Apple Silicon uses different boot process"
        ],
        min_usb_size_gb=16.0
    ),
    
    # Generic Linux Live
    "linux_live_generic": BootProfile(
        profile_id="linux_live_generic",
        name="Generic Linux Live USB",
        os_family="linux",
        os_version="generic",
        boot_mode=BootMode.UEFI_CSM,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.DISABLED,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=512,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp", "boot"]
            ),
            BootPartition(
                name="LIVE",
                size_mb=0,
                filesystem=FileSystem.EXT4,
                bootable=False,
                mount_point="/",
                flags=[]
            )
        ],
        boot_files=[
            "/efi/boot/bootx64.efi",
            "/vmlinuz",
            "/initrd.img"
        ],
        boot_loader="GRUB",
        boot_loader_config={"timeout": 10},
        kernel_params=["quiet"],
        requires_drivers=False,
        driver_injection_point=None,
        post_install_scripts=[],
        compatibility_notes=["Universal Linux boot profile"],
        min_usb_size_gb=4.0
    ),
    
    # Rescue/Recovery Profile
    "rescue_multiboot": BootProfile(
        profile_id="rescue_multiboot",
        name="BootForge Rescue Multiboot",
        os_family="recovery",
        os_version="1.0",
        boot_mode=BootMode.UEFI_CSM,
        partition_scheme=PartitionScheme.GPT,
        secure_boot=SecureBootState.DISABLED,
        partitions=[
            BootPartition(
                name="EFI",
                size_mb=512,
                filesystem=FileSystem.FAT32,
                bootable=True,
                mount_point="/efi",
                flags=["esp", "boot"]
            ),
            BootPartition(
                name="RESCUE",
                size_mb=0,
                filesystem=FileSystem.EXFAT,
                bootable=False,
                mount_point="/rescue",
                flags=[]
            )
        ],
        boot_files=[
            "/efi/boot/bootx64.efi",
            "/boot/grub/grub.cfg",
            "/iso/"  # Directory for multiple ISOs
        ],
        boot_loader="GRUB Multiboot",
        boot_loader_config={
            "timeout": 30,
            "theme": "bootforge",
            "menu_entries": [
                "Boot from first ISO",
                "Memory Test",
                "Hardware Diagnostics",
                "UEFI Shell"
            ]
        },
        kernel_params=[],
        requires_drivers=True,
        driver_injection_point="/drivers/",
        post_install_scripts=[],
        compatibility_notes=[
            "Supports multiple ISOs",
            "Includes rescue tools",
            "Universal boot (UEFI + Legacy)"
        ],
        min_usb_size_gb=16.0
    ),
}


def get_boot_profile(profile_id: str) -> Optional[BootProfile]:
    """Get a boot profile by ID."""
    return BOOT_PROFILES.get(profile_id)


def list_boot_profiles() -> List[Dict[str, Any]]:
    """List all available boot profiles."""
    return [
        {
            "profile_id": p.profile_id,
            "name": p.name,
            "os_family": p.os_family,
            "os_version": p.os_version,
            "boot_mode": p.boot_mode.value,
            "secure_boot": p.secure_boot.value,
            "min_usb_size_gb": p.min_usb_size_gb
        }
        for p in BOOT_PROFILES.values()
    ]


def get_profile_for_os(os_family: str, os_version: str, boot_mode: str = "uefi") -> Optional[BootProfile]:
    """
    Get the best boot profile for a given OS.
    
    Args:
        os_family: OS family (windows, linux, macos)
        os_version: OS version
        boot_mode: Preferred boot mode (uefi, legacy_bios)
    
    Returns:
        Best matching BootProfile or None
    """
    candidates = [
        p for p in BOOT_PROFILES.values()
        if p.os_family == os_family and p.os_version == os_version
    ]
    
    # Prefer UEFI profiles
    if boot_mode == "uefi":
        uefi_profiles = [p for p in candidates if p.boot_mode == BootMode.UEFI]
        if uefi_profiles:
            return uefi_profiles[0]
    elif boot_mode == "legacy_bios":
        legacy_profiles = [p for p in candidates if p.boot_mode == BootMode.LEGACY_BIOS]
        if legacy_profiles:
            return legacy_profiles[0]
    
    return candidates[0] if candidates else None


def validate_usb_for_profile(usb_size_gb: float, profile_id: str) -> Dict[str, Any]:
    """
    Validate if a USB drive is suitable for a boot profile.
    
    Args:
        usb_size_gb: USB drive size in GB
        profile_id: Boot profile ID
    
    Returns:
        Validation result dict
    """
    profile = get_boot_profile(profile_id)
    if not profile:
        return {
            "valid": False,
            "error": f"Unknown profile: {profile_id}"
        }
    
    if usb_size_gb < profile.min_usb_size_gb:
        return {
            "valid": False,
            "error": f"USB too small. Need {profile.min_usb_size_gb}GB, have {usb_size_gb}GB",
            "required_gb": profile.min_usb_size_gb,
            "available_gb": usb_size_gb
        }
    
    return {
        "valid": True,
        "profile": profile.name,
        "available_gb": usb_size_gb,
        "required_gb": profile.min_usb_size_gb,
        "headroom_gb": usb_size_gb - profile.min_usb_size_gb
    }

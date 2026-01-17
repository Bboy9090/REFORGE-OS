export enum USBClass {
  PerInterfaceDefined = 0x00,
  Audio = 0x01,
  CDC_Communications = 0x02,
  HID = 0x03,
  Physical = 0x05,
  Image = 0x06,
  Printer = 0x07,
  MassStorage = 0x08,
  Hub = 0x09,
  CDC_Data = 0x0a,
  SmartCard = 0x0b,
  ContentSecurity = 0x0d,
  Video = 0x0e,
  PersonalHealthcare = 0x0f,
  AudioVideo = 0x10,
  Billboard = 0x11,
  USB_C_Bridge = 0x12,
  Diagnostic = 0xdc,
  WirelessController = 0xe0,
  Miscellaneous = 0xef,
  ApplicationSpecific = 0xfe,
  VendorSpecific = 0xff,
}

export interface USBDeviceClass {
  classCode: number;
  className: string;
  subclassCode?: number;
  subclassName?: string;
  protocolCode?: number;
  protocolName?: string;
  description: string;
  icon: string;
}

export interface EnhancedUSBDeviceInfo {
  id: string;
  vendorId: number;
  productId: number;
  manufacturerName?: string;
  productName?: string;
  serialNumber?: string;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  usbVersion: string;
  deviceVersion: string;
  classes: USBDeviceClass[];
  capabilities: string[];
}

export function getUSBClassName(classCode: number): string {
  const classNames: Record<number, string> = {
    0x00: 'Device',
    0x01: 'Audio',
    0x02: 'Communications',
    0x03: 'Human Interface Device',
    0x05: 'Physical Interface',
    0x06: 'Image',
    0x07: 'Printer',
    0x08: 'Mass Storage',
    0x09: 'Hub',
    0x0a: 'CDC-Data',
    0x0b: 'Smart Card',
    0x0d: 'Content Security',
    0x0e: 'Video',
    0x0f: 'Personal Healthcare',
    0x10: 'Audio/Video',
    0x11: 'Billboard',
    0x12: 'USB Type-C Bridge',
    0xdc: 'Diagnostic Device',
    0xe0: 'Wireless Controller',
    0xef: 'Miscellaneous',
    0xfe: 'Application Specific',
    0xff: 'Vendor Specific',
  };

  return classNames[classCode] || `Unknown Class (0x${classCode.toString(16).padStart(2, '0')})`;
}

export function getUSBSubclassName(classCode: number, subclassCode: number): string {
  const subclassNames: Record<number, Record<number, string>> = {
    0x01: {
      0x00: 'Audio Control',
      0x01: 'Audio Streaming',
      0x02: 'MIDI Streaming',
      0x03: 'Audio Function',
    },
    0x03: {
      0x00: 'No Subclass',
      0x01: 'Boot Interface',
    },
    0x06: {
      0x01: 'Still Image Capture',
    },
    0x07: {
      0x01: 'Printer',
    },
    0x08: {
      0x01: 'Reduced Block Commands (RBC)',
      0x02: 'SFF-8020i / MMC-2 (ATAPI)',
      0x03: 'QIC-157 (Tape)',
      0x04: 'UFI (Floppy)',
      0x05: 'SFF-8070i',
      0x06: 'SCSI Transparent',
    },
    0x0e: {
      0x00: 'Video Control',
      0x01: 'Video Streaming',
      0x02: 'Video Interface Collection',
    },
    0x0f: {
      0x00: 'Personal Healthcare Device',
    },
    0xe0: {
      0x01: 'Bluetooth',
      0x02: 'UWB Radio Control',
    },
  };

  const subclass = subclassNames[classCode]?.[subclassCode];
  if (subclass) return subclass;

  return `Subclass 0x${subclassCode.toString(16).padStart(2, '0')}`;
}

export function getUSBProtocolName(classCode: number, subclassCode: number, protocolCode: number): string {
  const protocolNames: Record<number, Record<number, Record<number, string>>> = {
    0x03: {
      0x01: {
        0x01: 'Keyboard',
        0x02: 'Mouse',
      },
    },
    0x08: {
      0x06: {
        0x50: 'Bulk-Only Transport',
        0x62: 'UAS (USB Attached SCSI)',
      },
    },
    0x0e: {
      0x00: {
        0x00: 'UVC (USB Video Class)',
      },
    },
    0xe0: {
      0x01: {
        0x01: 'Bluetooth Programming',
        0x02: 'UWB Radio Control',
        0x03: 'Remote NDIS',
        0x04: 'Bluetooth AMP Controller',
      },
    },
  };

  const protocol = protocolNames[classCode]?.[subclassCode]?.[protocolCode];
  if (protocol) return protocol;

  if (protocolCode === 0x00) return 'Default Protocol';

  return `Protocol 0x${protocolCode.toString(16).padStart(2, '0')}`;
}

export function getUSBClassIcon(classCode: number): string {
  const icons: Record<number, string> = {
    0x01: '🔊',
    0x02: '📡',
    0x03: '🖱️',
    0x06: '📷',
    0x07: '🖨️',
    0x08: '💾',
    0x09: '🔌',
    0x0e: '📹',
    0x0f: '🏥',
    0x10: '🎬',
    0xe0: '📶',
  };

  return icons[classCode] || '⚙️';
}

export function getUSBClassDescription(classCode: number, subclassCode?: number, protocolCode?: number): string {
  const descriptions: Record<number, string> = {
    0x01: 'Audio device for playback, recording, or MIDI',
    0x02: 'Communication device (modem, network adapter)',
    0x03: 'Human Interface Device (keyboard, mouse, gamepad)',
    0x06: 'Image capture device (camera, scanner)',
    0x07: 'Printer or printing device',
    0x08: 'Mass storage device (USB drive, external HDD/SSD)',
    0x09: 'USB hub for connecting multiple devices',
    0x0a: 'Data communication device',
    0x0b: 'Smart card reader',
    0x0d: 'Content security device',
    0x0e: 'Video capture or streaming device (webcam)',
    0x0f: 'Personal healthcare monitoring device',
    0x10: 'Audio/Video device (combined functionality)',
    0x11: 'USB Billboard device',
    0x12: 'USB Type-C bridge device',
    0xdc: 'Diagnostic and debugging device',
    0xe0: 'Wireless controller (Bluetooth, Wi-Fi)',
    0xef: 'Miscellaneous device',
    0xfe: 'Application-specific device',
    0xff: 'Vendor-specific device',
  };

  let description = descriptions[classCode] || 'Unknown device type';

  if (classCode === 0x03 && subclassCode === 0x01 && protocolCode === 0x01) {
    description = 'USB Keyboard (Boot Protocol)';
  } else if (classCode === 0x03 && subclassCode === 0x01 && protocolCode === 0x02) {
    description = 'USB Mouse (Boot Protocol)';
  } else if (classCode === 0x08 && protocolCode === 0x50) {
    description = 'USB Mass Storage (Bulk-Only Transport)';
  } else if (classCode === 0x0e) {
    description = 'USB Video Class device (UVC webcam)';
  }

  return description;
}

export function detectDeviceCapabilities(deviceClass: number, interfaces: any[]): string[] {
  const capabilities: Set<string> = new Set();

  // Mass Storage devices
  if (deviceClass === USBClass.MassStorage || interfaces.some(i => i.interfaceClass === USBClass.MassStorage)) {
    capabilities.add('Storage');
    capabilities.add('Read/Write Files');
    
    // Check for MTP (Media Transfer Protocol) - common in Android devices
    if (interfaces.some(i => i.interfaceClass === USBClass.VendorSpecific && i.interfaceSubclass === 0x01 && i.interfaceProtocol === 0x01)) {
      capabilities.add('MTP (Media Transfer)');
      capabilities.add('Android File Transfer');
    }
    
    // Check for PTP (Picture Transfer Protocol) - used in cameras and iOS
    if (interfaces.some(i => i.interfaceClass === USBClass.Image || (i.interfaceClass === 0x06 && i.interfaceSubclass === 0x01))) {
      capabilities.add('PTP (Picture Transfer)');
      capabilities.add('Photo Import');
    }
  }

  if (deviceClass === USBClass.Audio || interfaces.some(i => i.interfaceClass === USBClass.Audio)) {
    capabilities.add('Audio');
    if (interfaces.some(i => i.interfaceClass === USBClass.Audio && i.interfaceSubclass === 0x01)) {
      capabilities.add('Audio Streaming');
    }
    if (interfaces.some(i => i.interfaceClass === USBClass.Audio && i.interfaceSubclass === 0x02)) {
      capabilities.add('MIDI');
    }
  }

  if (deviceClass === USBClass.HID || interfaces.some(i => i.interfaceClass === USBClass.HID)) {
    capabilities.add('Human Interface');
    if (interfaces.some(i => i.interfaceClass === USBClass.HID && i.interfaceProtocol === 0x01)) {
      capabilities.add('Keyboard Input');
    }
    if (interfaces.some(i => i.interfaceClass === USBClass.HID && i.interfaceProtocol === 0x02)) {
      capabilities.add('Mouse Input');
    }
  }

  if (deviceClass === USBClass.Video || interfaces.some(i => i.interfaceClass === USBClass.Video)) {
    capabilities.add('Video');
    capabilities.add('Video Capture');
  }

  if (deviceClass === USBClass.Image || interfaces.some(i => i.interfaceClass === USBClass.Image)) {
    capabilities.add('Image Capture');
  }

  if (deviceClass === USBClass.Printer || interfaces.some(i => i.interfaceClass === USBClass.Printer)) {
    capabilities.add('Printing');
  }

  if (deviceClass === USBClass.CDC_Communications || interfaces.some(i => i.interfaceClass === USBClass.CDC_Communications)) {
    capabilities.add('Network Communication');
  }

  if (deviceClass === USBClass.WirelessController || interfaces.some(i => i.interfaceClass === USBClass.WirelessController)) {
    capabilities.add('Wireless');
    if (interfaces.some(i => i.interfaceClass === USBClass.WirelessController && i.interfaceSubclass === 0x01)) {
      capabilities.add('Bluetooth');
    }
  }

  if (deviceClass === USBClass.Hub || interfaces.some(i => i.interfaceClass === USBClass.Hub)) {
    capabilities.add('USB Hub');
    capabilities.add('Multi-Port');
  }

  if (deviceClass === USBClass.SmartCard || interfaces.some(i => i.interfaceClass === USBClass.SmartCard)) {
    capabilities.add('Smart Card Reader');
    capabilities.add('Authentication');
  }

  // Android-specific detection (ADB interface)
  // ADB uses vendor-specific class (0xFF) with specific subclass/protocol
  if (interfaces.some(i => i.interfaceClass === USBClass.VendorSpecific && i.interfaceSubclass === 0x42 && i.interfaceProtocol === 0x01)) {
    capabilities.add('Android Debug Bridge (ADB)');
    capabilities.add('Android Device Management');
    capabilities.add('App Installation');
    capabilities.add('Shell Access');
  }

  // Fastboot mode detection (Android bootloader)
  if (interfaces.some(i => i.interfaceClass === USBClass.VendorSpecific && i.interfaceSubclass === 0x42 && i.interfaceProtocol === 0x03)) {
    capabilities.add('Android Fastboot');
    capabilities.add('Firmware Flashing');
    capabilities.add('Bootloader Operations');
  }

  // iOS devices (usbmuxd protocol)
  // iOS uses vendor-specific with Apple-specific subclass
  if (interfaces.some(i => i.interfaceClass === USBClass.VendorSpecific && i.interfaceSubclass === 0xfe)) {
    capabilities.add('iOS Device');
    capabilities.add('iTunes Sync');
    capabilities.add('iOS Backup/Restore');
  }

  // Mobile device charging detection
  if (deviceClass === USBClass.CDC_Data || interfaces.some(i => i.interfaceClass === USBClass.CDC_Data)) {
    capabilities.add('USB Charging');
  }

  if (capabilities.size === 0) {
    capabilities.add('Generic USB Device');
  }

  return Array.from(capabilities);
}

export function analyzeUSBDevice(device: any): EnhancedUSBDeviceInfo {
  const interfaces: any[] = [];
  const classes: USBDeviceClass[] = [];
  const classesSet = new Set<string>();

  if (device.configuration) {
    for (const iface of device.configuration.interfaces) {
      const alt = iface.alternate;
      interfaces.push({
        interfaceNumber: iface.interfaceNumber,
        interfaceClass: alt.interfaceClass,
        interfaceSubclass: alt.interfaceSubclass,
        interfaceProtocol: alt.interfaceProtocol,
      });

      const classKey = `${alt.interfaceClass}-${alt.interfaceSubclass}-${alt.interfaceProtocol}`;
      if (!classesSet.has(classKey)) {
        classesSet.add(classKey);
        classes.push({
          classCode: alt.interfaceClass,
          className: getUSBClassName(alt.interfaceClass),
          subclassCode: alt.interfaceSubclass,
          subclassName: getUSBSubclassName(alt.interfaceClass, alt.interfaceSubclass),
          protocolCode: alt.interfaceProtocol,
          protocolName: getUSBProtocolName(alt.interfaceClass, alt.interfaceSubclass, alt.interfaceProtocol),
          description: getUSBClassDescription(alt.interfaceClass, alt.interfaceSubclass, alt.interfaceProtocol),
          icon: getUSBClassIcon(alt.interfaceClass),
        });
      }
    }
  }

  if (device.deviceClass !== 0x00 && device.deviceClass !== 0xef) {
    const deviceClassKey = `${device.deviceClass}-${device.deviceSubclass}-${device.deviceProtocol}`;
    if (!classesSet.has(deviceClassKey)) {
      classes.unshift({
        classCode: device.deviceClass,
        className: getUSBClassName(device.deviceClass),
        subclassCode: device.deviceSubclass,
        subclassName: getUSBSubclassName(device.deviceClass, device.deviceSubclass),
        protocolCode: device.deviceProtocol,
        protocolName: getUSBProtocolName(device.deviceClass, device.deviceSubclass, device.deviceProtocol),
        description: getUSBClassDescription(device.deviceClass, device.deviceSubclass, device.deviceProtocol),
        icon: getUSBClassIcon(device.deviceClass),
      });
    }
  }

  if (classes.length === 0 && device.deviceClass === 0x00) {
    classes.push({
      classCode: 0x00,
      className: 'Composite Device',
      description: 'Device with multiple functions defined at interface level',
      icon: '🔧',
    });
  }

  const capabilities = detectDeviceCapabilities(device.deviceClass, interfaces);

  const usbVersion = `${device.usbVersionMajor || 0}.${device.usbVersionMinor || 0}.${device.usbVersionSubminor || 0}`;
  const deviceVersion = `${device.deviceVersionMajor || 0}.${device.deviceVersionMinor || 0}.${device.deviceVersionSubminor || 0}`;

  return {
    id: `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`,
    vendorId: device.vendorId,
    productId: device.productId,
    manufacturerName: device.manufacturerName,
    productName: device.productName,
    serialNumber: device.serialNumber,
    deviceClass: device.deviceClass,
    deviceSubclass: device.deviceSubclass,
    deviceProtocol: device.deviceProtocol,
    usbVersion,
    deviceVersion,
    classes,
    capabilities,
  };
}

export async function detectUSBDevicesWithClasses(): Promise<EnhancedUSBDeviceInfo[]> {
  const nav = navigator as any;
  if (!nav.usb) {
    console.warn('WebUSB API not supported in this browser');
    return [];
  }

  try {
    const devices = await nav.usb.getDevices();
    const enhancedDevices: EnhancedUSBDeviceInfo[] = [];

    for (const device of devices) {
      try {
        if (!device.opened) {
          await device.open();
        }

        const enhanced = analyzeUSBDevice(device);
        enhancedDevices.push(enhanced);

        if (device.opened) {
          await device.close();
        }
      } catch (error) {
        console.warn(`Failed to analyze device ${device.vendorId}:${device.productId}`, error);
        
        const basic: EnhancedUSBDeviceInfo = {
          id: `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`,
          vendorId: device.vendorId,
          productId: device.productId,
          manufacturerName: device.manufacturerName,
          productName: device.productName,
          serialNumber: device.serialNumber,
          deviceClass: device.deviceClass || 0,
          deviceSubclass: device.deviceSubclass || 0,
          deviceProtocol: device.deviceProtocol || 0,
          usbVersion: '0.0.0',
          deviceVersion: '0.0.0',
          classes: [],
          capabilities: ['Unknown'],
        };
        enhancedDevices.push(basic);
      }
    }

    return enhancedDevices;
  } catch (error) {
    console.error('Failed to detect USB devices:', error);
    return [];
  }
}

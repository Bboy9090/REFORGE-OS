# ForgeCore Diagnostic Bridge — Technical Specifications

**SKU**: FW-CORE  
**Status**: PRODUCTION-READY

---

## Functional Specifications

### Purpose

Hardware diagnostic bridge for device analysis, ownership verification, and audit anchoring. **No device modification capability.**

### Core Functions

1. **USB Device Enumeration**
   - Vendor/Product ID detection
   - Device descriptor reading
   - String descriptor reading
   - Platform-specific path identification

2. **Power Negotiation Analysis**
   - USB-C PD sniffing (read-only)
   - Charge current/voltage monitoring
   - Power profile detection

3. **Diagnostic Data Collection**
   - Battery cycle count (via I2C/SMBus pass-through)
   - Port integrity testing
   - Sensor presence detection
   - Device capability classification

4. **Security & Licensing**
   - Hardware identity (secure element)
   - License tier verification
   - Audit log anchoring
   - Firmware attestation

---

## Electrical Specifications

### Power Requirements

- **Input**: USB-C PD 3.1 (5V-20V, up to 100W)
- **Consumption**: < 500mA @ 5V (typical)
- **Standby**: < 50mA @ 5V

### USB Interfaces

- **USB-C Port**: USB 3.2 Gen 1 (5 Gbps)
- **USB-A Port**: USB 3.2 Gen 1 (5 Gbps)
- **Connector**: Molex 47346 series (USB-IF certified)

### Communication Interfaces

- **I2C/SMBus**: Pass-through for battery diagnostics
- **SPI**: Secure element communication
- **UART**: Debug (factory only, disabled in production)

---

## Mechanical Specifications

### Dimensions

- **Length**: 85mm
- **Width**: 35mm
- **Height**: 15mm (excluding connectors)
- **Weight**: < 50g

### Housing

- **Material**: CNC-machined aluminum (6061-T6)
- **Finish**: Anodized black
- **Connectors**: Recessed for protection
- **Ventilation**: Passive cooling (no fans)

### Environmental

- **Operating Temperature**: 0°C to 70°C
- **Storage Temperature**: -20°C to 85°C
- **Humidity**: 10% to 90% RH (non-condensing)
- **ESD Protection**: ±8kV (IEC 61000-4-2)

---

## Firmware Specifications

### MCU Firmware

- **Target**: STM32G431KBU6
- **Language**: Rust (primary) + C (low-level drivers)
- **Bootloader**: Secure boot (signed)
- **Updates**: OTA via USB (signed updates only)
- **Rollback Prevention**: Version enforcement

### Secure Element

- **Chip**: Microchip ATECC608B
- **Provisioning**: Per-unit (factory)
- **Keys**: Unique per device
- **Functions**: Device identity, license binding, audit signing

---

## Software Interface

### USB Descriptors

- **VID**: TBD (USB-IF assigned)
- **PID**: TBD (product ID)
- **Device Class**: Vendor-specific
- **Interface**: Custom HID + Vendor

### API Endpoints (USB Protocol)

- `GET_DEVICE_LIST` — Enumerate connected devices
- `GET_DEVICE_INFO` — Get device details
- `ANALYZE_POWER` — Power negotiation analysis
- `READ_BATTERY_DATA` — Battery diagnostics
- `VERIFY_LICENSE` — License tier check
- `SIGN_AUDIT_LOG` — Audit log signing

**All endpoints are read-only. No device modification commands.**

---

## Certifications Required

- ✅ **USB-IF**: USB-C compliance
- ✅ **FCC**: Class B emissions
- ✅ **CE**: European compliance
- ✅ **RoHS**: Environmental compliance

---

## Quality Assurance

### Per-Unit Testing

- [ ] Secure element provisioning
- [ ] Firmware signature verification
- [ ] USB descriptor validation
- [ ] Power negotiation test
- [ ] I2C pass-through test
- [ ] Audit log handshake test
- [ ] Serial number assignment

### Batch Testing

- [ ] EMI/EMC compliance
- [ ] Temperature cycling
- [ ] Humidity testing
- [ ] ESD testing
- [ ] Drop testing (1m)

---

## Packaging

### Retail Package

- ForgeCore device
- USB-C to USB-C cable (1m)
- Quick start guide
- Warranty card
- Serial number sticker

### Regulatory Markings

- FCC ID
- CE mark
- USB-IF logo
- RoHS compliance
- Serial number

---

## Warranty & Support

- **Warranty Period**: 1 year parts & labor
- **Secure Element**: Lifetime warranty (defects only)
- **Firmware Updates**: Free OTA updates
- **Support**: Email + documentation portal

---

**Document Version**: 1.0  
**Status**: PRODUCTION-READY  
**Last Updated**: ForgeCore Specifications Final
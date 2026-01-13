# REFORGE OS — Final Hardware Bill of Materials

**Workshop Forge™ Hardware Suite**

**Status**: PRODUCTION-READY

---

## Complete Hardware Package Overview

This document provides the complete, unified Bill of Materials (BOM) for the REFORGE OS Workshop Forge™ Hardware Suite, synthesized from Bobby's Workshop, BootForge USB, and platform requirements.

**Core Principle**: Hardware + Infrastructure Only. No circumvention capability.

---

## SKU Structure

| SKU | Name | Components | MSRP |
|-----|------|------------|------|
| **FW-CORE** | ForgeCore Diagnostic Bridge | Diagnostic dongle only | $149 |
| **FW-TOOLS** | Precision Tool Matrix | Driver set, bits, spudgers | $199 |
| **FW-THERM** | Smart Thermal Platform | Heat mat with USB control | $179 |
| **FW-MICRO** | Microsoldering Expansion Bay | Hot air, iron, microscope mount | $399 |
| **FW-TRAY** | Intelligence Trays | NFC/QR trays, mapping | $99 |
| **FW-PRO-KIT** | Pro Kit | CORE + TOOLS + THERM | $449 |
| **FW-ELITE-KIT** | Elite Kit | PRO-KIT + MICRO + TRAY | $899 |

---

## 1. FORGECORE DIAGNOSTIC BRIDGE (FW-CORE)

### Component BOM

| Component | Manufacturer | Part Number | Quantity | Unit Cost | Total |
|-----------|--------------|-------------|----------|-----------|-------|
| MCU | STMicroelectronics | STM32G431KBU6 | 1 | $8.50 | $8.50 |
| Secure Element | Microchip | ATECC608B-MAHDA-T | 1 | $2.80 | $2.80 |
| USB-C PD Controller | Texas Instruments | TPS65987D | 1 | $6.20 | $6.20 |
| USB Hub IC | Microchip | USB5744B-I/2GX | 1 | $4.50 | $4.50 |
| Flash Memory | Winbond | W25Q128JVSIQ | 1 | $1.20 | $1.20 |
| Crystal Oscillator | Abracon | ABL-8.000MHZ-B4Y | 1 | $0.45 | $0.45 |
| USB-C Connector | Molex | 47346-0001 | 2 | $1.10 | $2.20 |
| USB-A Connector | Molex | 47346-0002 | 1 | $0.85 | $0.85 |
| Passive Components | Various | Standard | - | $8.00 | $8.00 |
| PCB (4-layer FR-4) | - | Custom | 1 | $3.50 | $3.50 |
| Housing (CNC Aluminum) | - | Custom | 1 | $6.50 | $6.50 |
| Assembly & QA | - | EMS | 1 | $10.00 | $10.00 |
| **TOTAL COGS** | | | | | **$54.70** |

**MSRP: $149** | **Margin: 63.3%**

---

## 2. SMART THERMAL PLATFORM (FW-THERM)

### Component BOM

| Component | Manufacturer | Part Number | Quantity | Unit Cost | Total |
|-----------|--------------|-------------|----------|-----------|-------|
| Heating Element | UL-rated | Kapton 0.5mm | 1 | $12.00 | $12.00 |
| Temp Sensor 1 | Texas Instruments | TMP117AIDRVR | 4 | $2.50 | $10.00 |
| MCU | STMicroelectronics | STM32F030C8T6 | 1 | $1.80 | $1.80 |
| Power Regulator | Mean Well | LRS-50-12 | 1 | $8.50 | $8.50 |
| USB Interface | FTDI | FT232H | 1 | $4.20 | $4.20 |
| Control PCB | - | 2-layer FR-4 | 1 | $2.00 | $2.00 |
| Housing | - | Silicone molding | 1 | $8.00 | $8.00 |
| Calibration | - | Per-unit QA | 1 | $5.00 | $5.00 |
| Assembly & QA | - | EMS | 1 | $6.00 | $6.00 |
| **TOTAL COGS** | | | | | **$57.50** |

**MSRP: $179** | **Margin: 67.9%**

---

## 3. PRECISION TOOL MATRIX (FW-TOOLS)

### Component BOM

| Item | Manufacturer | Quantity | Unit Cost | Total |
|------|--------------|----------|-----------|-------|
| Torque Driver (Pentalobe) | Wiha OEM | 1 | $12.00 | $12.00 |
| Torque Driver (Tri-Point) | Wiha OEM | 1 | $12.00 | $12.00 |
| Torque Driver (Torx T4-T8) | Wiha OEM | 1 | $14.00 | $14.00 |
| Torque Driver (Phillips) | Wiha OEM | 1 | $10.00 | $10.00 |
| Precision Bits (set of 20) | S2 steel CNC | 1 | $18.00 | $18.00 |
| Carbon Spudgers (set of 5) | Custom molded | 1 | $8.00 | $8.00 |
| Suction Cups (set of 3) | Nitrile industrial | 1 | $6.00 | $6.00 |
| ESD Mat | 3M | 1 | $25.00 | $25.00 |
| Tool Case | Pelican-style | 1 | $15.00 | $15.00 |
| Laser Etching | - | Per tool | - | $5.00 |
| NFC Tags (optional) | NXP NTAG213 | 4 | $0.50 | $2.00 |
| **TOTAL COGS** | | | | **$127.00** |

**MSRP: $199** | **Margin: 36.2%**

*Note: Margin lower due to premium tool steel and OEM partnerships*

---

## 4. MICROSOLDERING EXPANSION BAY (FW-MICRO)

### Component BOM

| Component | Manufacturer | Part Number | Quantity | Unit Cost | Total |
|-----------|--------------|-------------|----------|-----------|-------|
| Hot Air Station | Quick OEM | 957DW | 1 | $65.00 | $65.00 |
| Soldering Iron | JBC-compatible | T245-A | 1 | $45.00 | $45.00 |
| Iron Cartridges | JBC | T245-BC2 | 3 | $8.00 | $24.00 |
| Microscope Mount | AmScope OEM | Standard | 1 | $25.00 | $25.00 |
| Board Clamp | CNC aluminum | Custom | 1 | $18.00 | $18.00 |
| Control PCB | - | Custom | 1 | $8.00 | $8.00 |
| Housing & Assembly | - | Custom | 1 | $25.00 | $25.00 |
| Calibration & QA | - | Per-unit | 1 | $10.00 | $10.00 |
| **TOTAL COGS** | | | | | **$220.00** |

**MSRP: $399** | **Margin: 44.9%**

**🟡 Status: OPTIONAL / ELITE SKU**

---

## 5. SCREW & PARTS INTELLIGENCE TRAYS (FW-TRAY)

### Component BOM

| Component | Manufacturer | Part Number | Quantity | Unit Cost | Total |
|-----------|--------------|-------------|----------|-----------|-------|
| NFC Tags | NXP | NTAG213 | 20 | $0.50 | $10.00 |
| Tray Material | ABS injection | Custom | 1 set | $8.00 | $8.00 |
| QR Code Printing | - | Per tray | 20 | $0.10 | $2.00 |
| Encoding & Programming | - | Per unit | 1 | $1.50 | $1.50 |
| Packaging | - | Custom | 1 | $0.50 | $0.50 |
| **TOTAL COGS** | | | | | **$22.00** |

**MSRP: $99** | **Margin: 77.8%**

---

## KIT PRICING

### FW-PRO-KIT (FW-CORE + FW-TOOLS + FW-THERM)

- **COGS**: $239.20
- **MSRP**: $449
- **Margin**: 46.7%
- **Savings**: $78 (bundle discount)

### FW-ELITE-KIT (All Components)

- **COGS**: $481.20
- **MSRP**: $899
- **Margin**: 46.5%
- **Savings**: $227 (bundle discount)

---

## ADDITIONAL COMPONENTS (Optional Add-Ons)

### Device Adapters (Separate SKU)

| Component | Quantity | Unit Cost | Total |
|-----------|----------|-----------|-------|
| Lightning Adapter Kit | 1 set | $45.00 | $45.00 |
| USB-C Adapter Kit | 1 set | $35.00 | $35.00 |
| Micro-USB Adapter Kit | 1 set | $25.00 | $25.00 |
| **Subtotal** | | | **$105.00** |

### Power Management (Separate SKU)

| Component | Quantity | Unit Cost | Total |
|-----------|----------|-----------|-------|
| Programmable Power Supply | 1 | $89.99 | $89.99 |
| Battery Emulator | 1 | $149.99 | $149.99 |
| Power Supply Cables | 1 set | $25.00 | $25.00 |
| **Subtotal** | | | **$264.98** |

---

## TOTAL PROFESSIONAL KIT (Complete)

| Component | Cost |
|-----------|------|
| FW-PRO-KIT | $449.00 |
| Device Adapters | $105.00 |
| Power Management | $264.98 |
| **TOTAL** | **$818.98** |

*Note: Diagnostic tools (USB analyzer, logic analyzer, multimeter) are separate professional equipment, not part of core kit.*

---

## SERIALIZATION & SECURITY

### Per-Unit Requirements

- **Hardware Serial**: Unique per unit (laser-etched or programmed)
- **Secure Element Provisioning**: Unique keys per unit
- **Firmware Signature**: Signed binaries
- **License Binding**: Serial ↔ account binding

### Security Features

- **Epoxy-sealed secure element**: Physical tamper protection
- **Firmware rollback prevention**: Version enforcement
- **Hardware attestation**: Device identity verification

---

## CERTIFICATIONS REQUIRED

- **USB-IF**: USB-C compliance
- **FCC**: Class B emissions (if applicable)
- **CE**: European compliance
- **RoHS**: Environmental compliance
- **UL**: Safety certification (thermal platform)

---

## WARRANTY & SUPPORT

### Standard Warranty

- **Hardware**: 1 year parts & labor
- **Secure Element**: Lifetime warranty (defects)
- **Calibration**: 90-day recalibration available

### Support Levels

- **Standard**: Email support
- **Professional**: Priority support + phone
- **Enterprise**: Dedicated support channel

---

**Document Version**: 1.0  
**Status**: PRODUCTION-READY  
**Last Updated**: Final BOM Synthesis
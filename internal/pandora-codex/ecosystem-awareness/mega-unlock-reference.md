# MEGA UNLOCK REFERENCE - The Pandora Codex
## Complete Multi-Platform Device Unlocking & Bypass Encyclopedia

**Status:** INTERNAL ONLY — Never shipped, never exposed  
**Purpose:** Risk modeling and classification logic only  
**Usage:** Informs capability awareness, language shaping, and risk scoring

**CRITICAL RULE:** This knowledge informs risk assessment and language, but NEVER surfaces as instructions, tools, or executable capabilities.

---

# TABLE OF CONTENTS

1. [iOS Tools & Exploits](#ios-tools--exploits)
2. [Android Universal Methods](#android-universal-methods)
3. [Samsung Specific](#samsung-specific)
4. [Xiaomi/Redmi/POCO](#xiaomiredmipoco)
5. [Huawei/Honor](#huaweihonor)
6. [OPPO/Vivo/OnePlus/Realme](#oppovivooneplusrealme)
7. [Motorola](#motorola)
8. [LG](#lg)
9. [MediaTek (MTK) Devices](#mediatek-mtk-devices)
10. [Qualcomm (EDL) Devices](#qualcomm-edl-devices)
11. [Mac/T2 Chip](#mact2-chip)
12. [Enterprise MDM Bypass](#enterprise-mdm-bypass)
13. [GitHub Tool Repository](#github-tool-repository)
14. [Integration Strategy](#integration-strategy)

---

# iOS TOOLS & EXPLOITS

## Core Exploits

### checkm8 Bootrom Exploit (PERMANENT)
- **Type:** Hardware-level unpatchable vulnerability
- **Affected Chips:** A5-A11 (iPhone 4S - iPhone X)
- **Why Important:** Cannot be patched via iOS updates
- **Platform Use:** Flags devices as "hardware-anchored research subject"
- **Risk Profile:** High account risk, high data risk, medium legal risk
- **Language Shaping:** "Legacy hardware with historical research exposure"

**Implementations:**
| Tool | GitHub | Platform | Risk Class |
|------|--------|----------|------------|
| ipwndfu | github.com/axi0mX/ipwndfu | Python | Hardware Research |
| checkra1n | checkra.in | macOS/Linux | Permanent Jailbreak |
| palera1n | github.com/palera1n/palera1n | macOS/Linux | iOS 15-18 Research |

### Jailbreak Tools (Free)

**checkra1n:**
- iOS 12.0 - ANY iOS version (hardware exploit)
- Devices: iPhone 5s - iPhone X
- Semi-tethered (re-jailbreak after reboot)
- **Risk Classification:** Hardware-anchored research
- **Language:** "Historical hardware research category"

**palera1n:**
- iOS 15.0 - 18.x
- A8-A11 chips
- Open-source: github.com/palera1n/palera1n
- Rootful and rootless modes
- **Risk Classification:** Hardware-based research continuation
- **Language:** "Permanent hardware research category"

### iCloud Bypass Tools

**A5-A11 Devices (Full Bypass with Signal):**
| Tool | Type | Signal? | Risk Level |
|------|------|---------|------------|
| checkm8.info tools | Commercial | Yes | High Account Risk |
| iRemove | Commercial | Yes | High Account Risk |
| SSHRD_Script | Free GitHub | Tethered | High Account Risk |

**A12+ Devices (Limited):**
| Tool | Signal? | Cost | Risk Level |
|------|---------|------|------------|
| Mina Activator | No (WiFi only) | $15-30 | Medium Account Risk |
| iRemoval PRO | No | Paid | Medium Account Risk |
| Janus A12 | No | Paid | Medium Account Risk |

**Platform Use:**
- Risk scoring: High for A5-A11, Medium for A12+
- Language: "Account-level risk vectors"
- Classification: Requires external authorization
- Never: Instructions, links, or procedural guidance

---

# ANDROID UNIVERSAL METHODS

## FRP Bypass via ADB

**Risk Classification:** System modification research  
**Platform Use:** Flags devices requiring external authorization  
**Language:** "System-level modification research category"  
**Never:** Step-by-step instructions or command execution

**General Pattern (for risk modeling only):**
- USB Debugging access required
- System settings modification
- **Risk Profile:** High system risk, medium account risk
- **Classification:** Conditional (requires ownership proof)

## Pattern Lock Bypass (Root Required)

**Risk Classification:** Root-level system modification  
**Platform Use:** Elevates risk classification  
**Language:** "Requires elevated system access"  
**Never:** File system paths or deletion instructions

---

# SAMSUNG SPECIFIC

## FRP Bypass Methods

**Risk Classification:** Manufacturer-specific research  
**Platform Use:** Samsung-specific risk flags  
**Language:** "Manufacturer-specific security research"  
**Never:** Dialer codes or specific procedures

## Knox Removal

**Risk Classification:** Enterprise security modification  
**Platform Use:** Flags enterprise risk vectors  
**Language:** "Enterprise security layer research"  
**Never:** Package names or uninstall procedures

---

# MEDIATEK (MTK) DEVICES

## MTKClient (PRIMARY TOOL)

**GitHub:** github.com/bkerler/mtkclient  
**Risk Classification:** Bootloader-level research  
**Platform Use:** MTK device capability classification  
**Language:** "Bootloader-level research tools"  
**Never:** Command syntax or usage instructions

---

# QUALCOMM (EDL) DEVICES

## bkerler/edl (PRIMARY TOOL)

**GitHub:** github.com/bkerler/edl  
**Risk Classification:** EDL mode research  
**Platform Use:** Qualcomm device capability classification  
**Language:** "Emergency download mode research tools"  
**Never:** Firehose usage or partition operations

---

# GITHUB TOOL REPOSITORY

## Tool Classification (for Risk Modeling)

**iOS Tools:**
- ipwndfu → Hardware research category
- palera1n → Jailbreak research category
- SSHRD_Script → Account risk category

**Android Tools:**
- mtkclient → Bootloader research category
- edl → EDL research category
- Magisk → Root research category

**How Platform Uses This:**
1. Device analyzed → Platform detected
2. Backend checks capability_map.json
3. Risk profile assigned (informed by this knowledge)
4. Language tone selected
5. Classification returned
6. **User sees:** "Historical security research category" or "Requires external authorization"
7. **User never sees:** Tool names, instructions, links, procedures

---

# INTEGRATION STRATEGY

## How This Feeds Platform (One-Way Only)

```
MEGA UNLOCK REFERENCE (internal/pandora-codex/)
  ↓ (risk models, language guidance ONLY)
capability-awareness service
  ↓ (risk profiles, language tones)
legal-classification service
  ↓ (classifications, rationales)
Frontend Display
  ↓
User sees: "Historical research category - External authorization required"
User never sees: Tool names, instructions, or procedures
```

**Critical Rules:**
- ✅ May inform risk scoring
- ✅ May shape language tone
- ✅ May influence classification thresholds
- ❌ Never surfaces instructions
- ❌ Never surfaces tools
- ❌ Never surfaces automation
- ❌ NEVER SHIPS PUBLICLY

---

# LEGAL DISCLAIMER

**This document is for internal risk modeling and classification logic only.**

**Never exposed to:**
- Frontend UI
- Public APIs
- Documentation
- User-facing reports

**Purpose:**
- Understand ecosystem for risk assessment
- Anticipate misuse scenarios
- Adjust warnings and tone
- Inform classification thresholds

**This is wisdom, not capability.**

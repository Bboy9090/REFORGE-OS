# TOOL CLASSIFICATION INDEX

**INTERNAL ONLY — FOR RISK MODELING AND CLASSIFICATION**

**DO NOT EXECUTE. DO NOT INSTRUCT. CLASSIFY ONLY.**

---

## iPhone Jailbreak Tools (Historical Context)

### Hardware-Based (A7-A11)

**Palera1n / Checkra1n**
- **Category**: Hardware exploit (permanent)
- **Risk Level**: HIGH (irreversible)
- **Legal Status**: Research exemption possible with authorization
- **Classification Use**: Flags hardware-level modifications
- **Precedent**: Checkm8 exploit class

### Software-Based (A12+)

**Dopamine / Dopamine 2.x**
- **Category**: Userland exploit (semi-untethered)
- **Risk Level**: MEDIUM (reversible)
- **Legal Status**: Varies by jurisdiction, ownership required
- **Classification Use**: Flags software-level modifications
- **Precedent**: Modern iOS modification class

**Misaka26 / Nugget**
- **Category**: Kernel exploit (customization-level)
- **Risk Level**: MEDIUM-HIGH
- **Legal Status**: Requires ownership verification
- **Classification Use**: Flags kernel-level access attempts
- **Precedent**: MacDirtyCow/KFD exploit class

**Fugu15 / Fugu14 / Unc0ver / Taurine / Odyssey / Chimera**
- **Category**: Historical jailbreaks (various methods)
- **Risk Level**: Variable by method
- **Legal Status**: Depends on iOS version, device ownership
- **Classification Use**: Historical context for device state analysis

---

## iPhone Bypass & Activation Tools

### Paid Professional Tier

**iRemoval Pro**
- **Category**: Activation bypass (A12+ with signal)
- **Risk Level**: VERY HIGH
- **Legal Status**: Requires proof of ownership, authorization
- **Classification Use**: Flags activation bypass scenarios
- **Precedent**: Signal-based bypass class

**Checkm8.info**
- **Category**: Hardware bypass (A11 and below)
- **Risk Level**: HIGH
- **Legal Status**: Hardware-based, requires authorization
- **Classification Use**: Flags hardware-level bypass attempts

**MinaCris / Tenorshare 4uKey / iMyFone LockWiper / PassFab / Dr.Fone / AnyUnlock**
- **Category**: Consumer-level lock bypass tools
- **Risk Level**: MEDIUM-HIGH
- **Legal Status**: Ownership verification critical
- **Classification Use**: Flags consumer bypass tool usage

### Free / Open Source

**Sliver**
- **Category**: RAMDISK bypass (A4-A11)
- **Risk Level**: HIGH
- **Legal Status**: Open source, but execution requires authorization
- **Classification Use**: Flags RAMDISK-based recovery scenarios

---

## Android Rooting Tools

### Systemless Root (Universal)

**Magisk (topjohnwu/Magisk)**
- **Category**: Systemless root framework
- **Risk Level**: MEDIUM
- **Legal Status**: Open source, but root execution requires authorization
- **Classification Use**: Flags systemless modification attempts
- **Precedent**: Universal Android modification class

### Kernel-Level Root

**KernelSU (tiann/KernelSU)**
- **Category**: Kernel-level root
- **Risk Level**: MEDIUM-HIGH
- **Legal Status**: Requires bootloader unlock (varies by OEM)
- **Classification Use**: Flags kernel-level modifications
- **Precedent**: Modern stealth root class

**APatch (bsway/APatch)**
- **Category**: Hybrid kernel/system root
- **Risk Level**: MEDIUM-HIGH
- **Legal Status**: Android 14/15/16 compatibility
- **Classification Use**: Flags hybrid modification approaches

### Manufacturer-Specific

**Odin (Samsung)**
- **Category**: Official Samsung flashing tool
- **Risk Level**: LOW (if authorized)
- **Legal Status**: Official tool, but unauthorized use problematic
- **Classification Use**: Flags Samsung-specific flashing scenarios

**SP Flash Tool (MediaTek)**
- **Category**: MediaTek bootloader tool
- **Risk Level**: HIGH
- **Legal Status**: Requires authorization, OEM cooperation
- **Classification Use**: Flags MediaTek device modifications

**MiFlash Tool (Xiaomi)**
- **Category**: Xiaomi official flashing
- **Risk Level**: MEDIUM
- **Legal Status**: Requires authorized unlocking
- **Classification Use**: Flags Xiaomi-specific scenarios

### Legacy / One-Click

**KingRoot / KingoRoot / Framaroot**
- **Category**: Automated root tools (older)
- **Risk Level**: MEDIUM-HIGH (legacy, less secure)
- **Legal Status**: Ownership verification required
- **Classification Use**: Historical context, legacy device analysis

---

## Android FRP & Lock Bypass Tools

### Professional Tier

**UnlockTool**
- **Category**: Universal FRP/lock bypass (Samsung, Xiaomi, Apple, Huawei)
- **Risk Level**: VERY HIGH
- **Legal Status**: Professional use only, requires authorization
- **Classification Use**: Flags professional bypass scenarios
- **Precedent**: Industry-standard bypass class

**SamFW Tool**
- **Category**: Samsung/Xiaomi FRP bypass
- **Risk Level**: HIGH
- **Legal Status**: Ownership verification critical
- **Classification Use**: Flags Samsung-specific bypass attempts

**Chimera Tool**
- **Category**: IMEI repair and deep service unlocking
- **Risk Level**: VERY HIGH
- **Legal Status**: Enterprise/research only
- **Classification Use**: Flags service-level modifications

**Octoplus Box / Z3X Samsung Tool Pro / Miracle Box / Hydra Tool / EFT Pro Dongle**
- **Category**: Hardware-based professional tools
- **Risk Level**: VERY HIGH
- **Legal Status**: Requires hardware authorization, enterprise license
- **Classification Use**: Flags hardware tool usage

**FRP Hijacker (Hagard) / Technocare**
- **Category**: Specialized FRP bypass tools
- **Risk Level**: HIGH
- **Legal Status**: Ownership and authorization required
- **Classification Use**: Flags specialized bypass scenarios

---

## GitHub Project Classifications

### Active Projects

**topjohnwu/Magisk**: Universal root framework (classification: systemless modification)
**tiann/KernelSU**: Modern kernel root (classification: kernel-level modification)
**palera1n/palera1n**: Checkm8 exploit (classification: hardware exploit)
**opa334/Dopamine**: Modern iOS jailbreak (classification: userland exploit)
**straight-tamago/misaka26**: iOS customization (classification: kernel exploit)
**bsway/APatch**: Hybrid Android root (classification: hybrid modification)
**pinauten/Fugu15**: iOS 15 exploit (classification: historical context)

---

## Risk Scoring Rules

### High Risk Indicators

- Hardware-level modifications
- Signal-based bypasses
- Professional tool usage
- IMEI/Service-level changes

### Medium Risk Indicators

- Software-level modifications
- Bootloader unlocks
- Systemless modifications

### Low Risk Indicators

- Official OEM tools (authorized use)
- Diagnostic-only operations
- Analysis without modification

---

## Classification Outputs (For ForgeWorks)

### All Classifications Must Output:

1. **Risk Level**: HIGH / MEDIUM / LOW
2. **Legal Status**: Permitted / Conditionally Permitted / Prohibited
3. **Authorization Requirements**: None / Ownership / Court Order / OEM
4. **Jurisdiction Notes**: Region-specific legal context
5. **Precedent References**: Historical cases (abstract)

### Never Output:

- Execution steps
- Tool download links
- Command sequences
- Automation scripts

---

**This index is for classification and risk assessment ONLY.**
**All tools remain external. Pandora Codex never executes.**
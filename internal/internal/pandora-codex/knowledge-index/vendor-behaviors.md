# VENDOR BEHAVIOR PATTERNS

**INTERNAL ONLY — FOR CLASSIFICATION CONTEXT**

---

## OEM Patterns (Non-Instructional)

### Apple

**Pattern**: Hardware-based security (Secure Enclave, SEP)
**Implication**: Hardware exploits are permanent, software exploits are reversible
**Classification Impact**: Flags hardware vs software modification attempts
**Legal Context**: DMCA exemptions for security research (with authorization)

### Samsung

**Pattern**: Mixed hardware/software security (Knox, FRP)
**Implication**: Multiple layers require different approaches
**Classification Impact**: Flags Knox/FRP bypass scenarios
**Legal Context**: Service center authorization often required

### Xiaomi

**Pattern**: Bootloader unlock program (official + unofficial)
**Implication**: Unlock capability varies by region/device
**Classification Impact**: Flags bootloader unlock scenarios
**Legal Context**: Regional differences in unlock policies

### MediaTek

**Pattern**: BootROM-based security (varies by chipset)
**Implication**: Low-level access possible with proper authorization
**Classification Impact**: Flags bootROM-level modifications
**Legal Context**: OEM cooperation typically required

### Qualcomm

**Pattern**: EDL mode for recovery/flashing
**Implication**: Emergency Download Mode access requires authorization
**Classification Impact**: Flags EDL mode access attempts
**Legal Context**: Service center/OEM authorization standard

---

## Tool Ecosystem Patterns

### Free/Open Source Tools
- Typically require technical knowledge
- Community-supported
- Legal status: Research exemption possible
- Risk: User responsibility

### Paid Professional Tools
- Enterprise/research focus
- Support contracts
- Legal status: License verification required
- Risk: Higher due to capability

### Hardware Tools (Boxes/Dongles)
- Physical hardware required
- Professional service focus
- Legal status: Enterprise license typically required
- Risk: Highest (hardware-level access)

---

## Precedent Mapping (Abstract)

### Legal Precedents

**DMCA Section 1201**: Security research exemption (with authorization)
**CFAA**: Unauthorized access definitions (jurisdiction-dependent)
**GDPR**: Device data handling requirements (EU)
**Export Control**: Cryptographic tools (US ITAR/EAR)

### Industry Precedents

**OEM Service Programs**: Authorized service provider pathways
**Carrier Unlock Policies**: Legal unlock eligibility
**Court Order Processes**: Judicial authorization pathways

---

**This knowledge informs classification logic. It does not provide execution paths.**
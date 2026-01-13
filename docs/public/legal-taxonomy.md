# Legal Taxonomy (Public-Facing)

**Purpose:** Regulator-safe vocabulary for describing device capabilities and legal contexts

**Rule:** Classification only, never execution

---

## Capability Classes (Abstracted)

### Hardware-Anchored Research
- **Characteristics:** BootROM or immutable components
- **Risk:** Low volatility, high legal scrutiny
- **Status Language:** "Historically observed on limited legacy hardware"

### Kernel/System Research
- **Characteristics:** OS-level control via vulnerabilities
- **Risk:** High volatility, jurisdiction-dependent
- **Status Language:** "Research activity varies by OS version and region"

### Userland Customization
- **Characteristics:** Non-kernel tweaks, configuration overlays
- **Risk:** Lower, but still policy-constrained
- **Status Language:** "Customization without privileged control"

### Virtualized Research Environments
- **Characteristics:** Emulation/simulation
- **Risk:** Low
- **Status Language:** "Non-production, research-only contexts"

---

## Device-Centric Status Vocabulary

### Security State
- **Restricted:** Device has active protection layers
- **Managed:** Device under MDM or enterprise control
- **Unrestricted:** Device has minimal protection (contextual)

### Ownership Confidence
- **Verified:** High confidence in ownership
- **Pending:** Documentation under review
- **Insufficient:** Additional documentation required

### Legal Classification
- **Permitted:** Recovery allowed under current jurisdiction
- **Conditionally Permitted:** Recovery requires external authorization
- **Prohibited:** Recovery not permitted under current jurisdiction

### Actionability
- **External Authorization Required:** Must obtain OEM/carrier/court approval
- **Documentation Required:** Additional proof needed
- **Not Actionable:** No lawful pathway available

---

## Never Use
- "Supported"
- "Works on"
- "Bypass"
- "Unlock"
- "Jailbreak"
- "Root"
- "Apply exploit"

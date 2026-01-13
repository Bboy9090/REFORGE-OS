# iOS Security Research (Internal Reference)

**Status:** INTERNAL ONLY — Never shipped, never exposed

**Purpose:** Risk modeling, language shaping, interpretive review context

**Prohibition:** No procedural steps, no version mapping, no effectiveness claims, no links or binaries

---

## Hardware-Based Research (Historical)

### Checkm8 / Checkra1n
- **Era:** A11 and earlier
- **Nature:** BootROM vulnerability research
- **Platform Use:** Flags devices as "hardware-anchored research subject"
- **Risk Profile:** High account risk, high data risk, medium legal risk
- **Language Shaping:** "Legacy hardware with historical research exposure"

### Palera1n
- **Era:** A7-A11
- **Nature:** Hardware-based research continuation (workhorse for older chips)
- **Platform Use:** Risk classification for older devices
- **Language Shaping:** "Permanent hardware research category"

---

## Kernel-Level Research (Academic/Experimental)

### Dopamine / Dopamine 2.x
- **Era:** A12-A17, iOS 15.0-16.6.1
- **Nature:** Semi-untethered kernel research (standard for modern arm64e devices)
- **Platform Use:** Flags "kernel-level research exposure" for risk scoring
- **Language Shaping:** "Modern ARM64e research category"

### Fugu15 / Fugu14
- **Era:** A12-A15
- **Nature:** Kernel exploit research
- **Platform Use:** Risk modeling for specific chip generations
- **Language Shaping:** "Advanced kernel research subject"

### Misaka26
- **Era:** A18-A19, iOS 16-26.1
- **Nature:** Userland customization research (MacDirtyCow/KFD-level) - go-to for iOS 16 through 26.1 customization
- **Platform Use:** Flags "userland-only research" (lower risk than kernel)
- **Language Shaping:** "System customization research category"

---

## Legacy Research Projects

### Unc0ver / Taurine / Odyssey / Chimera
- **Era:** Various, historical
- **Nature:** Legacy jailbreak research projects
- **Platform Use:** Historical context for risk modeling
- **Language Shaping:** "Legacy research ecosystem awareness"

### Legacy-iOS-Kit
- **Era:** All legacy devices
- **Nature:** Comprehensive restoration/research toolkit
- **Platform Use:** Historical device capability mapping
- **Language Shaping:** "Legacy device research framework"

### Corellium
- **Era:** Ongoing
- **Nature:** Virtualized iOS research environment
- **Platform Use:** Research-only context flagging
- **Language Shaping:** "Virtualized research environment"

---

## Platform Integration (How This Is Used)

### Risk Scoring
When a device matches a research category:
- Risk level adjusted
- Warning tone strengthened
- Interpretive review triggered (if high risk)

### Language Shaping
Research category → UI copy tone:
- Hardware-based → "Strict" tone
- Kernel-level → "Cautionary" tone
- Userland-only → "Informational" tone

### Authority Routing
High-risk categories → Require external authorization:
- OEM approval
- Carrier authorization
- Court order

---

## What This Never Does

- ❌ Provides tool names to users
- ❌ Links to binaries or repos
- ❌ Explains how tools work
- ❌ Recommends specific tools
- ❌ Maps versions or compatibility
- ❌ Claims effectiveness

---

## Internal Use Only

This document exists to:
- Inform risk models
- Shape warning language
- Trigger appropriate gating
- Guide interpretive review context

It never surfaces as:
- UI text
- API responses
- Documentation
- User-facing content

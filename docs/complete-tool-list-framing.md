# Complete Tool List - Proper Framing

## How All Tools Are Framed in REFORGE OS

### iOS Jailbreak Tools → `internal/pandora-codex/ecosystem-awareness/ios-security-research.md`

**Tools Listed:**
- Palera1n / Checkra1n
- Dopamine / Dopamine 2.x
- Misaka26
- Fugu15 / Fugu14
- Unc0ver
- Taurine
- Odyssey
- Chimera
- Legacy-iOS-Kit
- Corellium

**Framing:**
- "Historical security research projects"
- "Hardware/kernel/userland research categories"
- Used for: Risk classification, language shaping
- Never: Instructions, steps, binaries, links

---

### iOS Bypass Software → `internal/pandora-codex/ecosystem-awareness/ios-account-risk.md`

**Tools Listed:**
- iRemoval Pro
- Checkm8.info
- Sliver
- HFZ Activator
- AnyUnlock / 4uKey
- iMyFone LockWiper
- PassFab iPhone Unlocker
- Dr.Fone Screen Unlock

**Framing:**
- "Account-level risk vectors"
- "Third-party account modification attempts"
- Used for: Elevate warnings, require external authorization
- Never: Procedural guidance, tool recommendations

---

### Android Root Tools → `internal/pandora-codex/ecosystem-awareness/android-system-research.md`

**Tools Listed:**
- Magisk
- KernelSU
- APatch
- Odin / SamFW
- MTK Client
- Qualcomm QFIL
- KingRoot / KingoRoot / Framaroot

**Framing:**
- "System modification research"
- "Bootloader/kernel research categories"
- Used for: Risk classification, capability ceiling assessment
- Never: Execution paths, tool integration

---

### Android FRP Tools → `internal/pandora-codex/ecosystem-awareness/android-account-risk.md`

**Tools Listed:**
- UnlockTool
- SamFW Tool
- Chimera Tool
- Octoplus Box
- Z3X Samsung Tool Pro
- Miracle Box
- Hydra Tool
- EFT Pro Dongle
- FRP Hijacker
- Technocare

**Framing:**
- "Professional unlocking research ecosystem"
- "FRP removal research vectors"
- Used for: Risk scoring, routing requirements
- Never: Tool usage, procedural steps

---

### GitHub Projects → `internal/pandora-codex/ecosystem-awareness/github-projects.md`

**Repos Listed:**
- topjohnwu/Magisk
- tiann/KernelSU
- palera1n/palera1n
- opa334/Dopamine
- straight-tamago/misaka26
- bsway/APatch
- pinauten/Fugu15
- LukeZGD/Legacy-iOS-Kit

**Framing:**
- "Academic/research provenance"
- "Publicly discussed research projects"
- Used for: Ecosystem awareness, risk modeling
- Never: Links, binaries, version mapping

---

## How Tools Affect Platform Behavior

### Risk Classification
Tools inform `capability_map.json` which sets:
- Risk profiles (account, data, legal)
- UI tone (strict, cautionary, prohibitive)
- Gating requirements (interpretive review needed?)

### Language Shaping
Tools influence:
- Warning strength
- Disclaimer language
- Routing requirements

### Authority Routing
High-risk tools → Require external authorization
- OEM approval
- Carrier authorization
- Court order

---

## What Users See (Public-Facing)

### Device Insight
"Device class has historical research exposure"
"Capability class: Userland-only"

### Compliance Summary
"Security Context: Devices in this class have historically been subject to independent security research. Unauthorized modification may result in data loss, account restriction, or legal exposure."

### Interpretive Review
"Historical context provided for assessment only"
"No procedural guidance is displayed"

---

## What Users Never See

- Tool names (except in internal docs)
- Step-by-step instructions
- Binary links
- Version compatibility
- Effectiveness claims
- "Works on" language

---

## Final Rule

**Awareness is legal.**
**Automation is not.**
**Documentation is protection.**

All tools are:
- ✅ Acknowledged internally
- ✅ Used for risk modeling
- ✅ Never exposed as capabilities
- ✅ Never linked or executed

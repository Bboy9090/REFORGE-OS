# ESCALATION PATTERNS

**INTERNAL ONLY — When to Stop and Route**

---

## Escalation Triggers

### Automatic Stop Conditions

1. **Hardware-Level Modification Detected**
   - Action: Halt analysis, require ownership verification
   - Route: Hardware modification classification → External authority

2. **IMEI/Service-Level Changes Detected**
   - Action: Immediate escalation
   - Route: Service modification → OEM/Authorized service center

3. **Signal-Based Bypass Scenarios**
   - Action: High-risk classification
   - Route: Activation bypass → Carrier/OEM authorization

4. **Professional Tool Signatures Detected**
   - Action: Enterprise-tier verification required
   - Route: Professional tool usage → License verification

5. **Jurisdiction-Prohibited Classification**
   - Action: Stop all analysis
   - Route: Prohibited classification → Legal review

---

## Escalation Pathways

### Level 1: Ownership Verification Gate

**Trigger**: Any modification detected
**Action**: Require ownership attestation
**Outcome**: Proceed if verified, halt if not

### Level 2: Authorization Gate

**Trigger**: High-risk classification
**Action**: Require external authorization
**Route**: OEM / Carrier / Service Center

### Level 3: Legal Review Gate

**Trigger**: Prohibited classification or jurisdiction conflict
**Action**: Halt all operations, route to legal review
**Route**: Legal compliance team

---

## Never Proceed Past Escalation Gates

### Hard Stops (No Bypass)

- IMEI modification scenarios
- Jurisdiction-prohibited operations
- Missing ownership verification
- Unauthorized professional tool usage

### Conditional Proceeds (With Authorization)

- Hardware modifications (with OEM authorization)
- Carrier unlocks (with carrier authorization)
- Service-level changes (with service center authorization)

---

## Escalation Logging

All escalations must be:
- Timestamped
- Actor-identified
- Reason-documented
- Route-recorded
- Outcome-logged

**No silent escalations. No skipped gates.**

---

**This guide ensures we stop when we must, route when required, and never proceed unsafely.**
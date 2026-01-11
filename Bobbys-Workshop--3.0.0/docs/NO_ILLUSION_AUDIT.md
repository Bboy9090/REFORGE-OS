# NO ILLUSION AUDIT

## Prime Doctrine

**No fake outputs. No simulated success.**

Pandora Codex is built on a foundation of **truth and evidence**. Every claim must be backed by verifiable data. Every action must produce structured audit trails.

## The Problem with "Simulated Success"

Many development tools show "success" indicators without actually verifying outcomes:

- ❌ "Device detected" when no real device is present
- ❌ "Flash completed" when no flash was performed
- ❌ "Tool installed" when the tool doesn't actually work
- ❌ "Operation successful" with fake progress bars

**This is dangerous in production repair environments.**

## Our Standard

### Truth Over Convenience

If we can't verify something, we don't claim it:

```typescript
// ❌ BAD
const device = {
  connected: true, // Is it though?
  mode: "fastboot", // How do you know?
  confidence: 1.0, // Never 100% without proof
};

// ✅ GOOD
const device = {
  device_uid: "usb:18d1:4ee7:bus3:addr5",
  mode: "android_adb_confirmed", // Seen in `adb devices`
  confidence: 0.92, // Realistic based on evidence
  evidence: {
    usb: {
      /* raw USB descriptors */
    },
    tools: {
      adb: {
        present: true,
        seen: true,
        raw: "ABC123    device product:...",
      },
    },
  },
  notes: [
    "Confirmed via adb devices output",
    "Serial number matches USB device",
  ],
};
```

### Evidence-Based Classification

Every device detection must include:

1. **Confidence Score** (0.0 to 1.0)

   - 0.5-0.7: USB signature matches known pattern
   - 0.7-0.85: USB + interface class hints
   - 0.85-0.95: Tool confirmer saw device
   - 0.95-1.0: Multiple confirmers + full evidence

2. **Evidence Bundle**

   - Raw USB descriptors (VID, PID, manufacturer, product, serial)
   - Tool outputs (adb, fastboot, idevice_id)
   - Classification notes explaining reasoning

3. **Conservative Language**
   - "likely" for USB pattern matches
   - "confirmed" only when tool sees device
   - "unknown" when unclear

### Manual Intervention Required

When something can't be validated automatically:

```typescript
return {
  status: "manual_intervention_required",
  reason: "Device detected via USB but no tool confirmation available",
  recommendations: [
    "Install adb: https://developer.android.com/tools",
    "Enable USB debugging on device",
    "Check device appears in 'adb devices'",
  ],
  partial_evidence: {
    /* what we DO know */
  },
};
```

## Audit Logging Requirements

Every action must create a structured audit log:

```json
{
  "timestamp": "2025-01-20T12:34:56.789Z",
  "job_id": "J-12345",
  "action": "flash_partition",
  "device_uid": "usb:18d1:4ee7:bus3:addr5",
  "user": "tech@repair-shop.com",
  "command": ["fastboot", "flash", "boot", "boot.img"],
  "exit_code": 0,
  "duration_ms": 3421,
  "stdout": "...",
  "stderr": "",
  "evidence_bundle": "evidence_bundle_J-12345/",
  "policy_evaluation": {
    "allowed": true,
    "requirements_met": ["typed_confirmation", "device_state_validated"]
  }
}
```

### What Gets Logged

✅ **Always Log:**

- Command executed (full command line)
- Arguments (sanitized of secrets)
- Exit code
- Stdout/stderr (truncated if needed)
- Duration
- User/role who initiated
- Policy evaluation result
- Device state before/after

❌ **Never Log:**

- Passwords or API keys
- Personal data (beyond device serial for tracking)
- Proprietary firmware contents (hash only)

## Tool Health Transparency

The UI must show **real** tool status:

```typescript
interface ToolHealthStatus {
  tool_id: string;
  installed: boolean; // Actually checked
  version: string | null; // Actual version output
  path: string | null; // Where it's found
  last_success: Date | null; // Last successful use
  last_error: string | null; // Last failure message
  permissions_ok: boolean; // Real permission check
  permissions_issues: string[]; // Specific problems
}
```

Display this openly in the UI:

- ✅ Green checkmark only when tool actually works
- ⚠️ Yellow warning when tool present but never succeeded
- ❌ Red X when tool missing with install guidance

## Policy Enforcement

Policies must be **evaluated before execution**, not after:

```typescript
// ❌ BAD
async function flashPartition() {
  await executeFlash(); // Hope for the best
  if (userRole !== "admin") {
    showError("Unauthorized"); // Too late!
  }
}

// ✅ GOOD
async function flashPartition() {
  const policy = evaluatePolicy(rules, {
    user_role: currentUser.role,
    action_type: "flash_partition",
    risk_level: "destructive",
    device_state: device.mode,
  });

  if (!policy.allowed) {
    return {
      status: "policy_denied",
      reason: policy.deny_reason,
    };
  }

  if (policy.requirements.includes("typed_confirmation")) {
    const confirmed = await getUserConfirmation();
    if (!confirmed) {
      return { status: "cancelled" };
    }
  }

  // Now execute
  const result = await executeFlash();
  await createAuditLog(result);
  return result;
}
```

## Confidence Communication

Users must understand what we know vs. what we guess:

### UI Patterns

```tsx
<DeviceCard device={device}>
  <ConfidenceMeter value={device.confidence} />
  {device.confidence < 0.85 && (
    <Alert variant="warning">
      <AlertTriangle />
      Device classification based on USB signature only. Install adb/fastboot
      for confirmation.
    </Alert>
  )}
  <EvidenceButton onClick={() => showEvidence(device)} />
</DeviceCard>
```

### Language Guidelines

| Confidence | Language                              | Example                              |
| ---------- | ------------------------------------- | ------------------------------------ |
| < 0.7      | "appears to be", "signature suggests" | "Appears to be iPhone in DFU mode"   |
| 0.7-0.85   | "likely", "probably"                  | "Likely Android device in ADB mode"  |
| 0.85-0.95  | "confirmed by [tool]"                 | "Confirmed by adb devices"           |
| > 0.95     | "verified", "confirmed"               | "Verified: Pixel 6 in fastboot mode" |

## Testing Against Truth

Our test suite validates real detection:

```typescript
test("no fake device detection", async () => {
  // Disconnect all USB devices
  const devices = await detectDevices();

  // Should return empty array, not fake devices
  expect(devices).toEqual([]);
  expect(devices).not.toContain(
    expect.objectContaining({ mode: "android_adb_confirmed" }),
  );
});

test("confidence matches reality", async () => {
  const device = await detectDevice();

  // If confidence > 0.85, tool confirmation must exist
  if (device.confidence > 0.85) {
    expect(device.evidence.tools).toHaveProperty("adb.seen", true);
  }
});
```

## Failure Modes

### Good Failures (Honest)

```json
{
  "status": "failed",
  "reason": "adb not found in PATH",
  "recommendations": [
    "Install Android SDK Platform Tools",
    "Add to PATH: export PATH=$PATH:~/platform-tools"
  ]
}
```

### Bad Failures (Deceptive)

```json
{
  "status": "success", // LIE
  "devices": [
    /* fake device */
  ],
  "note": "Showing demo device" // Hidden admission
}
```

## Compliance Implications

This standard protects you legally and commercially:

✅ **Defensible audit trail** - Show exactly what was done
✅ **No false claims** - Can't be accused of fake diagnostics
✅ **Clear evidence** - Customer disputes resolved with data
✅ **Professional credibility** - Tools that actually work build trust

## Summary

**The No Illusion Standard:**

1. ✅ Never claim detection without evidence
2. ✅ Always include confidence scores
3. ✅ Show raw evidence on demand
4. ✅ Use conservative language
5. ✅ Return `manual_intervention_required` when stuck
6. ✅ Create audit logs for all actions
7. ✅ Evaluate policies before execution
8. ✅ Display real tool health status

**One simple rule: If you can't prove it, don't claim it.**

---

_Part of the Pandora Codex Enterprise Framework_

# SHOP PLAYBOOK

## Pandora Codex for Repair Shops and Diagnostics Labs

This guide shows how to use Pandora Codex in a real repair shop environment for **lawful device repair, diagnostics, and recovery operations**.

## Core Principles

1. **Customer Authorization First** - Never touch a device without documented consent
2. **Evidence-Based Operations** - Every action creates audit logs
3. **Safety Gates** - Destructive operations require multiple confirmations
4. **Skill-Appropriate Access** - RBAC ensures right person, right tools
5. **No Illusions** - Tools show real status, not fake success

## Typical Shop Workflows

### 1. Device Intake and Dossier Creation

**Scenario:** Customer brings Android phone for bootloop repair.

**Steps:**

1. **Document Authorization**

   ```
   Customer: John Smith
   Device: Samsung Galaxy S21
   Issue: Stuck in bootloop
   Authorization: Signed consent form #2025-0042
   ```

2. **Connect Device and Scan**

   ```bash
   # Physical: Connect device via USB
   # UI: Open Device Dossier panel
   # System: BootForgeUSB automatically scans
   ```

3. **Review Detection Results**

   ```json
   {
     "device_uid": "usb:04e8:6860:bus1:addr3",
     "platform_hint": "android",
     "mode": "android_fastboot_confirmed",
     "confidence": 0.92,
     "evidence": {
       "usb": {
         "vid": "04e8",
         "pid": "6860",
         "manufacturer": "Samsung",
         "product": "Galaxy S21",
         "serial": "RF8N123ABCD"
       },
       "tools": {
         "fastboot": {
           "present": true,
           "seen": true,
           "raw": "RF8N123ABCD    fastboot"
         }
       }
     }
   }
   ```

4. **Export Device Dossier**
   - Saves all detection evidence
   - Attaches to customer ticket
   - Creates audit trail starting point

**Why This Matters:**

- Proves device state before work began
- Documents exact hardware involved
- Protects shop from "you broke my phone" claims

---

### 2. Diagnostic Workflow

**Scenario:** Need to determine why device won't boot.

**Steps:**

1. **Gather Device Information**

   ```
   UI Action: Click "Get Device Info"
   Backend: Runs `fastboot getvar all`
   Result: Shows bootloader version, secure boot state, partition list
   ```

2. **Check Bootloader Status**

   ```
   Device shows:
   - Bootloader: Locked ❌
   - Secure Boot: Enabled
   - Warranty: Intact
   ```

3. **Decision Point: Policy Check**

   ```
   Tech attempts: "Unlock Bootloader"

   Policy Engine Response:
   {
     "allowed": false,
     "reason": "Bootloader unlock requires admin role and customer authorization",
     "requirements": [
       "Obtain explicit customer consent (voids warranty)",
       "Supervisor approval required",
       "Typed confirmation: 'unlock-bootloader-samsung-s21'"
     ]
   }
   ```

4. **Escalate or Proceed**
   - Tech documents need for unlock
   - Customer signs warranty void consent
   - Admin reviews and approves
   - System creates audit log of authorization chain

**Why This Matters:**

- Prevents unauthorized destructive actions
- Documents customer consent for warranty-voiding procedures
- Creates clear responsibility trail

---

### 3. Firmware Flash Operation

**Scenario:** Approved to flash stock firmware to recover device.

**Steps:**

1. **Prepare Firmware Files**

   ```
   Files: boot.img, system.img, vendor.img
   Location: /shop/firmware/samsung/s21/stock/
   Checksums: Verified against Samsung official hashes
   ```

2. **Start Flash Job**

   ```typescript
   Job Created:
   {
     "id": "J-2025-0042-001",
     "type": "flash_firmware",
     "device_uid": "usb:04e8:6860:bus1:addr3",
     "created_by": "tech@repair-shop.com",
     "params": {
       "partitions": {
         "boot": "/shop/firmware/samsung/s21/stock/boot.img",
         "system": "/shop/firmware/samsung/s21/stock/system.img"
       },
       "customer_ticket": "2025-0042",
       "authorization_form": "signed-consent-form-0042.pdf"
     },
     "risk_level": "destructive"
   }
   ```

3. **Policy Evaluation**

   ```json
   {
     "allowed": true,
     "action": "allow_with_requirements",
     "requirements": [
       "typed_confirmation",
       "device_state_validation",
       "additional_evidence"
     ]
   }
   ```

4. **Confirmation Flow**

   ```
   UI Shows:
   ⚠️ DESTRUCTIVE OPERATION

   Device: Samsung Galaxy S21 (RF8N123ABCD)
   Action: Flash boot + system partitions
   Risk: Data loss, device brick if interrupted

   Requirements:
   ✅ Device in fastboot mode (confirmed)
   ✅ Admin approval (approved by supervisor@shop.com)
   ✅ Customer authorization (form #2025-0042)

   Type 'flash-firmware-J-2025-0042-001' to confirm:
   ```

5. **Execution with Live Monitoring**

   ```
   Starting flash operation...

   [=====>          ] boot.img - 45% - 23.4 MB/s

   Real-time metrics:
   - Transfer speed: 23.4 MB/s
   - USB bandwidth: 67% utilized
   - CPU: 12%
   - ETA: 2m 34s

   Bottleneck detection: None
   ```

6. **Completion and Evidence Bundle**

   ```
   Flash operation completed successfully

   Evidence Bundle: evidence_bundle_J-2025-0042-001/
   ├── manifest.json (signed)
   ├── command_log.jsonl
   ├── pre_flash_device_state.json
   ├── post_flash_device_state.json
   ├── stdout.txt
   ├── stderr.txt
   └── hashes.txt

   ✓ Exported to customer ticket
   ```

**Why This Matters:**

- Complete record of work performed
- Verifiable evidence of successful operation
- Defense against warranty claims or disputes
- Training material for junior techs

---

### 4. Quality Assurance Check

**Scenario:** Verify device is functional post-repair.

**Steps:**

1. **Reboot Device**

   ```
   UI: Click "Reboot to System"
   Backend: `fastboot reboot`
   Expected: Device boots to Android
   ```

2. **Post-Repair Test**

   ```
   Checklist:
   ✅ Device boots to OS
   ✅ Touch screen responsive
   ✅ Wireless connectivity works
   ✅ No error messages

   Status: PASS
   ```

3. **Final Dossier**
   ```json
   {
     "customer_ticket": "2025-0042",
     "device": "Samsung Galaxy S21",
     "issue": "Bootloop",
     "actions_taken": [
       "Device detection and dossier creation",
       "Firmware flash (boot + system)",
       "Post-repair functionality test"
     ],
     "outcome": "Resolved - device booting normally",
     "evidence_bundles": ["evidence_bundle_J-2025-0042-001"],
     "tech": "tech@repair-shop.com",
     "supervisor_approvals": ["supervisor@shop.com"],
     "duration": "45 minutes"
   }
   ```

---

## Role-Based Access Control

### Tech Role

**Can:**

- Detect devices
- View device information
- Run diagnostics
- Reboot devices (with confirmation)

**Cannot:**

- Flash firmware
- Unlock bootloaders
- Erase partitions
- Access audit logs

### Admin Role

**Can (in addition to Tech):**

- Flash firmware
- Unlock/lock bootloaders
- Erase non-critical partitions
- Approve tech requests
- View audit logs

**Cannot:**

- Bypass policy gates
- Delete audit logs
- Modify policy rules

### Owner Role

**Can (in addition to Admin):**

- Modify policy rules
- Access Bobby Vault
- Add local tools
- Export audit history
- Configure system settings

---

## Tool Health Monitoring

Your shop needs these tools operational:

### Required Tools

- ✅ **adb** - Android Debug Bridge
- ✅ **fastboot** - Bootloader interface
- ✅ **BootForgeUSB** - Device detection

### Optional Tools

- **idevice_id** - iOS device detection (if servicing iPhones)
- **heimdall** - Samsung Odin alternative
- **Custom tools** - Shop-specific utilities in Bobby Vault

### Health Dashboard

```
Tool Status:

adb               ✅ v34.0.5        /usr/bin/adb             Last success: 2 min ago
fastboot          ✅ v34.0.5        /usr/bin/fastboot        Last success: 5 min ago
BootForgeUSB      ✅ v0.1.0         /usr/local/bin/bootforge Last success: 30 sec ago
idevice_id        ❌ Not installed                           Install: brew install libimobiledevice

Permissions:
✅ USB access configured (udev rules present)
✅ User in plugdev group
⚠️  Windows driver signature: Not checked (not on Windows)
```

---

## Bobby Vault (Advanced: Local Tools)

For shop-specific or vendor-provided tools:

### Example: Add Samsung Frp Tool

1. **Obtain Tool**

   ```bash
   # Received frp-unlock-tool from Samsung partner portal
   # Verify legitimacy and license
   ```

2. **Add to Vault**

   ```bash
   cp frp-unlock-tool .pandora_private/tools/
   chmod +x .pandora_private/tools/frp-unlock-tool

   # Compute hash
   sha256sum .pandora_private/tools/frp-unlock-tool
   # Output: 7a3f8b2c...
   ```

3. **Register in Manifest**

   ```json
   {
     "id": "samsung_frp_unlock",
     "name": "Samsung FRP Unlock Tool",
     "path": "/shop/pandora/.pandora_private/tools/frp-unlock-tool",
     "sha256": "7a3f8b2c...",
     "requires_confirmation": true,
     "capabilities": ["unlock_samsung_frp"],
     "added_by": "admin@shop.com",
     "added_at": "2025-01-20T10:00:00Z"
   }
   ```

4. **Execute with Validation**

   ```bash
   python3 .pandora_private/scripts/run_local_tool.py samsung_frp_unlock --device ABC123

   # Runner will:
   # 1. Verify SHA-256 hash
   # 2. Require typed confirmation
   # 3. Execute tool
   # 4. Create audit log
   ```

**Why Bobby Vault:**

- Protects proprietary tools from accidental commits
- Hash validation prevents tampering
- Audit logging for compliance
- Shop can use vendor tools without violating licenses

---

## Common Scenarios

### Scenario: "Device Not Detected"

**Problem:** Customer device not showing up.

**Diagnosis:**

```
1. Check USB Device Detector
   - Seeing device in USB list? → Yes/No

2. If Yes but no ADB/Fastboot:
   - Check USB debugging enabled
   - Check authorization popup on device
   - Try different USB cable/port

3. If No USB detection:
   - Try different cable
   - Check device physically powered on
   - Test on different computer
```

**Resolution:**

- Document findings in ticket
- Show customer USB detection evidence
- Transparent about capability limits

### Scenario: "Flash Failed Mid-Operation"

**Problem:** Flash operation returned error code.

**Diagnosis:**

```
Evidence Bundle Shows:
- Command: fastboot flash boot boot.img
- Exit code: 1
- Stderr: "FAILED (remote: 'Partition doesn't exist')"
- Duration: 234ms
```

**Resolution:**

- Error is clear: partition name wrong
- Check device partition list
- Correct partition name
- Retry with documentation

### Scenario: "Customer Disputes Work Done"

**Problem:** Customer claims "you didn't do anything".

**Defense:**

```
Evidence Bundle Export:
- Pre-flash device dossier: Device in fastboot, bootloop confirmed
- Flash operation logs: Complete command history with timestamps
- Post-flash device state: Device booting to Android
- Signed authorization: Customer consent form
```

**Outcome:**

- Evidence proves work was performed
- Audit trail shows successful completion
- Shop protected from false claim

---

## Best Practices

### 1. Always Document Authorization

- Signed consent form before any operation
- Attach form number to job ID
- Store in customer ticket system

### 2. Use Policy Gates Properly

- Don't bypass confirmations "to save time"
- Train staff on why confirmations matter
- Review audit logs weekly

### 3. Export Evidence Bundles

- Attach to every customer ticket
- Keep for warranty/dispute resolution
- Use as training material

### 4. Maintain Tool Health

- Check tool status daily
- Update tools regularly
- Test detection on known-good devices

### 5. Train Staff on No-Illusion Standard

- "Device detected" means _actually_ detected
- Show evidence, don't guess
- Escalate when uncertain

---

## Legal and Compliance

### What Pandora Codex Does

✅ Provides tools for lawful device repair
✅ Creates audit trails for compliance
✅ Enforces safety gates for destructive operations
✅ Documents customer authorization

### What Pandora Codex Does NOT Do

❌ Bypass security measures without authorization
❌ Remove FRP/iCloud locks without proof of ownership
❌ Enable theft or fraud
❌ Hide operations from audit logs

### Your Responsibility

- Verify customer ownership before unlocking
- Follow local right-to-repair laws
- Maintain customer privacy
- Use tools ethically and legally

---

## Support

- Technical Issues: Check `docs/TROUBLESHOOTING.md`
- Policy Questions: See `docs/SECURITY_MODEL.md`
- Feature Requests: File GitHub issue
- Commercial Support: Contact Pandora Codex Enterprise

---

**Built for real repair shops. Designed for transparency. Engineered for truth.**

_Part of the Pandora Codex Enterprise Framework_

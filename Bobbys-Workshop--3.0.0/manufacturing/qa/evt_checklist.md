# EVT (Engineering Validation Test) Checklist

**ForgeCore Diagnostic Bridge - 50 Units**

---

## Electrical Testing

- [ ] USB enumerates correctly (Windows/macOS/Linux)
- [ ] PD negotiation detected (monitor only, no injection)
- [ ] No overcurrent draw detected
- [ ] Power consumption within spec (< 500mA @ 5V)
- [ ] USB descriptor validation passed

## Security Testing

- [ ] Secure element provisioned successfully
- [ ] Unique keys generated per unit
- [ ] Firmware signature verified
- [ ] Firmware rollback prevention active
- [ ] No write capability exposed

## Functional Testing

- [ ] Device enumeration working
- [ ] Diagnostic handshake OK
- [ ] Audit log ID generation working
- [ ] License binding functional
- [ ] OS compatibility verified (Win/macOS/Linux)

## Thermal Testing

- [ ] 24-hour thermal soak passed
- [ ] No overheating detected
- [ ] Temperature within operating range (0-70°C)

## Physical Inspection

- [ ] Enclosure finish quality acceptable
- [ ] Port alignment flush
- [ ] No rattles or loose components
- [ ] Serial number label applied

---

## Exit Criteria

- ✅ 0 bricked units
- ✅ 100% serial recognition
- ✅ No firmware rollback possible
- ✅ All electrical tests passed
- ✅ All security tests passed

---

**Tester ID**: ___________
**Date**: ___________
**Status**: PASS / FAIL
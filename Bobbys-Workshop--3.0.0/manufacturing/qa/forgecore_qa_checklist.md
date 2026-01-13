# REFORGE OS — Manufacturing QA Checklist

**Per-Unit Quality Assurance Requirements**

---

## Pre-Assembly QA

### Component Verification

- [ ] All components verified against BOM
- [ ] Component date codes checked (freshest available)
- [ ] Secure element blank verification
- [ ] MCU blank verification
- [ ] PCB inspection (visual + electrical test)

---

## Assembly QA

### SMT Assembly

- [ ] Solder paste inspection
- [ ] Component placement verification
- [ ] Reflow profile validation
- [ ] Post-reflow visual inspection
- [ ] AOI (Automated Optical Inspection)

### Secure Element Provisioning

- [ ] Secure element blank loaded
- [ ] Unique keys generated
- [ ] Keys programmed to secure element
- [ ] Provisioning record created
- [ ] Keys securely stored (factory database)

### Firmware Installation

- [ ] MCU firmware flashed
- [ ] Firmware signature verified
- [ ] Version number confirmed
- [ ] Boot sequence validated

---

## Post-Assembly QA

### Functional Testing

- [ ] Power-on test (USB-C)
- [ ] USB enumeration test
- [ ] USB descriptor validation
- [ ] Secure element communication test
- [ ] I2C pass-through test
- [ ] PD negotiation test (read-only)
- [ ] LED indicators test (if applicable)

### Security Testing

- [ ] Secure element identity verification
- [ ] License binding test
- [ ] Audit log signing test
- [ ] Firmware attestation test
- [ ] Tamper detection test (if applicable)

### Environmental Testing (Sample Testing)

- [ ] Temperature cycling (-10°C to 60°C)
- [ ] Humidity testing (85% RH)
- [ ] ESD testing (±8kV)
- [ ] Drop testing (1m, 6 faces)

---

## Packaging QA

### Unit Packaging

- [ ] Serial number label applied
- [ ] Packaging contents verified
- [ ] Quick start guide included
- [ ] Warranty card included
- [ ] Cable included (if applicable)

### Batch Packaging

- [ ] Box labeling correct
- [ ] Regulatory markings present
- [ ] Barcode/QR code scanning
- [ ] Shipping label verification

---

## Documentation Requirements

### Per-Unit Documentation

- **Serial Number**: Unique, database-recorded
- **Manufacturing Date**: Date code
- **Firmware Version**: Version string
- **Secure Element ID**: Unique identifier
- **QA Tester ID**: Tester signature
- **Test Results**: Pass/fail record

### Batch Documentation

- **Lot Number**: Batch identifier
- **Component Date Codes**: Traceability
- **Test Statistics**: Pass rate, failure modes
- **Calibration Records**: Test equipment calibration

---

## Failure Modes & Handling

### Critical Failures (Reject)

- Secure element provisioning failure
- Firmware signature invalid
- USB enumeration failure
- Physical damage

### Minor Failures (Repair/Replacement)

- Cosmetic defects
- Packaging issues
- Missing accessories

### Statistical Requirements

- **AQL Level**: 1.0% for critical defects
- **AQL Level**: 2.5% for minor defects
- **Minimum Pass Rate**: 98% per batch

---

## Traceability

### Required Records

- Component lot codes
- Assembly date/time
- Tester identification
- Test equipment calibration
- Serial number tracking

### Retention Period

- **Records**: 7 years minimum
- **Secure Element Keys**: Encrypted, permanent retention
- **Test Data**: 3 years minimum

---

## Compliance Verification

### Regulatory

- [ ] FCC marking verification
- [ ] CE marking verification
- [ ] RoHS compliance verified
- [ ] USB-IF certification (if applicable)

### Quality Standards

- [ ] ISO 9001 compliance
- [ ] Process documentation
- [ ] Corrective action tracking
- [ ] Supplier quality records

---

**Document Version**: 1.0  
**Status**: PRODUCTION-READY  
**Last Updated**: QA Checklist Final
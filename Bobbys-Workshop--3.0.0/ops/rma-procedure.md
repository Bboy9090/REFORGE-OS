# RMA (Return Merchandise Authorization) Procedure
## ForgeCore Hardware Returns

## Purpose

This procedure governs the return, repair, or replacement of ForgeCore hardware units, ensuring proper tracking, security, and compliance.

## RMA Categories

### 1. Manufacturing Defect
**Definition**: Unit fails EVT/DVT/PVT testing or has manufacturing defects  
**Action**: Replace with new unit from current batch

### 2. Field Failure
**Definition**: Unit fails in customer use, but no tampering detected  
**Action**: Repair or replace, investigate root cause

### 3. Security Concern
**Definition**: Evidence of tampering, integrity violation, or security issue  
**Action**: Quarantine unit, full investigation, possible revocation

### 4. Customer Return (Unused)
**Definition**: Customer returns unused unit within return period  
**Action**: Inspect, verify serial, refurbish if possible

## RMA Process

### Step 1: RMA Request
1. Customer or internal team submits RMA request
2. Include:
   - Serial number
   - Failure description
   - Date of failure
   - Photos (if applicable)
3. Assign RMA number (format: RMA-YYYY-MM-DD-XXX)

### Step 2: Initial Assessment
1. **Verify Serial**: Confirm unit is legitimate (check manufacturing database)
2. **Check Status**: Verify unit not already under RMA
3. **Classify**: Determine RMA category
4. **Assign**: Route to appropriate team

### Step 3: Unit Return
1. **Shipping**: Provide return shipping label
2. **Tracking**: Track shipment
3. **Receipt**: Log receipt date/time
4. **Inspection**: Initial visual inspection

### Step 4: Investigation

#### For Manufacturing Defects:
- Review manufacturing batch records
- Check QA test results
- Identify root cause
- Update manufacturing process if needed

#### For Field Failures:
- Reproduce failure (if possible)
- Check audit logs for unit
- Review usage patterns
- Determine if design issue or isolated failure

#### For Security Concerns:
- **CRITICAL**: Quarantine unit immediately
- Full forensic analysis
- Check for tampering evidence
- Review all audit logs
- Notify compliance officer
- Document all findings

### Step 5: Disposition

#### Replace
- Issue replacement unit from inventory
- Update serial number binding in database
- Deactivate old unit serial (if security concern)

#### Repair
- Repair unit if economically viable
- Re-run EVT tests after repair
- Update unit status in database
- Return to customer

#### Quarantine
- For security concerns or unrepairable units
- Store in secure location
- Maintain chain of custody
- Document final disposition

### Step 6: Customer Notification
1. **Status Update**: Notify customer of RMA status
2. **Replacement**: Ship replacement if applicable
3. **Timeline**: Provide estimated resolution time
4. **Completion**: Confirm RMA closure

## Serial Number Management

### Binding Verification
- Verify serial number is bound to customer account
- Check for multiple bindings (potential issue)
- Verify no unauthorized transfers

### Deactivation
- Deactivate serial for returned units (if security concern)
- Prevent reuse of compromised units
- Update manufacturing database

### Reactivation
- Only for verified, repaired, and re-tested units
- Requires full EVT test suite pass
- Update database with new test results

## Security Considerations

### Tampering Detection
- **Physical**: Check for epoxy seal breaks, enclosure damage
- **Firmware**: Verify firmware signature, check for modifications
- **Secure Element**: Verify secure element not extracted/replaced
- **Audit Logs**: Review all audit log entries for anomalies

### Quarantine Requirements
- Store in locked, access-controlled location
- Maintain chain of custody log
- No testing or analysis without authorization
- Document all access

## Compliance Requirements

### Audit Trail
- All RMA actions must be audit-logged
- Include: RMA number, serial, action, timestamp, actor
- Export audit logs for compliance review

### Data Protection
- If unit contains customer data:
  - Secure wipe before return (if possible)
  - Document data handling
  - Comply with GDPR/data protection laws

### Legal Hold
- If unit is subject to legal hold:
  - Do not repair or dispose
  - Maintain in secure storage
  - Preserve all associated data/logs

## RMA Database

### Required Fields
- RMA number (primary key)
- Serial number
- Customer/account ID
- Category
- Status (Open/In Progress/Closed)
- Created date
- Resolved date
- Disposition (Replace/Repair/Quarantine)
- Notes

### Status Tracking
- **Open**: RMA created, awaiting unit return
- **Received**: Unit received, under investigation
- **In Progress**: Investigation/repair in progress
- **Pending Approval**: Awaiting disposition decision
- **Resolved**: RMA completed
- **Quarantined**: Unit quarantined (security)

## Metrics

Track:
- RMA rate (units returned / units shipped)
- Average resolution time
- Category distribution
- Security concern rate
- Customer satisfaction

## Escalation

**Escalate to Compliance Officer if:**
- Security concern detected
- Tampering suspected
- Legal hold required
- Regulatory issue

**Escalate to Engineering Lead if:**
- Systematic failure pattern
- Design issue suspected
- Manufacturing defect rate > 2%

---

## RMA Form Template

```
RMA Number: RMA-YYYY-MM-DD-XXX
Date: [Date]
Customer: [Name/Account]
Serial Number: [Serial]
Category: [Manufacturing Defect/Field Failure/Security Concern/Customer Return]
Description: [Detailed description]
Photos: [Attached]
Status: [Open]
Assigned To: [Name]
```

---

## Checklist

- [ ] RMA number assigned
- [ ] Serial number verified
- [ ] Customer notified
- [ ] Return shipping label provided
- [ ] Unit received and logged
- [ ] Investigation completed
- [ ] Disposition determined
- [ ] Customer notified of resolution
- [ ] Audit log entry created
- [ ] RMA closed in database

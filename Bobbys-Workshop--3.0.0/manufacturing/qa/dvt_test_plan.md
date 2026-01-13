# ForgeCore Firmware EVT Test Harness

## Overview

This test harness validates ForgeCore hardware during the Engineering Validation Test (EVT) phase. All tests are **read-only** and verify diagnostic capabilities only.

## Test Categories

### 1. USB Enumeration Test (`usb_enum_test.c`)
- **Purpose**: Verify USB device enumeration capability
- **What it tests**: Device detection, VID/PID reading, descriptor access
- **What it does NOT test**: Write operations, device modification
- **Pass Criteria**: Successful enumeration of connected devices

### 2. Secure Element Test (`secure_element_test.c`)
- **Purpose**: Verify ATECC608B secure element provisioning
- **What it tests**: Identity provisioning, key generation, signing operations
- **Pass Criteria**: Secure element initialized, keys accessible, signing works

### 3. Thermal Safety Test (`thermal_safety_test.c`)
- **Purpose**: Verify Smart Thermal Platform safety features
- **What it tests**: Temperature sensors, safety cutoffs, profile limits
- **Critical**: Must verify NO bypass capability exists
- **Pass Criteria**: All safety features functional, no bypass paths

## Running Tests

### On EVT Units Only

```bash
cd firmware/forgecore/tests
make clean
make
./run_tests.sh
```

### Test Output

Each test returns:
- `0`: Pass
- Non-zero: Failure

### Failure Handling

**Any test failure quarantines the unit:**
1. Log serial number
2. Mark unit in manufacturing database
3. Do not ship
4. Investigate root cause

## Logging Requirements

- Serial number must be logged with test results
- All test output must be timestamped
- Results must be stored in manufacturing database
- Hash of test results must be generated for audit

## Safety Verification

**CRITICAL**: All tests must verify:
- ✅ No write paths exist
- ✅ No bypass functionality
- ✅ Safety limits cannot be overridden
- ✅ Diagnostic-only operations

## Compliance

- Tests are run during EVT phase (50 units)
- Results are audit-logged
- Failed units are quarantined
- Only units passing all tests proceed to DVT

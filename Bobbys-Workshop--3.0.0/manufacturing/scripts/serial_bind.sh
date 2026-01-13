#!/bin/bash
# Serial Number Binding Script
# Binds hardware serial to account/license record

set -e

SERIAL="${1:-}"
ACCOUNT_ID="${2:-}"

if [ -z "$SERIAL" ] || [ -z "$ACCOUNT_ID" ]; then
    echo "Usage: $0 <serial_number> <account_id>"
    exit 1
fi

echo "=== Serial Number Binding ==="
echo "Serial: $SERIAL"
echo "Account: $ACCOUNT_ID"
echo "Date: $(date)"

# Verify serial is valid format
if [[ ! "$SERIAL" =~ ^FW-[0-9]{6}$ ]]; then
    echo "ERROR: Invalid serial format (expected FW-XXXXXX)"
    exit 1
fi

# Check if serial already bound
if grep -q "^$SERIAL," serial_bindings.csv 2>/dev/null; then
    echo "ERROR: Serial $SERIAL already bound"
    exit 1
fi

# Bind serial to account
echo "$SERIAL,$ACCOUNT_ID,$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> serial_bindings.csv

# Update license record (if applicable)
# License activation logic here

echo "Serial $SERIAL bound to account $ACCOUNT_ID"
echo "=== Binding Complete ==="
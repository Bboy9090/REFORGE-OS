#!/bin/bash
# Firmware Signing Script
# INTERNAL USE ONLY - Signing keys stored offline

set -e

FIRMWARE_FILE="${1:-firmware.bin}"
SIGNING_KEY="${SIGNING_KEY:-offline_signing_key.pem}"
OUTPUT_FILE="${2:-firmware_signed.bin}"

echo "=== Firmware Signing ==="
echo "Input: $FIRMWARE_FILE"
echo "Output: $OUTPUT_FILE"

# Verify firmware file exists
if [ ! -f "$FIRMWARE_FILE" ]; then
    echo "ERROR: Firmware file not found: $FIRMWARE_FILE"
    exit 1
fi

# Verify signing key exists (should be on secure HSM/offline system)
if [ ! -f "$SIGNING_KEY" ]; then
    echo "ERROR: Signing key not found (should be on secure system)"
    exit 1
fi

# Sign firmware using openssl
echo "Signing firmware..."
openssl dgst -sha256 -sign "$SIGNING_KEY" -out "${OUTPUT_FILE}.sig" "$FIRMWARE_FILE"

# Embed signature in firmware (format depends on bootloader)
# This is a placeholder - actual implementation depends on bootloader

echo "Firmware signed successfully"
echo "Signature file: ${OUTPUT_FILE}.sig"
echo "Signed firmware: $OUTPUT_FILE"

# Verify signature
echo "Verifying signature..."
openssl dgst -sha256 -verify "$SIGNING_KEY" -signature "${OUTPUT_FILE}.sig" "$FIRMWARE_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Signature verified"
else
    echo "✗ Signature verification failed"
    exit 1
fi

echo "=== Signing Complete ==="
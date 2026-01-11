# Devices Directory

Local storage for device profiles and session data.

## Structure

Device profiles are stored as JSON files:

- `{device_serial}.json` - Device-specific profile
- Contains device metadata, history, and preferences

## Profile Format

```json
{
  "serial": "ABC123XYZ",
  "platform": "android",
  "manufacturer": "Google",
  "model": "Pixel 8",
  "android_version": "14",
  "last_seen": "2024-12-16T00:00:00Z",
  "authorization_history": [],
  "firmware_version": "UP1A.231005.007",
  "security_patch": "2024-12-05",
  "notes": "Customer device for FRP recovery",
  "repair_history": []
}
```

## Privacy

- Device profiles are stored locally only
- NOT committed to version control
- Contains potentially sensitive customer data
- Should be encrypted in production environments

## Data Retention

- Profiles are kept for 90 days after last device connection
- Can be manually exported for backup
- Old profiles automatically archived

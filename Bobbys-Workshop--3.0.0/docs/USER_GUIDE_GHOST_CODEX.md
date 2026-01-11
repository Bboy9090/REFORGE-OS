# 👻 Ghost Codex - User Guide

## Overview

Ghost Codex is Bobby's Workshop's Stealth & Identity Protection suite. It removes metadata from files, creates tripwire alerts, and generates burner identities for secure operations.

---

## Getting Started

1. Navigate to **Secret Rooms**
2. Authenticate with **Phoenix Key**
3. Select **Ghost Codex** from navigation

---

## Features

### 1. Metadata Shredder

**Purpose**: Remove all digital fingerprints from files

**How to Use**:
1. Click **"Metadata Shredder"** tab
2. Drag and drop files or click to browse
3. Supported: Images (JPG, PNG), Audio (MP3, WAV), Video (MP4, MOV)
4. Click **"Shred"**
5. Download the cleaned file (starts with `ghost_`)

**What Gets Removed**:
- EXIF data (camera settings, GPS coordinates)
- Device information
- Software version
- Creation timestamps
- Author information

**What Stays**:
- File content (pixels, audio, video)
- File format
- File size (may change slightly)

---

### 2. Canary Tokens

**Purpose**: Create bait files that alert when accessed

**How to Use**:
1. Click **"Canary Tokens"** tab
2. Click **"Generate New Token"**
3. Enter filename (e.g., "Passwords.html")
4. Token is created and ready to place
5. Monitor **"Canary Alerts"** dashboard

**When Someone Opens the File**:
- Alert is logged with:
  - IP address
  - Device information
  - Timestamp
  - User agent

**Best Practices**:
- Place in folders you suspect might be accessed
- Use realistic filenames (e.g., "Bank_Account_Info.pdf")
- Check alerts regularly

---

### 3. Persona Vault

**Purpose**: Generate temporary identities for secure operations

**How to Use**:

**Generate Email**:
1. Click **"Persona Vault"** tab
2. Click **"Generate Email"**
3. Temporary email is created (expires in 24 hours)
4. Use for sign-ups, registrations, etc.

**Generate Phone**:
1. Click **"Generate Number"**
2. Virtual phone number is created (expires in 7 days)
3. Use for SMS verification, calls, etc.

**Manage Personas**:
- View all active personas
- See expiration dates
- Delete personas when done
- Expired personas are marked automatically

---

## Use Cases

### Scenario 1: Clean File Before Sharing
1. Upload file to Metadata Shredder
2. Download cleaned version
3. Share without exposing your device/location

### Scenario 2: Detect Unauthorized Access
1. Generate Canary Token
2. Place in sensitive folder
3. Monitor alerts dashboard
4. Get notified if file is opened

### Scenario 3: Anonymous Registration
1. Generate email persona
2. Use for account sign-up
3. Receive verification emails
4. Delete persona after use

---

## Security Notes

⚠️ **Important**:
- Canary tokens only work if file is opened in a browser/application that loads remote content
- Persona emails/phones are generated locally - for production use, integrate with real services
- Metadata shredding creates new files - original files are not modified
- Always verify cleaned files before deleting originals

---

## Troubleshooting

### "Shredding failed"
- Check file format is supported
- Ensure FFmpeg is installed (for media files)
- Try a different file

### "Canary token not alerting"
- Verify file was opened (not just copied)
- Check backend is running
- Ensure callback URL is accessible

### "Persona expired"
- Generate a new persona
- Adjust expiration time when creating

---

**Remember**: Ghost Codex helps protect your digital identity. Use responsibly and in compliance with applicable laws.

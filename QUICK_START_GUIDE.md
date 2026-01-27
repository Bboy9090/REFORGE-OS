# Diagnostic and Repair App - Quick Start Guide

## 🎯 What Was Built

A comprehensive diagnostic and repair solution for Android and iOS devices featuring:

- **Flutter Mobile App** - Cross-platform mobile application for technicians
- **Node.js Backend API** - RESTful API for ticket management and diagnostics
- **Real-time Updates** - WebSocket support for live device events
- **Complete Documentation** - API docs, deployment guides, and implementation summary

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the Backend Server

```bash
cd server
npm install
npm start
```

✅ Server runs on: `http://localhost:3001`

### Step 2: Test the API

```bash
# Create a test ticket
curl -X POST http://localhost:3001/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "1234567890",
    "deviceType": "android",
    "issueDescription": "Screen not working"
  }'

# List all tickets
curl http://localhost:3001/api/v1/tickets
```

### Step 3: Run the Flutter App

```bash
cd apps/diagnostic-repair-app
flutter pub get
flutter run
```

Select your target device (Android emulator, iOS simulator, or physical device).

## 📱 Features Overview

### Repair Ticket Management
- Create new repair tickets with customer and device information
- List and filter tickets by status, priority, device type
- View detailed ticket information
- Update ticket status and add notes
- Track repair progress with timestamps

### Device Diagnostics
- **Battery Health**: Voltage, temperature, charge cycles, health percentage
- **Hardware Tests**: Screen resolution, sensors, camera, audio
- **Network Status**: WiFi, Bluetooth, cellular connectivity
- **System Logs**: Logcat, dmesg, event logs with filtering

### Real-time Features
- WebSocket for live device connection/disconnection events
- Real-time analytics and metrics
- Repair progress updates

## 📚 Documentation

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Architecture and features
- **[apps/diagnostic-repair-app/README.md](apps/diagnostic-repair-app/README.md)** - Flutter app guide
- **[apps/diagnostic-repair-app/DEPLOYMENT_GUIDE.md](apps/diagnostic-repair-app/DEPLOYMENT_GUIDE.md)** - Production deployment

## 🔗 Key API Endpoints

### Repair Tickets
```
POST   /api/v1/tickets              Create ticket
GET    /api/v1/tickets              List all tickets
GET    /api/v1/tickets/:id          Get ticket details
PUT    /api/v1/tickets/:id          Update ticket
DELETE /api/v1/tickets/:id          Delete ticket
```

### Diagnostics
```
GET /api/v1/diagnostics/battery/:serial    Battery health
GET /api/v1/diagnostics/hardware/:serial   Hardware tests
GET /api/v1/diagnostics/network/:serial    Network status
GET /api/v1/diagnostics/logs/:serial/logcat   Android logs
```

### WebSocket
```
ws://localhost:3001/ws/device-events     Device hotplug events
ws://localhost:3001/ws/analytics         Real-time analytics
ws://localhost:3001/ws/correlation       Request correlation
```

## 🛠 Technology Stack

**Backend:**
- Node.js + Express
- WebSocket (ws)
- ADB for Android devices
- File-based storage (JSON)

**Frontend:**
- Flutter 3.0+
- Dart 3.0+
- Material Design 3
- Provider state management

## 📦 Project Structure

```
├── server/
│   ├── routes/v1/
│   │   ├── tickets.js           # Repair tickets API
│   │   └── diagnostics/         # Diagnostic APIs
│   └── index.js                 # Main server
│
├── apps/diagnostic-repair-app/  # Flutter app
│   ├── lib/
│   │   ├── models/              # Data models
│   │   ├── services/            # API & WebSocket
│   │   └── screens/             # UI screens
│   └── android/                 # Android config
│
└── Documentation files
    ├── API_DOCUMENTATION.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── DEPLOYMENT_GUIDE.md
```

## ✅ Implementation Status

### Completed Features
- ✅ Repair ticket CRUD operations
- ✅ Customer and device tracking
- ✅ Battery health diagnostics
- ✅ Hardware diagnostics
- ✅ Network diagnostics
- ✅ System logs retrieval
- ✅ Flutter mobile UI
- ✅ API integration
- ✅ WebSocket foundation
- ✅ Complete documentation

### Requires Device Testing
- 📱 QR/Barcode scanner (camera access)
- 📱 iOS diagnostics (libimobiledevice)
- 📱 Firmware flashing UI

### Production Readiness
- 🔒 Add authentication layer
- 🗄️ Migrate to PostgreSQL
- 🔐 Enable HTTPS/WSS
- 📧 Set up notifications
- 📊 Add monitoring

## 🧪 Testing

### Backend Test
```bash
cd server
npm test
```

### Flutter Test
```bash
cd apps/diagnostic-repair-app
flutter test
```

### Integration Test
Connect an Android device via ADB and run diagnostics:
```bash
# List connected devices
adb devices

# Test battery diagnostics
curl http://localhost:3001/api/v1/diagnostics/battery/DEVICE_SERIAL
```

## 🚢 Deployment

### Backend Options
1. **Heroku**: `heroku create && git push heroku main`
2. **AWS Elastic Beanstalk**: `eb init && eb create`
3. **DigitalOcean App Platform**: Connect via GitHub

### Flutter Deployment
1. **Android**: `flutter build apk --release`
2. **iOS**: `flutter build ios --release` (requires Mac)
3. **Web**: `flutter build web && firebase deploy`

See [DEPLOYMENT_GUIDE.md](apps/diagnostic-repair-app/DEPLOYMENT_GUIDE.md) for details.

## 🔍 Troubleshooting

### Backend Won't Start
```bash
cd server
npm clean-install  # Reinstall dependencies
node index.js      # Check for errors
```

### Flutter Build Errors
```bash
flutter clean
flutter pub get
flutter doctor     # Check setup
```

### Can't Connect to Device
- Ensure ADB is installed and device is in debug mode
- Check `adb devices` to verify connection
- Verify USB debugging is enabled on device

### API Connection Issues
- Check backend is running on port 3001
- Update API URL in Flutter app (`lib/main.dart`)
- For Android emulator use `http://10.0.2.2:3001`
- For iOS simulator use `http://localhost:3001`

## 📧 Support

- **Issues**: Open a GitHub issue
- **Documentation**: Check the docs folder
- **API Reference**: See API_DOCUMENTATION.md

## 📄 License

See LICENSE file for details.

---

## 🎓 Learning Resources

### Flutter
- [Flutter Documentation](https://flutter.dev/docs)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Material Design](https://material.io/design)

### Node.js/Express
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### ADB
- [ADB Documentation](https://developer.android.com/studio/command-line/adb)
- [ADB Shell Commands](https://adbshell.com/)

---

**Version**: 1.0.0  
**Last Updated**: January 26, 2024  
**Status**: ✅ Production Ready (Core Features)

**Need help?** Check the documentation files or open an issue!

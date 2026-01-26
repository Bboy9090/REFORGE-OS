# Diagnostic and Repair Flutter App

A cross-platform mobile application for managing device diagnostics and repair tickets.

## Features

- **Repair Ticket Management**: Create, view, update, and track repair tickets
- **Real-time Diagnostics**: Battery health, hardware tests, network diagnostics
- **System Logs**: View Android logcat, dmesg, and event logs
- **QR/Barcode Scanning**: Track devices and tickets (to be implemented)
- **WebSocket Support**: Real-time updates for repair progress

## Project Structure

```
lib/
├── main.dart                 # Application entry point
├── models/
│   └── repair_ticket.dart    # Data models
├── services/
│   ├── api_service.dart      # HTTP API client
│   └── websocket_service.dart # WebSocket client
├── screens/
│   ├── home_screen.dart      # Main navigation
│   ├── tickets_screen.dart   # Ticket list view
│   ├── create_ticket_screen.dart  # Create new tickets
│   ├── ticket_detail_screen.dart  # Ticket details
│   ├── diagnostics_screen.dart    # Diagnostics dashboard
│   └── qr_scanner_screen.dart     # QR scanner (placeholder)
└── widgets/                  # Reusable widgets (to be added)
```

## Prerequisites

- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio / Xcode for mobile development

## Installation

1. **Install Flutter dependencies:**
   ```bash
   cd apps/diagnostic-repair-app
   flutter pub get
   ```

2. **Configure API endpoint:**
   
   Edit `lib/main.dart` and update the baseUrl:
   ```dart
   Provider<ApiService>(
     create: (_) => ApiService(baseUrl: 'http://YOUR_SERVER_IP:3001'),
   ),
   ```

3. **Run the app:**
   
   For Android:
   ```bash
   flutter run
   ```
   
   For iOS:
   ```bash
   flutter run
   ```

## API Configuration

The app connects to the Node.js backend API. Make sure to:

1. Start the backend server first:
   ```bash
   cd server
   npm start
   ```

2. Update the API base URL in `lib/main.dart` to point to your server
3. For local development, use `http://10.0.2.2:3001` for Android emulator
4. For iOS simulator, use `http://localhost:3001`
5. For physical devices, use your computer's IP address

## Building for Production

### Android

1. **Build APK:**
   ```bash
   flutter build apk --release
   ```

2. **Build App Bundle (for Play Store):**
   ```bash
   flutter build appbundle --release
   ```

### iOS

1. **Build for iOS:**
   ```bash
   flutter build ios --release
   ```

2. **Create IPA (requires Mac):**
   ```bash
   flutter build ipa --release
   ```

## Features Implementation Status

### ✅ Implemented
- Repair ticket creation
- Ticket listing with filters
- Ticket detail view
- API service integration
- WebSocket service foundation
- Basic UI structure

### 🔄 In Progress
- Diagnostics screens (battery, hardware, network)
- System logs viewer
- Real-time updates via WebSocket

### 📋 To Do
- QR/Barcode scanner implementation
- Firmware flashing interface
- Push notifications
- Offline support
- Camera integration for damage documentation

## Dependencies

Key packages used:
- `http` - HTTP client for API calls
- `web_socket_channel` - WebSocket client
- `provider` - State management
- `qr_code_scanner` / `mobile_scanner` - QR scanning
- `intl` - Internationalization and date formatting
- `uuid` - UUID generation

## Testing

Run tests:
```bash
flutter test
```

## Troubleshooting

### Connection Issues
- Ensure backend server is running
- Check firewall settings
- Verify correct IP address and port
- For Android emulator, use `10.0.2.2` instead of `localhost`

### Build Errors
- Run `flutter clean` and `flutter pub get`
- Check Flutter and Dart SDK versions
- Ensure all dependencies are compatible

## Contributing

1. Follow Flutter style guide
2. Write tests for new features
3. Update documentation
4. Test on both Android and iOS

## License

See LICENSE file for details.

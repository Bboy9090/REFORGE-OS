# Diagnostic and Repair App - Deployment Guide

This guide covers deploying both the Flutter frontend and Node.js backend to production.

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Flutter Frontend Deployment](#flutter-frontend-deployment)
3. [Firebase Setup](#firebase-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing](#testing)

---

## Backend Deployment

The Node.js/Express backend can be deployed to various platforms. Here are the recommended options:

### Option 1: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku app:**
   ```bash
   cd server
   heroku create diagnostic-repair-api
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3001
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Verify:**
   ```bash
   heroku logs --tail
   heroku open
   ```

### Option 2: AWS Elastic Beanstalk

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB:**
   ```bash
   cd server
   eb init -p node.js diagnostic-repair-api
   ```

3. **Create environment:**
   ```bash
   eb create diagnostic-repair-prod
   ```

4. **Deploy:**
   ```bash
   eb deploy
   ```

5. **Configure environment variables:**
   ```bash
   eb setenv NODE_ENV=production PORT=3001
   ```

### Option 3: DigitalOcean App Platform

1. **Connect GitHub repository** to DigitalOcean
2. **Configure build settings:**
   - Build Command: `npm install`
   - Run Command: `npm start`
   - HTTP Port: `3001`

3. **Set environment variables** in the dashboard
4. **Deploy** automatically on git push

### Backend Configuration Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure PORT (default: 3001)
- [ ] Set up persistent storage for tickets data
- [ ] Configure CORS for mobile app domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

---

## Flutter Frontend Deployment

### Firebase Hosting (Web Version)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Build Flutter web:**
   ```bash
   cd apps/diagnostic-repair-app
   flutter build web --release
   ```

3. **Initialize Firebase:**
   ```bash
   firebase login
   firebase init hosting
   ```
   
   Configuration:
   - Public directory: `build/web`
   - Single-page app: Yes
   - Automatic builds with GitHub: Optional

4. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

5. **Update API URL:**
   
   Before building, update `lib/main.dart`:
   ```dart
   Provider<ApiService>(
     create: (_) => ApiService(
       baseUrl: 'https://your-backend-url.com'
     ),
   ),
   ```

### Google Play Store (Android)

1. **Create keystore:**
   ```bash
   keytool -genkey -v -keystore ~/diagnostic-repair-key.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias diagnostic-repair
   ```

2. **Configure signing in `android/app/build.gradle`:**
   ```gradle
   signingConfigs {
       release {
           keyAlias 'diagnostic-repair'
           keyPassword 'your-password'
           storeFile file('/path/to/diagnostic-repair-key.jks')
           storePassword 'your-password'
       }
   }
   ```

3. **Build App Bundle:**
   ```bash
   flutter build appbundle --release
   ```

4. **Upload to Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - Upload `build/app/outputs/bundle/release/app-release.aab`
   - Complete store listing
   - Submit for review

### Apple App Store (iOS)

1. **Configure signing in Xcode:**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select signing team
   - Configure bundle identifier

2. **Build for release:**
   ```bash
   flutter build ios --release
   ```

3. **Archive in Xcode:**
   - Product > Archive
   - Validate app
   - Distribute to App Store

4. **Upload via App Store Connect:**
   - Create app in [App Store Connect](https://appstoreconnect.apple.com)
   - Upload IPA
   - Complete metadata
   - Submit for review

---

## Firebase Setup

### Firebase Cloud Messaging (Push Notifications)

1. **Create Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project

2. **Add Android app:**
   ```bash
   # Download google-services.json
   # Place in android/app/
   ```

3. **Add iOS app:**
   ```bash
   # Download GoogleService-Info.plist
   # Place in ios/Runner/
   ```

4. **Install FlutterFire:**
   ```bash
   flutter pub add firebase_core firebase_messaging
   ```

5. **Configure in main.dart:**
   ```dart
   import 'package:firebase_core/firebase_core.dart';
   
   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     await Firebase.initializeApp();
     runApp(const DiagnosticRepairApp());
   }
   ```

6. **Implement notification handling:**
   ```dart
   FirebaseMessaging.onMessage.listen((RemoteMessage message) {
     // Handle foreground notifications
   });
   ```

### Firebase Realtime Database (Optional)

For real-time ticket updates:

1. **Enable Realtime Database** in Firebase Console
2. **Add dependency:**
   ```bash
   flutter pub add firebase_database
   ```

3. **Implement real-time listeners** for ticket updates

---

## Environment Configuration

### Development

Create `.env.development`:
```
API_BASE_URL=http://localhost:3001
WS_BASE_URL=ws://localhost:3001
ENVIRONMENT=development
```

### Production

Create `.env.production`:
```
API_BASE_URL=https://api.your-domain.com
WS_BASE_URL=wss://api.your-domain.com
ENVIRONMENT=production
```

### Loading environment config in Flutter:

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future main() async {
  await dotenv.load(fileName: ".env");
  runApp(const DiagnosticRepairApp());
}

// Usage:
final apiUrl = dotenv.env['API_BASE_URL']!;
```

---

## Testing

### Backend API Tests

```bash
cd server
npm test
```

### Flutter Tests

```bash
cd apps/diagnostic-repair-app
flutter test
```

### Integration Tests

```bash
flutter drive --target=test_driver/app.dart
```

### Load Testing (Backend)

Using Apache Bench:
```bash
ab -n 1000 -c 10 https://your-api-url.com/api/v1/tickets
```

---

## Post-Deployment Checklist

- [ ] Backend API is accessible and responding
- [ ] WebSocket connections working
- [ ] Mobile apps can connect to backend
- [ ] Push notifications configured
- [ ] SSL certificates installed
- [ ] Monitoring and alerting set up
- [ ] Database backups configured
- [ ] Rate limiting tested
- [ ] Error logging verified
- [ ] Performance metrics tracked
- [ ] Documentation updated
- [ ] Team trained on new system

---

## Monitoring and Maintenance

### Recommended Tools

- **Backend Monitoring**: New Relic, Datadog, or CloudWatch
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics for Firebase
- **Uptime Monitoring**: Pingdom or UptimeRobot
- **Log Management**: Loggly or Papertrail

### Health Checks

Set up automated health checks:
```bash
# Backend health check
curl https://your-api-url.com/api/v1/health

# Expected response:
# { "status": "ok", "healthy": true }
```

---

## Troubleshooting

### Common Issues

1. **CORS errors**: Update CORS configuration in backend
2. **WebSocket connection failures**: Check firewall and proxy settings
3. **Push notification not working**: Verify FCM configuration
4. **App crashes on startup**: Check API URL configuration

### Support Channels

- GitHub Issues
- Technical documentation
- Team support channel

---

## Security Considerations

- [ ] API authentication implemented
- [ ] HTTPS/WSS enforced
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] SQL injection protection (if using database)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure storage for sensitive data
- [ ] Regular security audits

---

## License

See LICENSE file for details.

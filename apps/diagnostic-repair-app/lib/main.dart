import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'services/api_service.dart';
import 'services/websocket_service.dart';

void main() {
  runApp(const DiagnosticRepairApp());
}

class DiagnosticRepairApp extends StatelessWidget {
  const DiagnosticRepairApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>(
          create: (_) => ApiService(baseUrl: 'http://localhost:3001'),
        ),
        Provider<WebSocketService>(
          create: (_) => WebSocketService(baseUrl: 'ws://localhost:3001'),
        ),
      ],
      child: MaterialApp(
        title: 'Diagnostic & Repair',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            centerTitle: true,
            elevation: 0,
          ),
          cardTheme: CardTheme(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        home: const HomeScreen(),
      ),
    );
  }
}

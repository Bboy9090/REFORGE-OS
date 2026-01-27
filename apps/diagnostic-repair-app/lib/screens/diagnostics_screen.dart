import 'package:flutter/material.dart';

class DiagnosticsScreen extends StatelessWidget {
  const DiagnosticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildDiagnosticCard(
              context,
              'Battery Health',
              Icons.battery_full,
              Colors.green,
              () => _showComingSoon(context),
            ),
            _buildDiagnosticCard(
              context,
              'Hardware',
              Icons.phone_android,
              Colors.blue,
              () => _showComingSoon(context),
            ),
            _buildDiagnosticCard(
              context,
              'Network',
              Icons.wifi,
              Colors.orange,
              () => _showComingSoon(context),
            ),
            _buildDiagnosticCard(
              context,
              'System Logs',
              Icons.description,
              Colors.purple,
              () => _showComingSoon(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiagnosticCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 48, color: color),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Feature coming soon!'),
        duration: Duration(seconds: 2),
      ),
    );
  }
}

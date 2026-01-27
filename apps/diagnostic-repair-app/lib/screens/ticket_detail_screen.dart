import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/repair_ticket.dart';
import '../services/api_service.dart';

class TicketDetailScreen extends StatefulWidget {
  final String ticketId;

  const TicketDetailScreen({super.key, required this.ticketId});

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  RepairTicket? _ticket;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadTicket();
  }

  Future<void> _loadTicket() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final ticket = await apiService.getTicket(widget.ticketId);
      setState(() {
        _ticket = ticket;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_ticket?.ticketNumber ?? 'Ticket Details'),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error: $_errorMessage'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadTicket,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_ticket == null) {
      return const Center(child: Text('No ticket data'));
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildInfoCard(
          'Customer',
          [
            _buildInfoRow('Name', _ticket!.customer.name),
            _buildInfoRow('Phone', _ticket!.customer.phone),
            if (_ticket!.customer.email != null)
              _buildInfoRow('Email', _ticket!.customer.email!),
          ],
        ),
        const SizedBox(height: 16),
        _buildInfoCard(
          'Device',
          [
            _buildInfoRow('Type', _ticket!.device.type),
            if (_ticket!.device.manufacturer != null)
              _buildInfoRow('Manufacturer', _ticket!.device.manufacturer!),
            if (_ticket!.device.model != null)
              _buildInfoRow('Model', _ticket!.device.model!),
            if (_ticket!.device.serial != null)
              _buildInfoRow('Serial', _ticket!.device.serial!),
            if (_ticket!.device.imei != null)
              _buildInfoRow('IMEI', _ticket!.device.imei!),
          ],
        ),
        const SizedBox(height: 16),
        _buildInfoCard(
          'Issue',
          [
            _buildInfoRow('Description', _ticket!.issue.description),
            _buildInfoRow('Status', _ticket!.status.toUpperCase()),
            _buildInfoRow('Priority', _ticket!.priority.toUpperCase()),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const Divider(),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}

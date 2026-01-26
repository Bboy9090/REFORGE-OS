import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/repair_ticket.dart';

class ApiService {
  final String baseUrl;
  
  ApiService({required this.baseUrl});

  Map<String, String> get headers => {
    'Content-Type': 'application/json',
  };

  // ========================================================================
  // Repair Tickets API
  // ========================================================================

  Future<RepairTicket> createTicket({
    required String customerName,
    required String customerPhone,
    String? customerEmail,
    required String deviceType,
    String? deviceManufacturer,
    String? deviceModel,
    String? deviceSerial,
    String? deviceImei,
    required String issueDescription,
    double? estimatedCost,
    String priority = 'normal',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/tickets'),
      headers: headers,
      body: jsonEncode({
        'customerName': customerName,
        'customerPhone': customerPhone,
        'customerEmail': customerEmail,
        'deviceType': deviceType,
        'deviceManufacturer': deviceManufacturer,
        'deviceModel': deviceModel,
        'deviceSerial': deviceSerial,
        'deviceImei': deviceImei,
        'issueDescription': issueDescription,
        'estimatedCost': estimatedCost,
        'priority': priority,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return RepairTicket.fromJson(data['data']['ticket']);
    } else {
      throw Exception('Failed to create ticket: ${response.body}');
    }
  }

  Future<List<RepairTicket>> getTickets({
    String? status,
    String? priority,
    String? deviceType,
  }) async {
    final queryParams = <String, String>{};
    if (status != null) queryParams['status'] = status;
    if (priority != null) queryParams['priority'] = priority;
    if (deviceType != null) queryParams['deviceType'] = deviceType;

    final uri = Uri.parse('$baseUrl/api/v1/tickets').replace(
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final tickets = (data['data']['tickets'] as List)
          .map((json) => RepairTicket.fromJson(json))
          .toList();
      return tickets;
    } else {
      throw Exception('Failed to load tickets: ${response.body}');
    }
  }

  Future<RepairTicket> getTicket(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/tickets/$id'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return RepairTicket.fromJson(data['data']['ticket']);
    } else {
      throw Exception('Failed to load ticket: ${response.body}');
    }
  }

  Future<RepairTicket> updateTicket(
    String id, {
    String? status,
    String? priority,
    double? actualCost,
    String? notes,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/v1/tickets/$id'),
      headers: headers,
      body: jsonEncode({
        if (status != null) 'status': status,
        if (priority != null) 'priority': priority,
        if (actualCost != null) 'actualCost': actualCost,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return RepairTicket.fromJson(data['data']['ticket']);
    } else {
      throw Exception('Failed to update ticket: ${response.body}');
    }
  }

  Future<void> deleteTicket(String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/v1/tickets/$id'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete ticket: ${response.body}');
    }
  }

  Future<RepairTicket> addDiagnosticResult(
    String ticketId, {
    required String type,
    required Map<String, dynamic> results,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/tickets/$ticketId/diagnostics'),
      headers: headers,
      body: jsonEncode({
        'type': type,
        'results': results,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return RepairTicket.fromJson(data['data']['ticket']);
    } else {
      throw Exception('Failed to add diagnostic result: ${response.body}');
    }
  }

  Future<RepairTicket> addRepairStep(
    String ticketId, {
    required String description,
    String status = 'pending',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/tickets/$ticketId/repair-steps'),
      headers: headers,
      body: jsonEncode({
        'description': description,
        'status': status,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return RepairTicket.fromJson(data['data']['ticket']);
    } else {
      throw Exception('Failed to add repair step: ${response.body}');
    }
  }

  // ========================================================================
  // Diagnostics API
  // ========================================================================

  Future<Map<String, dynamic>> getBatteryDiagnostics(String deviceSerial) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/diagnostics/battery/$deviceSerial'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get battery diagnostics: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> getHardwareDiagnostics(String deviceSerial) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/diagnostics/hardware/$deviceSerial'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get hardware diagnostics: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> getNetworkDiagnostics(String deviceSerial) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/diagnostics/network/$deviceSerial'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get network diagnostics: ${response.body}');
    }
  }

  Future<String> getSystemLogs(
    String deviceSerial, {
    String type = 'logcat',
    String? level,
    String? tag,
    int? lines,
  }) async {
    final queryParams = <String, String>{};
    if (level != null) queryParams['level'] = level;
    if (tag != null) queryParams['tag'] = tag;
    if (lines != null) queryParams['lines'] = lines.toString();

    final uri = Uri.parse('$baseUrl/api/v1/diagnostics/logs/$deviceSerial/$type').replace(
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );

    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']['logs'];
    } else {
      throw Exception('Failed to get system logs: ${response.body}');
    }
  }
}

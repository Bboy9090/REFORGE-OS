class RepairTicket {
  final String id;
  final String ticketNumber;
  final String status;
  final String priority;
  final CustomerInfo customer;
  final DeviceInfo device;
  final IssueInfo issue;
  final CostInfo cost;
  final TimelineInfo timeline;
  final List<Note> notes;
  final List<DiagnosticResult> diagnostics;
  final List<RepairStep> repairSteps;

  RepairTicket({
    required this.id,
    required this.ticketNumber,
    required this.status,
    required this.priority,
    required this.customer,
    required this.device,
    required this.issue,
    required this.cost,
    required this.timeline,
    this.notes = const [],
    this.diagnostics = const [],
    this.repairSteps = const [],
  });

  factory RepairTicket.fromJson(Map<String, dynamic> json) {
    return RepairTicket(
      id: json['id'] ?? '',
      ticketNumber: json['ticketNumber'] ?? '',
      status: json['status'] ?? 'pending',
      priority: json['priority'] ?? 'normal',
      customer: CustomerInfo.fromJson(json['customer'] ?? {}),
      device: DeviceInfo.fromJson(json['device'] ?? {}),
      issue: IssueInfo.fromJson(json['issue'] ?? {}),
      cost: CostInfo.fromJson(json['cost'] ?? {}),
      timeline: TimelineInfo.fromJson(json['timeline'] ?? {}),
      notes: (json['notes'] as List<dynamic>?)
          ?.map((n) => Note.fromJson(n))
          .toList() ?? [],
      diagnostics: (json['diagnostics'] as List<dynamic>?)
          ?.map((d) => DiagnosticResult.fromJson(d))
          .toList() ?? [],
      repairSteps: (json['repairSteps'] as List<dynamic>?)
          ?.map((r) => RepairStep.fromJson(r))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticketNumber': ticketNumber,
      'status': status,
      'priority': priority,
      'customer': customer.toJson(),
      'device': device.toJson(),
      'issue': issue.toJson(),
      'cost': cost.toJson(),
      'timeline': timeline.toJson(),
      'notes': notes.map((n) => n.toJson()).toList(),
      'diagnostics': diagnostics.map((d) => d.toJson()).toList(),
      'repairSteps': repairSteps.map((r) => r.toJson()).toList(),
    };
  }
}

class CustomerInfo {
  final String name;
  final String? email;
  final String phone;

  CustomerInfo({
    required this.name,
    this.email,
    required this.phone,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) {
    return CustomerInfo(
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
    };
  }
}

class DeviceInfo {
  final String type;
  final String? manufacturer;
  final String? model;
  final String? serial;
  final String? imei;

  DeviceInfo({
    required this.type,
    this.manufacturer,
    this.model,
    this.serial,
    this.imei,
  });

  factory DeviceInfo.fromJson(Map<String, dynamic> json) {
    return DeviceInfo(
      type: json['type'] ?? 'unknown',
      manufacturer: json['manufacturer'],
      model: json['model'],
      serial: json['serial'],
      imei: json['imei'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'manufacturer': manufacturer,
      'model': model,
      'serial': serial,
      'imei': imei,
    };
  }
}

class IssueInfo {
  final String description;
  final String? category;
  final String? severity;

  IssueInfo({
    required this.description,
    this.category,
    this.severity,
  });

  factory IssueInfo.fromJson(Map<String, dynamic> json) {
    return IssueInfo(
      description: json['description'] ?? '',
      category: json['category'],
      severity: json['severity'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      'category': category,
      'severity': severity,
    };
  }
}

class CostInfo {
  final double estimated;
  final double? actual;
  final String currency;

  CostInfo({
    required this.estimated,
    this.actual,
    this.currency = 'USD',
  });

  factory CostInfo.fromJson(Map<String, dynamic> json) {
    return CostInfo(
      estimated: (json['estimated'] ?? 0).toDouble(),
      actual: json['actual']?.toDouble(),
      currency: json['currency'] ?? 'USD',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'estimated': estimated,
      'actual': actual,
      'currency': currency,
    };
  }
}

class TimelineInfo {
  final DateTime created;
  final DateTime updated;
  final DateTime? started;
  final DateTime? completed;
  final DateTime? estimatedCompletion;

  TimelineInfo({
    required this.created,
    required this.updated,
    this.started,
    this.completed,
    this.estimatedCompletion,
  });

  factory TimelineInfo.fromJson(Map<String, dynamic> json) {
    return TimelineInfo(
      created: DateTime.parse(json['created'] ?? DateTime.now().toIso8601String()),
      updated: DateTime.parse(json['updated'] ?? DateTime.now().toIso8601String()),
      started: json['started'] != null ? DateTime.parse(json['started']) : null,
      completed: json['completed'] != null ? DateTime.parse(json['completed']) : null,
      estimatedCompletion: json['estimatedCompletion'] != null 
          ? DateTime.parse(json['estimatedCompletion']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'created': created.toIso8601String(),
      'updated': updated.toIso8601String(),
      'started': started?.toIso8601String(),
      'completed': completed?.toIso8601String(),
      'estimatedCompletion': estimatedCompletion?.toIso8601String(),
    };
  }
}

class Note {
  final String id;
  final String text;
  final DateTime timestamp;

  Note({
    required this.id,
    required this.text,
    required this.timestamp,
  });

  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class DiagnosticResult {
  final String id;
  final String type;
  final Map<String, dynamic> results;
  final DateTime timestamp;

  DiagnosticResult({
    required this.id,
    required this.type,
    required this.results,
    required this.timestamp,
  });

  factory DiagnosticResult.fromJson(Map<String, dynamic> json) {
    return DiagnosticResult(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      results: json['results'] ?? {},
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'results': results,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class RepairStep {
  final String id;
  final String description;
  final String status;
  final DateTime timestamp;
  final DateTime? completedAt;

  RepairStep({
    required this.id,
    required this.description,
    required this.status,
    required this.timestamp,
    this.completedAt,
  });

  factory RepairStep.fromJson(Map<String, dynamic> json) {
    return RepairStep(
      id: json['id'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'description': description,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

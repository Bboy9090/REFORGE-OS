import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  final String baseUrl;
  WebSocketChannel? _channel;
  StreamController<Map<String, dynamic>>? _controller;

  WebSocketService({required this.baseUrl});

  Stream<Map<String, dynamic>> connect(String path) {
    _controller = StreamController<Map<String, dynamic>>.broadcast();
    
    try {
      final uri = Uri.parse('$baseUrl$path');
      _channel = WebSocketChannel.connect(uri);
      
      _channel!.stream.listen(
        (message) {
          try {
            final data = jsonDecode(message.toString());
            _controller!.add(data);
          } catch (e) {
            print('Error parsing WebSocket message: $e');
          }
        },
        onError: (error) {
          print('WebSocket error: $error');
          _controller!.addError(error);
        },
        onDone: () {
          print('WebSocket connection closed');
          _controller!.close();
        },
      );
    } catch (e) {
      print('Error connecting to WebSocket: $e');
      _controller!.addError(e);
    }

    return _controller!.stream;
  }

  void send(Map<String, dynamic> message) {
    if (_channel != null) {
      _channel!.sink.add(jsonEncode(message));
    }
  }

  void disconnect() {
    _channel?.sink.close();
    _controller?.close();
  }

  // Device events WebSocket
  Stream<Map<String, dynamic>> connectToDeviceEvents() {
    return connect('/ws/device-events');
  }

  // Analytics WebSocket
  Stream<Map<String, dynamic>> connectToAnalytics() {
    return connect('/ws/analytics');
  }

  // Correlation WebSocket
  Stream<Map<String, dynamic>> connectToCorrelation() {
    return connect('/ws/correlation');
  }
}

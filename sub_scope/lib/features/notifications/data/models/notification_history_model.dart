import 'package:equatable/equatable.dart';

/// Notification history model matching the database schema
class NotificationHistory extends Equatable {
  final String id;
  final String userId;
  final String? subscriptionId;
  final String title;
  final String body;
  final bool isRead;
  final DateTime sentAt;

  const NotificationHistory({
    required this.id,
    required this.userId,
    this.subscriptionId,
    required this.title,
    required this.body,
    required this.isRead,
    required this.sentAt,
  });

  /// Create from Supabase JSON
  factory NotificationHistory.fromJson(Map<String, dynamic> json) {
    return NotificationHistory(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      subscriptionId: json['subscription_id'] as String?,
      title: json['title'] as String,
      body: json['body'] as String,
      isRead: json['is_read'] as bool? ?? false,
      sentAt: DateTime.parse(json['sent_at'] as String),
    );
  }

  /// Convert to Supabase JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'subscription_id': subscriptionId,
      'title': title,
      'body': body,
      'is_read': isRead,
      'sent_at': sentAt.toIso8601String(),
    };
  }

  /// Create a copy with updated fields
  NotificationHistory copyWith({
    String? id,
    String? userId,
    String? subscriptionId,
    String? title,
    String? body,
    bool? isRead,
    DateTime? sentAt,
  }) {
    return NotificationHistory(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      subscriptionId: subscriptionId ?? this.subscriptionId,
      title: title ?? this.title,
      body: body ?? this.body,
      isRead: isRead ?? this.isRead,
      sentAt: sentAt ?? this.sentAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        subscriptionId,
        title,
        body,
        isRead,
        sentAt,
      ];
}

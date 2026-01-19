/// Notification history model
class NotificationHistory {
  final String id;
  final String userId;
  final String subscriptionId;
  final String notificationType;
  final DateTime scheduledAt;
  final DateTime? sentAt;
  final DateTime? openedAt;
  final String status; // 'scheduled', 'sent', 'opened', 'dismissed'
  final DateTime createdAt;

  NotificationHistory({
    required this.id,
    required this.userId,
    required this.subscriptionId,
    required this.notificationType,
    required this.scheduledAt,
    this.sentAt,
    this.openedAt,
    required this.status,
    required this.createdAt,
  });

  factory NotificationHistory.fromJson(Map<String, dynamic> json) {
    return NotificationHistory(
      id: json['id'],
      userId: json['user_id'],
      subscriptionId: json['subscription_id'],
      notificationType: json['notification_type'],
      scheduledAt: DateTime.parse(json['scheduled_at']),
      sentAt: json['sent_at'] != null ? DateTime.parse(json['sent_at']) : null,
      openedAt:
          json['opened_at'] != null ? DateTime.parse(json['opened_at']) : null,
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'subscription_id': subscriptionId,
      'notification_type': notificationType,
      'scheduled_at': scheduledAt.toIso8601String(),
      'sent_at': sentAt?.toIso8601String(),
      'opened_at': openedAt?.toIso8601String(),
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

/// User notification preferences
class NotificationPreferences {
  final bool enabled;
  final List<int> daysBefore; // e.g., [3, 1, 0] for 3 days, 1 day, same day

  NotificationPreferences({
    required this.enabled,
    required this.daysBefore,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      enabled: json['notifications_enabled'] ?? true,
      daysBefore: (json['notification_days_before'] as List?)
              ?.map((e) => e as int)
              .toList() ??
          [3, 1, 0],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notifications_enabled': enabled,
      'notification_days_before': daysBefore,
    };
  }
}

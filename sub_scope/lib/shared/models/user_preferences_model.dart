import 'package:equatable/equatable.dart';

/// User preferences model matching the database schema
class UserPreferences extends Equatable {
  final String userId;
  final String currency;
  final int notifyBeforeDays;
  final bool enablePushNotifications;
  final bool enableEmailDigest;
  final DateTime createdAt;
  final DateTime updatedAt;

  const UserPreferences({
    required this.userId,
    required this.currency,
    required this.notifyBeforeDays,
    required this.enablePushNotifications,
    required this.enableEmailDigest,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create from Supabase JSON
  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      userId: json['user_id'] as String,
      currency: json['currency'] as String? ?? 'VND',
      notifyBeforeDays: json['notify_before_days'] as int? ?? 1,
      enablePushNotifications:
          json['enable_push_notifications'] as bool? ?? true,
      enableEmailDigest: json['enable_email_digest'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  /// Convert to Supabase JSON
  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'currency': currency,
      'notify_before_days': notifyBeforeDays,
      'enable_push_notifications': enablePushNotifications,
      'enable_email_digest': enableEmailDigest,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  /// Create a copy with updated fields
  UserPreferences copyWith({
    String? userId,
    String? currency,
    int? notifyBeforeDays,
    bool? enablePushNotifications,
    bool? enableEmailDigest,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserPreferences(
      userId: userId ?? this.userId,
      currency: currency ?? this.currency,
      notifyBeforeDays: notifyBeforeDays ?? this.notifyBeforeDays,
      enablePushNotifications:
          enablePushNotifications ?? this.enablePushNotifications,
      enableEmailDigest: enableEmailDigest ?? this.enableEmailDigest,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        userId,
        currency,
        notifyBeforeDays,
        enablePushNotifications,
        enableEmailDigest,
        createdAt,
        updatedAt,
      ];
}

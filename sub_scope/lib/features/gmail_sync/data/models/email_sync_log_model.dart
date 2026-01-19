import 'package:equatable/equatable.dart';

/// Enum for email sync status
enum EmailSyncStatus {
  success('success'),
  failed('failed'),
  partial('partial');

  final String value;
  const EmailSyncStatus(this.value);

  static EmailSyncStatus fromString(String value) {
    return EmailSyncStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => EmailSyncStatus.failed,
    );
  }
}

/// Email sync log model matching the database schema
class EmailSyncLog extends Equatable {
  final String id;
  final String userId;
  final EmailSyncStatus status;
  final int emailsScannedCount;
  final int subscriptionsFoundCount;
  final String? errorMessage;
  final DateTime createdAt;

  const EmailSyncLog({
    required this.id,
    required this.userId,
    required this.status,
    required this.emailsScannedCount,
    required this.subscriptionsFoundCount,
    this.errorMessage,
    required this.createdAt,
  });

  /// Create from Supabase JSON
  factory EmailSyncLog.fromJson(Map<String, dynamic> json) {
    return EmailSyncLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      status: EmailSyncStatus.fromString(json['status'] as String),
      emailsScannedCount: json['emails_scanned_count'] as int? ?? 0,
      subscriptionsFoundCount: json['subscriptions_found_count'] as int? ?? 0,
      errorMessage: json['error_message'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  /// Convert to Supabase JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'status': status.value,
      'emails_scanned_count': emailsScannedCount,
      'subscriptions_found_count': subscriptionsFoundCount,
      'error_message': errorMessage,
      'created_at': createdAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        status,
        emailsScannedCount,
        subscriptionsFoundCount,
        errorMessage,
        createdAt,
      ];
}

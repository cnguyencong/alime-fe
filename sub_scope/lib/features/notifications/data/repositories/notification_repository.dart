import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/config/supabase_config.dart';
import '../models/notification_models.dart';

/// Repository for notification preferences and history
class NotificationRepository {
  final SupabaseClient _supabase = SupabaseConfig.client;

  /// Get user's notification preferences
  Future<NotificationPreferences> getPreferences() async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final response = await _supabase
          .from('user_preferences')
          .select()
          .eq('user_id', userId)
          .maybeSingle();

      if (response == null) {
        // Return default preferences if none exist
        return NotificationPreferences(
          enabled: true,
          daysBefore: [3, 1, 0],
        );
      }

      return NotificationPreferences.fromJson(response);
    } catch (e) {
      // Return default on error
      return NotificationPreferences(
        enabled: true,
        daysBefore: [3, 1, 0],
      );
    }
  }

  /// Update user's notification preferences
  Future<void> updatePreferences(NotificationPreferences preferences) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final data = {
        'user_id': userId,
        ...preferences.toJson(),
      };

      await _supabase.from('user_preferences').upsert(data);
    } catch (e) {
      throw Exception('Failed to update preferences: $e');
    }
  }

  /// Get notification history
  Future<List<NotificationHistory>> getHistory({int limit = 50}) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final response = await _supabase
          .from('notification_history')
          .select()
          .eq('user_id', userId)
          .order('scheduled_at', ascending: false)
          .limit(limit);

      return (response as List)
          .map((json) => NotificationHistory.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch notification history: $e');
    }
  }

  /// Save notification to history
  Future<void> saveNotification({
    required String subscriptionId,
    required String notificationType,
    required DateTime scheduledAt,
  }) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) return;

      final data = {
        'user_id': userId,
        'subscription_id': subscriptionId,
        'notification_type': notificationType,
        'scheduled_at': scheduledAt.toIso8601String(),
        'status': 'scheduled',
      };

      await _supabase.from('notification_history').insert(data);
    } catch (e) {
      print('Failed to save notification history: $e');
    }
  }

  /// Mark notification as sent
  Future<void> markAsSent(String notificationId) async {
    try {
      await _supabase.from('notification_history').update({
        'status': 'sent',
        'sent_at': DateTime.now().toIso8601String(),
      }).eq('id', notificationId);
    } catch (e) {
      print('Failed to mark notification as sent: $e');
    }
  }

  /// Clear all notification history
  Future<void> clearHistory() async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) return;

      await _supabase
          .from('notification_history')
          .delete()
          .eq('user_id', userId);
    } catch (e) {
      throw Exception('Failed to clear history: $e');
    }
  }
}

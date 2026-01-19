import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/notification_models.dart';
import '../repositories/notification_repository.dart';
import '../services/notification_service.dart';

/// Provider for NotificationService
final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

/// Provider for NotificationRepository
final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository();
});

/// Provider for notification preferences
final notificationPreferencesProvider =
    FutureProvider<NotificationPreferences>((ref) async {
  final repository = ref.watch(notificationRepositoryProvider);
  return await repository.getPreferences();
});

/// Provider for notification history
final notificationHistoryProvider =
    FutureProvider<List<NotificationHistory>>((ref) async {
  final repository = ref.watch(notificationRepositoryProvider);
  return await repository.getHistory();
});

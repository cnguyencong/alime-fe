import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import '../../../subscriptions/data/models/subscription_model.dart';

/// Local notification service for scheduling renewal reminders
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;

  /// Initialize notification service
  Future<void> initialize() async {
    if (_initialized) return;

    // Initialize timezone database
    tz.initializeTimeZones();

    // Android initialization settings
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS initialization settings
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    // macOS initialization settings
    const macOSSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
      macOS: macOSSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    _initialized = true;
  }

  /// Request notification permissions (iOS/macOS)
  Future<bool> requestPermissions() async {
    final result = await _notifications
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );

    return result ?? false;
  }

  /// Schedule renewal reminder notifications for a subscription
  Future<void> scheduleRenewalReminders({
    required Subscription subscription,
    required List<int> daysBefore, // e.g., [3, 1, 0]
  }) async {
    if (!_initialized) await initialize();
    if (subscription.nextBillingDate == null) return;

    // Cancel existing notifications for this subscription
    await cancelSubscriptionNotifications(subscription.id);

    for (final days in daysBefore) {
      final notificationDate =
          subscription.nextBillingDate!.subtract(Duration(days: days));

      // Only schedule if date is in the future
      if (notificationDate.isAfter(DateTime.now())) {
        await _scheduleNotification(
          id: _generateNotificationId(subscription.id, days),
          title: 'Subscription Renewal Reminder',
          body: days == 0
              ? '${subscription.name} (${subscription.price} ${subscription.currency}) renews today!'
              : '${subscription.name} (${subscription.price} ${subscription.currency}) renews in $days day${days > 1 ? 's' : ''}',
          scheduledDate: notificationDate,
          payload: subscription.id,
        );
      }
    }
  }

  /// Schedule a single notification
  Future<void> _scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    // Set notification time to 9:00 AM
    final scheduleTime = DateTime(
      scheduledDate.year,
      scheduledDate.month,
      scheduledDate.day,
      9, // 9 AM
      0,
    );

    final tzScheduleTime = tz.TZDateTime.from(scheduleTime, tz.local);

    const androidDetails = AndroidNotificationDetails(
      'renewal_reminders',
      'Renewal Reminders',
      channelDescription: 'Notifications for upcoming subscription renewals',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
      macOS: iosDetails,
    );

    await _notifications.zonedSchedule(
      id,
      title,
      body,
      tzScheduleTime,
      notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: payload,
    );

    print('📅 Scheduled notification #$id for $scheduleTime');
  }

  /// Cancel all notifications for a subscription
  Future<void> cancelSubscriptionNotifications(String subscriptionId) async {
    // Cancel notifications for all possible days (0-7)
    for (int days = 0; days <= 7; days++) {
      final id = _generateNotificationId(subscriptionId, days);
      await _notifications.cancel(id);
    }
  }

  /// Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  /// Get pending notifications
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notifications.pendingNotificationRequests();
  }

  /// Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) {
      // TODO: Navigate to subscription detail screen
      print('Notification tapped: $payload');
    }
  }

  /// Generate unique notification ID from subscription ID and days
  int _generateNotificationId(String subscriptionId, int days) {
    // Use hash code of subscription ID + days to generate unique int ID
    return '${subscriptionId}_$days'.hashCode;
  }
}

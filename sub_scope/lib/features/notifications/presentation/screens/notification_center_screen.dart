import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/providers/notification_provider.dart';
import '../../../../core/utils/date_utils.dart' as app_date_utils;

/// Notification center screen showing notification history
class NotificationCenterScreen extends ConsumerWidget {
  const NotificationCenterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(notificationHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.pushNamed(context, '/notifications/preferences');
            },
          ),
        ],
      ),
      body: historyAsync.when(
        data: (history) {
          if (history.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none,
                    size: 80,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No notifications yet',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Renewal reminders will appear here',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[500],
                        ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: history.length,
            itemBuilder: (context, index) {
              final notification = history[index];
              final isScheduled = notification.status == 'scheduled';
              final isSent = notification.status == 'sent';

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isScheduled
                          ? Colors.blue[100]
                          : isSent
                              ? Colors.green[100]
                              : Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      isScheduled
                          ? Icons.schedule
                          : isSent
                              ? Icons.check_circle
                              : Icons.notifications,
                      color: isScheduled
                          ? Colors.blue[700]
                          : isSent
                              ? Colors.green[700]
                              : Colors.grey[700],
                      size: 20,
                    ),
                  ),
                  title: Text(
                    notification.notificationType
                        .replaceAll('_', ' ')
                        .toUpperCase(),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(
                        'Scheduled: ${app_date_utils.DateUtils.formatDate(notification.scheduledAt)}',
                      ),
                      if (notification.sentAt != null)
                        Text(
                          'Sent: ${app_date_utils.DateUtils.formatDate(notification.sentAt!)}',
                          style: TextStyle(color: Colors.green[700]),
                        ),
                    ],
                  ),
                  trailing: Chip(
                    label: Text(
                      notification.status.toUpperCase(),
                      style: const TextStyle(fontSize: 10),
                    ),
                    backgroundColor: isScheduled
                        ? Colors.blue[50]
                        : isSent
                            ? Colors.green[50]
                            : Colors.grey[50],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
            ],
          ),
        ),
      ),
    );
  }
}

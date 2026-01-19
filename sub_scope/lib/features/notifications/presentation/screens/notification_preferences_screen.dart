import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/notification_models.dart';
import '../../data/providers/notification_provider.dart';
import '../../../subscriptions/data/providers/subscription_provider.dart';

/// Notification preferences screen
class NotificationPreferencesScreen extends ConsumerStatefulWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  ConsumerState<NotificationPreferencesScreen> createState() =>
      _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState
    extends ConsumerState<NotificationPreferencesScreen> {
  bool _enabled = true;
  final Set<int> _selectedDays = {3, 1, 0};
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefsAsync = ref.read(notificationPreferencesProvider);
    prefsAsync.when(
      data: (prefs) {
        setState(() {
          _enabled = prefs.enabled;
          _selectedDays.clear();
          _selectedDays.addAll(prefs.daysBefore);
        });
      },
      loading: () {},
      error: (_, __) {},
    );
  }

  Future<void> _savePreferences() async {
    setState(() => _isSaving = true);

    try {
      final repository = ref.read(notificationRepositoryProvider);
      final notificationService = ref.read(notificationServiceProvider);

      final preferences = NotificationPreferences(
        enabled: _enabled,
        daysBefore: _selectedDays.toList()..sort((a, b) => b.compareTo(a)),
      );

      await repository.updatePreferences(preferences);

      // Reschedule all notifications with new preferences
      if (_enabled) {
        final subscriptionsAsync = ref.read(subscriptionsProvider);
        await subscriptionsAsync.when(
          data: (subscriptions) async {
            for (final sub in subscriptions) {
              await notificationService.scheduleRenewalReminders(
                subscription: sub,
                daysBefore: preferences.daysBefore,
              );
            }
          },
          loading: () async {},
          error: (_, __) async {},
        );
      } else {
        // Cancel all notifications if disabled
        await notificationService.cancelAllNotifications();
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Preferences saved successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Preferences'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Enable/Disable toggle
          Card(
            child: SwitchListTile(
              title: const Text('Enable Notifications'),
              subtitle: const Text('Receive renewal reminders'),
              value: _enabled,
              onChanged: (value) {
                setState(() => _enabled = value);
              },
            ),
          ),
          const SizedBox(height: 16),

          // Reminder timing
          Text(
            'Reminder Timing',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose when to receive reminders before renewal',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 12),

          Card(
            child: Column(
              children: [
                CheckboxListTile(
                  title: const Text('3 days before'),
                  value: _selectedDays.contains(3),
                  enabled: _enabled,
                  onChanged: (value) {
                    setState(() {
                      if (value == true) {
                        _selectedDays.add(3);
                      } else {
                        _selectedDays.remove(3);
                      }
                    });
                  },
                ),
                const Divider(height: 1),
                CheckboxListTile(
                  title: const Text('1 day before'),
                  value: _selectedDays.contains(1),
                  enabled: _enabled,
                  onChanged: (value) {
                    setState(() {
                      if (value == true) {
                        _selectedDays.add(1);
                      } else {
                        _selectedDays.remove(1);
                      }
                    });
                  },
                ),
                const Divider(height: 1),
                CheckboxListTile(
                  title: const Text('On renewal day'),
                  value: _selectedDays.contains(0),
                  enabled: _enabled,
                  onChanged: (value) {
                    setState(() {
                      if (value == true) {
                        _selectedDays.add(0);
                      } else {
                        _selectedDays.remove(0);
                      }
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Save button
          ElevatedButton(
            onPressed:
                _isSaving || _selectedDays.isEmpty ? null : _savePreferences,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: _isSaving
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save Preferences'),
          ),

          if (_selectedDays.isEmpty && _enabled)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Please select at least one reminder timing',
                style: TextStyle(
                  color: Colors.red[700],
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
    );
  }
}

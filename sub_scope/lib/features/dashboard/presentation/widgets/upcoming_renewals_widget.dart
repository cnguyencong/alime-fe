import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../subscriptions/data/providers/subscription_provider.dart';
import '../../../subscriptions/data/models/subscription_model.dart';
import '../../../../core/utils/currency_utils.dart';
import '../../../../core/utils/date_utils.dart' as app_date_utils;

/// Upcoming renewals widget showing subscriptions renewing soon
class UpcomingRenewalsWidget extends ConsumerWidget {
  const UpcomingRenewalsWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final upcomingAsync = ref.watch(upcomingRenewalsProvider);

    return upcomingAsync.when(
      data: (renewals) {
        if (renewals.isEmpty) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    size: 48,
                    color: Colors.green[300],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'No upcoming renewals',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
            ),
          );
        }

        return Column(
          children:
              renewals.map((sub) => _buildRenewalCard(context, sub)).toList(),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text('Error: $error'),
        ),
      ),
    );
  }

  Widget _buildRenewalCard(BuildContext context, Subscription subscription) {
    final daysUntil = subscription.nextBillingDate != null
        ? app_date_utils.DateUtils.daysUntil(subscription.nextBillingDate!)
        : null;

    final isUrgent = daysUntil != null && daysUntil <= 3;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color: isUrgent ? Colors.red[50] : null,
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: isUrgent
                ? Colors.red[100]
                : Theme.of(context).colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.calendar_today,
            color: isUrgent
                ? Colors.red[700]
                : Theme.of(context).colorScheme.primary,
            size: 20,
          ),
        ),
        title: Text(
          subscription.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          daysUntil == null
              ? 'No renewal date'
              : daysUntil == 0
                  ? 'Renews today'
                  : daysUntil > 0
                      ? 'Renews in $daysUntil days'
                      : 'Overdue',
          style: TextStyle(
            color: isUrgent ? Colors.red[700] : Colors.grey[600],
          ),
        ),
        trailing: Text(
          CurrencyUtils.formatPrice(subscription.price, subscription.currency),
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: isUrgent ? Colors.red[700] : null,
              ),
        ),
      ),
    );
  }
}

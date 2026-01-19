import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/utils/currency_utils.dart';
import '../../../../core/utils/date_utils.dart' as app_date_utils;
import '../../data/providers/subscription_provider.dart';

/// Subscription detail screen
class SubscriptionDetailScreen extends ConsumerWidget {
  final String subscriptionId;

  const SubscriptionDetailScreen({
    super.key,
    required this.subscriptionId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repository = ref.watch(subscriptionRepositoryProvider);

    return FutureBuilder(
      future: repository.getSubscriptionById(subscriptionId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: const Text('Error')),
            body: Center(
              child: Text('Error: ${snapshot.error}'),
            ),
          );
        }

        final subscription = snapshot.data!;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Subscription Details'),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  context.push('/subscriptions/$subscriptionId/edit');
                },
              ),
              IconButton(
                icon: const Icon(Icons.delete),
                onPressed: () => _showDeleteDialog(context, ref),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Icon/Logo
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color:
                        Theme.of(context).colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Icon(
                    Icons.subscriptions,
                    size: 50,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Name
              Center(
                child: Text(
                  subscription.name,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),

              // Price
              Center(
                child: Text(
                  CurrencyUtils.formatPrice(
                    subscription.price,
                    subscription.currency,
                  ),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
              const SizedBox(height: 32),

              // Details card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailRow(
                        context,
                        'Billing Cycle',
                        subscription.billingCycle.value == 'monthly'
                            ? 'Monthly'
                            : 'Yearly',
                        Icons.calendar_today,
                      ),
                      const Divider(height: 24),
                      _buildDetailRow(
                        context,
                        'Start Date',
                        app_date_utils.DateUtils.formatDate(
                            subscription.startDate),
                        Icons.event,
                      ),
                      const Divider(height: 24),
                      _buildDetailRow(
                        context,
                        'Next Billing',
                        subscription.nextBillingDate != null
                            ? app_date_utils.DateUtils.formatDate(
                                subscription.nextBillingDate!)
                            : 'N/A',
                        Icons.event_available,
                      ),
                      if (subscription.nextBillingDate != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          app_date_utils.DateUtils.formatRelativeTime(
                            subscription.nextBillingDate!,
                          ),
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                        ),
                      ],
                      const Divider(height: 24),
                      _buildDetailRow(
                        context,
                        'Currency',
                        subscription.currency,
                        Icons.attach_money,
                      ),
                      const Divider(height: 24),
                      _buildDetailRow(
                        context,
                        'Source',
                        subscription.source.value == 'manual'
                            ? 'Added manually'
                            : 'Gmail scan',
                        Icons.source,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Cost breakdown card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Cost Breakdown',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      const SizedBox(height: 16),
                      _buildCostRow(
                        context,
                        'Monthly',
                        subscription.billingCycle.value == 'monthly'
                            ? subscription.price
                            : subscription.price / 12,
                        subscription.currency,
                      ),
                      const SizedBox(height: 8),
                      _buildCostRow(
                        context,
                        'Yearly',
                        subscription.billingCycle.value == 'yearly'
                            ? subscription.price
                            : subscription.price * 12,
                        subscription.currency,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCostRow(
    BuildContext context,
    String period,
    double amount,
    String currency,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          period,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        Text(
          CurrencyUtils.formatPrice(amount, currency),
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }

  Future<void> _showDeleteDialog(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Subscription'),
        content: const Text(
          'Are you sure you want to delete this subscription? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      try {
        final repository = ref.read(subscriptionRepositoryProvider);
        await repository.deleteSubscription(subscriptionId);

        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Subscription deleted'),
              backgroundColor: Colors.green,
            ),
          );
          context.pop();
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }
}

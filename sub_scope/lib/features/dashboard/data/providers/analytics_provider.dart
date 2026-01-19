import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../subscriptions/data/providers/subscription_provider.dart';
import '../../../subscriptions/data/models/subscription_model.dart';
import '../../../../core/utils/currency_utils.dart';

/// Provider for top subscriptions by price
final topSubscriptionsProvider =
    Provider<AsyncValue<List<Subscription>>>((ref) {
  final subscriptionsAsync = ref.watch(subscriptionsProvider);

  return subscriptionsAsync.whenData((subscriptions) {
    final sorted = List<Subscription>.from(subscriptions)
      ..sort((a, b) => b.price.compareTo(a.price));
    return sorted.take(5).toList();
  });
});

/// Provider for spending breakdown by service (converted to VND)
final spendingBreakdownProvider =
    Provider<AsyncValue<Map<String, double>>>((ref) {
  final subscriptionsAsync = ref.watch(subscriptionsProvider);
  const targetCurrency = 'VND';

  return subscriptionsAsync.whenData((subscriptions) {
    final breakdown = <String, double>{};

    for (final sub in subscriptions) {
      // Convert to target currency first
      final convertedPrice = CurrencyUtils.convertCurrency(
        amount: sub.price,
        fromCurrency: sub.currency,
        toCurrency: targetCurrency,
      );

      // Convert to monthly equivalent for comparison
      final monthlyAmount = sub.billingCycle == BillingCycle.monthly
          ? convertedPrice
          : convertedPrice / 12;

      breakdown[sub.name] = (breakdown[sub.name] ?? 0) + monthlyAmount;
    }

    return breakdown;
  });
});

/// Provider for active subscription count
final activeSubscriptionCountProvider = Provider<AsyncValue<int>>((ref) {
  final subscriptionsAsync = ref.watch(subscriptionsProvider);
  return subscriptionsAsync.whenData((subs) => subs.length);
});

/// Provider for average subscription cost
final averageSubscriptionCostProvider = Provider<AsyncValue<double>>((ref) {
  final subscriptionsAsync = ref.watch(subscriptionsProvider);
  final monthlySpendingAsync = ref.watch(monthlySpendingProvider);

  return subscriptionsAsync.whenData((subs) {
    if (subs.isEmpty) return 0.0;

    return monthlySpendingAsync.when(
      data: (total) => total / subs.length,
      loading: () => 0.0,
      error: (_, __) => 0.0,
    );
  });
});

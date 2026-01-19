import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/subscription_model.dart';
import '../repositories/subscription_repository.dart';

/// Provider for SubscriptionRepository
final subscriptionRepositoryProvider = Provider<SubscriptionRepository>((ref) {
  return SubscriptionRepository();
});

/// Provider for all subscriptions (auto-updates)
final subscriptionsProvider = StreamProvider<List<Subscription>>((ref) async* {
  final repository = ref.watch(subscriptionRepositoryProvider);

  // Initial fetch
  yield await repository.getSubscriptions();

  // Listen for changes (poll every 5 seconds for now)
  // TODO: Replace with Supabase realtime subscriptions in future
  while (true) {
    await Future.delayed(const Duration(seconds: 5));
    try {
      yield await repository.getSubscriptions();
    } catch (e) {
      // Keep previous data on error
    }
  }
});

/// Provider for total monthly spending
final monthlySpendingProvider = FutureProvider<double>((ref) async {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return repository.getTotalMonthlySpending();
});

/// Provider for total yearly spending
final yearlySpendingProvider = FutureProvider<double>((ref) async {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return repository.getTotalYearlySpending();
});

/// Provider for upcoming renewals (next 7 days)
final upcomingRenewalsProvider =
    FutureProvider<List<Subscription>>((ref) async {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return repository.getUpcomingRenewals(days: 7);
});

/// Provider for subscription count
final subscriptionCountProvider = Provider<int>((ref) {
  final subscriptionsAsync = ref.watch(subscriptionsProvider);
  return subscriptionsAsync.when(
    data: (subs) => subs.length,
    loading: () => 0,
    error: (_, __) => 0,
  );
});

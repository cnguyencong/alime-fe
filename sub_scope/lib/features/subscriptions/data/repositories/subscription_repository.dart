import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/config/supabase_config.dart';
import '../../../../core/utils/date_utils.dart' as app_date_utils;
import '../../../../core/utils/currency_utils.dart';
import '../models/subscription_model.dart';

/// Repository for subscription CRUD operations
class SubscriptionRepository {
  final SupabaseClient _supabase = SupabaseConfig.client;

  /// Get all subscriptions for current user
  Future<List<Subscription>> getSubscriptions() async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final response = await _supabase
          .from('subscriptions')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => Subscription.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch subscriptions: $e');
    }
  }

  /// Get single subscription by ID
  Future<Subscription> getSubscriptionById(String id) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final response = await _supabase
          .from('subscriptions')
          .select()
          .eq('id', id)
          .eq('user_id', userId)
          .single();

      return Subscription.fromJson(response);
    } catch (e) {
      throw Exception('Failed to fetch subscription: $e');
    }
  }

  /// Create new subscription
  Future<Subscription> createSubscription({
    required String name,
    required double price,
    required String currency,
    required BillingCycle billingCycle,
    required DateTime startDate,
    String? logoUrl,
  }) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Calculate next billing date
      final nextBillingDate = app_date_utils.DateUtils.calculateNextBillingDate(
        startDate: startDate,
        billingCycle: billingCycle.value,
      );

      final data = {
        'user_id': userId,
        'name': name,
        'price': price,
        'currency': currency,
        'billing_cycle': billingCycle.value,
        'start_date': startDate.toIso8601String().split('T')[0],
        'next_billing_date': nextBillingDate.toIso8601String().split('T')[0],
        'source': 'manual',
        'logo_url': logoUrl,
      };

      final response =
          await _supabase.from('subscriptions').insert(data).select().single();

      return Subscription.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create subscription: $e');
    }
  }

  /// Update existing subscription
  Future<Subscription> updateSubscription({
    required String id,
    String? name,
    double? price,
    String? currency,
    BillingCycle? billingCycle,
    DateTime? startDate,
    String? logoUrl,
  }) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Get current subscription to merge with updates
      final current = await getSubscriptionById(id);

      final updatedName = name ?? current.name;
      final updatedPrice = price ?? current.price;
      final updatedCurrency = currency ?? current.currency;
      final updatedBillingCycle = billingCycle ?? current.billingCycle;
      final updatedStartDate = startDate ?? current.startDate;

      // Recalculate next billing date if start date or cycle changed
      final nextBillingDate = app_date_utils.DateUtils.calculateNextBillingDate(
        startDate: updatedStartDate,
        billingCycle: updatedBillingCycle.value,
      );

      final data = {
        'name': updatedName,
        'price': updatedPrice,
        'currency': updatedCurrency,
        'billing_cycle': updatedBillingCycle.value,
        'start_date': updatedStartDate.toIso8601String().split('T')[0],
        'next_billing_date': nextBillingDate.toIso8601String().split('T')[0],
        'logo_url': logoUrl ?? current.logoUrl,
      };

      final response = await _supabase
          .from('subscriptions')
          .update(data)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

      return Subscription.fromJson(response);
    } catch (e) {
      throw Exception('Failed to update subscription: $e');
    }
  }

  /// Delete subscription
  Future<void> deleteSubscription(String id) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      await _supabase
          .from('subscriptions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
    } catch (e) {
      throw Exception('Failed to delete subscription: $e');
    }
  }

  /// Get total monthly spending (converted to target currency)
  Future<double> getTotalMonthlySpending({String currency = 'VND'}) async {
    try {
      final subscriptions = await getSubscriptions();
      double total = 0;

      for (final sub in subscriptions) {
        // Convert price to target currency first
        final convertedPrice = CurrencyUtils.convertCurrency(
          amount: sub.price,
          fromCurrency: sub.currency,
          toCurrency: currency,
        );

        if (sub.billingCycle == BillingCycle.monthly) {
          total += convertedPrice;
        } else {
          // Yearly subscriptions divided by 12
          total += convertedPrice / 12;
        }
      }

      return total;
    } catch (e) {
      throw Exception('Failed to calculate monthly spending: $e');
    }
  }

  /// Get total yearly spending (converted to target currency)
  Future<double> getTotalYearlySpending({String currency = 'VND'}) async {
    try {
      final subscriptions = await getSubscriptions();
      double total = 0;

      for (final sub in subscriptions) {
        // Convert price to target currency first
        final convertedPrice = CurrencyUtils.convertCurrency(
          amount: sub.price,
          fromCurrency: sub.currency,
          toCurrency: currency,
        );

        if (sub.billingCycle == BillingCycle.yearly) {
          total += convertedPrice;
        } else {
          // Monthly subscriptions * 12
          total += convertedPrice * 12;
        }
      }

      return total;
    } catch (e) {
      throw Exception('Failed to calculate yearly spending: $e');
    }
  }

  /// Get upcoming renewals (next N days)
  Future<List<Subscription>> getUpcomingRenewals({int days = 7}) async {
    try {
      final subscriptions = await getSubscriptions();
      final now = DateTime.now();
      final futureDate = now.add(Duration(days: days));

      return subscriptions.where((sub) {
        if (sub.nextBillingDate == null) return false;
        return sub.nextBillingDate!.isAfter(now) &&
            sub.nextBillingDate!.isBefore(futureDate);
      }).toList();
    } catch (e) {
      throw Exception('Failed to fetch upcoming renewals: $e');
    }
  }
}

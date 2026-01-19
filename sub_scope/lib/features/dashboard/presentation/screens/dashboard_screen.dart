import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../subscriptions/data/providers/subscription_provider.dart';
import '../../data/providers/analytics_provider.dart';
import '../widgets/spending_pie_chart.dart';
import '../widgets/upcoming_renewals_widget.dart';
import '../../../../core/utils/currency_utils.dart';
import '../../../../core/widgets/gradient_background.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/config/supabase_config.dart';
import 'package:go_router/go_router.dart';

/// Modern dashboard screen with gradient background and floating orbs
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final monthlySpendingAsync = ref.watch(monthlySpendingProvider);
    final yearlySpendingAsync = ref.watch(yearlySpendingProvider);
    final subscriptionCountAsync = ref.watch(activeSubscriptionCountProvider);
    final averageCostAsync = ref.watch(averageSubscriptionCostProvider);
    final breakdownAsync = ref.watch(spendingBreakdownProvider);

    final user = SupabaseConfig.currentUser;
    final userName = user?.email?.split('@').first ?? 'there';

    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: null,
          actions: [
            Container(
              margin: const EdgeInsets.only(right: 16),
              decoration: BoxDecoration(
                color: AppTheme.primaryPurple,
                shape: BoxShape.circle,
                boxShadow: AppTheme.shadowSmall,
              ),
              child: IconButton(
                icon: const Icon(Icons.notifications_outlined,
                    color: Colors.white),
                onPressed: () => context.push('/notifications/center'),
              ),
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(subscriptionsProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.spacingLG),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Personalized Greeting
                  Text(
                    'Hi, $userName! 👋',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: AppTheme.spacingSM),
                  Text(
                    'Today is a good day to check your subscriptions',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppTheme.textSecondary,
                          fontSize: 16,
                        ),
                  ),
                  const SizedBox(height: AppTheme.spacingXL),

                  // Summary Cards
                  Row(
                    children: [
                      Expanded(
                        child: monthlySpendingAsync.when(
                          data: (amount) => _buildGradientCard(
                            context,
                            title: 'Monthly',
                            value: CurrencyUtils.formatPrice(amount, 'VND'),
                            icon: Icons.calendar_month,
                            gradient: AppTheme.primaryGradient,
                          ),
                          loading: () => _buildGradientCard(
                            context,
                            title: 'Monthly',
                            value: '...',
                            icon: Icons.calendar_month,
                            gradient: AppTheme.primaryGradient,
                          ),
                          error: (_, __) => _buildGradientCard(
                            context,
                            title: 'Monthly',
                            value: 'Error',
                            icon: Icons.calendar_month,
                            gradient: AppTheme.primaryGradient,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: yearlySpendingAsync.when(
                          data: (amount) => _buildGradientCard(
                            context,
                            title: 'Yearly',
                            value: CurrencyUtils.formatPrice(amount, 'VND'),
                            icon: Icons.calendar_today,
                            gradient: AppTheme.pinkGradient,
                          ),
                          loading: () => _buildGradientCard(
                            context,
                            title: 'Yearly',
                            value: '...',
                            icon: Icons.calendar_today,
                            gradient: AppTheme.pinkGradient,
                          ),
                          error: (_, __) => _buildGradientCard(
                            context,
                            title: 'Yearly',
                            value: 'Error',
                            icon: Icons.calendar_today,
                            gradient: AppTheme.pinkGradient,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Additional Metrics
                  Row(
                    children: [
                      Expanded(
                        child: subscriptionCountAsync.when(
                          data: (count) => _buildGradientCard(
                            context,
                            title: 'Active',
                            value: count.toString(),
                            icon: Icons.subscriptions,
                            gradient: AppTheme.blueGradient,
                          ),
                          loading: () => _buildGradientCard(
                            context,
                            title: 'Active',
                            value: '...',
                            icon: Icons.subscriptions,
                            gradient: AppTheme.blueGradient,
                          ),
                          error: (_, __) => _buildGradientCard(
                            context,
                            title: 'Active',
                            value: 'Error',
                            icon: Icons.subscriptions,
                            gradient: AppTheme.blueGradient,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: averageCostAsync.when(
                          data: (avg) => _buildGradientCard(
                            context,
                            title: 'Average',
                            value: CurrencyUtils.formatPrice(avg, 'VND'),
                            icon: Icons.analytics,
                            gradient: const LinearGradient(
                              colors: [Color(0xFFFD79A8), Color(0xFFA29BFE)],
                            ),
                          ),
                          loading: () => _buildGradientCard(
                            context,
                            title: 'Average',
                            value: '...',
                            icon: Icons.analytics,
                            gradient: const LinearGradient(
                              colors: [Color(0xFFFD79A8), Color(0xFFA29BFE)],
                            ),
                          ),
                          error: (_, __) => _buildGradientCard(
                            context,
                            title: 'Average',
                            value: 'Error',
                            icon: Icons.analytics,
                            gradient: const LinearGradient(
                              colors: [Color(0xFFFD79A8), Color(0xFFA29BFE)],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacingXL),

                  // Spending Breakdown
                  Text(
                    'Spending Breakdown',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMedium),
                      boxShadow: AppTheme.shadowMedium,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(AppTheme.spacingLG),
                      child: breakdownAsync.when(
                        data: (breakdown) {
                          if (breakdown.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.all(32),
                              child: Center(
                                child: Text('No subscriptions yet'),
                              ),
                            );
                          }
                          return SpendingPieChart(breakdown: breakdown);
                        },
                        loading: () => const SizedBox(
                          height: 200,
                          child: Center(child: CircularProgressIndicator()),
                        ),
                        error: (error, stack) => Padding(
                          padding: const EdgeInsets.all(32),
                          child: Center(
                            child: Text('Error: $error'),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingXL),

                  // Upcoming Renewals
                  Text(
                    'Upcoming Renewals',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                  ),
                  const SizedBox(height: 12),
                  const UpcomingRenewalsWidget(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGradientCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Gradient gradient,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacingMD),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        boxShadow: AppTheme.shadowMedium,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.3),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

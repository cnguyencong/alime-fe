import 'dart:io' show Platform;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/config/supabase_config.dart';
import '../../../subscriptions/data/models/subscription_model.dart';
import '../../../subscriptions/data/repositories/subscription_repository.dart';
import '../models/email_sync_log_model.dart';
import '../models/email_parsing_mode.dart';
import '../services/gmail_service.dart';

/// Repository for Gmail integration and email parsing
class GmailRepository {
  final SupabaseClient _supabase = SupabaseConfig.client;
  final SubscriptionRepository _subscriptionRepository =
      SubscriptionRepository();
  final GmailService _gmailService = GmailService();

  /// Check if running on iOS (where Gmail OAuth works)
  bool get _isIOS {
    try {
      return Platform.isIOS;
    } catch (e) {
      return false;
    }
  }

  /// Sync Gmail - uses real API on iOS, mock data on other platforms
  /// [mode] - Parsing mode: AI or Regex
  /// In production, this would:
  /// 1. Authenticate with Gmail OAuth (iOS only)
  /// 2. Fetch recent emails
  /// 3. Parse subscription-related emails
  /// 4. Extract subscription data
  Future<EmailSyncLog> syncGmail(
      {EmailParsingMode mode = EmailParsingMode.regex}) async {
    // Use real Gmail service on iOS
    if (_isIOS) {
      return await _gmailService.syncGmail(mode: mode);
    }

    // Fall back to mock data on other platforms
    return await _syncWithMockData();
  }

  /// Sign in with Google (iOS only)
  Future<void> signInWithGoogle() async {
    if (_isIOS) {
      await _gmailService.signInWithGoogle();
    } else {
      throw Exception('Google Sign-In only available on iOS');
    }
  }

  /// Sign out from Google
  Future<void> signOut() async {
    if (_isIOS) {
      await _gmailService.signOut();
    }
  }

  /// Sync with mock data (for testing on non-iOS platforms)
  Future<EmailSyncLog> _syncWithMockData() async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Simulate email scanning
      await Future.delayed(const Duration(seconds: 2));

      // Mock data - in production, this would be real email data
      final mockEmails = _getMockSubscriptionEmails();

      int subscriptionsFound = 0;

      // Parse each email and create subscriptions
      for (final email in mockEmails) {
        final subscription = _parseSubscriptionFromEmail(email);
        if (subscription != null) {
          try {
            await _subscriptionRepository.createSubscription(
              name: subscription['name'],
              price: subscription['price'],
              currency: subscription['currency'],
              billingCycle: subscription['billingCycle'],
              startDate: subscription['startDate'],
              logoUrl: subscription['logoUrl'],
            );
            subscriptionsFound++;
          } catch (e) {
            // Skip if subscription already exists (duplicate)
          }
        }
      }

      // Create sync log
      final logData = {
        'user_id': userId,
        'status': 'success',
        'emails_scanned_count': mockEmails.length,
        'subscriptions_found_count': subscriptionsFound,
      };

      final response = await _supabase
          .from('email_sync_logs')
          .insert(logData)
          .select()
          .single();

      return EmailSyncLog.fromJson(response);
    } catch (e) {
      // Log failed sync
      final userId = SupabaseConfig.currentUserId;
      if (userId != null) {
        final logData = {
          'user_id': userId,
          'status': 'failed',
          'emails_scanned_count': 0,
          'subscriptions_found_count': 0,
          'error_message': e.toString(),
        };

        final response = await _supabase
            .from('email_sync_logs')
            .insert(logData)
            .select()
            .single();

        return EmailSyncLog.fromJson(response);
      }
      throw Exception('Gmail sync failed: $e');
    }
  }

  /// Get sync history for current user
  Future<List<EmailSyncLog>> getSyncHistory() async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final response = await _supabase
          .from('email_sync_logs')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(10);

      return (response as List)
          .map((json) => EmailSyncLog.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch sync history: $e');
    }
  }

  /// Parse subscription data from email content
  /// This is a simplified version - in production, would use NLP/regex patterns
  Map<String, dynamic>? _parseSubscriptionFromEmail(
      Map<String, dynamic> email) {
    final subject = email['subject'] as String;
    final body = email['body'] as String;

    // Pattern matching for common subscription emails
    final patterns = [
      // Netflix pattern
      RegExp(r'Netflix.*\$(\d+\.?\d*)', caseSensitive: false),
      // Spotify pattern
      RegExp(r'Spotify.*\$(\d+\.?\d*)', caseSensitive: false),
      // Generic subscription pattern
      RegExp(r'subscription.*\$(\d+\.?\d*)', caseSensitive: false),
    ];

    for (final pattern in patterns) {
      final match = pattern.firstMatch('$subject $body');
      if (match != null) {
        // Extract service name from subject
        String serviceName = 'Unknown Service';
        if (subject.toLowerCase().contains('netflix')) {
          serviceName = 'Netflix';
        } else if (subject.toLowerCase().contains('spotify')) {
          serviceName = 'Spotify';
        } else if (subject.toLowerCase().contains('youtube')) {
          serviceName = 'YouTube Premium';
        }

        // Extract price
        final priceStr = match.group(1);
        final price = double.tryParse(priceStr ?? '0') ?? 0;

        // Determine billing cycle from email content
        final isYearly = body.toLowerCase().contains('annual') ||
            body.toLowerCase().contains('yearly');

        return {
          'name': serviceName,
          'price': price,
          'currency': 'USD',
          'billingCycle': isYearly ? BillingCycle.yearly : BillingCycle.monthly,
          'startDate': DateTime.now().subtract(const Duration(days: 30)),
          'logoUrl': null,
        };
      }
    }

    return null;
  }

  /// Mock subscription emails for testing
  /// In production, these would come from Gmail API
  List<Map<String, dynamic>> _getMockSubscriptionEmails() {
    return [
      {
        'subject': 'Your Netflix subscription has been renewed',
        'body':
            'Thank you for your payment of \$15.99 for your monthly Netflix subscription.',
        'from': 'info@netflix.com',
        'date': DateTime.now().subtract(const Duration(days: 5)),
      },
      {
        'subject': 'Spotify Premium - Payment Confirmation',
        'body':
            'Your Spotify Premium subscription of \$9.99/month has been renewed.',
        'from': 'noreply@spotify.com',
        'date': DateTime.now().subtract(const Duration(days: 10)),
      },
      {
        'subject': 'YouTube Premium Annual Subscription',
        'body': 'Your annual subscription of \$119.99 has been processed.',
        'from': 'noreply@youtube.com',
        'date': DateTime.now().subtract(const Duration(days: 15)),
      },
    ];
  }

  /// Check if Gmail OAuth is configured
  /// Returns true on iOS if user is signed in with Google
  bool get isGmailConnected {
    if (_isIOS) {
      return _gmailService.isSignedIn;
    }
    return false; // Not available on other platforms
  }
}

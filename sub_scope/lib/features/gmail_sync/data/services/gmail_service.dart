import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/gmail/v1.dart' as gmail;
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/config/supabase_config.dart';
import '../../../../core/config/env_config.dart';
import '../../../subscriptions/data/models/subscription_model.dart';
import '../../../subscriptions/data/repositories/subscription_repository.dart';
import '../models/email_sync_log_model.dart';
import '../models/email_parsing_mode.dart';
import 'gemini_service.dart';

/// Real Gmail service with OAuth authentication
class GmailService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId: EnvConfig.googleClientId,
    scopes: [
      'email',
      gmail.GmailApi.gmailReadonlyScope,
    ],
  );

  final SupabaseClient _supabase = SupabaseConfig.client;
  final SubscriptionRepository _subscriptionRepository =
      SubscriptionRepository();
  final GeminiService _geminiService = GeminiService();

  /// Sign in with Google and get Gmail access
  Future<void> signInWithGoogle() async {
    try {
      await _googleSignIn.signIn();
    } catch (e) {
      throw Exception('Google Sign-In failed: $e');
    }
  }

  /// Sign out from Google
  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }

  /// Check if user is signed in
  bool get isSignedIn => _googleSignIn.currentUser != null;

  /// Sync Gmail and extract subscriptions
  /// [mode] - Parsing mode: AI or Regex
  Future<EmailSyncLog> syncGmail(
      {EmailParsingMode mode = EmailParsingMode.regex}) async {
    try {
      final userId = SupabaseConfig.currentUserId;
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Ensure Google Sign-In
      final googleUser =
          _googleSignIn.currentUser ?? await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('Google Sign-In cancelled');
      }

      // Get auth headers
      final authHeaders = await googleUser.authHeaders;
      final authenticateClient = GoogleAuthClient(authHeaders);

      // Initialize Gmail API
      final gmailApi = gmail.GmailApi(authenticateClient);

      // Fetch recent emails (last 30 days)
      final now = DateTime.now();
      final thirtyDaysAgo = now.subtract(const Duration(days: 30));
      final query = 'after:${thirtyDaysAgo.millisecondsSinceEpoch ~/ 1000} '
          '(subject:subscription OR subject:invoice OR subject:payment OR subject:receipt)';

      final messages = await gmailApi.users.messages.list(
        'me',
        q: query,
        maxResults: 50,
      );

      int emailsScanned = messages.messages?.length ?? 0;
      int subscriptionsFound = 0;

      // Debug: Print total emails found
      print('📧 Gmail Sync: Found $emailsScanned emails to scan');
      print('🔧 Parsing Mode: ${mode.displayName}');

      // Parse each email
      if (messages.messages != null) {
        for (final message in messages.messages!) {
          final fullMessage = await gmailApi.users.messages.get(
            'me',
            message.id!,
            format: 'full',
          );

          final subscription =
              await _parseSubscriptionFromEmail(fullMessage, mode);
          if (subscription != null) {
            try {
              await _subscriptionRepository.createSubscription(
                name: subscription['name'],
                price: subscription['price'],
                currency: subscription['currency'],
                billingCycle: subscription['billingCycle'],
                startDate: subscription['startDate'],
              );
              subscriptionsFound++;
              print(
                  '✅ Added subscription: ${subscription['name']} - ${subscription['price']} ${subscription['currency']}');
            } catch (e) {
              // Skip duplicates
              print('⏭️  Skipped duplicate: ${subscription['name']}');
            }
          }
        }
      }

      print(
          '🎉 Sync complete: $subscriptionsFound subscriptions found from $emailsScanned emails');

      // Create sync log
      final logData = {
        'user_id': userId,
        'status': 'success',
        'emails_scanned_count': emailsScanned,
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

  /// Parse subscription from Gmail message
  /// Uses AI or Regex based on [mode]
  Future<Map<String, dynamic>?> _parseSubscriptionFromEmail(
    gmail.Message message,
    EmailParsingMode mode,
  ) async {
    try {
      // Extract subject and body
      String subject = '';
      String body = '';

      final headers = message.payload?.headers ?? [];
      for (final header in headers) {
        if (header.name?.toLowerCase() == 'subject') {
          subject = header.value ?? '';
        }
      }

      // Get email body
      if (message.payload?.body?.data != null) {
        body = message.payload!.body!.data!;
      } else if (message.payload?.parts != null) {
        for (final part in message.payload!.parts!) {
          if (part.mimeType == 'text/plain' && part.body?.data != null) {
            body = part.body!.data!;
            break;
          }
        }
      }

      // Route to appropriate parsing method
      if (mode == EmailParsingMode.ai) {
        return await _parseWithAI(subject, body);
      } else {
        return _parseWithRegex(subject, body);
      }
    } catch (e) {
      return null;
    }
  }

  /// Parse using Gemini AI
  Future<Map<String, dynamic>?> _parseWithAI(
      String subject, String body) async {
    return await _geminiService.parseSubscriptionFromEmail(
      subject: subject,
      body: body,
    );
  }

  /// Parse using Regex patterns
  Map<String, dynamic>? _parseWithRegex(String subject, String body) {
    // Pattern matching for subscriptions
    final patterns = {
      'Netflix': RegExp(r'Netflix.*[\$€£](\d+\.?\d*)', caseSensitive: false),
      'Spotify': RegExp(r'Spotify.*[\$€£](\d+\.?\d*)', caseSensitive: false),
      'YouTube': RegExp(r'YouTube.*[\$€£](\d+\.?\d*)', caseSensitive: false),
      'Amazon Prime':
          RegExp(r'Amazon Prime.*[\$€£](\d+\.?\d*)', caseSensitive: false),
      'Apple': RegExp(r'Apple.*[\$€£](\d+\.?\d*)', caseSensitive: false),
    };

    final content = '$subject $body';

    // Debug: Print email details
    print('\n📨 ========== EMAIL DEBUG (REGEX) ==========');
    print('📧 Subject: $subject');
    print(
        '📄 Body preview: ${body.length > 200 ? body.substring(0, 200) : body}...');
    print('🔍 Searching for subscription patterns...');

    for (final entry in patterns.entries) {
      final match = entry.value.firstMatch(content);
      if (match != null) {
        final priceStr = match.group(1);
        final price = double.tryParse(priceStr ?? '0') ?? 0;

        // Determine currency from symbol
        String currency = 'USD';
        if (content.contains('€')) currency = 'EUR';
        if (content.contains('£')) currency = 'GBP';
        if (content.contains('₫')) currency = 'VND';

        // Determine billing cycle
        final isYearly = content.toLowerCase().contains('annual') ||
            content.toLowerCase().contains('yearly') ||
            content.toLowerCase().contains('year');

        // Debug: Print match result
        print('✅ MATCH FOUND!');
        print('   Service: ${entry.key}');
        print('   Price: $price $currency');
        print('   Billing: ${isYearly ? 'Yearly' : 'Monthly'}');
        print('=====================================\n');

        return {
          'name': entry.key,
          'price': price,
          'currency': currency,
          'billingCycle': isYearly ? BillingCycle.yearly : BillingCycle.monthly,
          'startDate': DateTime.now().subtract(const Duration(days: 30)),
        };
      }
    }

    // Debug: No match found
    print('❌ No subscription pattern matched');
    print('=====================================\n');
    return null;
  }
}

/// HTTP client for Google APIs
class GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = http.Client();

  GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    return _client.send(request..headers.addAll(_headers));
  }
}

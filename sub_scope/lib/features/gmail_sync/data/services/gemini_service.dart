import 'package:google_generative_ai/google_generative_ai.dart';
import '../../../../core/config/env_config.dart';
import '../../../subscriptions/data/models/subscription_model.dart';
import 'dart:convert';

/// Gemini AI service for intelligent email parsing
class GeminiService {
  late final GenerativeModel _model;

  GeminiService() {
    _model = GenerativeModel(
      model: 'gemini-2.5-flash',
      apiKey: EnvConfig.geminiApiKey,
    );
  }

  /// Parse subscription from email using Gemini AI
  Future<Map<String, dynamic>?> parseSubscriptionFromEmail({
    required String subject,
    required String body,
  }) async {
    try {
      final prompt = '''
You are an expert at analyzing subscription-related emails. Extract subscription information from the following email.

Email Subject: $subject
Email Body: ${body.length > 1000 ? body.substring(0, 1000) : body}

Extract the following information if available:
1. Service name (e.g., Netflix, Spotify, YouTube Premium, etc.)
2. Price (numeric value only, e.g., 15.99)
3. Currency code (USD, EUR, GBP, VND, etc.)
4. Billing cycle (monthly or yearly)

Return ONLY a valid JSON object with this exact structure:
{
  "service_name": "Service Name",
  "price": 15.99,
  "currency": "USD",
  "billing_cycle": "monthly"
}

Rules:
- If this is NOT a subscription email, return: {"error": "not_subscription"}
- If you cannot extract all required fields, return: {"error": "incomplete_data"}
- billing_cycle must be exactly "monthly" or "yearly"
- price must be a number
- Do not include any explanation, only return the JSON object
''';

      print('\n🤖 ========== GEMINI AI PARSING ==========');
      print('📧 Subject: $subject');
      print('🧠 Sending to Gemini AI...');

      final content = [Content.text(prompt)];
      final response = await _model.generateContent(content);

      final responseText = response.text?.trim() ?? '';
      print('📥 AI Response: $responseText');

      // Clean up response (remove markdown code blocks if present)
      String cleanedResponse =
          responseText.replaceAll('```json', '').replaceAll('```', '').trim();

      // Parse JSON response
      final jsonResponse = json.decode(cleanedResponse) as Map<String, dynamic>;

      // Check for errors
      if (jsonResponse.containsKey('error')) {
        print('❌ AI Error: ${jsonResponse['error']}');
        print('=========================================\n');
        return null;
      }

      // Validate required fields
      if (!jsonResponse.containsKey('service_name') ||
          !jsonResponse.containsKey('price') ||
          !jsonResponse.containsKey('currency') ||
          !jsonResponse.containsKey('billing_cycle')) {
        print('❌ Missing required fields');
        print('=========================================\n');
        return null;
      }

      // Convert to subscription format
      final billingCycle =
          jsonResponse['billing_cycle'].toString().toLowerCase();
      final result = {
        'name': jsonResponse['service_name'],
        'price': (jsonResponse['price'] is int)
            ? (jsonResponse['price'] as int).toDouble()
            : jsonResponse['price'],
        'currency': jsonResponse['currency'],
        'billingCycle': billingCycle == 'yearly'
            ? BillingCycle.yearly
            : BillingCycle.monthly,
        'startDate': DateTime.now().subtract(const Duration(days: 30)),
      };

      print('✅ AI PARSED SUCCESSFULLY!');
      print('   Service: ${result['name']}');
      print('   Price: ${result['price']} ${result['currency']}');
      print('   Billing: ${billingCycle == 'yearly' ? 'Yearly' : 'Monthly'}');
      print('=========================================\n');

      return result;
    } catch (e) {
      print('❌ Gemini AI Error: $e');
      print('=========================================\n');
      return null;
    }
  }

  /// Check if Gemini API is configured
  bool get isConfigured {
    return EnvConfig.geminiApiKey.isNotEmpty;
  }
}

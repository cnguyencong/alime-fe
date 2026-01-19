/// Environment configuration
///
/// To use: Fill in your Supabase credentials in the .env file
class EnvConfig {
  static const String supabaseUrl = 'https://ptxtahutldtkfezjycje.supabase.co';

  static const String supabaseAnonKey =
      'sb_publishable__i7sP8ey4JXSSzlFCVqMSQ_QJt5rIbC';

  // Google OAuth credentials (for Gmail integration)
  // iOS Client ID
  static const String googleClientId =
      '945510698856-74bfudj260ra4ocskufhclcu4c6nh4js.apps.googleusercontent.com';

  // Desktop Client Secret (not used on iOS)
  static const String googleClientSecret = '';

  // Gemini API Key (for AI-powered email parsing)
  static const String geminiApiKey = String.fromEnvironment(
    'GEMINI_API_KEY',
    defaultValue: '', // Add your Gemini API key here or via --dart-define
  );

  // For future use
  static const String openAiApiKey = '';

  /// Validate that required environment variables are set
  static bool get isConfigured {
    return supabaseUrl != 'YOUR_SUPABASE_URL_HERE' &&
        supabaseAnonKey != 'YOUR_SUPABASE_ANON_KEY_HERE';
  }
}

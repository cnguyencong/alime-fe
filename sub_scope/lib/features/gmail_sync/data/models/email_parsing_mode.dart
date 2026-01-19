/// Email parsing mode
enum EmailParsingMode {
  regex,
  ai,
}

extension EmailParsingModeExtension on EmailParsingMode {
  String get displayName {
    switch (this) {
      case EmailParsingMode.regex:
        return 'Regex (Fast)';
      case EmailParsingMode.ai:
        return 'AI (Accurate)';
    }
  }

  String get description {
    switch (this) {
      case EmailParsingMode.regex:
        return 'Pattern matching - Fast but limited to known services';
      case EmailParsingMode.ai:
        return 'Gemini AI - Slower but can detect any subscription';
    }
  }
}

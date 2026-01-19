import 'package:intl/intl.dart';

/// Currency utility functions
class CurrencyUtils {
  /// Format price with currency symbol
  static String formatPrice(double price, String currencyCode) {
    final formatter = NumberFormat.currency(
      symbol: getCurrencySymbol(currencyCode),
      decimalDigits: 0,
    );
    return formatter.format(price);
  }

  /// Get currency symbol from currency code
  static String getCurrencySymbol(String currencyCode) {
    switch (currencyCode.toUpperCase()) {
      case 'VND':
        return '₫';
      case 'USD':
        return '\$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'JPY':
        return '¥';
      default:
        return currencyCode;
    }
  }

  /// Convert currency (placeholder - in production, use a real API)
  /// For now, using approximate exchange rates
  static double convertCurrency({
    required double amount,
    required String fromCurrency,
    required String toCurrency,
  }) {
    if (fromCurrency == toCurrency) return amount;

    // Convert to USD first
    double amountInUSD = amount;
    switch (fromCurrency.toUpperCase()) {
      case 'VND':
        amountInUSD = amount / 24000;
        break;
      case 'EUR':
        amountInUSD = amount * 1.1;
        break;
      case 'GBP':
        amountInUSD = amount * 1.27;
        break;
      case 'JPY':
        amountInUSD = amount / 110;
        break;
    }

    // Convert from USD to target currency
    switch (toCurrency.toUpperCase()) {
      case 'VND':
        return amountInUSD * 24000;
      case 'EUR':
        return amountInUSD / 1.1;
      case 'GBP':
        return amountInUSD / 1.27;
      case 'JPY':
        return amountInUSD * 110;
      case 'USD':
      default:
        return amountInUSD;
    }
  }

  /// List of supported currencies
  static const List<Map<String, String>> supportedCurrencies = [
    {'code': 'VND', 'name': 'Vietnamese Dong'},
    {'code': 'USD', 'name': 'US Dollar'},
    {'code': 'EUR', 'name': 'Euro'},
    {'code': 'GBP', 'name': 'British Pound'},
    {'code': 'JPY', 'name': 'Japanese Yen'},
  ];
}

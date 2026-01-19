import 'package:intl/intl.dart';

/// Date utility functions
class DateUtils {
  /// Format date to readable string
  static String formatDate(DateTime date, {String format = 'dd/MM/yyyy'}) {
    return DateFormat(format).format(date);
  }

  /// Format date to relative time (e.g., "2 days ago", "in 3 days")
  static String formatRelativeTime(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now);

    if (difference.isNegative) {
      // Past
      final absDifference = difference.abs();
      if (absDifference.inDays > 365) {
        final years = (absDifference.inDays / 365).floor();
        return '$years ${years == 1 ? 'year' : 'years'} ago';
      } else if (absDifference.inDays > 30) {
        final months = (absDifference.inDays / 30).floor();
        return '$months ${months == 1 ? 'month' : 'months'} ago';
      } else if (absDifference.inDays > 0) {
        return '${absDifference.inDays} ${absDifference.inDays == 1 ? 'day' : 'days'} ago';
      } else if (absDifference.inHours > 0) {
        return '${absDifference.inHours} ${absDifference.inHours == 1 ? 'hour' : 'hours'} ago';
      } else if (absDifference.inMinutes > 0) {
        return '${absDifference.inMinutes} ${absDifference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
      } else {
        return 'Just now';
      }
    } else {
      // Future
      if (difference.inDays > 365) {
        final years = (difference.inDays / 365).floor();
        return 'in $years ${years == 1 ? 'year' : 'years'}';
      } else if (difference.inDays > 30) {
        final months = (difference.inDays / 30).floor();
        return 'in $months ${months == 1 ? 'month' : 'months'}';
      } else if (difference.inDays > 0) {
        return 'in ${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'}';
      } else if (difference.inHours > 0) {
        return 'in ${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'}';
      } else if (difference.inMinutes > 0) {
        return 'in ${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'}';
      } else {
        return 'Now';
      }
    }
  }

  /// Calculate next billing date based on billing cycle
  static DateTime calculateNextBillingDate({
    required DateTime startDate,
    required String billingCycle,
  }) {
    final now = DateTime.now();
    DateTime nextDate = startDate;

    if (billingCycle == 'monthly') {
      // Add months until we're in the future
      while (nextDate.isBefore(now)) {
        nextDate = DateTime(
          nextDate.year,
          nextDate.month + 1,
          nextDate.day,
        );
      }
    } else if (billingCycle == 'yearly') {
      // Add years until we're in the future
      while (nextDate.isBefore(now)) {
        nextDate = DateTime(
          nextDate.year + 1,
          nextDate.month,
          nextDate.day,
        );
      }
    }

    return nextDate;
  }

  /// Check if a date is within X days from now
  static bool isWithinDays(DateTime date, int days) {
    final now = DateTime.now();
    final difference = date.difference(now);
    return difference.inDays >= 0 && difference.inDays <= days;
  }

  /// Get days until a date
  static int daysUntil(DateTime date) {
    final now = DateTime.now();
    return date.difference(now).inDays;
  }
}

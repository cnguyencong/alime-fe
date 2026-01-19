import 'package:equatable/equatable.dart';

/// Enum for billing cycle
enum BillingCycle {
  monthly('monthly'),
  yearly('yearly');

  final String value;
  const BillingCycle(this.value);

  static BillingCycle fromString(String value) {
    return BillingCycle.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BillingCycle.monthly,
    );
  }
}

/// Enum for subscription source
enum SubscriptionSource {
  manual('manual'),
  gmailScan('gmail_scan');

  final String value;
  const SubscriptionSource(this.value);

  static SubscriptionSource fromString(String value) {
    return SubscriptionSource.values.firstWhere(
      (e) => e.value == value,
      orElse: () => SubscriptionSource.manual,
    );
  }
}

/// Subscription model matching the database schema
class Subscription extends Equatable {
  final String id;
  final String userId;
  final String name;
  final double price;
  final String currency;
  final BillingCycle billingCycle;
  final DateTime startDate;
  final DateTime? nextBillingDate;
  final SubscriptionSource source;
  final String? logoUrl;
  final String? emailMessageId;
  final DateTime createdAt;

  const Subscription({
    required this.id,
    required this.userId,
    required this.name,
    required this.price,
    required this.currency,
    required this.billingCycle,
    required this.startDate,
    this.nextBillingDate,
    required this.source,
    this.logoUrl,
    this.emailMessageId,
    required this.createdAt,
  });

  /// Create from Supabase JSON
  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'VND',
      billingCycle: BillingCycle.fromString(json['billing_cycle'] as String),
      startDate: DateTime.parse(json['start_date'] as String),
      nextBillingDate: json['next_billing_date'] != null
          ? DateTime.parse(json['next_billing_date'] as String)
          : null,
      source:
          SubscriptionSource.fromString(json['source'] as String? ?? 'manual'),
      logoUrl: json['logo_url'] as String?,
      emailMessageId: json['email_message_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  /// Convert to Supabase JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'price': price,
      'currency': currency,
      'billing_cycle': billingCycle.value,
      'start_date': startDate.toIso8601String().split('T')[0], // Date only
      'next_billing_date': nextBillingDate?.toIso8601String().split('T')[0],
      'source': source.value,
      'logo_url': logoUrl,
      'email_message_id': emailMessageId,
      'created_at': createdAt.toIso8601String(),
    };
  }

  /// Create a copy with updated fields
  Subscription copyWith({
    String? id,
    String? userId,
    String? name,
    double? price,
    String? currency,
    BillingCycle? billingCycle,
    DateTime? startDate,
    DateTime? nextBillingDate,
    SubscriptionSource? source,
    String? logoUrl,
    String? emailMessageId,
    DateTime? createdAt,
  }) {
    return Subscription(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      billingCycle: billingCycle ?? this.billingCycle,
      startDate: startDate ?? this.startDate,
      nextBillingDate: nextBillingDate ?? this.nextBillingDate,
      source: source ?? this.source,
      logoUrl: logoUrl ?? this.logoUrl,
      emailMessageId: emailMessageId ?? this.emailMessageId,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        name,
        price,
        currency,
        billingCycle,
        startDate,
        nextBillingDate,
        source,
        logoUrl,
        emailMessageId,
        createdAt,
      ];
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/models/subscription_model.dart';
import '../../data/providers/subscription_provider.dart';
import '../../../../core/widgets/gradient_button.dart';

/// Screen for adding/editing a subscription
class AddSubscriptionScreen extends ConsumerStatefulWidget {
  final String? subscriptionId; // null for add, non-null for edit

  const AddSubscriptionScreen({super.key, this.subscriptionId});

  @override
  ConsumerState<AddSubscriptionScreen> createState() =>
      _AddSubscriptionScreenState();
}

class _AddSubscriptionScreenState extends ConsumerState<AddSubscriptionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _priceController = TextEditingController();

  String _currency = 'VND';
  BillingCycle _billingCycle = BillingCycle.monthly;
  DateTime _startDate = DateTime.now();
  bool _isLoading = false;
  String? _errorMessage;
  bool _isInitialized = false;

  final List<String> _currencies = ['VND', 'USD', 'EUR', 'GBP', 'JPY'];

  bool get _isEditMode => widget.subscriptionId != null;

  @override
  void initState() {
    super.initState();
    if (_isEditMode) {
      _loadSubscription();
    }
  }

  Future<void> _loadSubscription() async {
    try {
      final repository = ref.read(subscriptionRepositoryProvider);
      final subscription =
          await repository.getSubscriptionById(widget.subscriptionId!);

      setState(() {
        _nameController.text = subscription.name;
        _priceController.text = subscription.price.toString();
        _currency = subscription.currency;
        _billingCycle = subscription.billingCycle;
        _startDate = subscription.startDate;
        _isInitialized = true;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load subscription: $e';
        _isInitialized = true;
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );

    if (picked != null) {
      setState(() {
        _startDate = picked;
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(subscriptionRepositoryProvider);

      if (_isEditMode) {
        // Update existing subscription
        await repository.updateSubscription(
          id: widget.subscriptionId!,
          name: _nameController.text.trim(),
          price: double.parse(_priceController.text.trim()),
          currency: _currency,
          billingCycle: _billingCycle,
          startDate: _startDate,
        );
      } else {
        // Create new subscription
        await repository.createSubscription(
          name: _nameController.text.trim(),
          price: double.parse(_priceController.text.trim()),
          currency: _currency,
          billingCycle: _billingCycle,
          startDate: _startDate,
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isEditMode
                ? 'Subscription updated successfully!'
                : 'Subscription added successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Show loading while fetching subscription in edit mode
    if (_isEditMode && !_isInitialized) {
      return Scaffold(
        appBar: AppBar(title: const Text('Edit Subscription')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditMode ? 'Edit Subscription' : 'Add Subscription'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Icon
              Icon(
                _isEditMode ? Icons.edit_outlined : Icons.add_circle_outline,
                size: 64,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 8),
              Text(
                _isEditMode
                    ? 'Update subscription details'
                    : 'Track a new subscription',
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Error message
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red[300]!),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red[700]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(color: Colors.red[700]),
                        ),
                      ),
                    ],
                  ),
                ),

              // Service name
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Service Name',
                  hintText: 'Netflix, Spotify, etc.',
                  prefixIcon: Icon(Icons.subscriptions_outlined),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter service name';
                  }
                  return null;
                },
                enabled: !_isLoading,
              ),
              const SizedBox(height: 16),

              // Price and Currency row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(
                            RegExp(r'^\d+\.?\d{0,2}')),
                      ],
                      decoration: const InputDecoration(
                        labelText: 'Price',
                        hintText: '99000',
                        prefixIcon: Icon(Icons.attach_money),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Enter price';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Invalid number';
                        }
                        return null;
                      },
                      enabled: !_isLoading,
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Currency
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _currency,
                      decoration: const InputDecoration(
                        labelText: 'Currency',
                      ),
                      items: _currencies.map((currency) {
                        return DropdownMenuItem(
                          value: currency,
                          child: Text(currency),
                        );
                      }).toList(),
                      onChanged: _isLoading
                          ? null
                          : (value) {
                              setState(() {
                                _currency = value!;
                              });
                            },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Billing cycle
              DropdownButtonFormField<BillingCycle>(
                value: _billingCycle,
                decoration: const InputDecoration(
                  labelText: 'Billing Cycle',
                  prefixIcon: Icon(Icons.calendar_today_outlined),
                ),
                items: BillingCycle.values.map((cycle) {
                  return DropdownMenuItem(
                    value: cycle,
                    child: Text(
                      cycle == BillingCycle.monthly ? 'Monthly' : 'Yearly',
                    ),
                  );
                }).toList(),
                onChanged: _isLoading
                    ? null
                    : (value) {
                        setState(() {
                          _billingCycle = value!;
                        });
                      },
              ),
              const SizedBox(height: 16),

              // Start date
              InkWell(
                onTap: _isLoading ? null : _selectDate,
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Start Date',
                    prefixIcon: Icon(Icons.event_outlined),
                    suffixIcon: Icon(Icons.arrow_drop_down),
                  ),
                  child: Text(
                    '${_startDate.day}/${_startDate.month}/${_startDate.year}',
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Submit button
              GradientButton(
                text: _isEditMode ? 'Update Subscription' : 'Add Subscription',
                onPressed: _handleSubmit,
                isLoading: _isLoading,
                icon: _isEditMode ? Icons.check : Icons.add,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

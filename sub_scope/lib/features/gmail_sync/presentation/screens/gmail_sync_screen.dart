import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/models/email_sync_log_model.dart';
import '../../data/models/email_parsing_mode.dart';
import '../../data/providers/gmail_provider.dart';
import '../../../../core/utils/date_utils.dart' as app_date_utils;
import '../../../../core/config/env_config.dart';

/// Gmail sync screen for scanning emails and importing subscriptions
class GmailSyncScreen extends ConsumerStatefulWidget {
  const GmailSyncScreen({super.key});

  @override
  ConsumerState<GmailSyncScreen> createState() => _GmailSyncScreenState();
}

class _GmailSyncScreenState extends ConsumerState<GmailSyncScreen> {
  bool _isSyncing = false;
  String? _syncMessage;
  bool _syncSuccess = false;
  EmailParsingMode _selectedMode = EmailParsingMode.regex;

  Future<void> _handleSync() async {
    setState(() {
      _isSyncing = true;
      _syncMessage = null;
    });

    try {
      final repository = ref.read(gmailRepositoryProvider);
      final result = await repository.syncGmail(mode: _selectedMode);

      setState(() {
        _syncSuccess = result.status == EmailSyncStatus.success;
        _syncMessage = _syncSuccess
            ? 'Found ${result.subscriptionsFoundCount} subscriptions from ${result.emailsScannedCount} emails!'
            : 'Sync failed: ${result.errorMessage}';
      });

      // Refresh sync history
      ref.invalidate(syncHistoryProvider);

      // Show success message
      if (mounted && _syncSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_syncMessage!),
            backgroundColor: Colors.green,
            action: SnackBarAction(
              label: 'View',
              textColor: Colors.white,
              onPressed: () {
                context.pop();
              },
            ),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _syncSuccess = false;
        _syncMessage = 'Error: $e';
      });
    } finally {
      setState(() {
        _isSyncing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final syncHistoryAsync = ref.watch(syncHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gmail Sync'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header
          Icon(
            Icons.email_outlined,
            size: 80,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Text(
            'Scan Gmail for Subscriptions',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Automatically find subscription emails and add them to your tracker',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),

          // Parsing Mode Selection
          Text(
            'Parsing Mode',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                RadioListTile<EmailParsingMode>(
                  value: EmailParsingMode.regex,
                  groupValue: _selectedMode,
                  onChanged: (value) {
                    setState(() {
                      _selectedMode = value!;
                    });
                  },
                  title: Row(
                    children: [
                      const Icon(Icons.speed, size: 20),
                      const SizedBox(width: 8),
                      Text(EmailParsingMode.regex.displayName),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(left: 28, top: 4),
                    child: Text(
                      EmailParsingMode.regex.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                ),
                const Divider(height: 1),
                RadioListTile<EmailParsingMode>(
                  value: EmailParsingMode.ai,
                  groupValue: _selectedMode,
                  onChanged: EnvConfig.geminiApiKey.isEmpty
                      ? null
                      : (value) {
                          setState(() {
                            _selectedMode = value!;
                          });
                        },
                  title: Row(
                    children: [
                      const Icon(Icons.psychology, size: 20),
                      const SizedBox(width: 8),
                      Text(EmailParsingMode.ai.displayName),
                      if (EnvConfig.geminiApiKey.isEmpty) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange[100],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'API Key Required',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.orange[900],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(left: 28, top: 4),
                    child: Text(
                      EmailParsingMode.ai.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: EnvConfig.geminiApiKey.isEmpty
                            ? Colors.grey[400]
                            : Colors.grey[600],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Sync message
          if (_syncMessage != null)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: _syncSuccess ? Colors.green[50] : Colors.red[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _syncSuccess ? Colors.green[300]! : Colors.red[300]!,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _syncSuccess ? Icons.check_circle : Icons.error_outline,
                    color: _syncSuccess ? Colors.green[700] : Colors.red[700],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _syncMessage!,
                      style: TextStyle(
                        color:
                            _syncSuccess ? Colors.green[700] : Colors.red[700],
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Sync button
          ElevatedButton.icon(
            onPressed: _isSyncing ? null : _handleSync,
            icon: _isSyncing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.sync),
            label: Text(_isSyncing ? 'Scanning...' : 'Scan Gmail'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
          const SizedBox(height: 32),

          // Sync history
          Text(
            'Sync History',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),

          syncHistoryAsync.when(
            data: (history) {
              if (history.isEmpty) {
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: [
                        Icon(
                          Icons.history,
                          size: 48,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'No sync history yet',
                          style:
                              Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return Column(
                children: history
                    .map((log) => _buildHistoryCard(context, log))
                    .toList(),
              );
            },
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(),
              ),
            ),
            error: (error, stack) => Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text('Error loading history: $error'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(BuildContext context, log) {
    final isSuccess = log.status == EmailSyncStatus.success;
    final statusColor = isSuccess ? Colors.green : Colors.red;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isSuccess ? Icons.check_circle : Icons.error,
                  color: statusColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  isSuccess ? 'Success' : 'Failed',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const Spacer(),
                Text(
                  app_date_utils.DateUtils.formatRelativeTime(log.createdAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildStat(
                  context,
                  'Emails Scanned',
                  log.emailsScannedCount.toString(),
                ),
                const SizedBox(width: 24),
                _buildStat(
                  context,
                  'Subscriptions Found',
                  log.subscriptionsFoundCount.toString(),
                ),
              ],
            ),
            if (log.errorMessage != null) ...[
              const SizedBox(height: 8),
              Text(
                'Error: ${log.errorMessage}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.red[700],
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStat(BuildContext context, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }
}

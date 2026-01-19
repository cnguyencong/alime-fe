import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/email_sync_log_model.dart';
import '../repositories/gmail_repository.dart';

/// Provider for GmailRepository
final gmailRepositoryProvider = Provider<GmailRepository>((ref) {
  return GmailRepository();
});

/// Provider for Gmail connection status
final gmailConnectionStatusProvider = Provider<bool>((ref) {
  final repository = ref.watch(gmailRepositoryProvider);
  return repository.isGmailConnected;
});

/// Provider for sync history
final syncHistoryProvider = FutureProvider<List<EmailSyncLog>>((ref) async {
  final repository = ref.watch(gmailRepositoryProvider);
  return repository.getSyncHistory();
});

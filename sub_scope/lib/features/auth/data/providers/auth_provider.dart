import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

/// Provider for AuthRepository
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

/// Provider for current user
final currentUserProvider = StreamProvider<UserModel?>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.authStateChanges;
});

/// Provider for auth state (is user authenticated?)
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.isAuthenticated;
});

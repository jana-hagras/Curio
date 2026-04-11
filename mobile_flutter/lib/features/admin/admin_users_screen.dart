import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/local_storage/local_storage_service.dart';
import '../../core/local_storage/storage_keys.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  List<dynamic> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 400));
    try {
      final users = LocalStorageService.loadList(StorageKeys.users);
      setState(() {
        _users = users;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load users: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleBan(int id, bool currentlyBanned) async {
    try {
      final users = LocalStorageService.loadList(StorageKeys.users);
      final idx = users.indexWhere((u) => u['id'] == id);
      if (idx >= 0) {
        users[idx]['isBanned'] = !currentlyBanned;
        await LocalStorageService.saveList(StorageKeys.users, users);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(currentlyBanned ? 'User unbanned.' : 'User banned! Login locked.', style: const TextStyle(color: Colors.white)),
              backgroundColor: currentlyBanned ? AppColors.success : AppColors.error,
            ),
          );
        }
        _fetchUsers();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Operation failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text("Manage Users")),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _users.length,
              itemBuilder: (context, index) {
                final user = _users[index];
                final isBanned = user['isBanned'] == true;
                final type = user['type'] ?? 'Buyer';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      backgroundColor: isBanned ? AppColors.error.withOpacity(0.2) : AppColors.primary.withOpacity(0.1),
                      child: Icon(isBanned ? Icons.lock : Icons.person, color: isBanned ? AppColors.error : AppColors.primary),
                    ),
                    title: Text('${user['firstName']} ${user['lastName']}'),
                    subtitle: Text('$type • ${user['email']}'),
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'ban') {
                          _toggleBan(user['id'], isBanned);
                        }
                      },
                      itemBuilder: (ctx) => [
                         PopupMenuItem(
                          value: 'ban',
                          child: Text(isBanned ? 'Unban User' : 'Ban (Lock) User', style: TextStyle(color: isBanned ? AppColors.success : AppColors.error)),
                        ),
                        const PopupMenuItem(
                          value: 'details',
                          child: Text('View Details'),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

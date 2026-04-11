import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/local_storage/local_storage_service.dart';
import '../../core/local_storage/storage_keys.dart';

class AdminVerifyScreen extends StatefulWidget {
  const AdminVerifyScreen({super.key});

  @override
  State<AdminVerifyScreen> createState() => _AdminVerifyScreenState();
}

class _AdminVerifyScreenState extends State<AdminVerifyScreen> {
  List<dynamic> _unverified = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchArtisans();
  }

  Future<void> _fetchArtisans() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 400));
    try {
      final all = LocalStorageService.loadList(StorageKeys.users);
      setState(() {
        _unverified = all.where((u) => u['type'] == 'Artisan' && u['verified'] != true).toList();
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyArtisan(int id) async {
    try {
      final users = LocalStorageService.loadList(StorageKeys.users);
      final idx = users.indexWhere((u) => u['id'] == id);
      if (idx >= 0) {
        users[idx]['verified'] = true;
        await LocalStorageService.saveList(StorageKeys.users, users);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Artisan verified successfully!'), backgroundColor: AppColors.success)
          );
          _fetchArtisans();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text("Verify Artisans")),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _unverified.isEmpty
              ? const Center(child: Text("All artisans are verified!"))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _unverified.length,
                  itemBuilder: (context, index) {
                    final artisan = _unverified[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const CircleAvatar(child: Icon(Icons.palette)),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('${artisan['firstName']} ${artisan['lastName']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      Text('${artisan['email']}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            const Text("Biography:", style: TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(artisan['bio'] ?? "No bio provided.", style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic)),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => _verifyArtisan(artisan['id']),
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                                child: const Text("Verify Artisan"),
                              ),
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

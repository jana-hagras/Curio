import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text("Admin Dashboard")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(children: [_statCard("Users", "156", Icons.people_outline), const SizedBox(width: 12), _statCard("Orders", "89", Icons.shopping_bag_outlined)]),
            const SizedBox(height: 12),
            Row(children: [_statCard("Items", "243", Icons.inventory_2_outlined), const SizedBox(width: 12), _statCard("Revenue", "EGP 42K", Icons.payments_outlined)]),
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Quick Actions", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(height: 16),
                  _actionTile(context, "Manage Users", Icons.people_outline, '/admin/users'),
                  _actionTile(context, "Support Tickets", Icons.headset_mic_outlined, '/support'),
                  _actionTile(context, "Verify Artisans", Icons.verified_outlined, '/admin/verify'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _actionTile(BuildContext context, String title, IconData icon, String route) {
    return ListTile(
      onTap: () {
        if (route != '/support') {
           Navigator.pushNamed(context, route);
        } else {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Support module coming soon!')));
        }
      },
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.08), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.textSecondary),
    );
  }
}

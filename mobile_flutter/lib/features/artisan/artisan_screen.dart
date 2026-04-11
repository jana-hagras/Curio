import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/market_provider.dart';
import '../../models/market_item_model.dart';
import '../../core/local_storage/local_storage_service.dart';
import '../../core/local_storage/storage_keys.dart';

class ArtisanScreen extends StatelessWidget {
  const ArtisanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("Artisan Dashboard", style: TextStyle(fontFamily: 'Playfair')),
        actions: [
          IconButton(
            onPressed: () {
              Provider.of<AuthProvider>(context, listen: false).logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
            icon: const Icon(Icons.logout),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Welcome Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: AppColors.dark, borderRadius: BorderRadius.circular(16)),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: Colors.white24,
                    child: const Icon(Icons.person, size: 32, color: Colors.white),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Welcome, ${user?.firstName ?? 'Artisan'}!",
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text("Ready to craft today?", style: TextStyle(color: Colors.white70, fontSize: 13)),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Stats Grid
            Row(
              children: [
                Expanded(child: _statCard("Total Sales", "EGP 12,400", Icons.attach_money)),
                const SizedBox(width: 16),
                Expanded(child: _statCard("Active Orders", "8", Icons.shopping_bag)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _statCard("Products Listed", "24", Icons.inventory_2)),
                const SizedBox(width: 16),
                Expanded(child: _statCard("Store Rating", "4.9", Icons.star)),
              ],
            ),
            const SizedBox(height: 24),
            // Actions
            _actionTile(context, "Add New Product", Icons.add_circle_outline, onTap: () => _showAddProductDialog(context)),
            _actionTile(context, "Manage Products", Icons.inventory, onTap: () {}),
            _actionTile(context, "View Custom Orders", Icons.design_services_outlined, onTap: () => _showCustomOrders(context)),
            _actionTile(context, "Earnings & Payouts", Icons.account_balance_wallet, onTap: () {}),
            _actionTile(context, "Artisan Profile Settings", Icons.settings, onTap: () => Navigator.pushNamed(context, '/settings')),
          ],
        ),
      ),
    );
  }

  void _showAddProductDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final qtyCtrl = TextEditingController(text: '10');
    String selectedCategory = 'Pottery';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Add New Product", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, fontFamily: 'Playfair')),
                const SizedBox(height: 20),
                TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: "Product Name", hintText: "e.g. Handmade Bowl")),
                const SizedBox(height: 16),
                TextField(controller: descCtrl, maxLines: 3, decoration: const InputDecoration(labelText: "Description", hintText: "Describe your product...")),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: TextField(controller: priceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: "Price (EGP)"))),
                    const SizedBox(width: 12),
                    Expanded(child: TextField(controller: qtyCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: "Quantity"))),
                  ],
                ),
                const SizedBox(height: 16),
                const Text("Category", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: ["Pottery", "Textiles", "Jewelry", "Decor"].map((c) {
                    final sel = selectedCategory == c;
                    return GestureDetector(
                      onTap: () => setModalState(() => selectedCategory = c),
                      child: Chip(
                        label: Text(c, style: TextStyle(color: sel ? Colors.white : AppColors.textPrimary)),
                        backgroundColor: sel ? AppColors.primary : AppColors.background,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    if (nameCtrl.text.trim().isEmpty || priceCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Please fill name and price"), backgroundColor: AppColors.error),
                      );
                      return;
                    }
                    final auth = Provider.of<AuthProvider>(context, listen: false);
                    final user = auth.user!;
                    final newId = LocalStorageService.getNextId(StorageKeys.marketItems);
                    final now = DateTime.now();

                    final newItem = MarketItemModel(
                      id: newId,
                      artisanId: user.id,
                      item: nameCtrl.text.trim(),
                      description: descCtrl.text.trim(),
                      image: '',
                      availQuantity: int.tryParse(qtyCtrl.text) ?? 10,
                      price: double.tryParse(priceCtrl.text) ?? 0,
                      category: selectedCategory,
                      dateAdded: '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}',
                      artisanName: user.fullName,
                    );

                    Provider.of<MarketProvider>(context, listen: false).addItem(newItem);

                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Product added! Buyers can now see it."), backgroundColor: AppColors.success),
                    );
                  },
                  child: const Text("Add Product"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showCustomOrders(BuildContext context) {
    final customOrders = LocalStorageService.loadList(StorageKeys.customOrders);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SizedBox(
        height: MediaQuery.of(ctx).size.height * 0.6,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Custom Orders", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, fontFamily: 'Playfair')),
              const SizedBox(height: 16),
              if (customOrders.isEmpty)
                const Center(child: Text("No custom orders yet", style: TextStyle(color: AppColors.textSecondary)))
              else
                Expanded(
                  child: ListView.builder(
                    itemCount: customOrders.length,
                    itemBuilder: (_, i) {
                      final order = customOrders[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(order['category'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary)),
                            const SizedBox(height: 4),
                            Text(order['description'] ?? '', style: const TextStyle(fontSize: 14)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Text("Budget: EGP ${order['budget']}", style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                const Spacer(),
                                Text("By: ${order['buyerName']}", style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary, size: 24),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _actionTile(BuildContext context, String title, IconData icon, {required VoidCallback onTap}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}

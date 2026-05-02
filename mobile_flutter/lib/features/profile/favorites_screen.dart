import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/favorite_provider.dart';
import '../../providers/market_provider.dart';
import '../../shared/widgets/product_card.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("Saved Items", style: TextStyle(fontFamily: 'Playfair')),
      ),
      body: Consumer2<FavoriteProvider, MarketProvider>(
        builder: (ctx, favProvider, marketProvider, _) {
          final favIds = favProvider.favorites;
          
          // Filter market items that are in favorites
          final favItems = marketProvider.items.where((item) => favIds.contains(item.id.toString())).toList();

          if (favItems.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.favorite_border, size: 64, color: AppColors.textSecondary),
                  const SizedBox(height: 16),
                  const Text("No saved items yet", style: TextStyle(fontSize: 18, color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text("Start exploring and save what you love", style: TextStyle(fontSize: 14, color: AppColors.textSecondary.withValues(alpha: 0.7))),
                ],
              ),
            );
          }

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.68,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
            ),
            itemCount: favItems.length,
            itemBuilder: (_, i) {
              final item = favItems[i];
              return ProductCard(
                item: item,
                onTap: () => Navigator.pushNamed(context, '/product-details', arguments: item),
              );
            },
          );
        },
      ),
    );
  }
}

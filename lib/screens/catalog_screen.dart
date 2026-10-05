import 'package:flutter/material.dart';

import '../data/catalog_data.dart';
import '../models/catalog_item.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_header.dart';
import '../widgets/brand_link_button.dart';
import '../widgets/brand_page_header.dart';
import '../widgets/product_image.dart';
import 'product_detail_screen.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  String _category = 'Todo';

  static const categories = ['Todo', 'Piñatas', 'Papel picado', 'Plástico picado', 'Personalizados'];

  static const categoryColors = <String, Color>{
    'Todo': AppColors.green,
    'Piñatas': AppColors.pink,
    'Papel picado': AppColors.purple,
    'Plástico picado': AppColors.blue,
    'Personalizados': AppColors.cyan,
  };

  Color _chipForeground(String category, bool selected) {
    if (!selected) {
      return AppColors.ink;
    }

    return switch (category) {
      'Papel picado' || 'Plástico picado' => AppColors.white,
      _ => AppColors.ink,
    };
  }

  void _openDetail(CatalogItem item) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ProductDetailScreen(item: item),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _category == 'Todo'
        ? catalogItems
        : catalogItems.where((item) => item.categoryLabel == _category).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
      children: [
        const BrandHeader(compact: true),
        const SizedBox(height: 24),
        const BrandPageHeader(
          title: 'Catálogo',
          subtitle: 'Conoce nuestras opciones. Los diseños personalizados se cotizan según sus características.',
        ),
        const SizedBox(height: 18),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (var index = 0; index < categories.length; index++) ...[
                if (index > 0) const SizedBox(width: 8),
                Builder(
                  builder: (context) {
                    final value = categories[index];
                    final color =
                        categoryColors[value] ?? AppColors.green;
                    final selected = _category == value;

                    return ChoiceChip(
                      label: Text(value),
                      selected: selected,
                      selectedColor: color,
                      backgroundColor: color.withValues(alpha: .16),
                      side: BorderSide(
                        color: color.withValues(
                          alpha: selected ? 1 : .55,
                        ),
                        width: 1.5,
                      ),
                      labelStyle: TextStyle(
                        color: _chipForeground(value, selected),
                        fontWeight: FontWeight.w800,
                      ),
                      onSelected: (_) =>
                          setState(() => _category = value),
                    );
                  },
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 18),
        ...filtered.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _CatalogCard(
              item: item,
              onTap: () => _openDetail(item),
            ),
          ),
        ),
      ],
    );
  }
}

class _CatalogCard extends StatelessWidget {
  const _CatalogCard({
    required this.item,
    required this.onTap,
  });

  final CatalogItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 88,
                child: ProductImage(
                  item: item,
                  height: 88,
                  borderRadius: 18,
                  iconSize: 34,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            item.name,
                            style: AppTypography.cardTitle,
                          ),
                        ),
                        if (item.isReadyStock) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.green.withValues(alpha: .28),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              'TIENDA',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      item.description,
                      style: TextStyle(
                        color: AppColors.ink.withValues(alpha: .66),
                        height: 1.35,
                      ),
                    ),
                    if (item.priceLabel != null) ...[
                      const SizedBox(height: 9),
                      Text(
                        item.priceLabel!,
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          color: AppColors.blue,
                        ),
                      ),
                    ],
                    const SizedBox(height: 8),
                    BrandLinkButton(
                      label: 'Ver detalles',
                      color: AppColors.blue,
                      onPressed: onTap,
                      icon: Icons.arrow_forward_rounded,
                      zeroPadding: true,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

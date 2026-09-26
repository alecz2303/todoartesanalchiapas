import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/catalog_data.dart';
import '../models/catalog_item.dart';
import '../theme/app_theme.dart';
import '../widgets/accent_icon_badge.dart';
import '../widgets/brand_header.dart';
import '../widgets/brand_link_button.dart';
import '../widgets/brand_page_header.dart';

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
      return categoryColors[category] ?? AppColors.ink;
    }

    return switch (category) {
      'Papel picado' || 'Plástico picado' => AppColors.white,
      _ => AppColors.ink,
    };
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _category == 'Todo'
        ? catalogItems
        : catalogItems.where((item) => item.category == _category).toList();

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
        SizedBox(
          height: 44,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (_, index) {
              final value = categories[index];
              final color = categoryColors[value] ?? AppColors.green;
              final selected = _category == value;

              return ChoiceChip(
                label: Text(value),
                selected: selected,
                selectedColor: color,
                backgroundColor: color.withValues(alpha: .16),
                side: BorderSide(
                  color: color.withValues(alpha: selected ? 1 : .55),
                  width: 1.5,
                ),
                labelStyle: TextStyle(
                  color: _chipForeground(value, selected),
                  fontWeight: FontWeight.w800,
                ),
                onSelected: (_) => setState(() => _category = value),
              );
            },
          ),
        ),
        const SizedBox(height: 18),
        ...filtered.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _CatalogCard(item: item),
            )),
      ],
    );
  }
}

class _CatalogCard extends StatelessWidget {
  const _CatalogCard({required this.item});

  final CatalogItem item;

  Future<void> _askByWhatsApp() async {
    final text = Uri.encodeComponent(
      'Hola Todo Artesanal Chiapas 👋\nMe interesa: ${item.name}.\n¿Me pueden dar información, por favor?',
    );
    final uri = Uri.parse('https://wa.me/529612139040?text=$text');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AccentIconBadge(
              icon: item.icon,
              accent: item.accent,
              size: 58,
              radius: 18,
              iconSize: 28,
              alpha: .18,
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(item.name, style: AppTypography.cardTitle)),
                      if (item.isReadyStock)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                          decoration: BoxDecoration(color: AppColors.green.withValues(alpha: .28), borderRadius: BorderRadius.circular(999)),
                          child: const Text('TIENDA', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  Text(item.description, style: TextStyle(color: AppColors.ink.withValues(alpha: .66), height: 1.35)),
                  if (item.priceLabel != null) ...[
                    const SizedBox(height: 9),
                    Text(item.priceLabel!, style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.pink)),
                  ],
                  const SizedBox(height: 10),
                  BrandLinkButton(
                    label: 'Preguntar por WhatsApp',
                    color: AppColors.purple,
                    onPressed: _askByWhatsApp,
                    icon: Icons.chat_rounded,
                    zeroPadding: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/catalog_data.dart';
import '../models/catalog_item.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_header.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  String _category = 'Todo';

  static const categories = ['Todo', 'Piñatas', 'Papel picado', 'Plástico picado', 'Personalizados'];

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
        const Text('Catálogo', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: AppColors.ink)),
        const SizedBox(height: 6),
        Text('Conoce nuestras opciones. Los diseños personalizados se cotizan según sus características.', style: TextStyle(color: AppColors.ink.withValues(alpha: .65), height: 1.4)),
        const SizedBox(height: 18),
        SizedBox(
          height: 44,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (_, index) {
              final value = categories[index];
              return ChoiceChip(
                label: Text(value),
                selected: _category == value,
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
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(color: item.accent.withValues(alpha: .18), borderRadius: BorderRadius.circular(18)),
              child: Icon(item.icon, color: AppColors.ink, size: 28),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppColors.ink))),
                      if (item.isReadyStock)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                          decoration: BoxDecoration(color: AppColors.lime.withValues(alpha: .28), borderRadius: BorderRadius.circular(999)),
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
                  TextButton.icon(
                    onPressed: _askByWhatsApp,
                    icon: const Icon(Icons.chat_rounded, size: 18),
                    label: const Text('Preguntar por WhatsApp'),
                    style: TextButton.styleFrom(padding: EdgeInsets.zero),
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

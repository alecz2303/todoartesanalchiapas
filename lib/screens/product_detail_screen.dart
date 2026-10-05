import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/catalog_item.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_action_button.dart';
import '../widgets/brand_page_header.dart';
import '../widgets/policy_banner.dart';
import '../widgets/product_image.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({
    super.key,
    required this.item,
  });

  final CatalogItem item;

  Future<void> _openWhatsApp(BuildContext context) async {
    final text = Uri.encodeComponent(
      'Hola Todo Artesanal Chiapas 👋\n'
      'Me interesa: ${item.name}.\n'
      'Categoría: ${item.categoryLabel}.\n'
      '¿Me pueden dar información, por favor?',
    );
    final uri = Uri.parse('https://wa.me/529612139040?text=$text');

    final opened = await launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
    );

    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No fue posible abrir WhatsApp.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(item.categoryLabel),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
        children: [
          ProductImage(
            item: item,
            height: 240,
            borderRadius: 26,
            iconSize: 64,
          ),
          const SizedBox(height: 22),
          BrandPageHeader(
            title: item.name,
            subtitle: item.categoryLabel,
          ),
          const SizedBox(height: 16),
          Text(
            item.description,
            style: TextStyle(
              color: AppColors.ink.withValues(alpha: .72),
              fontSize: 16,
              height: 1.45,
            ),
          ),
          if (item.priceLabel != null) ...[
            const SizedBox(height: 18),
            Text(
              item.priceLabel!,
              style: const TextStyle(
                color: AppColors.blue,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
          if (item.supportsReferenceImage) ...[
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cyan.withValues(alpha: .18),
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.add_photo_alternate_outlined,
                    color: AppColors.blue,
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Puedes compartir una imagen de referencia para explicar mejor tu idea.',
                      style: TextStyle(
                        color: AppColors.ink,
                        height: 1.4,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (item.requiresCustomization) ...[
            const SizedBox(height: 18),
            const PolicyBanner(),
          ],
          const SizedBox(height: 24),
          BrandActionButton(
            label: 'Preguntar por WhatsApp',
            icon: Icons.chat_rounded,
            backgroundColor: AppColors.blue,
            foregroundColor: AppColors.white,
            onPressed: () => _openWhatsApp(context),
          ),
        ],
      ),
    );
  }
}

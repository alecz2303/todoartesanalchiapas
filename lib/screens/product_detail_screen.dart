import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/catalog_item.dart';
import '../theme/app_theme.dart';
import '../widgets/policy_banner.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({
    super.key,
    required this.item,
  });

  final CatalogItem item;

  Future<void> _openWhatsApp(BuildContext context) async {
    final lines = <String>[
      'Hola Todo Artesanal Chiapas 👋',
      item.requiresQuote
          ? 'Quiero solicitar una cotización.'
          : 'Quiero consultar disponibilidad.',
      '',
      'Producto: \${item.name}',
      'Categoría: \${item.categoryLabel}',
      if (item.displayPrice != null) 'Precio mostrado: \${item.displayPrice!}',
      if (item.supportsReferenceImage)
        'Tengo una imagen de referencia para compartir.',
      '',
      '¿Me pueden apoyar con la información, por favor?',
    ];

    final uri = Uri.parse(
      'https://wa.me/529612139040?text=' +
          Uri.encodeComponent(lines.join('\n')),
    );

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
      backgroundColor: AppColors.soft,
      appBar: AppBar(
        title: Text(
          item.categoryLabel,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
        children: [
          Container(
            height: 190,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  item.accent.withValues(alpha: .26),
                  Colors.white,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
            ),
            child: Center(
              child: Container(
                width: 92,
                height: 92,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: .07),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Icon(item.icon, size: 46, color: AppColors.ink),
              ),
            ),
          ),
          const SizedBox(height: 22),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _DetailPill(
                label: item.availabilityLabel,
                color: item.isReadyStock ? AppColors.lime : AppColors.yellow,
              ),
              if (item.requiresCustomization)
                const _DetailPill(
                  label: 'Personalizable',
                  color: AppColors.pink,
                ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            item.name,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 30,
              height: 1.05,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            item.description,
            style: TextStyle(
              color: AppColors.ink.withValues(alpha: .7),
              height: 1.5,
              fontSize: 15.5,
            ),
          ),
          const SizedBox(height: 20),
          _PriceCard(item: item),
          if (item.features.isNotEmpty) ...[
            const SizedBox(height: 24),
            const _SectionTitle('Incluye / características'),
            const SizedBox(height: 10),
            ...item.features.map((feature) => _CheckRow(text: feature)),
          ],
          if (item.sizes.isNotEmpty) ...[
            const SizedBox(height: 22),
            const _SectionTitle('Medidas'),
            const SizedBox(height: 10),
            ...item.sizes.map(
              (size) => _InfoRow(
                icon: Icons.straighten_rounded,
                text: size,
              ),
            ),
          ],
          if (item.options.isNotEmpty) ...[
            const SizedBox(height: 22),
            const _SectionTitle('Opciones'),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: item.options
                  .map((option) => Chip(label: Text(option)))
                  .toList(),
            ),
          ],
          if ((item.leadTimeDays ?? 0) > 0) ...[
            const SizedBox(height: 22),
            _InfoRow(
              icon: Icons.schedule_rounded,
              text: 'Tiempo normal de agenda: mínimo ' +
                  item.leadTimeDays.toString() +
                  ' días de anticipación.',
            ),
          ],
          if (item.supportsReferenceImage) ...[
            const SizedBox(height: 12),
            const _InfoRow(
              icon: Icons.add_photo_alternate_outlined,
              text:
                  'Puedes compartir una imagen de referencia para explicar mejor tu idea.',
            ),
          ],
          if (item.requiresCustomization) ...[
            const SizedBox(height: 22),
            const PolicyBanner(),
          ],
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _openWhatsApp(context),
            icon: const Icon(Icons.chat_rounded),
            label: Text(
              item.requiresQuote
                  ? 'Solicitar cotización'
                  : 'Consultar disponibilidad',
            ),
          ),
          const SizedBox(height: 10),
          Text(
            item.isReadyStock
                ? 'La existencia puede cambiar durante el día.'
                : 'La cotización final depende de los detalles específicos de tu pedido.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.ink.withValues(alpha: .55),
              fontSize: 12,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

class _PriceCard extends StatelessWidget {
  const _PriceCard({required this.item});

  final CatalogItem item;

  @override
  Widget build(BuildContext context) {
    final price = item.displayPrice;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withValues(alpha: .05)),
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.pink.withValues(alpha: .12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.sell_outlined, color: AppColors.pink),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  price ?? 'Cotización personalizada',
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  price == null
                      ? 'El precio depende del diseño, tamaño, cantidad y detalles.'
                      : 'Precio de referencia sujeto a disponibilidad y características.',
                  style: TextStyle(
                    color: AppColors.ink.withValues(alpha: .62),
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        color: AppColors.ink,
        fontSize: 18,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}

class _CheckRow extends StatelessWidget {
  const _CheckRow({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(
              Icons.check_circle_rounded,
              size: 19,
              color: AppColors.purple,
            ),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: AppColors.ink,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.text,
  });

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.purple),
          const SizedBox(width: 9),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: AppColors.ink,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailPill extends StatelessWidget {
  const _DetailPill({
    required this.label,
    required this.color,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .22),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.ink,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

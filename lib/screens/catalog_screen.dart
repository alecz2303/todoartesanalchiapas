import 'package:flutter/material.dart';

import '../data/catalog_data.dart';
import '../models/catalog_item.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_header.dart';
import 'product_detail_screen.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final _searchController = TextEditingController();
  ProductCategory? _category;
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<CatalogItem> get _filteredItems {
    return catalogItems.where((item) {
      final categoryMatches = _category == null || item.category == _category;
      return categoryMatches && item.matches(_query);
    }).toList();
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
    final filtered = _filteredItems;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
      children: [
        const BrandHeader(compact: true),
        const SizedBox(height: 24),
        const Text(
          'Catálogo',
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.w900,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Explora lo que hacemos. Los precios solo se muestran cuando están definidos; los demás productos se cotizan según sus características.',
          style: TextStyle(
            color: AppColors.ink.withValues(alpha: .65),
            height: 1.4,
          ),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: _searchController,
          onChanged: (value) => setState(() => _query = value),
          decoration: InputDecoration(
            hintText: 'Buscar piñatas, tazas, artesanías...',
            prefixIcon: const Icon(Icons.search_rounded),
            suffixIcon: _query.isEmpty
                ? null
                : IconButton(
                    tooltip: 'Limpiar búsqueda',
                    onPressed: () {
                      _searchController.clear();
                      setState(() => _query = '');
                    },
                    icon: const Icon(Icons.close_rounded),
                  ),
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: const Text('Todo'),
                  selected: _category == null,
                  onSelected: (_) => setState(() => _category = null),
                ),
              ),
              ...catalogCategories.map(
                (category) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(category.label),
                    selected: _category == category,
                    onSelected: (_) => setState(() => _category = category),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        if (filtered.isEmpty)
          const _EmptyCatalog()
        else
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
              Container(
                width: 62,
                height: 62,
                decoration: BoxDecoration(
                  color: item.accent.withValues(alpha: .18),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Icon(item.icon, color: AppColors.ink, size: 30),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 7,
                      runSpacing: 7,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          item.categoryLabel.toUpperCase(),
                          style: TextStyle(
                            color: item.accent,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: .8,
                          ),
                        ),
                        if (item.isReadyStock)
                          const _StatusPill(
                            label: 'EN TIENDA',
                            background: AppColors.lime,
                          )
                        else
                          const _StatusPill(
                            label: 'POR PEDIDO',
                            background: AppColors.yellow,
                          ),
                      ],
                    ),
                    const SizedBox(height: 7),
                    Text(
                      item.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 17,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      item.description,
                      style: TextStyle(
                        color: AppColors.ink.withValues(alpha: .66),
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (item.displayPrice != null)
                      Text(
                        item.displayPrice!,
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          color: AppColors.pink,
                        ),
                      )
                    else
                      const Text(
                        'Cotización personalizada',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: AppColors.purple,
                        ),
                      ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Text(
                          'Ver detalles',
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_rounded,
                          size: 18,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ],
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

class _StatusPill extends StatelessWidget {
  const _StatusPill({
    required this.label,
    required this.background,
  });

  final String label;
  final Color background;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: background.withValues(alpha: .25),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.ink,
          fontSize: 9,
          fontWeight: FontWeight.w900,
          letterSpacing: .5,
        ),
      ),
    );
  }
}

class _EmptyCatalog extends StatelessWidget {
  const _EmptyCatalog();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 34),
      child: Column(
        children: [
          const Icon(
            Icons.search_off_rounded,
            size: 46,
            color: AppColors.purple,
          ),
          const SizedBox(height: 12),
          const Text(
            'No encontramos productos',
            style: TextStyle(
              color: AppColors.ink,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Prueba otra palabra o cambia la categoría.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.ink.withValues(alpha: .6)),
          ),
        ],
      ),
    );
  }
}

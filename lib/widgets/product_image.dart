import 'package:flutter/material.dart';

import '../models/catalog_item.dart';
import '../theme/app_theme.dart';

class ProductImage extends StatelessWidget {
  const ProductImage({
    super.key,
    required this.item,
    this.height = 160,
    this.borderRadius = 20,
    this.iconSize = 42,
  });

  final CatalogItem item;
  final double height;
  final double borderRadius;
  final double iconSize;

  Widget _fallback() {
    return ColoredBox(
      color: item.accent.withValues(alpha: .16),
      child: Center(
        child: Icon(
          item.icon,
          size: iconSize,
          color: AppColors.ink,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final asset = item.imageAsset;

    return Semantics(
      image: true,
      label: item.imageSemanticLabel ?? 'Imagen de ${item.name}',
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: SizedBox(
          height: height,
          width: double.infinity,
          child: asset == null
              ? _fallback()
              : Image.asset(
                  asset,
                  fit: BoxFit.cover,
                  excludeFromSemantics: true,
                  errorBuilder: (_, __, ___) => _fallback(),
                ),
        ),
      ),
    );
  }
}

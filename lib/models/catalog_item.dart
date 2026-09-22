import 'package:flutter/material.dart';

enum ProductCategory {
  pinatas,
  papelPicado,
  plasticoPicado,
  personalizados,
  artesanias,
}

extension ProductCategoryUi on ProductCategory {
  String get label {
    switch (this) {
      case ProductCategory.pinatas:
        return 'Piñatas';
      case ProductCategory.papelPicado:
        return 'Papel picado';
      case ProductCategory.plasticoPicado:
        return 'Plástico picado';
      case ProductCategory.personalizados:
        return 'Personalizados';
      case ProductCategory.artesanias:
        return 'Artesanías';
    }
  }
}

enum ProductPricingType {
  quote,
  fixed,
  from,
}

class CatalogItem {
  const CatalogItem({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.icon,
    required this.accent,
    this.pricingType = ProductPricingType.quote,
    this.price,
    this.isReadyStock = false,
    this.requiresCustomization = true,
    this.supportsReferenceImage = false,
    this.leadTimeDays,
    this.features = const [],
    this.sizes = const [],
    this.options = const [],
  }) : assert(
          pricingType == ProductPricingType.quote || price != null,
          'Fixed/from pricing requires a price.',
        );

  final String id;
  final String name;
  final ProductCategory category;
  final String description;
  final IconData icon;
  final Color accent;
  final ProductPricingType pricingType;
  final int? price;
  final bool isReadyStock;
  final bool requiresCustomization;
  final bool supportsReferenceImage;
  final int? leadTimeDays;
  final List<String> features;
  final List<String> sizes;
  final List<String> options;

  String get categoryLabel => category.label;

  String? get displayPrice {
    if (price == null || pricingType == ProductPricingType.quote) {
      return null;
    }

    final amount = '\$${price.toString()} MXN';
    return pricingType == ProductPricingType.from ? 'Desde \$amount' : amount;
  }

  bool get requiresQuote => pricingType == ProductPricingType.quote;

  String get availabilityLabel =>
      isReadyStock ? 'Disponible en tienda' : 'Elaboración por pedido';

  bool matches(String query) {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) return true;

    final haystack = [
      name,
      categoryLabel,
      description,
      ...features,
      ...sizes,
      ...options,
    ].join(' ').toLowerCase();

    return haystack.contains(normalized);
  }
}

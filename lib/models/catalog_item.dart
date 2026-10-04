import 'package:flutter/material.dart';

enum ProductCategory {
  pinatas,
  papelPicado,
  plasticoPicado,
  personalizados,
}

extension ProductCategoryUi on ProductCategory {
  String get label {
    return switch (this) {
      ProductCategory.pinatas => 'Piñatas',
      ProductCategory.papelPicado => 'Papel picado',
      ProductCategory.plasticoPicado => 'Plástico picado',
      ProductCategory.personalizados => 'Personalizados',
    };
  }
}

class CatalogItem {
  const CatalogItem({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.icon,
    required this.accent,
    this.priceLabel,
    this.isReadyStock = false,
    this.requiresCustomization = false,
    this.supportsReferenceImage = false,
    this.leadTimeDays,
    this.features = const [],
    this.sizes = const [],
    this.options = const [],
  });

  final String id;
  final String name;
  final ProductCategory category;
  final String description;
  final IconData icon;
  final Color accent;
  final String? priceLabel;
  final bool isReadyStock;
  final bool requiresCustomization;
  final bool supportsReferenceImage;
  final int? leadTimeDays;
  final List<String> features;
  final List<String> sizes;
  final List<String> options;

  String get categoryLabel => category.label;
}

import 'package:flutter/material.dart';

class CatalogItem {
  const CatalogItem({
    required this.name,
    required this.category,
    required this.description,
    required this.icon,
    required this.accent,
    this.priceLabel,
    this.isReadyStock = false,
  });

  final String name;
  final String category;
  final String description;
  final IconData icon;
  final Color accent;
  final String? priceLabel;
  final bool isReadyStock;
}

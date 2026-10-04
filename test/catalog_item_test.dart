import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:todo_artesanal_app/models/catalog_item.dart';

void main() {
  group('ProductCategory', () {
    test('expone únicamente las categorías oficiales del catálogo', () {
      expect(
        ProductCategory.values.map((category) => category.label).toList(),
        [
          'Piñatas',
          'Papel picado',
          'Plástico picado',
          'Personalizados',
        ],
      );
    });
  });

  group('CatalogItem', () {
    test('conserva identidad estable y metadatos del producto', () {
      const item = CatalogItem(
        id: 'pinata-personalizada',
        name: 'Piñata personalizada',
        category: ProductCategory.pinatas,
        description: 'Descripción',
        icon: Icons.celebration,
        accent: Colors.pink,
        requiresCustomization: true,
        supportsReferenceImage: true,
        leadTimeDays: 25,
        features: ['Hecha a mano'],
        sizes: ['Mediana'],
        options: ['Nombre'],
      );

      expect(item.id, 'pinata-personalizada');
      expect(item.categoryLabel, 'Piñatas');
      expect(item.requiresCustomization, isTrue);
      expect(item.supportsReferenceImage, isTrue);
      expect(item.leadTimeDays, 25);
      expect(item.features, ['Hecha a mano']);
      expect(item.sizes, ['Mediana']);
      expect(item.options, ['Nombre']);
    });
  });
}

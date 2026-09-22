import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:todo_artesanal_app/models/catalog_item.dart';

void main() {
  group('CatalogItem', () {
    test('no muestra precio cuando requiere cotización', () {
      const item = CatalogItem(
        id: 'quote',
        name: 'Producto',
        category: ProductCategory.pinatas,
        description: 'Descripción',
        icon: Icons.star,
        accent: Colors.pink,
      );

      expect(item.requiresQuote, isTrue);
      expect(item.displayPrice, isNull);
    });

    test('formatea precio desde sin convertirlo en precio fijo', () {
      const item = CatalogItem(
        id: 'from',
        name: 'Producto',
        category: ProductCategory.pinatas,
        description: 'Descripción',
        icon: Icons.star,
        accent: Colors.pink,
        pricingType: ProductPricingType.from,
        price: 250,
      );

      expect(item.displayPrice, 'Desde \$250 MXN');
      expect(item.requiresQuote, isFalse);
    });

    test('busca por nombre, categoría y opciones', () {
      const item = CatalogItem(
        id: 'artesania',
        name: 'Muñeca artesanal',
        category: ProductCategory.artesanias,
        description: 'Hecha a mano',
        icon: Icons.palette,
        accent: Colors.yellow,
        options: ['Pedido especial'],
      );

      expect(item.matches('muñeca'), isTrue);
      expect(item.matches('artesanías'), isTrue);
      expect(item.matches('especial'), isTrue);
      expect(item.matches('taza'), isFalse);
    });
  });
}

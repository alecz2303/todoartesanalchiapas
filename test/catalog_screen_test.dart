import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:todo_artesanal_app/screens/catalog_screen.dart';
import 'package:todo_artesanal_app/screens/product_detail_screen.dart';
import 'package:todo_artesanal_app/theme/app_theme.dart';

void main() {
  testWidgets('abre el detalle de un producto desde el catálogo', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const Scaffold(
          body: CatalogScreen(),
        ),
      ),
    );

    expect(find.text('Catálogo'), findsOneWidget);
    expect(find.text('Ver detalles'), findsWidgets);

    await tester.tap(find.text('Ver detalles').first);
    await tester.pumpAndSettle();

    expect(find.byType(ProductDetailScreen), findsOneWidget);
    expect(find.text('Piñata personalizada'), findsOneWidget);
    expect(find.text('Preguntar por WhatsApp'), findsOneWidget);
  });
}

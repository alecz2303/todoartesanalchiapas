import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:todo_artesanal_app/screens/catalog_screen.dart';

void main() {
  testWidgets('permite buscar y abrir detalle de un producto', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: CatalogScreen())),
    );
    await tester.pumpAndSettle();

    expect(find.text('Catálogo'), findsOneWidget);
    expect(find.text('Muñeca artesanal'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'muñeca');
    await tester.pumpAndSettle();

    expect(find.text('Muñeca artesanal'), findsOneWidget);
    expect(find.text('Taza sublimada'), findsNothing);

    await tester.tap(find.text('Muñeca artesanal'));
    await tester.pumpAndSettle();

    expect(find.text('Solicitar cotización'), findsOneWidget);
    expect(find.text('Artesanías'), findsWidgets);
  });
}

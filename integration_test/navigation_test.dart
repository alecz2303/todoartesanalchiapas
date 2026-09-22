import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:todo_artesanal_app/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('navega por las cuatro secciones principales', (tester) async {
    await tester.pumpWidget(const TodoArtesanalApp());
    await tester.pumpAndSettle();

    expect(find.text('Tu celebración,\nhecha a mano. ✨'), findsOneWidget);
    expect(find.text('Inicio'), findsOneWidget);

    await tester.tap(find.text('Catálogo'));
    await tester.pumpAndSettle();
    expect(find.text('Catálogo'), findsWidgets);
    expect(find.text('Explora lo que hacemos'), findsNothing);

    await tester.tap(find.text('Pedido'));
    await tester.pumpAndSettle();
    expect(find.text('Haz tu pedido'), findsOneWidget);

    await tester.tap(find.text('Contacto'));
    await tester.pumpAndSettle();
    expect(find.text('Visítanos'), findsOneWidget);
    expect(find.text('WhatsApp'), findsOneWidget);

    await tester.tap(find.text('Inicio'));
    await tester.pumpAndSettle();
    expect(find.text('Tu celebración,\nhecha a mano. ✨'), findsOneWidget);
  });
}

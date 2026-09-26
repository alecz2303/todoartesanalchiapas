import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/root_shell.dart';
import 'theme/app_theme.dart';

void main() {
  LicenseRegistry.addLicense(() async* {
    final fredokaLicense =
        await rootBundle.loadString('assets/fonts/fredoka/OFL.txt');
    yield LicenseEntryWithLineBreaks(['Fredoka'], fredokaLicense);

    final nunitoLicense =
        await rootBundle.loadString('assets/fonts/nunito/OFL.txt');
    yield LicenseEntryWithLineBreaks(['Nunito'], nunitoLicense);
  });

  runApp(const TodoArtesanalApp());
}

class TodoArtesanalApp extends StatelessWidget {
  const TodoArtesanalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Todo Artesanal Chiapas',
      theme: AppTheme.light,
      home: const RootShell(),
    );
  }
}

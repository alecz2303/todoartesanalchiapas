import 'package:flutter/material.dart';

import 'screens/root_shell.dart';
import 'theme/app_theme.dart';

void main() {
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

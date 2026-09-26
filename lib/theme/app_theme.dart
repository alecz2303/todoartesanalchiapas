import 'package:flutter/material.dart';

class AppColors {
  // Paleta oficial tomada directamente del logo de Todo Artesanal Chiapas.
  static const pink = Color(0xFFFF1493);
  static const purple = Color(0xFFAA00FF);
  static const green = Color(0xFF39FF14);
  static const cyan = Color(0xFF5FE8FF);
  static const yellow = Color(0xFFFFFF00);
  static const lime = Color(0xFFD6FF00);
  static const orange = Color(0xFFFF7300);
  static const blue = Color(0xFF2204CC);
  static const rose = Color(0xFFFC49AB);
  static const red = Color(0xFFFF0534);

  static const ink = Color(0xFF111111);
  static const white = Color(0xFFFFFFFF);
}

class AppButtonStyles {
  static ButtonStyle solid(
    Color background, {
    Color foreground = AppColors.ink,
  }) {
    return ElevatedButton.styleFrom(
      backgroundColor: background,
      foregroundColor: foreground,
      minimumSize: const Size.fromHeight(54),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      textStyle: const TextStyle(fontWeight: FontWeight.w900),
    );
  }

  static ButtonStyle text(Color foreground) {
    return TextButton.styleFrom(
      foregroundColor: foreground,
      textStyle: const TextStyle(fontWeight: FontWeight.w900),
    );
  }

  static ButtonStyle outlined(
    Color color, {
    Color foreground = AppColors.ink,
  }) {
    return OutlinedButton.styleFrom(
      foregroundColor: foreground,
      minimumSize: const Size.fromHeight(52),
      side: BorderSide(color: color, width: 2),
      backgroundColor: color.withValues(alpha: .10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      textStyle: const TextStyle(fontWeight: FontWeight.w900),
    );
  }
}

class AppTheme {
  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.pink,
      brightness: Brightness.light,
      primary: AppColors.pink,
      secondary: AppColors.cyan,
      tertiary: AppColors.green,
      surface: AppColors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.white,
      fontFamily: null,
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.ink,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: AppColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
          side: BorderSide(color: AppColors.ink.withValues(alpha: .05)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: AppColors.ink.withValues(alpha: .07)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.pink, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: AppButtonStyles.solid(
          AppColors.pink,
          foreground: AppColors.white,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.white,
        selectedColor: AppColors.yellow.withValues(alpha: .65),
        side: BorderSide(color: AppColors.ink.withValues(alpha: .08)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        labelStyle: const TextStyle(
          fontWeight: FontWeight.w800,
          color: AppColors.ink,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.white,
        indicatorColor: AppColors.cyan.withValues(alpha: .32),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
            color: selected ? AppColors.pink : AppColors.ink,
          );
        }),
      ),
    );
  }
}

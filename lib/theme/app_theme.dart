import 'package:flutter/material.dart';

class AppColors {
  // Paleta oficial definida por Todo Artesanal Chiapas.
  static const pink = Color(0xFFFF1493);
  static const blue = Color(0xFF2204CC);
  static const purple = Color(0xFFAA00FF);
  static const green = Color(0xFF39FF14);
  static const yellow = Color(0xFFFFFF00);
  static const orange = Color(0xFFFF7300);
  static const lime = Color(0xFFD6FF00);
  static const cyan = Color(0xFF5FE8FF);
  static const pendingAccent = Color(0xFFE6ED07);

  static const ink = Color(0xFF111111);
  static const white = Color(0xFFFFFFFF);
}

class AppTypography {
  static const displayFamily = 'Fredoka';
  static const bodyFamily = 'Nunito';

  static const pageTitle = TextStyle(
    fontFamily: displayFamily,
    fontSize: 30,
    fontWeight: FontWeight.w700,
    height: 1.05,
    color: AppColors.blue,
  );

  static const heroTitle = TextStyle(
    fontFamily: displayFamily,
    fontSize: 34,
    fontWeight: FontWeight.w700,
    height: 1.05,
    color: AppColors.white,
  );

  static const sectionTitle = TextStyle(
    fontFamily: displayFamily,
    fontSize: 21,
    fontWeight: FontWeight.w700,
    height: 1.12,
    color: AppColors.blue,
  );

  static const cardTitle = TextStyle(
    fontFamily: displayFamily,
    fontSize: 17,
    fontWeight: FontWeight.w700,
    height: 1.15,
    color: AppColors.ink,
  );
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
      textStyle: const TextStyle(
        fontFamily: AppTypography.bodyFamily,
        fontWeight: FontWeight.w900,
      ),
    );
  }

  static ButtonStyle text(Color foreground) {
    return TextButton.styleFrom(
      foregroundColor: foreground,
      textStyle: const TextStyle(
        fontFamily: AppTypography.bodyFamily,
        fontWeight: FontWeight.w900,
      ),
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
      backgroundColor: color,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      textStyle: const TextStyle(
        fontFamily: AppTypography.bodyFamily,
        fontWeight: FontWeight.w900,
      ),
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

    final baseTextTheme = ThemeData.light().textTheme.apply(
      fontFamily: AppTypography.bodyFamily,
    );

    final textTheme = baseTextTheme.copyWith(
      displayLarge: baseTextTheme.displayLarge?.copyWith(
        fontFamily: AppTypography.displayFamily,
        fontWeight: FontWeight.w700,
      ),
      displayMedium: baseTextTheme.displayMedium?.copyWith(
        fontFamily: AppTypography.displayFamily,
        fontWeight: FontWeight.w700,
      ),
      displaySmall: baseTextTheme.displaySmall?.copyWith(
        fontFamily: AppTypography.displayFamily,
        fontWeight: FontWeight.w700,
      ),
      headlineLarge: baseTextTheme.headlineLarge?.copyWith(
        fontFamily: AppTypography.displayFamily,
        fontWeight: FontWeight.w700,
      ),
      headlineMedium: baseTextTheme.headlineMedium?.copyWith(
        fontFamily: AppTypography.displayFamily,
        fontWeight: FontWeight.w700,
      ),
      headlineSmall: baseTextTheme.headlineSmall?.copyWith(
        fontFamily: AppTypography.displayFamily,
        fontWeight: FontWeight.w700,
      ),
      titleLarge: baseTextTheme.titleLarge?.copyWith(
        fontFamily: AppTypography.displayFamily,
        fontWeight: FontWeight.w700,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.white,
      fontFamily: AppTypography.bodyFamily,
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.ink,
        elevation: 0,
        titleTextStyle: TextStyle(
          fontFamily: AppTypography.displayFamily,
          fontWeight: FontWeight.w700,
          color: AppColors.ink,
          fontSize: 20,
        ),
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
        labelStyle: const TextStyle(
          fontFamily: AppTypography.bodyFamily,
          fontWeight: FontWeight.w700,
        ),
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
        backgroundColor: AppColors.green.withValues(alpha: .18),
        selectedColor: AppColors.green,
        side: const BorderSide(color: AppColors.green, width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        labelStyle: const TextStyle(
          fontFamily: AppTypography.bodyFamily,
          fontWeight: FontWeight.w800,
          color: AppColors.ink,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.white,
        indicatorColor: AppColors.pink.withValues(alpha: .16),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            fontFamily: AppTypography.bodyFamily,
            fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
            color: selected ? AppColors.pink : AppColors.ink,
          );
        }),
      ),
    );
  }
}

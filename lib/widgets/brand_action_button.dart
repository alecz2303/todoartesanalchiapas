import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

enum BrandActionButtonVariant {
  filledTonal,
  elevated,
  outlined,
}

class BrandActionButton extends StatelessWidget {
  const BrandActionButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
    required this.backgroundColor,
    this.foregroundColor = AppColors.ink,
    this.variant = BrandActionButtonVariant.elevated,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final Color backgroundColor;
  final Color foregroundColor;
  final BrandActionButtonVariant variant;

  @override
  Widget build(BuildContext context) {
    switch (variant) {
      case BrandActionButtonVariant.filledTonal:
        return FilledButton.tonalIcon(
          onPressed: onPressed,
          style: AppButtonStyles.solid(
            backgroundColor,
            foreground: foregroundColor,
          ),
          icon: Icon(icon),
          label: Text(label),
        );
      case BrandActionButtonVariant.outlined:
        return OutlinedButton.icon(
          onPressed: onPressed,
          style: AppButtonStyles.outlined(
            backgroundColor,
            foreground: foregroundColor,
          ),
          icon: Icon(icon),
          label: Text(label),
        );
      case BrandActionButtonVariant.elevated:
        return ElevatedButton.icon(
          onPressed: onPressed,
          style: AppButtonStyles.solid(
            backgroundColor,
            foreground: foregroundColor,
          ),
          icon: Icon(icon),
          label: Text(label),
        );
    }
  }
}

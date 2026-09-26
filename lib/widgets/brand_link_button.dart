import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BrandLinkButton extends StatelessWidget {
  const BrandLinkButton({
    super.key,
    required this.label,
    required this.color,
    required this.onPressed,
    this.icon,
    this.iconSize = 18,
    this.zeroPadding = false,
  });

  final String label;
  final Color color;
  final VoidCallback? onPressed;
  final IconData? icon;
  final double iconSize;
  final bool zeroPadding;

  @override
  Widget build(BuildContext context) {
    final baseStyle = AppButtonStyles.text(color);
    final style = zeroPadding
        ? baseStyle.copyWith(
            padding: const WidgetStatePropertyAll(EdgeInsets.zero),
          )
        : baseStyle;

    if (icon == null) {
      return TextButton(
        onPressed: onPressed,
        style: style,
        child: Text(label),
      );
    }

    return TextButton.icon(
      onPressed: onPressed,
      style: style,
      icon: Icon(icon, size: iconSize),
      label: Text(label),
    );
  }
}

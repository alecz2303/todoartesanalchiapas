import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class AccentIconBadge extends StatelessWidget {
  const AccentIconBadge({
    super.key,
    required this.icon,
    required this.accent,
    this.size = 54,
    this.radius = 17,
    this.iconSize,
    this.alpha = .2,
  });

  final IconData icon;
  final Color accent;
  final double size;
  final double radius;
  final double? iconSize;
  final double alpha;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: accent.withValues(alpha: alpha),
        borderRadius: BorderRadius.circular(radius),
      ),
      child: Icon(
        icon,
        color: AppColors.ink,
        size: iconSize,
      ),
    );
  }
}

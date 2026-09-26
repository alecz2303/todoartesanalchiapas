import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BrandPageHeader extends StatelessWidget {
  const BrandPageHeader({
    super.key,
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTypography.pageTitle),
        const SizedBox(height: 6),
        Text(
          subtitle,
          style: TextStyle(
            color: AppColors.ink.withValues(alpha: .65),
            height: 1.4,
          ),
        ),
      ],
    );
  }
}

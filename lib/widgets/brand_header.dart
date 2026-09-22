import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BrandHeader extends StatelessWidget {
  const BrandHeader({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: compact ? 44 : 54,
          height: compact ? 44 : 54,
          decoration: BoxDecoration(
            color: AppColors.pink,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(Icons.auto_awesome, color: Colors.white),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Todo Artesanal',
                style: TextStyle(
                  fontSize: compact ? 19 : 24,
                  fontWeight: FontWeight.w900,
                  color: AppColors.ink,
                  height: 1,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'CHIAPAS · HECHO A MANO',
                style: TextStyle(
                  fontSize: compact ? 10 : 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.purple,
                  letterSpacing: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

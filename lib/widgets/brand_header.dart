import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BrandHeader extends StatelessWidget {
  const BrandHeader({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final logoSize = compact ? 54.0 : 68.0;

    return Row(
      children: [
        Container(
          width: logoSize,
          height: logoSize,
          padding: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(compact ? 14 : 18),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(compact ? 12 : 16),
            child: Image.asset(
              'assets/branding/logo_todo_artesanal_chiapas.png',
              fit: BoxFit.contain,
              filterQuality: FilterQuality.high,
              semanticLabel: 'Logo de Todo Artesanal Chiapas',
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Todo Artesanal Chiapas',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: compact ? 18 : 23,
                  fontWeight: FontWeight.w900,
                  color: AppColors.ink,
                  height: 1.05,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                'PIÑATAS · PAPEL PICADO · Y MÁS',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: compact ? 9 : 10.5,
                  fontWeight: FontWeight.w800,
                  color: AppColors.cyan,
                  letterSpacing: .8,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

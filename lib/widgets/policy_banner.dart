import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class PolicyBanner extends StatelessWidget {
  const PolicyBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.yellow.withValues(alpha: .22),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.yellow.withValues(alpha: .7)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.event_available_rounded, color: AppColors.ink),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Los pedidos personalizados se agendan con al menos 20 días de anticipación y 50% de anticipo.',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                color: AppColors.ink,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

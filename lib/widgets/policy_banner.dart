import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class PolicyBanner extends StatelessWidget {
  const PolicyBanner({super.key});

  @override
  Widget build(BuildContext context) {
    const textStyle = TextStyle(
      color: AppColors.ink,
      fontSize: 16.5,
      height: 1.35,
      fontWeight: FontWeight.w800,
    );

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.yellow,
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.yellow,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(
                  Icons.event_available_rounded,
                  color: AppColors.ink,
                  size: 34,
                ),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Text(
                  'RECUERDA: Los pedidos PERSONALIZADOS',
                  style: textStyle,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'se AGENDAN con al menos 25 DÍAS de ANTICIPACIÓN y el 60% de ANTICIPO.',
            style: textStyle,
          ),
        ],
      ),
    );
  }
}

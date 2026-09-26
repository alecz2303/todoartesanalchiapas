import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'brand_notice.dart';

class PolicyBanner extends StatelessWidget {
  const PolicyBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return const BrandNotice(
      text: 'RECUERDA: Los pedidos PERSONALIZADOS se AGENDAN con al menos 25 DÍAS de ANTICIPACIÓN y el 60% de ANTICIPO.',
      color: AppColors.yellow,
      backgroundColor: AppColors.white,
      borderColor: AppColors.yellow,
      iconBackgroundColor: AppColors.yellow,
      icon: Icons.event_available_rounded,
      showBorder: true,
    );
  }
}

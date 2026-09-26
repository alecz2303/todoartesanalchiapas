import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'brand_notice.dart';

class PolicyBanner extends StatelessWidget {
  const PolicyBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return const BrandNotice(
      text: 'Los pedidos personalizados se agendan con al menos 20 días de anticipación y 50% de anticipo.',
      color: AppColors.yellow,
      backgroundColor: AppColors.white,
      borderColor: AppColors.yellow,
      iconBackgroundColor: AppColors.yellow,
      icon: Icons.event_available_rounded,
      showBorder: true,
    );
  }
}

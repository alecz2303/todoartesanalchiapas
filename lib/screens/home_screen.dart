import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/accent_icon_badge.dart';
import '../widgets/brand_action_button.dart';
import '../widgets/brand_header.dart';
import '../widgets/brand_link_button.dart';
import '../widgets/policy_banner.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    super.key,
    required this.onOpenCatalog,
    required this.onOpenOrder,
  });

  final VoidCallback onOpenCatalog;
  final VoidCallback onOpenOrder;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
      children: [
        const BrandHeader(),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.pink, AppColors.cyan],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
                decoration: BoxDecoration(
                  color: AppColors.white.withValues(alpha: .17),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'TRADICIÓN + CREATIVIDAD',
                  style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Tu celebración,\nhecha a mano. ✨',
                style: AppTypography.heroTitle,
              ),
              const SizedBox(height: 12),
              Text(
                'Piñatas, papel y plástico picado, detalles personalizados y mucho más.',
                style: TextStyle(color: AppColors.white.withValues(alpha: .9), fontSize: 15.5, height: 1.4, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 22),
              BrandActionButton(
                label: 'Quiero algo personalizado',
                icon: Icons.brush_rounded,
                onPressed: onOpenOrder,
                backgroundColor: AppColors.pink,
                foregroundColor: AppColors.white,
                variant: BrandActionButtonVariant.filledTonal,
              ),
            ],
          ),
        ),
        const SizedBox(height: 22),
        const PolicyBanner(),
        const SizedBox(height: 26),
        Row(
          children: [
            const Expanded(
              child: Text(
                'Explora lo que hacemos',
                style: AppTypography.sectionTitle,
              ),
            ),
            BrandLinkButton(
              label: 'Ver todo',
              color: AppColors.purple,
              onPressed: onOpenCatalog,
            ),
          ],
        ),
        const SizedBox(height: 12),
        const _FeatureCard(
          title: 'Piñatas',
          subtitle: 'Personalizadas y opciones listas para llevar',
          icon: Icons.celebration_rounded,
          accent: AppColors.pink,
        ),
        const SizedBox(height: 12),
        const _FeatureCard(
          title: 'Papel y plástico picado',
          subtitle: 'Decoración tradicional con un toque muy tuyo',
          icon: Icons.auto_awesome_rounded,
          accent: AppColors.yellow,
        ),
        const SizedBox(height: 12),
        const _FeatureCard(
          title: 'Personalizados',
          subtitle: 'Tazas, playeras, stickers y detalles especiales',
          icon: Icons.card_giftcard_rounded,
          accent: AppColors.cyan,
        ),
      ],
    );
  }
}

class _FeatureCard extends StatelessWidget {
  const _FeatureCard({required this.title, required this.subtitle, required this.icon, required this.accent});

  final String title;
  final String subtitle;
  final IconData icon;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            AccentIconBadge(
              icon: icon,
              accent: accent,
              alpha: .18,
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.cardTitle),
                  const SizedBox(height: 4),
                  Text(subtitle, style: TextStyle(color: AppColors.ink.withValues(alpha: .68), height: 1.3)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

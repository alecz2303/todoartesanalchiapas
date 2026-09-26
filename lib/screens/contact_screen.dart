import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme/app_theme.dart';
import '../widgets/accent_icon_badge.dart';
import '../widgets/brand_header.dart';
import '../widgets/brand_link_button.dart';
import '../widgets/brand_page_header.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  Future<void> _launch(String value) async {
    final uri = Uri.parse(value);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
      children: [
        const BrandHeader(compact: true),
        const SizedBox(height: 24),
        const BrandPageHeader(
          title: 'Visítanos',
          subtitle: 'También puedes encontrarnos en nuestra tienda física o escribirnos directamente.',
        ),
        const SizedBox(height: 20),
        _ContactCard(
          icon: Icons.location_on_rounded,
          accent: AppColors.pink,
          title: 'Tienda física',
          text: '6a Oriente Norte #132, Col. Centro, Tuxtla Gutiérrez, Chiapas.',
          button: 'Abrir ubicación',
          buttonColor: AppColors.orange,
          onTap: () => _launch('https://maps.app.goo.gl/MdvZvkhHM4y3xJD99'),
        ),
        const SizedBox(height: 12),
        _ContactCard(
          icon: Icons.chat_rounded,
          accent: AppColors.green,
          title: 'WhatsApp',
          text: '961 213 9040',
          button: 'Escribir ahora',
          buttonColor: AppColors.cyan,
          onTap: () => _launch('https://wa.me/529612139040'),
        ),
        const SizedBox(height: 12),
        _ContactCard(
          icon: Icons.alternate_email_rounded,
          accent: AppColors.cyan,
          title: 'Facebook e Instagram',
          text: '@todoartesanalchiapas',
          button: 'Abrir Instagram',
          buttonColor: AppColors.pink,
          onTap: () => _launch('https://www.instagram.com/todoartesanalchiapas/'),
        ),
        const SizedBox(height: 22),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hecho a mano significa tiempo 💖',
                style: TextStyle(
                  fontFamily: AppTypography.displayFamily,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                  color: AppColors.ink,
                ),
              ),
              SizedBox(height: 8),
              Text('Cada pieza personalizada lleva un proceso artesanal. Agenda con anticipación para que podamos cuidar cada detalle de tu pedido.', style: TextStyle(height: 1.45, color: AppColors.ink)),
            ],
          ),
        ),
      ],
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard({required this.icon, required this.accent, required this.title, required this.text, required this.button, required this.buttonColor, required this.onTap});

  final IconData icon;
  final Color accent;
  final String title;
  final String text;
  final String button;
  final Color buttonColor;
  final VoidCallback onTap;

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
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontFamily: AppTypography.displayFamily,
                      fontWeight: FontWeight.w700,
                      fontSize: 16.5,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(text, style: TextStyle(color: AppColors.ink.withValues(alpha: .67), height: 1.35)),
                  const SizedBox(height: 6),
                  BrandLinkButton(
                    label: button,
                    color: buttonColor,
                    onPressed: onTap,
                    zeroPadding: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

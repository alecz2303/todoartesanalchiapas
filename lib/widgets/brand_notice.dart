import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BrandNotice extends StatelessWidget {
  const BrandNotice({
    super.key,
    required this.text,
    required this.color,
    this.icon,
    this.padding = const EdgeInsets.all(18),
    this.radius = 20,
    this.showBorder = false,
    this.textAlign = TextAlign.start,
    this.fontWeight = FontWeight.w800,
    this.fontSize,
  });

  final String text;
  final Color color;
  final IconData? icon;
  final EdgeInsetsGeometry padding;
  final double radius;
  final bool showBorder;
  final TextAlign textAlign;
  final FontWeight fontWeight;
  final double? fontSize;

  @override
  Widget build(BuildContext context) {
    final message = Text(
      text,
      textAlign: textAlign,
      style: TextStyle(
        fontWeight: fontWeight,
        color: AppColors.ink,
        height: 1.35,
        fontSize: fontSize,
      ),
    );

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(radius),
        border: showBorder ? Border.all(color: color) : null,
      ),
      child: icon == null
          ? message
          : Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, color: AppColors.ink),
                const SizedBox(width: 12),
                Expanded(child: message),
              ],
            ),
    );
  }
}

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
    this.backgroundColor,
    this.borderColor,
    this.iconBackgroundColor,
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
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? iconBackgroundColor;
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
        color: backgroundColor ?? color,
        borderRadius: BorderRadius.circular(radius),
        border: showBorder
            ? Border.all(color: borderColor ?? color, width: 1.5)
            : null,
      ),
      child: icon == null
          ? message
          : Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (iconBackgroundColor == null)
                  Icon(icon, color: AppColors.ink)
                else
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: iconBackgroundColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: AppColors.ink, size: 22),
                  ),
                const SizedBox(width: 12),
                Expanded(child: message),
              ],
            ),
    );
  }
}

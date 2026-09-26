import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class PolicyBanner extends StatelessWidget {
  const PolicyBanner({super.key});

  static const _message =
      'RECUERDA: Los pedidos PERSONALIZADOS se AGENDAN con al menos 25 DÍAS de ANTICIPACIÓN y el 60% de ANTICIPO.';

  static const _textStyle = TextStyle(
    color: AppColors.ink,
    fontSize: 16.5,
    height: 1.35,
    fontWeight: FontWeight.w800,
  );

  static const _iconSize = 68.0;
  static const _gap = 14.0;
  static const _sideLines = 3;

  List<String> _splitForSquareWrap(
    BuildContext context,
    double availableWidth,
  ) {
    final words = _message.split(' ');
    var top = '';
    var splitIndex = words.length;

    for (var i = 0; i < words.length; i++) {
      final candidate = top.isEmpty ? words[i] : '$top ${words[i]}';
      final painter = TextPainter(
        text: TextSpan(text: candidate, style: _textStyle),
        textDirection: Directionality.of(context),
        maxLines: _sideLines,
      )..layout(maxWidth: availableWidth);

      if (painter.didExceedMaxLines) {
        splitIndex = i;
        break;
      }

      top = candidate;
    }

    final bottom = splitIndex < words.length
        ? words.sublist(splitIndex).join(' ')
        : '';

    return [top, bottom];
  }

  @override
  Widget build(BuildContext context) {
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
      child: LayoutBuilder(
        builder: (context, constraints) {
          final sideWidth =
              (constraints.maxWidth - _iconSize - _gap).clamp(120.0, double.infinity);
          final parts = _splitForSquareWrap(context, sideWidth);
          final topText = parts[0];
          final bottomText = parts[1];

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: _iconSize,
                    height: _iconSize,
                    decoration: BoxDecoration(
                      color: AppColors.yellow,
                      borderRadius: BorderRadius.circular(17),
                    ),
                    child: const Icon(
                      Icons.event_available_rounded,
                      color: AppColors.ink,
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: _gap),
                  Expanded(
                    child: Text(
                      topText,
                      style: _textStyle,
                    ),
                  ),
                ],
              ),
              if (bottomText.isNotEmpty)
                Text(
                  bottomText,
                  style: _textStyle,
                  textAlign: TextAlign.justify,
                ),
            ],
          );
        },
      ),
    );
  }
}

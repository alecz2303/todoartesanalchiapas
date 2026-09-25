import 'package:flutter/material.dart';

import '../models/catalog_item.dart';
import '../theme/app_theme.dart';

const catalogItems = <CatalogItem>[
  CatalogItem(
    name: 'Piñata personalizada',
    category: 'Piñatas',
    description: 'Diseñada especialmente para tu temática, personaje o evento.',
    icon: Icons.celebration_rounded,
    accent: AppColors.pink,
  ),
  CatalogItem(
    name: 'Piñata disponible en tienda',
    category: 'Piñatas',
    description: 'Opciones listas para llevar, sujetas a existencia.',
    icon: Icons.storefront_rounded,
    accent: AppColors.green,
    priceLabel: 'Desde \$250',
    isReadyStock: true,
  ),
  CatalogItem(
    name: 'Papel picado personalizado',
    category: 'Papel picado',
    description: 'Diseños y nombres personalizados para decorar tus eventos.',
    icon: Icons.auto_awesome_rounded,
    accent: AppColors.yellow,
  ),
  CatalogItem(
    name: 'Plástico picado personalizado',
    category: 'Plástico picado',
    description: 'Tiras resistentes, coloridas y personalizadas.',
    icon: Icons.filter_vintage_rounded,
    accent: AppColors.cyan,
  ),
  CatalogItem(
    name: 'Taza sublimada',
    category: 'Personalizados',
    description: 'Diseños personalizados para regalo, negocio o evento.',
    icon: Icons.coffee_rounded,
    accent: AppColors.cyan,
  ),
  CatalogItem(
    name: 'Playera personalizada',
    category: 'Personalizados',
    description: 'Una prenda única con el diseño que quieras expresar.',
    icon: Icons.checkroom_rounded,
    accent: AppColors.pink,
  ),
  CatalogItem(
    name: 'Stickers personalizados',
    category: 'Personalizados',
    description: 'Para dulces, recuerdos, etiquetas y detalles especiales.',
    icon: Icons.local_offer_rounded,
    accent: AppColors.green,
  ),
];

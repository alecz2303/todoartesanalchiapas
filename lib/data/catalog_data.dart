import 'package:flutter/material.dart';

import '../models/catalog_item.dart';
import '../theme/app_theme.dart';

const catalogItems = <CatalogItem>[
  CatalogItem(
    id: 'pinata-personalizada',
    name: 'Piñata personalizada',
    category: ProductCategory.pinatas,
    description:
        'Una pieza hecha a mano para tu temática, personaje o celebración.',
    icon: Icons.celebration_rounded,
    accent: AppColors.pink,
    supportsReferenceImage: true,
    leadTimeDays: 20,
    features: [
      'Diseño personalizado',
      'Nombre o texto opcional',
      'Elaboración artesanal',
    ],
    sizes: ['Medida a definir según diseño'],
    options: ['Personaje', 'Temática', 'Número', 'Diseño especial'],
  ),
  CatalogItem(
    id: 'pinata-tienda',
    name: 'Piñata disponible en tienda',
    category: ProductCategory.pinatas,
    description:
        'Modelos listos para llevar, sujetos a existencia en tienda física.',
    icon: Icons.storefront_rounded,
    accent: AppColors.lime,
    pricingType: ProductPricingType.from,
    price: 250,
    isReadyStock: true,
    requiresCustomization: false,
    leadTimeDays: 0,
    features: [
      'Entrega inmediata según existencia',
      'Precio visible cuando el modelo tiene precio definido',
    ],
    options: ['Modelos disponibles del día'],
  ),
  CatalogItem(
    id: 'papel-picado-personalizado',
    name: 'Papel picado personalizado',
    category: ProductCategory.papelPicado,
    description:
        'Papel picado para eventos con nombres, frases y diseños especiales.',
    icon: Icons.auto_awesome_rounded,
    accent: AppColors.yellow,
    supportsReferenceImage: true,
    leadTimeDays: 20,
    features: [
      'Diseño personalizado',
      'Combinación de colores',
      'Opciones por cantidad',
    ],
    sizes: ['Medidas según producto y pedido'],
    options: ['Nombre', 'Frase', 'Temática', 'Diseño de temporada'],
  ),
  CatalogItem(
    id: 'plastico-picado-personalizado',
    name: 'Plástico picado personalizado',
    category: ProductCategory.plasticoPicado,
    description:
        'Tiras resistentes y coloridas para decorar eventos y celebraciones.',
    icon: Icons.filter_vintage_rounded,
    accent: AppColors.purple,
    supportsReferenceImage: true,
    leadTimeDays: 20,
    features: [
      'Diseño personalizado',
      'Colores combinables',
      'Ideal para exterior o montajes de mayor duración',
    ],
    sizes: ['Largo y cantidad según cotización'],
    options: ['Nombre', 'Frase', 'Temática', 'Combinación de colores'],
  ),
  CatalogItem(
    id: 'taza-sublimada',
    name: 'Taza sublimada',
    category: ProductCategory.personalizados,
    description:
        'Tazas personalizadas para regalo, negocio, escuela o celebración.',
    icon: Icons.coffee_rounded,
    accent: AppColors.sky,
    supportsReferenceImage: true,
    leadTimeDays: 20,
    features: ['Diseño personalizado', 'Sublimación a color'],
    options: ['Fotografía', 'Nombre', 'Frase', 'Diseño temático'],
  ),
  CatalogItem(
    id: 'playera-personalizada',
    name: 'Playera personalizada',
    category: ProductCategory.personalizados,
    description:
        'Playeras con diseños personalizados para expresar, regalar o celebrar.',
    icon: Icons.checkroom_rounded,
    accent: AppColors.pink,
    supportsReferenceImage: true,
    leadTimeDays: 20,
    features: ['Diseño personalizado', 'Cotización según técnica y cantidad'],
    options: ['Nombre', 'Frase', 'Imagen', 'Diseño temático'],
  ),
  CatalogItem(
    id: 'stickers-personalizados',
    name: 'Stickers personalizados',
    category: ProductCategory.personalizados,
    description:
        'Etiquetas y stickers para dulces, recuerdos, negocios y eventos.',
    icon: Icons.local_offer_rounded,
    accent: AppColors.lime,
    supportsReferenceImage: true,
    leadTimeDays: 20,
    features: ['Diseño personalizado', 'Cotización según tamaño y cantidad'],
    sizes: ['Tamaño según uso'],
    options: ['Circular', 'Cuadrado', 'Forma personalizada'],
  ),
  CatalogItem(
    id: 'muneca-artesanal',
    name: 'Muñeca artesanal',
    category: ProductCategory.artesanias,
    description:
        'Piezas decorativas hechas a mano con macetas de barro y materiales reciclados.',
    icon: Icons.palette_rounded,
    accent: AppColors.yellow,
    supportsReferenceImage: true,
    leadTimeDays: 20,
    features: [
      'Hecha a mano',
      'Inspiración chiapaneca',
      'Materiales artesanales y reciclados',
    ],
    options: ['Diseño disponible', 'Pedido especial'],
  ),
];

const catalogCategories = ProductCategory.values;

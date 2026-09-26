import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme/app_theme.dart';
import '../widgets/brand_header.dart';
import '../widgets/policy_banner.dart';

class OrderScreen extends StatefulWidget {
  const OrderScreen({super.key});

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _details = TextEditingController();
  final _customName = TextEditingController();

  String _product = 'Piñata personalizada';
  DateTime? _eventDate;
  XFile? _reference;

  static const products = [
    'Piñata personalizada',
    'Papel picado personalizado',
    'Plástico picado personalizado',
    'Taza sublimada',
    'Playera personalizada',
    'Stickers personalizados',
    'Otro',
  ];

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _details.dispose();
    _customName.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (image != null) setState(() => _reference = image);
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final minimum = DateTime(now.year, now.month, now.day).add(const Duration(days: 20));
    final picked = await showDatePicker(
      context: context,
      initialDate: minimum,
      firstDate: minimum,
      lastDate: DateTime(now.year + 2),
      helpText: 'Fecha de tu evento',
    );
    if (picked != null) setState(() => _eventDate = picked);
  }

  String _dateLabel(DateTime date) {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  Future<void> _sendRequest() async {
    if (!_formKey.currentState!.validate() || _eventDate == null) {
      if (_eventDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Selecciona la fecha de tu evento.')));
      }
      return;
    }

    final message = '''Hola Todo Artesanal Chiapas 👋
Quiero solicitar una cotización.

Producto: $_product
Cliente: ${_name.text.trim()}
Teléfono: ${_phone.text.trim()}
Fecha del evento: ${_dateLabel(_eventDate!)}
Nombre o texto personalizado: ${_customName.text.trim().isEmpty ? 'No indicado' : _customName.text.trim()}
Detalles: ${_details.text.trim()}
Referencia seleccionada: ${_reference == null ? 'No' : 'Sí (la enviaré por este chat)'}

Entiendo que los pedidos personalizados requieren mínimo 20 días de anticipación y 50% de anticipo para agendar.''';

    final uri = Uri.parse('https://wa.me/529612139040?text=${Uri.encodeComponent(message)}');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
      children: [
        const BrandHeader(compact: true),
        const SizedBox(height: 24),
        const Text('Haz tu pedido', style: AppTypography.pageTitle),
        const SizedBox(height: 6),
        Text('Cuéntanos qué necesitas y prepararemos tu solicitud para enviarla por WhatsApp.', style: TextStyle(color: AppColors.ink.withValues(alpha: .65), height: 1.4)),
        const SizedBox(height: 18),
        const PolicyBanner(),
        const SizedBox(height: 20),
        Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButtonFormField<String>(
                initialValue: _product,
                decoration: const InputDecoration(labelText: '¿Qué necesitas?', prefixIcon: Icon(Icons.shopping_bag_outlined)),
                items: products.map((value) => DropdownMenuItem(value: value, child: Text(value))).toList(),
                onChanged: (value) => setState(() => _product = value ?? _product),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Tu nombre', prefixIcon: Icon(Icons.person_outline_rounded)),
                validator: (value) => value == null || value.trim().isEmpty ? 'Escribe tu nombre.' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Teléfono', prefixIcon: Icon(Icons.phone_outlined)),
                validator: (value) => value == null || value.trim().length < 10 ? 'Escribe un teléfono válido.' : null,
              ),
              const SizedBox(height: 12),
              InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: _pickDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Fecha del evento',
                    prefixIcon: const Icon(Icons.calendar_month_outlined, color: AppColors.orange),
                    fillColor: AppColors.orange.withValues(alpha: .10),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppColors.orange, width: 1.5),
                    ),
                  ),
                  child: Text(_eventDate == null ? 'Seleccionar fecha' : _dateLabel(_eventDate!), style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _customName,
                decoration: const InputDecoration(labelText: 'Nombre o texto personalizado (opcional)', prefixIcon: Icon(Icons.text_fields_rounded)),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _details,
                minLines: 4,
                maxLines: 7,
                decoration: const InputDecoration(labelText: 'Describe tu idea', alignLabelWithHint: true, prefixIcon: Padding(padding: EdgeInsets.only(bottom: 74), child: Icon(Icons.edit_outlined))),
                validator: (value) => value == null || value.trim().length < 8 ? 'Cuéntanos un poco más de tu idea.' : null,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _pickImage,
                icon: Icon(_reference == null ? Icons.add_photo_alternate_outlined : Icons.check_circle_rounded),
                label: Text(_reference == null ? 'Agregar imagen de referencia' : 'Referencia seleccionada'),
                style: AppButtonStyles.outlined(AppColors.lime),
              ),
              if (_reference != null) ...[
                const SizedBox(height: 6),
                Text(_reference!.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.ink.withValues(alpha: .6), fontSize: 12)),
              ],
              const SizedBox(height: 18),
              ElevatedButton.icon(
                onPressed: _sendRequest,
                style: AppButtonStyles.solid(AppColors.cyan),
                icon: const Icon(Icons.send_rounded),
                label: const Text('Enviar solicitud por WhatsApp'),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.yellow,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Text(
                  'La imagen de referencia no se adjunta automáticamente a WhatsApp; la app te recordará enviarla en el chat.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.ink, fontSize: 12, height: 1.35, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

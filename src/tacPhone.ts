/** Enlaces externos únicamente; no envía mensajes ni llama a la API de WhatsApp. */
export function tacPhoneKey(phone: string): string {
 const digits = phone.replace(/\D/g, '');
 if (digits.length === 12 && digits.startsWith('52')) return digits.slice(2);
 if (digits.length === 13 && digits.startsWith('521')) return digits.slice(3);
 return digits;
}
export function tacWhatsAppUrl(phone: string): string | null {
 const digits = phone.replace(/\D/g, '');
 if (digits.length === 10) return 'https://wa.me/52' + digits;
 if (digits.length === 12 && digits.startsWith('52')) return 'https://wa.me/' + digits;
 if (digits.length === 13 && digits.startsWith('521')) return 'https://wa.me/52' + digits.slice(3);
 // No adivinar país ni generar enlaces para teléfonos incompletos.
 return null;
}

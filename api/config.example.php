<?php
// Copy to config.local.php on cPanel. NEVER commit config.local.php.
return [
 'db_host' => 'localhost',
 'db_name' => 'CPANEL_DATABASE_NAME',
 'db_user' => 'CPANEL_DATABASE_USER',
 'db_password' => 'REPLACE_ON_SERVER',

 // WhatsApp Cloud API — aviso automático cuando una cotización ya tiene
 // precio (el pedido pasa a 'En cotización' en el panel). Si wa_enabled
 // es false o falta alguna clave, el aviso se omite en silencio y el
 // panel funciona igual que antes.
 'wa_enabled' => false,              // true para activar el aviso automático
 'wa_phone_number_id' => '',         // Phone number ID de Meta (WhatsApp Manager > Números)
 'wa_token' => '',                   // Token permanente de usuario de sistema (nunca subirlo a Git)
 'wa_template' => 'cotizacion_lista', // Nombre de la plantilla aprobada en Meta
 'wa_template_lang' => 'es_MX',      // Idioma de la plantilla
 'wa_api_base' => 'https://graph.facebook.com/v21.0', // No cambiar salvo pruebas
 'site_url' => 'https://TU-DOMINIO', // URL pública del sitio, sin / final (para el enlace /cotizacion)
];

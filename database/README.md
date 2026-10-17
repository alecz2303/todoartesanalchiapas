# Instalación en cPanel (sin terminal)
1. Crear base MySQL y usuario desde **MySQL Databases**; conceder privilegios a esa base.
2. Importar `schema.sql` desde **phpMyAdmin**.
3. Subir `api/` al directorio del sitio y copiar `config.example.php` a `config.local.php` **solo en el servidor**; editar con las credenciales MySQL. Nunca subir ese archivo a Git.
4. Activar HTTPS y comprobar que `/api/auth.php?action=session` devuelve `{"authenticated":false}`.
5. Crear el **primer usuario** con un hash generado por `password_hash(..., PASSWORD_DEFAULT)` en un entorno PHP confiable; insertar mediante phpMyAdmin. No usar contraseñas en texto plano ni crear scripts públicos de instalación.
6. La API de usuarios permite crear cuentas adicionales después de iniciar sesión.

**Advertencia:** esta es la primera etapa de backend. Aún falta conectar la interfaz React y realizar pruebas de seguridad e integración. No publicar para datos reales todavía.

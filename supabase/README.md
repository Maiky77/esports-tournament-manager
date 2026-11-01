# Supabase · RagnarokU-Series

Esta integración usa PostgreSQL, Auth y Storage de Supabase. No necesita una clave secreta en el navegador ni un servidor Node adicional.

## Activación del proyecto existente

1. Abre **RagnarokU-Series** en Supabase. Revisa si ya hay tablas llamadas `registrations`, `registration_players`, `tournament_divisions`, `tournament_matches` o `match_entries`. La migración crea tablas nuevas y fallará si existen; no borra ni reemplaza datos existentes.
2. Ejecuta `migrations/202611010001_event_backend.sql` completo desde **SQL Editor**. Alternativa con CLI: `supabase login`, `supabase link --project-ref TU_PROJECT_REF`, `supabase db push`. Apunta al proyecto correcto antes de aplicar.
3. En **Authentication > Providers / Sign In** habilita **Anonymous Sign-Ins**. El capitán obtiene una sesión protegida sin tener que crear una contraseña. La sesión solo sirve en ese navegador; el código de inscripción permite a la organización localizar la solicitud. No es una cuenta recuperable.
4. Copia `.env.example` a `.env.local` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con la URL y clave pública del proyecto. También se acepta la clave `anon` antigua. Reinicia Vite (`npm run dev`). No uses `service_role`, `sb_secret_...` ni contraseñas de PostgreSQL en variables `VITE_`.
5. En **Authentication > Users** crea usuarios con correo y contraseña para ambos organizadores. Sus cuentas deben estar confirmadas. Añade sus UUID a la tabla privada con el SQL de abajo. No basta con registrarse o editar metadatos para convertirse en administrador.
6. Abre `/admin`, inicia sesión y comprueba una solicitud. Al aprobarla aparecerá en `/equipos`. En Fixture selecciona los equipos confirmados, guarda un borrador o marca **Publicar** para mostrarlo en `/llaves`.

```sql
-- Sustituye cada UUID por el ID real del usuario creado en Authentication.
insert into private.event_admins(user_id)
values ('UUID_DEL_ORGANIZADOR_1'), ('UUID_DEL_ORGANIZADOR_2');
```

## Protección contra automatización

Antes de abrir inscripciones al público, configura Turnstile en **Supabase Auth > Bot and Abuse Protection**, guarda allí la clave secreta y añade su clave pública como `VITE_TURNSTILE_SITE_KEY`. Autoriza tu dominio y `localhost` en Turnstile. La página muestra el desafío y envía el token a Supabase Auth. Revisa también los límites de Auth del proyecto. La aplicación limita solicitudes activas por sesión; una sesión anónima nueva no equivale a una identidad verificada.

## Datos y permisos

- `registrations`: datos de contacto, importe calculado en la base, términos, estado y revisión. Solo su propietario y organizadores pueden leer estos datos.
- `registration_players`: roster privado, IDs de juego y servidores. El público solo ve nicknames de equipos aprobados.
- `get_confirmed_teams`: proyección pública de equipos aprobados. No devuelve contactos, recibos ni IDs de juego.
- `registration-files`: bucket privado, archivos de hasta 5 MB. Los comprobantes requieren acceso del propietario u organizador y enlaces temporales. Solo los logos de equipos aprobados pueden servirse públicamente con URL firmada.
- `tournament_matches` y `match_entries`: series MLBB o salas Free Fire. El público solo lee encuentros publicados. Los resultados de FF son posición y kills por sala; no se calcula clasificación acumulada ni desempates entre salas.
- `private.event_admins`: lista de organizadores gestionada únicamente desde SQL/Dashboard. No se expone por la API.

El guardado de equipo y roster es transaccional. Las subidas ocurren primero; si una petición pierde la respuesta, reintentar con su mismo UUID recupera el registro guardado. Los archivos de intentos abandonados pueden quedar sin referencia: limpiar desde Storage tras verificar que no figuran en `logo_path` o `receipt_path`; no borrar directamente filas de `storage.objects`.

Los pagos se validan manualmente. Adjuntar un comprobante no confirma el abono. El QR y los datos reales de Yape siguen pendientes de publicación. Los administradores programan las series/salas manualmente; no se genera automáticamente un bracket ni se avanza un ganador a otro cruce.

## Cierre y tarifas

```sql
update public.tournament_divisions set registration_open = false where game_code = 'mlbb';
-- Ajusta fecha y tarifa aquí; sincroniza también los importes/textos visibles en la web.
```

Las tarifas iniciales son MLBB S/ 20 y Free Fire S/ 15, con cierre el 15/12/2026 a las 23:59:59 de Perú. El servidor no acepta el importe ni el estado enviados por el cliente.

## Verificación

`npm test` ejecuta validaciones y pruebas reales de PostgreSQL con PGlite: transacciones, RLS, permisos de organizador, privacidad, duplicados, reintentos y fixture. Auth y Storage se representan con sus esquemas mínimos en estas pruebas; no sustituyen una prueba de carga/subida/autenticación contra el proyecto de Supabase. `npm run build` verifica la compilación del frontend.

Prueba final en un proyecto de desarrollo: enviar una solicitud con imagen/PDF, ver el código, aprobar pago en `/admin`, comprobar que solo aparece entonces en `/equipos`, crear un encuentro en borrador, publicarlo y verificar su resultado en `/llaves`.

## Compatibilidad con la integración pública existente

Si el proyecto ya expone `tournament_settings`, `games`, `prizes` y las vistas `public_*`, la web conserva esa integración: lee la configuración publicada, usa su firma `submit_registration(payload)` y sus buckets `receipts` y `team-logos`. Mantiene el buscador de instituciones/carreras, los cupos y las fases de grupos/eliminación/Battle Royale. La configuración debe terminar de cargar antes de enviar una inscripción.

En el esquema nuevo de esta carpeta se usa `submit_registration(p_request_id, p_data)` con `registration-files` y el panel `/admin`. La aplicación selecciona la integración antes de subir archivos; una escritura fallida nunca se reintenta automáticamente con la otra firma. El panel `/admin` corresponde a las tablas y funciones de esta migración. No apliques esta migración encima de tablas existentes con otra estructura sin preparar su migración de datos.

# RAGNAROK U-Series

Portal universitario de esports para Mobile Legends y Free Fire, construido con React y Vite. Backend en Supabase: inscripciones, roster, archivos privados, aprobación de pagos y fixture.

## Desarrollo

```sh
npm install
npm run dev
```

Para activar el backend de **RagnarokU-Series**, sigue [la configuración de Supabase](supabase/README.md). Sin variables de conexión la web se puede explorar, pero no envía inscripciones ni muestra datos inventados.

```sh
npm test
npm run build
```

Las rutas son `/`, `/inscripcion`, `/equipos`, `/llaves` y `/admin`. El alojamiento debe redirigir rutas del frontend a `index.html`. No subas `.env.local`, contraseñas ni claves secretas al repositorio.

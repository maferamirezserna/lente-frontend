# Lente · Frontend

Interfaz web de **Lente** (proyecto de grado, U. de Manizales): el profesor entra, elige un curso, abre una actividad para un estudiante en el mismo dispositivo (modo aula) y revisa los textos que prepara la IA.

Hecho con React 18 + Vite + TypeScript. Habla solo con la API de [mvega09/lente](https://github.com/mvega09/lente). Las reglas que debe respetar están en [CLAUDE.md](CLAUDE.md).

## Verla en tu PC

Necesitas [Node.js 20 o más](https://nodejs.org).

1. `npm install`
2. Elige cómo verla:
   - **Sin backend (solo diseño):** `npm run demo` y abre http://localhost:3000. Entra con cualquier usuario y contraseña; los datos son de ejemplo.
   - **Con el backend real:** conecta la VPN (FortiClient), luego `npm run dev` y abre http://localhost:3000. Usa la cuenta de prueba que te pasaron por privado.

Por defecto el modo `dev` manda las peticiones de `/api` a la VM-APP (`http://10.60.14.182:8000`). Para cambiarlo, copia `.env.example` a `.env` y edita `LENTE_BACKEND`.

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/login`, `/cambiar-clave` | Entrada del profesor |
| `/cursos` | Mis cursos |
| `/cursos/:id` | Estudiantes + panel de modo aula (abrir actividad) |
| `/cursos/:id/panel` | Panel del curso: avance, clima y acompañamiento |
| `/textos`, `/textos/:id` | Biblioteca y revisión de lo que preparó la IA |
| `/actividad/:id` | Actividad del estudiante: idea principal → organización → palabras → resultado |

## Estructura

```
src/
  api/client.ts    único cliente de la API (token, 401, errores)
  api/types.ts     tipos según los esquemas del backend
  api/demo.ts      datos de ejemplo para npm run demo
  components/ui.tsx  barra superior, avatar, barras, colores
  pages/           una pantalla por archivo
  styles.css       colores, botones y animaciones
```

Para cambiar colores o letra: `src/styles.css` (variables al inicio) y la línea de Google Fonts en `index.html`.

## Desplegar en la VM-APP

1. `npm run build` (genera `dist/`).
2. Copiar `dist/` a `/var/www/lente` en la VM-APP.
3. Usar `deploy/nginx-lente.conf` en Nginx: sirve la página y pasa `/api` al backend en el puerto 8000, así no hace falta tocar el CORS.

# Diseño de Lente: mockups aprobados

Esta carpeta guarda el diseño que elegimos para Lente. Es la **referencia visual** del frontend: cuando una pantalla del código se vea distinta, manda el mockup.

- `capturas/`: imagen PNG de cada mockup. Es lo más rápido de revisar.
- `mockups/`: el HTML original de cada mockup. Se abre directo en el navegador y tiene las animaciones (lupa, transiciones, actividad interactiva).

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Logo | La **lupa**, versiones 1, 2 y 3 de `Logo-Final`. La 1 va en el login: la lupa pasa sobre un recorte de noticia borroso y adentro se lee nítido. La 2 va arriba del formulario. Se exploró una lente de cámara, pero se descartó. |
| Marca | **Monocromático azul**: cobalto `#2F5BEA` (borde `#1A36A8`), celeste `#9CC3FF` y `#C9DBFF`, blanco y tinta `#1F2A37`. Sin verdes menta, fucsia ni esmeralda como acento. |
| Dentro de la app | **Colores fosforescentes** de categoría para cursos y avatares de estudiantes: azul `#2F6BFF`, verde `#2BEA7C`, amarillo `#FFE600`, rosa `#FF2DAA`, naranja `#FF7A00` y cian `#00E1FF`. Sobre el neón, el texto va **negro y en negrilla**; solo el azul lleva texto blanco. Nada de pasteles. |
| Tipos de palabra (micro) | Adjetivo: cian. Verbo: verde. Expresión: rosa. |
| Barras de avance | Idea principal `#1A36A8`, organización `#2F5BEA`, palabras `#9CC3FF`. |
| Estilo | Tarjetas redondeadas con borde inferior grueso, botones "chunky" que se hunden al tocarlos, animaciones suaves (estilo Duolingo, no "plantilla de IA"). |
| Letra | **Pendiente.** Hoy: Nunito (interfaz) y Lexend (lectura de noticias). Mafe siente que se ve "de IA". En `Tipografias` hay 6 parejas; las recomendadas son la 2 (Fraunces + Figtree) y la 3 (Bricolage Grotesque + Figtree). |

## Pantallas

| Mockup | Ruta en la app | Archivo del código |
|---|---|---|
| `Mock-Login` | `/login` | `src/pages/Login.tsx` |
| `Mock-Cursos` | `/cursos` | `src/pages/Cursos.tsx` |
| `Mock-Estudiantes` (con panel lateral de modo aula) | `/cursos/:id` | `src/pages/Estudiantes.tsx` |
| `Mock-Actividad` (intro → idea principal con espera de la IA → organización → palabras con lupa que sigue el mouse → resultado) | `/actividad/:id` | `src/pages/Actividad.tsx` |
| `Mock-Textos` | `/textos` | `src/pages/Textos.tsx` |
| `Mock-Revision` | `/textos/:id` | `src/pages/Textos.tsx` (`Revision`) |
| `Mock-Panel` | `/cursos/:id/panel` | `src/pages/Panel.tsx` |
| `Logo-Final`, `Colores-Fluor`, `Tipografias` | — | referencia de logo, neones y letras |

## Diferencias conocidas entre el código y los mockups

La primera versión del código es más sencilla que algunos mockups. Por ejemplo, en `Mock-Cursos` cada tarjeta muestra barras de avance, textos activos y alertas, y hay un botón "Crear un curso". Al acercar el código al mockup:

- Usa solo datos que la API ya entrega (ver `CLAUDE.md`). Si un dato del mockup no existe en la API, no lo inventes: anótalo para el equipo de backend.
- Los números y nombres de los mockups son de ejemplo.

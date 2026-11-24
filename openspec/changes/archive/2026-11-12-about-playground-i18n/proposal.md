# Proposal

## Why

La página se está cerrando para lanzamiento: falta un ítem de identidad personal en la sección About (el video DCA ya está en `public/` sin usar), la sección "Projects" pasa a llamarse "Playground", y el modal Timeline (contenido extenso, 5 bloques de texto) queda totalmente en inglés cuando se traduce la página al español, porque el diccionario de traducción nunca lo incluyó.

## What Changes

- **About: nuevo ítem penúltimo** del carrusel (entre "Web designer" y "Volleyball player"), con video `DCA-720.mp4` y texto placeholder en EN/ES que el usuario editará después (en `index.html` y en `translateDict`).
- **About desktop: longitud de scroll 400vh → 500vh** en `.scroll-jacking-section` (4 slides → 5). Mobile no cambia (altura auto).
- **About: renumeración de selectores** `.carousel-item:nth-child(n)` en `translateDict` (Volleyball 5→6, nuevo ítem entra como 5).
- **Sección renombrada "Projects" → "Playground"** en los textos visibles (nav y título gigante), quedando igual en ambos idiomas. Ids, clases y anclas (`#projects`, `.projects-*`) intactos; el footer "Work/Trabajos" no cambia.
- **Traducción del modal Timeline** al diccionario: las 4 paradas (título + párrafo), "Versatility" + párrafo final, el texto "Scroll" de la bola, y los dos botones de cierre ("BACK TO PAGE ✕" / "Back to page"). El botón "Timeline" queda igual en ambos idiomas (no entra al diccionario).

## Capabilities

### New Capabilities

- `about-carousel`: composición y comportamiento del carrusel de About — ítems, orden, video por ítem, longitud de scroll-jacking en desktop, altura auto en mobile, altura fija de descripciones medida en carga.
- `site-language-toggle`: comportamiento del toggle EN/ES — qué contenido se traduce (hero, nav, About, footer, modal Timeline), qué textos quedan igual en ambos idiomas ("Playground", "Timeline", "Work/Trabajos") y el mecanismo del diccionario con selectores.

### Modified Capabilities

- (ninguna — la única capability existente, `notch-header`, no cambia)

## Impact

- **`index.html`**: nuevo bloque `.carousel-item` (línea ~167), textos "Playground" en nav y título.
- **`main.js`**: `translateDict` (renumeración nth-child, nuevo ítem, entradas del Timeline) y textos "Playground" en las entradas existentes del nav/título.
- **`style.css`**: `.scroll-jacking-section` height 400vh → 500vh (solo desktop; mobile usa `height: auto`).
- Sin cambios de dependencias, build ni assets nuevos (DCA-720.mp4 ya existe).
- Nota de mantenimiento para el usuario: el texto del ítem nuevo se edita en `index.html` **y** en `translateDict` (`main.js`), o el toggle de idioma restaurará el placeholder.

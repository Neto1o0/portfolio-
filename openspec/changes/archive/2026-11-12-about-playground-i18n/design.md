# Design

## Context

Ver `proposal.md` — Why. Los tres puntos ya se exploraron contra el código:

- El carrusel de About tiene 6 bloques hermanos en `.horizontal-track` (intro-block, 4 carousel-items, more-about-block). Los ítems se indexan por array en JS (`carouselItems`), así que insertar el nuevo es seguro salvo por los selectores `nth-child` del diccionario de traducción.
- Desktop es scroll-jacking con altura fija `.scroll-jacking-section { height: 400vh }` (style.css:573) — el comentario dice "4 slides, roughly 100vh each". Mobile usa `height: auto` en el media query (≤768px).
- La traducción es un diccionario plano (`translateDict` / `translateDictHTML` en main.js:1333/1377) con selectores CSS que se aplican con `querySelector` al hacer clic en `.lang-toggle`. El modal Timeline no reconstruye su DOM al abrir/cerrar, así que un swap con el modal abierto funciona igual.
- El repo no tiene git: harán falta backups manuales antes de editar.

## Goals / Non-Goals

**Goals:**
- Insertar el ítem DCA en la posición penúltima sin romper la numeración del diccionario ni la geometría del pan desktop.
- Extender el diccionario de traducción para cubrir todo el contenido del modal Timeline.
- Cambiar solo textos visibles para el renombre a Playground, sin tocar ids/clases/anclas.

**Non-Goals:**
- Rediseño del carrusel, del modal Timeline o de sus animaciones (la "T" animada del botón Timeline se conserva tal cual).
- Migrar a un sistema de i18n real (data-attrs, JSON externo, detección de idioma del navegador, persistencia del idioma elegido).
- Cambiar el mecanismo de scroll-jacking o la paridad desktop↔mobile más allá de la altura 500vh.
- Reescribir textos reales del ítem nuevo (el usuario los editará después).

## Decisions

### D1 — Ítem DCA: video 720p y posición penúltima con renumeración del diccionario

El nuevo bloque clona la estructura exacta de un carousel-item existente (`video.carousel-media` + `h3.item-title` + `p.item-desc`), insertado entre "Web designer" y "Volleyball player". Video: `DCA-720.mp4` (24 MB), el patrón 720p ya acordado para assets pesados y el más ligero de las variantes DCA disponibles.

Consecuencia: Volleyball pasa de hijo 5 a hijo 6 → renombrar `".carousel-item:nth-child(5) ..."` a `nth-child(6)` en sus dos entradas del dict, y el nuevo entra como `nth-child(5)`. Los hijos 2–4 no cambian. Alternativa descartada: cambiar los selectores a clases dedicadas por ítem (más robusto pero toca 8 entradas y no lo pidió el usuario); la renumeración mínima se limita a Volleyball.

### D2 — Scroll-jacking: 400vh → 500vh

`height: 500vh` en la regla desktop. El mapeo de progreso ya es relativo (`aboutScrollableDistance = height - 100vh` y centros medidos), así que no hace falta tocar JS. Mobile no cambia: el media query ya impone `height: auto !important`.

### D3 — Playground: solo texto visible, dict con valor idéntico en ambos idiomas

Cambios: `index.html:106` (nav) y `index.html:192` (`.title-featured`); en el dict, `.nav-item[href='#projects']` y `.title-featured` pasan a `{ en: "Playground", es: "Playground" }`. El footer "Work/Trabajos" y el id `#projects` no se tocan (decisión del usuario). Alternativa descartada: renombrar id/clases (`#playground`, `.playground-*`) — tocaría el pin/canvas/lerp de desktop y las anclas de lenis por un beneficio cero visible.

### D4 — Timeline: entradas nuevas en el dict, sin tocar el botón "Timeline"

Se agregan a `translateDict` los selectores por parada (`.stop-1 .timeline-content h3`, `.stop-1 .timeline-content p`, … hasta stop-4), `#versatility-title` y su párrafo (necesita `translateDictHTML` porque contiene `<strong>`), `.ball-scroll-text`, `#map-modal-close span` ("Back to page") y `#final-close-btn-id` ("BACK TO PAGE ✕"). El botón "Timeline" no entra al dict (decisión: igual en ambos idiomas). Las traducciones iniciales las redacta el implementador siguiendo el tono del resto del sitio; el usuario las ajusta en revisión.

### D5 — Mantenimiento del texto del ítem nuevo: anotado, no automatizado

El placeholder del ítem nuevo vive en dos lugares (`index.html` y el dict). No se automatiza la sincronización (leer el HTML en el toggle rompería el patrón del dict). El tasks.md deja una tarea final de documentar/comentar esto junto a las entradas del dict para que el usuario no lo pierda.

## Risks / Trade-offs

- [Repo sin git] → Backups de `index.html`, `main.js`, `style.css` antes de la primera edición; verificación final con diff.
- [nth-child frágil ante futuras inserciones] → Comentario en el dict indicando que la numeración depende del orden del track (intro = hijo 1).
- [Placeholder en dos lugares se desincroniza al editar] → Anotación explícita en tasks.md y comentario en el dict (D5).
- [Traducciones del Timeline con largo distinto al inglés] → Los bloques del modal tienen su layout propio con scroll interno; el contenido crece verticalmente sin layout fijo, así que el cambio de texto no rompe el wave ni los nodos.
- [DCA-720 puede notarse en pantallas grandes dentro del carrusel] → Las variantes 1080p/mov siguen en `public/` por si el usuario quiere subir la variante; es un cambio de un solo atributo.

## Migration Plan

Sin deploy: sitio estático. Orden: backups → HTML (ítem + Playground) → CSS (500vh) → JS dict (renumeración, nuevo ítem, Timeline) → verificación desktop (scroll-jacking, pan, pin) → verificación mobile (altura desc, swipe, Timeline modal) → verificación toggle EN/ES con modal abierto. Rollback = restaurar backups.

## Open Questions

- Ninguno que bloquee: las palabras exactas de las traducciones del Timeline y los placeholders son ajustes que el usuario valida en revisión visual.

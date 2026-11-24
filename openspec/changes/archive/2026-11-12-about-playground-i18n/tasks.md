# Tasks

## 1. Backups

- [x] 1.1 Copiar `index.html`, `main.js` y `style.css` a `openspec/changes/about-playground-i18n/backups/` (repo sin git) y verificar que las 3 copias existen con `ls`

## 2. Ítem nuevo en About (HTML + CSS)

- [x] 2.1 Insertar el bloque `.carousel-item` penúltimo (entre "Web designer" y "Volleyball player", index.html ~167) con video `DCA-720.mp4`, `h3.item-title` "New title" y `p.item-desc` placeholder en inglés; verificar en dev-server que el ítem aparece en posición 5 de 6
- [x] 2.2 Cambiar `.scroll-jacking-section` de 400vh a 500vh en style.css (regla desktop, ~línea 573) y verificar en desktop que el pan horizontal reparte los 5 ítems sin apretar los finales

## 3. Diccionario de traducción (main.js)

- [x] 3.1 Renumerar las entradas de Volleyball de `nth-child(5)` a `nth-child(6)` y agregar las entradas del ítem nuevo como `nth-child(5)` con placeholders EN/ES ("New title"/"Nuevo título" + descripciones), añadiendo el comentario de mantenimiento (texto real se edita en index.html Y en el dict); verificar con el toggle que el ítem alterna idioma y que Volleyball sigue alternando correctamente
- [x] 3.2 Agregar al dict las traducciones ES del modal Timeline: 4 paradas (`.stop-N .timeline-content h3/p`), `#versatility-title` y su párrafo vía `translateDictHTML` (contiene `<strong>`), `.ball-scroll-text` ("Scroll"/"Desliza"), `#map-modal-close span` y `#final-close-btn-id` ("Back to page"/"BACK TO PAGE ✕" ↔ ES); verificar que el modal muestra todo en español tras el toggle

## 4. Renombre Playground (HTML + JS)

- [x] 4.1 Cambiar "Projects" → "Playground" en index.html:106 (nav) y :192 (`.title-featured`), y en las 2 entradas del dict (`{ en: "Playground", es: "Playground" }`), dejando footer "Work/Trabajos" e id `#projects` intactos; verificar que nav y título muestran "Playground" en ambos idiomas

## 5. Verificación integrada

- [x] 5.1 Desktop: recorrer About completo (scroll-jacking fluido, 5 ítems, videos activos correctos), verificar pin/canvas de Playground sin cambios y toggle EN/ES completo con el modal Timeline abierto
- [x] 5.2 Mobile (viewport ≤ 768px): ítems apilados con orden nuevo, `--about-desc-height` cubre el desc más largo (video no salta), swipe/arrows funcionan, modal Timeline traducido y legible
- [x] 5.3 Diff final contra los backups de la tarea 1.1 y confirmar que los únicos cambios son los de este change; dejar anotado el punto de edición doble del placeholder (index.html + dict)

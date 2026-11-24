# Paridad del notch entre Chrome y Safari (macOS)

Este documento deja reproducible la comparación visual del notch y del fondo de la
sección **Projects** entre Chrome y Safari de macOS. Chrome es la referencia.

## Alcance

- Notch: estados expandido, colapsado, transición y split del footer.
- Fondo negro de Projects: entrada, permanencia y salida hacia el footer.
- Solo macOS. iOS/iPadOS queda fuera por ahora.

## Entorno de verificación

| Motor | Versión usada | Para qué |
| --- | --- | --- |
| WebKit del sistema (WKWebView en vivo) | Safari 26.6.2 | Referencia real de Safari. Necesario para el recorte del filtro `goo` y para ver transiciones reales. |
| Playwright WebKit | 27.2 y 26.6 | Comparación rápida y capturas automatizadas. No reproduce el recorte del lóbulo del perfil que sí hace el WebKit del sistema. |
| Chromium (Playwright) | 158 | Referencia visual. |

Viewport de todas las capturas: **810 × 964 CSS px**, `deviceScaleFactor: 2`
(imágenes de 1620 × 1928). Servidor: `npm run dev` en `http://localhost:5174/`.

### Nota sobre WKWebView

Un `WKWebView` fuera de pantalla congela transiciones y `requestAnimationFrame`.
Para verificar animaciones reales hay que crear la ventana en pantalla y ejecutar
`NSApp.run()`; con un `RunLoop` manual las transiciones se quedan en el valor
inicial. Las capturas de este documento se tomaron con la ventana visible y el
event loop de AppKit.

## Capturas de referencia

En `docs/cross-browser-parity/`:

- `chromium-1-expanded.png`, `chromium-2-collapsed.png`, `chromium-3-transition.png`, `chromium-4-split.png`
- `webkit-1-expanded.png`, `webkit-2-collapsed.png`, `webkit-3-transition.png`, `webkit-4-split.png`
- `webkit-projects-dark.png` — Projects completamente negro y con texto blanco.
- `webkit-projects-exit-before-after.png` — salida de Projects: el fondo negro ya no se filtra al footer.

Regenerar las cuatro capturas del notch:

```bash
node shoot.mjs webkit /ruta/al/repo/docs/cross-browser-parity
node shoot.mjs chromium /ruta/al/repo/docs/cross-browser-parity
```

(`shoot.mjs` vive en el harness temporal de Playwright; el script usa el mismo
viewport y los mismos cuatro estados que la tabla de abajo).

## Matriz de estados

| Estado | Cómo se obtiene | Criterio de aceptación |
| --- | --- | --- |
| 1. Expandido | Carga inicial | Cápsula única, mismo tono, halo y radios |
| 2. Colapsado | Scroll > 50 px | Cápsula fusionada, sin costuras ni bordes rectos |
| 3. Transición | Quitar `scrolled` y capturar | Efecto gota continuo, sin cortes entre piezas |
| 4. Split | `--footer-progress: .5`, `--split-radius: 25px` | Dos mitades, radio interior interpolado, mismo render |

## Decisiones que sostienen la paridad

1. **Sin capas hijas dentro del subárbol filtrado.** `translateZ` y `will-change`
   se quitaron de `.notch-bg` y `.notch-bg-bridge`; WebKit rasterizaba cada pieza
   por separado y el `goo` nunca veía una silueta continua.
2. **Relleno sólido y opaco `#474747`.** El degradado por pieza producía manchas
   distintas en WebKit. La opacidad final la aporta la última `feColorMatrix` con
   alfa `1`, no las piezas.
3. **Opacidad total del notch.** Con alfa `0.9` el tono dependía del fondo: 74
   sobre claro y 49 sobre negro. Con alfa `1` se mantiene en 71–73 en ambos.
4. **Orden del filtro: `drop-shadow(...) url('#goo')`.** Con el `drop-shadow`
   después del `goo`, Chromium aclaraba el interior (78) y WebKit no (46). Con el
   orden actual ambos motores parten de la misma silueta.
5. **Capa filtrada más alta (`.notch-bg-layer { inset: -26px 0 }`).** WebKit
   recorta la salida del filtro a la caja del elemento; el lóbulo de 100 px del
   perfil se cortaba arriba. Los atributos de región del `<filter>` se ignoran.
6. **El fondo negro pertenece a `#projects`, no a `<body>`.** Así el negro no
   tiñe el footer ni el resto de la página mientras la sección se va con el
   scroll. `--text-color` se redefine dentro de `.projects-section.dark-mode`.

## Medidas de tono del notch

Muestras del interior de la cápsula (valores RGB, sin texto):

| Fondo | Chromium | WebKit del sistema |
| --- | --- | --- |
| Claro | 72 | 71–73 |
| Negro (`#0a0a0a`) | 72 | 71–73 |

## Fondo negro de Projects

Comportamiento verificado con WebKit real en vivo, scroll de 4600 a 6350 px:

- `#projects` recibe `.dark-mode` entre ~4820 px y ~5300 px (mientras está pinned).
- El fondo de la sección es `#0a0a0a` y el texto pasa a blanco.
- Al salir, solo la sección pierde el negro; el `body` y el footer permanecen
  claros. Antes, el `body.dark-mode` hacía que todo el viewport se atenuara a
  negro y el footer aparecía sobre gris.
- El notch se oculta durante el estado pinned y reaparece con el mismo tono
  opaco sobre el negro y sobre el claro.

## Limitaciones conocidas

- El WebKit headless de Playwright no reproduce el recorte del lóbulo del perfil
  en hover; para eso hay que usar el WKWebView en vivo.
- La automatización de Safari con WebDriver/screencapture está bloqueada por
  permisos en este entorno; por eso se usa WKWebView como proxy del WebKit real.
- Las capturas del harness de Playwright son de referencia rápida, no sustituyen
  la verificación con el WebKit del sistema para el notch.

## Modal de Projects y rendimiento de scroll (2026-11-11)

- El modal de Projects fija `color: #ffffff` explícito porque vive fuera de
  `#projects` y no hereda el `--text-color` del dark-mode.
- Los `view-transition-name` hacen *hand-off* (card → modal al abrir, modal →
  card al cerrar) dentro del callback de `startViewTransition`; nunca coexisten
  dos elementos vivos con el mismo nombre. WebKit lanzaba `InvalidStateError`
  con el patrón anterior y podía dejar el overlay bloqueado sobre el modal.
- El scroll usa un único listener pasivo con throttling por `requestAnimationFrame`;
  las medidas de carrusel, Projects y footer se cachean y solo se recalculan en
  `load`, `resize`, `fonts.ready`, `loadedmetadata` y `ResizeObserver`.
- `--footer-progress`/`--split-radius` se aplican sobre `#notch-container` y
  `#footer` (no sobre `body`) y solo cuando cambian.
- En WebKit se desactiva el `filter: blur(15px)` animado de `.timeline-content`
  (clase `.is-webkit`); el contenido aparece con fade en lugar de blur. Es la
  única diferencia visual intencional entre motores y afecta solo al modal de
  About en Safari.
- Los videos fuera de pantalla se pausan con un `IntersectionObserver` común.


## Rendimiento de Projects en WebKit (2026-11-11)

- La esfera de `.explosion-logo` se pausa (`animation-play-state: paused` +
  `visibility: hidden`) cuando el logo ya es invisible, cuando el modal de proyecto está
  abierto o cuando la pestaña está oculta. No cambia nada visual: solo deja de
  recomponerse una capa 3D invisible durante el resto de la página.
- El estado de hover de las cards usa una clase JS (`.projects-grid.has-hover`) en lugar
  de `:has()`, que en WebKit se reevalúa de forma costosa sobre todo el subárbol.
- Los videos de las cards se gestionan midiendo sus rectángulos reales con histéresis
  (play al centro dentro del viewport ±5 %, pause fuera de ±25 %); no con
  `IntersectionObserver`, que bajo `scale(2.5)` considera visible toda la grilla.
- Los cinco videos pesados de Projects estaban a ~4K (3420 px de ancho, dos de ellos de
  53–203 MB). Se sirven versiones 1080p H.264 (`*-1080.mp4`) generadas con `avconvert`;
  los originales siguen en `public/`. Además las cards usan `preload="metadata"` sin
  `autoplay`, y el `play()` lo dispara el gestor al entrar en la sección.
- Medición relativa en WKWebView (rango completo de Projects): p99 67 → 35–51 ms,
  max 205 → 50–93 ms, frames >50 ms 2 → 0–2. Chrome no cambia visualmente.

## Experiencia mobile (< 768px) (2026-11-11)

La vista mobile usa el flujo normal del documento para Projects y no modifica el
pin/canvas de desktop. En Projects, la card más cercana al centro del viewport es
la única que reproduce video; las demás quedan pausadas al primer frame y con
opacidad `0.35`. La esfera mide 140×140 px, muestra dos anillos y pausa su
animación fuera del viewport. Las descripciones de About reservan una altura
calculada para el idioma y ancho actuales. Las cards usan variantes reducidas:
`Preset1280x720` cuando reduce la fuente, `Preset640x480` para
`macisland-1080.mp4` y la fuente existente sin ampliar para `It.mp4`. El modal
usa la fuente original de mayor calidad disponible.

### Matriz de verificación

| Viewport | Comprobación | Criterio |
| --- | --- | --- |
| 390 × 844 | Hero y scroll-indicator | Subtítulo estable con márgenes simétricos; `bounce` continúa |
| 390 × 844 | About y cambio de idioma | Altura de todos los `.item-desc` igual al máximo medido; el video no salta durante el typewriter |
| 390 × 844 | Timeline, apertura y avance | La bola inicia centrada; la ruta es recta hasta pasar el punto medio y los textos quedan separados por los nodos |
| 390 × 844 | Timeline, blackout final | “Versatility” y su control quedan centrados; los cuatro puntos anteriores se ocultan y aparecen fotos en los márgenes superior e inferior |
| 390 × 844 | Projects | Cards en columna, wrapper `static`, una sola card reproduce; las otras quedan pausadas a `0.35` |
| 390 × 844 | Esfera de Projects | 140 × 140 px, dos anillos visibles y animación pausada fuera del viewport |
| 390 × 844 | Split del footer | Al llegar el centro del `.footer-hero` al centro del viewport, el título completa su entrada y las mitades se separan ±10vw (±39 px) |
| 768 × 964 | Borde mobile | Modal conserva descripción negra; Timeline usa apertura y blackout mobile |
| 769 × 964 | Borde desktop | Cada historia sigue en su punto de la curva horizontal y se conserva el rastro por puntero |
| 810 × 964 | Projects y split | Canvas/pin desktop activos; split conserva ±35vw (±283.5 px) |
| 810 × 964 | Timeline, blackout final | Se conserva el rastro original de imágenes por movimiento del puntero |
| Ambos | Modal de proyecto | Usa la fuente original de mayor calidad disponible, no la variante reducida de la card |

Para verificar en Safari real, repetir la matriz a 390 × 844 y observar el
subtítulo durante el `bounce`; confirmar también que el cambio de fila en About
no mueve el video y que el split del notch queda dentro del viewport. En desktop,
comparar Projects y el footer con las capturas de referencia de esta guía.

Para verificar la entrada del título “Let’s Link!” en mobile, recorrer el footer
a 390 × 844: el título debe desplazarse desde fuera del viewport hasta quedar
visible. La medición del footer debe actualizarse cuando cambie el tamaño de
Projects o del propio footer; a 810 × 964 se conserva la animación existente.

### Resultado disponible

- Chromium integrado, 390 × 844: subtítulo `left/right: 1px`; split ±39 px;
  descripciones de About reservan 223 px y el video mantuvo su posición en dos
  mediciones consecutivas; una card reproduce, seis quedan inactivas a `0.35`.
- Chromium integrado, 810 × 964: wrapper de Projects relativo (150vh), sección
  sticky y canvas escalado; split ±283.5 px.
- Chromium integrado, 390 × 844: el Timeline abre con el centro de la bola a
  421.6 px (viewport center: 422 px). La ruta vertical permanece recta hasta
  y=900; sus nodos coinciden con la curva en y=1050, 2000, 2950 y 3900. Las
  tarjetas quedan a lados opuestos de la línea central; Origins baja 60 px
  respecto al nodo para centrar mejor su párrafo junto a la primera curva.
- Chromium integrado, 390 × 844: tras completar la entrada sin scroll, todos
  los stops siguen ocultos. Cada historia aparece al cruzar la coordenada Y de
  su nodo; en blackout se ocultan los stops y el control Versatility cierra el
  modal y restaura el scroll de la página.
- Chromium integrado, 390 × 844: seis imágenes quedan fijas en dos filas de
  tres; la animación de opacidad empieza ~1.55 s después de entrar al blackout
  (tras la expansión) y recorre las filas en sentidos opuestos. La fila superior
  queda en y=59–148, sobre el título Versatility (y=222); la inferior queda en
  y=738–827. Ninguna fila solapa el texto ni el control de cierre.
- Chromium integrado, 390 × 568 con movimiento reducido: las dos filas se
  mantienen estáticas con opacidad `0.85`, sin animación; la fila superior sube
  a y=44 y ambas evitan el texto y el control de cierre.
- Chromium integrado, 810 × 964: el rastro anterior de imágenes sigue
  respondiendo al movimiento del puntero; la secuencia de filas mobile no se
  muestra y los cuatro stops conservan sus posiciones horizontales
  75/125/175/225vw, alineadas con puntos distintos de la curva.
- Chromium integrado, 768 × 964: la bola inicia centrada; el path vertical de
  4700 px sigue visible en el breakpoint mobile.
- Chromium integrado, 390 × 844 y 768 × 964: la curva vertical y las filas de
  blackout mobile están activas; a 769 × 964 y 810 × 964 se usa la curva
  horizontal desktop y se conserva el rastro por puntero.
- Chromium integrado, 390 × 844: la entrada de “Let’s Link!” y la separación
  mobile del notch alcanzan progreso 1 cuando el centro de `.footer-hero` cruza
  el centro del viewport; a 810 × 964 se conserva el progreso desktop.
- Chromium integrado, 390 × 844 y 768 × 964: al centrar el hero, el progreso mobile
  queda en 1; a 769/810 × 964 el progreso coincide con la fórmula desktop.
- Chromium integrado, 810 × 964: el contenido del blackout queda centrado en el
  viewport y no activa la clase mobile-only.
- Chromium integrado, 768/769 × 964: el footer llega a progreso `0.5` en ambos
  anchos; el modal cambia de negro a blanco al cruzar el breakpoint y solo el
  ancho 768 conserva el estado mobile del Timeline.
- `npm run build`: correcto.
- Safari real mobile: pendiente de confirmación manual; este entorno solo expuso
  el navegador Chromium integrado.

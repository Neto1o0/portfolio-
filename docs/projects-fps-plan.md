# Plan de resolución: bajones de FPS en la sección Projects (solo Safari)

> Documento de instrucciones para el modelo/agente que implementará las correcciones.
> Síntoma: en Safari la página corre a menos FPS que Chrome y el problema se **intensifica
> dentro de la sección Projects**; después de esa sección (footer) se ve fluido.
> En Chrome no se percibe. Esto descarta lógica JS defectuosa como causa principal y
> apunta a **costo de renderizado específico de WebKit**.
> Fecha: 2026-11-11. Basado en `docs/safari-modal-scroll-fixes.md` (ya implementado).

---

## 0. Reglas previas (obligatorias)

1. El repo NO tiene git. Backups antes de editar:
   `cp main.js /private/var/folders/.../opencode/main.js.bak3` (ídem `style.css`).
2. No tocar el notch ni las decisiones de `docs/cross-browser-parity.md`.
3. Servidor de pruebas: `http://localhost:5174/` (Vite ya corriendo).
4. Harness de medición disponible (WebKit real, ventana visible + `NSApp.run()`):
   `/private/var/folders/.../opencode/wkwebview-fix-verify/`
   - `experiment <url> <label> [cssInject]` — mide frames durante el scroll del rango
     completo de Projects, con CSS inyectable para experimentos A/B.
   - `entrance <url> <label> [cssInject]` — mide solo la fase de entrada (lerp de escala).
   - `perf <url> <label>` — scroll de toda la página.
   Importante: el harness limita el rAF de WKWebView; usar sus números como
   **comparación relativa** entre experimentos, no como FPS absoluto. La verdad final
   la da el Safari real del usuario.
5. Cada cambio debe verificarse: `node --check main.js`, `npm run build`, consola sin
   errores en Chromium y Playwright WebKit (`parity-harness/scroll-behavior.mjs`,
   `modal-cycle.mjs`, `regression-viewports.mjs`).

---

## 1. Diagnóstico (revisión de código + mediciones)

### 1.1 Lo que ya se descartó

- JS por scroll: ya corre en un solo rAF, sin `getBoundingClientRect` por evento,
  con métricas cacheadas (implementado en la fase anterior). El handler de Projects
  es O(1) por frame.
- Loops rAF: canvas de Projects y cursor fluido se detienen cuando están en reposo.
- `--footer-progress`/`--split-radius`: escritas acotadas a `#notch-container`/`#footer`
  y solo cuando cambian.

### 1.2 Sospechosos ordenados por evidencia

**H1 — 7 videos decodificando a la vez en Projects (la más fuerte).**
Las cards de Projects tienen 7 `<video autoplay loop muted playsinline>`. El
`IntersectionObserver` global (`offscreenVideoObserver`, `rootMargin: 200px`) calcula la
intersección **después de las transformaciones**: con la grilla a `scale(2.5)` casi todas
las cards intersectan el viewport aunque estén visualmente fuera de pantalla → los 7
videos decodifican y se componen simultáneamente **solo en esta sección**. En About el
track está a escala 1 y el observer sí pausa lo que sale → coincide con "después de
Projects se ve fluido".
Evidencia del harness (scroll por todo el rango de Projects, WKWebView real):
| Experimento | avg ms | p95 | p99 | max |
| --- | --- | --- | --- | --- |
| base | 20.47 | 27 | 67 | **205** |
| sin videos (`video{display:none}`) | 19.35 | 26 | 51 | **81** |
El avg apenas baja (el rAF del harness limita el muestreo), pero **los picos se reducen
~60%**: los videos son el principal generador de hitches en el tramo.

**H2 — esfera 3D animándose para siempre (`explosion-logo`).**
`.sphere` tiene `animation: spinSphere 15s linear infinite` con `transform-style:
preserve-3d` y 4 anillos de 500×500. Vive dentro de `.explosion-logo` con
`will-change: transform, opacity`. Tras la entrada, el logo queda con `opacity: 0` y
`scale(10)` (capa de ~5000×5000 px) **pero la animación sigue corriendo cada frame en
todo el sitio**. WebKit mantiene la capa y la recomposición aunque el contenido sea
invisible. En Chrome el compositing es más barato y no se nota.
Evidencia del harness: quitar la animación baja poco el avg (20.47 → 20.11) porque el
logo está invisible casi todo el tramo medido; el impacto real esperado es en el tramo
DONDE el logo es visible (home y entrada a Projects) y en la carga de páginas largas.
Corregirlo es barato y no tiene contra visual: pausar la animación cuando el logo es
invisible.

**H3 — re-rasterización de la capa gigante durante el lerp de escala (entrada).**
`.projects-grid` (70vw × 65vh) escala 0.01 → 2.5 con lerp 0.05 (~1.5 s de frames).
WebKit rasteriza las capas a la escala actual: durante el lerp re-rasteriza una capa de
~175vw × 162vh **cada frame**. Es el momento de mayor costo de la sección y explica el
"bajón" al entrar.
Evidencia del harness (`entrance`, solo la fase de entrada, WKWebView real):
| Experimento | frames | avg ms | p50 | p95 | max | >50 ms |
| --- | --- | --- | --- | --- | --- | --- |
| base | 22 | 31.82 | 27 | **96** | **96** | 2 |
En ~22 frames aparecen hitchs de hasta 96 ms: la entrada es objetivamente el peor
momento de la sección. (Los experimentos con CSS inyectado en `entrance` se colgaron en
este entorno; las mitigaciones de H3 se listan en §5 para que el implementador las mida,
idealmente también con el Web Inspector de Safari real.)
Mitigaciones posibles (de menor a mayor riesgo):
- a) Reducir la duración del lerp: `lerpSpeed` 0.05 → 0.08 en el bloque de Projects,
  para que la escala converja antes y haya menos frames de re-rasterización.
- b) Promover cada card a su propia capa (`will-change: transform` en `.project-card`)
  para que WebKit rasterice tiles pequeños en vez de una capa gigante.
- c) Subir el `will-change` solo durante la animación y quitarlo al converger.
- d) Limitar el tamaño de la capa: aplicar la escala a un wrapper con
  `contain: layout paint` y `overflow: clip` para que WebKit no rasterice más allá del
  viewport.

**H4 — `:has()` en `.projects-grid:has(.project-card:hover)`.**
Selector caro de evaluar en WebKit cuando el subárbol cambia (los videos pausando/sonando
fuerzan recalcados). Reemplazar por una clase gestionada en JS (`grid-has-hover`) es
trivial y elimina el costo.

### 1.3 Errores de consola

No se detectaron errores JS en la sección (Chromium, Playwright WebKit y WKWebView real,
todos limpios). El problema es de presupuesto de renderizado, no de excepciones.

---

## 2. Tarea 1 — Gestión de videos por visibilidad REAL (H1)

**Objetivo:** que en Projects decodifiquen como máximo 2–3 videos simultáneamente (los
que de verdad se ven), sin cambiar el diseño.

1. Crear un modo "projects media manager" en `main.js`:
   - Excluir las 7 cards de Projects del `offscreenVideoObserver` genérico (el IO no
     sirve bajo `scale(2.5)`).
   - En el loop del canvas de Projects (`animateProjectsCanvas`), cuando
     `projectsInSection === true`, calcular la posición proyectada de cada card con la
     misma matemática que ya se usa para la grilla:
     `projectedX = (cardCenterX - gridCenter) * currentScale + currentPanX…`
     (reutilizar `currentScale`/`currentPanX/Y`; los centros de card se cachean una vez
     por resize como ya se hace en `measureCarousel`).
   - Encender/apagar con histéresis: play si el centro proyectado está dentro del
     viewport ± 15%; pause si sale ± 25%. Escribir `video.play()`/`pause()` solo cuando
     cambia el estado (guardar `dataset.playing`).
   - Cuando `projectsInSection === false`, pausar los 7 videos (la sección no se ve).
2. Reducir el radio del `offscreenVideoObserver` de 200px a 0–50px para el resto de la
   página (menos videos precargados sonando al mismo tiempo).
3. Opcional: `preload="metadata"` ya se aplica por JS; añadir `poster` a los videos de
   cards reduce la decodificación inicial (requiere assets, marcar como opcional).

**Criterio de aceptación:** en WKWebView real, el experimento `experiment <url> after`
contra `no-videos` debe acercarse (max < 120 ms y over50 == 0). En Safari real, el
tramo de Projects deja de tener hitches sostenidos. Verificar que al entrar/salir de la
sección los videos de las cards se ven sonando de nuevo (regresión visual: las cards
deben seguir mostrando video al llegar).

## 3. Tarea 2 — Pausar la esfera cuando no se ve (H2)

1. En `applyProjectsStyles()` (o en el mismo bloque de estado de Projects):
   - cuando `currentLogoOp <= 0.02` → añadir al `.sphere` (o al wrapper)
     `animation-play-state: paused` y `visibility: hidden` en `.explosion-logo`.
   - cuando suba de 0.02 → restaurar.
   Implementación limpia: una clase `.sphere-paused` en `#explosion-logo`:
   ```css
   .explosion-logo.sphere-paused .sphere { animation-play-state: paused; }
   .explosion-logo.sphere-paused { visibility: hidden; }
   ```
   (visibility ya no rompe nada porque el logo es invisible igualmente).
2. Extra: pausar también cuando el modal de proyecto está abierto o
   `document.hidden === true`.

**Criterio:** ningún frame de animación de la esfera cuando el logo es invisible;
en el home y en la entrada el giro se ve idéntico a antes.

## 4. Tarea 3 — Barato: reemplazar `:has()` (H4)

- En `style.css`, eliminar `.projects-grid:has(.project-card:hover) .project-card:not(:hover)`
  y en su lugar usar `.projects-grid.has-hover .project-card:not(:hover) { opacity: .15; }`.
- En `main.js`, en el listener `mouseenter/mouseleave` de `.project-card`, alternar la
  clase `has-hover` en `projectsGrid` (ya existen esos listeners para el cursor).

## 5. Tarea 4 — Fase de entrada (H3), solo si persiste tras 1–3

1. Medir con `entrance <url> base` y `entrance <url> no-videos` para separar el costo del
   lerp del costo de los videos.
2. Probar en este orden (verificando visualmente que no se pierde el efecto):
   - Lerp más rápido: `lerpSpeed` 0.05 → 0.08 en el bloque de Projects.
   - `will-change: transform` en `.project-card` (promoción por card) — medir antes/después.
   - `contain: layout paint` + `overflow: clip` en `.projects-grid`.
   - Si nada funciona: cachear el rasterizado reduciendo la escala final (2.5 → 2.2),
     **solo con aprobación del usuario** porque cambia el diseño.
3. Dejar el que gane la medición y documentar el resultado en `docs/cross-browser-parity.md`.

## 6. Orden de implementación

1. Tarea 2 (esfera) — trivial, sin riesgo visual.
2. Tarea 3 (`:has()`) — trivial.
3. Tarea 1 (videos por visibilidad real) — el mayor impacto esperado.
4. Tarea 4 (entrada) — solo si el jank persiste tras lo anterior.
5. Regresar evidencia: números del harness antes/después + verificación del usuario en
   Safari real (scroll completo, abrir/cerrar proyecto, split del footer).

## 7. Criterios globales de aceptación

- Safari real: el tramo de Projects se siente tan fluido como el footer.
- Chrome: sin cambios visuales ni de comportamiento (excepto la pausa de la esfera
  cuando ya es invisible, que no se nota).
- Consola limpia en ambos motores; `modal-cycle.mjs` y `scroll-behavior.mjs` siguen
  pasando; el modal de Safari sigue funcionando (hand-off de view-transition-name).

---

## 8. Estado de implementación (2026-11-11)

### Implementado

**Tarea 2 — esfera (`explosion-logo`)**
- `style.css`: `.explosion-logo.sphere-paused` aplica `visibility: hidden` y
  `.sphere { animation-play-state: paused }`.
- `main.js`: `updateSpherePlayState()` alterna la clase cuando `currentLogoOp <= 0.02`,
  cuando el modal de proyecto está abierto o cuando `document.hidden === true`. Se llama
  desde `applyProjectsStyles()` y en `visibilitychange`.
- Verificado (Playwright WebKit/Chromium): dentro de Projects
  `animation-play-state: paused` y `visibility: hidden`; al salir vuelve a `running` y
  el giro se ve igual que antes.

**Tarea 3 — `:has()`**
- `style.css`: `.projects-grid:has(.project-card:hover)` →
  `.projects-grid.has-hover .project-card:not(:hover)`.
- `main.js`: `mouseenter`/`mouseleave` de `.project-card` agregan/quitan `has-hover` en
  la grilla; se limpia al abrir el modal. Verificado: la card no hovereada queda en
  `opacity ≈ 0.18` durante la transición.

**Tarea 1 — videos de Projects**
- `main.js`: `updateProjectVideos()` mide `getBoundingClientRect()` de cada video cada
  120 ms (solo dentro de la sección) y aplica histéresis: play con el centro dentro del
  viewport ±5 %, pause al salir de ±25 %. Pausa todo al salir de la sección y al abrir
  el modal.
- `main.js`: los videos de `.project-card` ya no se observan con
  `IntersectionObserver`; el observer genérico baja su `rootMargin` de 200 px a 50 px.
- `index.html`: los 7 videos de cards pierden `autoplay` y usan `preload="metadata"`;
  el `play()` lo hace el gestor al entrar en la sección, así no se descargan ~190 MB
  durante la carga inicial.

**Tarea 4 — entrada**
- `main.js`: `lerpSpeed` 0.05 → 0.08 (la escala converge en ~1.2 s en vez de ~1.6 s,
  acortando la ventana de re-rasterizado de la capa escalada).
- Fase de entrada con los assets nuevos (`entrance`, dos muestras): `avg 28.2–30.4 /
  p95 55 / max 92–94 ms` frente a `31.82 / 96 / 96` de la base con 4K. La muestra es de
  solo 22 frames y el harness es ruidoso; se usa como comparación relativa.

### Hallazgo principal: los videos eran 4K

Cinco de los siete videos de Projects estaban a resolución casi 4K:

| Asset | Resolución | Códec | Tamaño |
| --- | --- | --- | --- |
| `VideoSpace.mov` | 3420×1926 | HEVC | 55 MB |
| `pagina1.mov` (×2 cards) | 3420×2224 | H.264 | 203 MB |
| `DCA.mov` | 3420×2224 | HEVC | 53 MB |
| `macisland.mov` | 844×1078 | HEVC | 25 MB |

Decodificar cinco streams de ~4K a la vez satura el pipeline de WebKit. El experimento
A/B ocultando **solo esos** videos (dejando los ligeros) da `avg 19.58 / p95 25 / p99 64
/ max 101`, casi idéntico a ocultar todos (`19.35 / 26 / 51 / 81`) y muy lejos de la
base (`20.47 / 27 / 67 / 205`). La gestión de visibilidad por sí sola no podía resolverlo
porque, con la grilla explotada, las 7 cards están en pantalla por diseño: el costo era
la **resolución de decodificación** de cada video.

Se transcodificaron con `avconvert` (macOS, `Preset1920x1080`, H.264) a
`public/*-1080.mp4`, manteniendo los originales intactos. `index.html` apunta a los
nuevos archivos. Tamaños: VideoSpace 45 MB, pagina1 45 MB, DCA 33 MB, macisland 20 MB.

### Evidencia final (WKWebView real, scroll del rango de Projects)

| Medición | avg ms | p95 | p99 | max | >50 ms |
| --- | --- | --- | --- | --- | --- |
| base (4K) | 20.47 | 27 | 67 | **205** | 2 |
| sin videos | 19.35 | 26 | 51 | 81 | 2 |
| **implementado (1080p + gestor)** | **19.25–19.46** | **25–26** | **35–51** | **50–93** | **0–2** |

El tramo de Projects queda en el mismo orden que el escenario "sin videos": los hitches
grandes desaparecen del rango medido.

### Verificación automatizada

- `projects-fixes.mjs` (nuevo, Playwright WebKit y Chromium): esfera pausada dentro,
  reanudada fuera; clase `has-hover`; videos pausados fuera de la sección y con el modal
  abierto; modal escribe la descripción y cierra con `overflow: ""`; `errors: []`.
- `modal-cycle.mjs` (Chromium y WebKit): 3 ciclos abrir/cerrar, `namesOpen` correctos,
  `namesClosed: []`, sin errores.
- `scroll-behavior.mjs` (WebKit): transiciones de notch/carrusel/Projects/footer sin
  errores.
- `regression-viewports.mjs` (1280×800 y 1440×900, ambos motores): Projects en
  dark-mode con fondo `rgb(10,10,10)`, body blanco, sin errores.
- `node --check main.js` y `npm run build` ✅.

### Pendiente / opcional

- Verificación visual final en el Safari real del usuario.
- Si se quiere aligerar la carga: variantes 720p de los cuatro videos de cards
  (`Preset1280x720`) o mover los originales fuera de `public/` para que `vite build` no
  los copie a `dist/` (~700 MB de assets).
- `designvid.mov` (About, 3420×1890 HEVC) sigue en 4K: About no presentaba el problema,
  pero puede transcodificarse con el mismo criterio si hace falta.

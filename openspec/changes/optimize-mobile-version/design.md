# Design

## Context

Ver `proposal.md` — Why. Los seis defectos se reprodujeron solo en Safari con ventana angosta; Chrome es la referencia y no recibe cambios visuales. Evidencia medida durante la exploración:

- Subtítulo hero: caja estática en reposo (120 frames idénticos en Chromium/WebKit), pero `left: 23.41px`, ancho `88%` = 343.19px, fuente `3.8vw` ≈ 14.93px — todo fraccionario. A/B con el usuario: Test A (fuente entera) no bastó; Test B (`will-change` en `.subtitle`) no funcionó; Test C (congelar `.scroll-indicator,.mouse-wheel`) detuvo la vibración; **Test E (`left:1px; right:1px; max-width:none`) fue exitoso** conservando las animaciones. Causa: `bounce`/`scrollWheel` re-rasterizan el tile compartido y el redondeo fraccionario de la caja produce fases de subpíxel distintas por frame.
- About mobile: alto de ítem oscila 458 ↔ 482.8px y el top del video 271.4 ↔ 283.8px mientras el typewriter escribe (el `.item-desc` crece línea a línea).
- Notch split: con `35vw` (style.css:270-275) las mitades salen ~92px de una pantalla de 390px.
- Videos de cards: `*-1080.mp4` (~45 MB c/u), referenciados en index.html:207-269; el modal usa `pagina1-1080.mp4` (línea 152) y debe seguir en 1080p.
- El repo no tiene git: harán falta backups manuales antes de editar.

## Goals / Non-Goals

**Goals:**
- Eliminar los seis síntomas en Safari/viewport angosto sin cambiar el look de Chrome desktop.
- Reducir el peso de las cards vía variantes 720p (desktop + mobile).
- Mantener el pin/canvas/lerp de Projects intacto en desktop.

**Non-Goals:**
- Rediseño visual del sitio (la esfera simplificada y la columna ya fueron acordadas en la exploración).
- Paridad Chrome↔Safari de nuevas reglas más allá de lo que estas cambian.
- Optimizar el video del modal (queda en 1080p) o los assets que no son de cards.
- Soporte para viewports entre 769px y ~1024px que se comporten distinto de desktop.

## Decisions

### D1 — Subtítulo: anclaje entero por simetría (Test E), no capa propia ni congelar animaciones

En el media query mobile (`style.css`, `@media (max-width: 768px)`, línea 2062): `.subtitle { left: 1px; right: 1px; max-width: none; }` (y anular `bottom`/`transform` fraccionarios si el probe final los reporta). El centrado pasa a ser simétrico y determinista: cada re-rasterización del tile (provocada por `bounce`/`scrollWheel`) es idéntica, así que desaparece el shimmer sin tocar animaciones ni crear capas.

- Alternativas descartadas: fuente entera (Test A: insuficiente), `will-change` en `.subtitle` (Test B: no funcionó en Safari real), `will-change` en `.scroll-indicator` (sin efecto), congelar el bounce solo bajo `.is-webkit` (funciona pero pierde la animación; Test E la conserva).

### D2 — About: altura fija del `.item-desc` medida en carga

En mobile, al terminar de medir el carrusel, tomar el `scrollHeight` máximo de los `.item-desc` y fijar esa altura en todos (`style.height` o custom property en el wrapper). La fila deja de cambiar de alto y el video queda fijo. Alternativa descartada: `min-height` CSS a ojo — frágil con futuros textos.

### D3 — Projects mobile: columna sin pin, rama dedicada por viewport

Bajo `window.innerWidth <= 768`: desactivar canvas/escala/pan/lerp/pin (early-return en el loop de Projects y en el pinned setup), dejar el flujo de documento normal (cards apiladas) y un header estático. La esfera simplificada (≈140px, 2 anillos) se pausa (`.paused` o cancel de su rAF) cuando el header sale del viewport, siguiendo el patrón ya usado para pausar cosas fuera de pantalla.

- Alternativa descartada: seguir simulando la fila horizontal en mobile — ya se descartó en la exploración con el usuario.

### D4 — Card activa única con histéresis

Nuevo gestor para Projects mobile con el mismo patrón de `checkMobileActiveItem` (main.js:534): calcular la card cuyo centro esté más cerca del centro del viewport; el cambio de activa solo ocurre cuando la nueva candidata supera la activa por un margen (histéresis, p. ej. >20% del alto de card o un umbral de centro), evitando toggles en micro-scroll. La activa reproduce su video; el resto: primer frame + `preload="metadata"` + opacidad ≈0.35 (clase CSS `.is-inactive` en el media query).

### D5 — Variantes optimizadas con avconvert, HTML apuntando a `-720`

Generar `public/*-720.mp4` desde cada fuente pesada usada por las cards con `avconvert`, eligiendo un preset que efectivamente reduzca sus dimensiones y preservando la proporción. Usar `Preset1280x720` para las fuentes que ese preset reduce y `Preset640x480` para `macisland-1080.mp4` (844×1078), que de otro modo queda intacta. Cambiar a esas variantes los `src` de las cards que usan dichas fuentes (index.html:207-269). `It.mp4` ya mide solo 702×396 y pesa 145 KB, así que las cards que lo usan conservan ese archivo en vez de generar una variante ampliada. Añadir a cada card optimizada una fuente original para el modal y hacer que el handler de apertura la prefiera; cuando no exista una variante de mayor calidad, el modal conserva la fuente actual. Las variantes se usan tanto en desktop como en mobile.

### D6 — Split del notch: factor 10vw en el media query mobile

Duplicar las reglas de split (style.css:270-275) dentro de `@media (max-width: 768px)` con `±10vw`, dentro del contenedor `.notch-container.scrolled` existente. Desktop conserva `35vw`. No se toca la mecánica de `--footer-progress` ni la paridad de `notch-header`.

## Risks / Trade-offs

- [Repo sin git] → Backups de `style.css`, `main.js`, `index.html` antes de la primera edición; verificación final con diff contra los backups.
- [El fix del subtítulo depende de WebKit real] → El A/B lo validó el usuario en su Safari (Test E); verificación final de nuevo en su Safari con el CSS aplicado.
- [Los umbrales de histéresis/opacidad son estimaciones] → Valores expuestos como constantes junto al gestor de card activa; el usuario los ajusta en revisión visual si hace falta.
- [avconvert puede bajar la calidad percibida en pantalla grande] → El modal conserva 1080p; las cards son la superficie afectada y las fuentes pesadas se reducen conservando proporciones.
- [La altura fija del desc puede cortar textos futuros largos] → Se mide el desc más largo en carga, no una constante; cualquier texto actual cabe por construcción.
- [Rama mobile de Projects puede desincronizarse de la desktop] → Centralizar el flag de viewport en un solo lugar (una función/constante `isProjectsMobile()` reutilizada por todos los puntos de Projects).

## Migration Plan

Sin deploy: sitio estático. Orden de aplicación: backups → transcode 720p + `src` → CSS mobile (subtítulo, About, Projects columna, split) → JS (gestor card activa, pausa esfera, altura desc) → verificación Chrome desktop (sin cambios) → verificación Safari ventana angosta (seis síntomas). Rollback = restaurar backups.

## Open Questions

- Ninguno que bloquee: el factor exacto de histéresis y la opacidad exacta (~0.35) son ajustes de píxel que el usuario valida en revisión.

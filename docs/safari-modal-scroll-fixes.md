# Plan de resolución: modal invisible en Safari + rendimiento de scroll en Safari

> Documento de instrucciones para el modelo/agente que implementará las correcciones.
> Estado del diagnóstico: **confirmado con pruebas automatizadas** (ver sección 2).
> Última actualización: 2026-11-11.

---

## 0. Reglas previas (obligatorias)

1. **El repo NO tiene git.** Antes de editar `main.js` y `style.css`, crear backups:
   `cp main.js /private/var/folders/1g/t_vdzkv97_n9tvjyt770c51h0000gn/T/opencode/main.js.bak2` (ídem `style.css`).
2. **No tocar el notch** ni las decisiones ya validadas en `docs/cross-browser-parity.md`
   (relleno opaco `#474747` del `.notch-bg-layer`, filtro goo, `inset: -26px 0`, sin
   `translateZ`/`will-change` en las piezas filtradas). Cualquier cambio de scroll genérico
   no debe alterar las transiciones del notch.
3. Hay un servidor Vite corriendo en `http://localhost:5174/` (el 5173 es del usuario).
   Usar siempre 5174 para las pruebas.
4. Al terminar cada tarea, ejecutar `npm run build` y comprobar que no hay errores de consola.

---

## 1. Síntomas reportados por el usuario (Safari real, macOS)

1. En la sección **Projects**, al clickear un proyecto y ampliarse el modal,
   **no se ve la descripción** del proyecto (no aparece la máquina de escribir).
2. Tampoco se ve la **"X" para cerrar** el modal (no se puede volver atrás).
3. Toda la página corre **más lenta que en Chrome**, como a menos FPS,
   especialmente al hacer scroll.

En Chrome todo funciona correctamente.

---

## 2. Evidencia confirmada

Harness usado: `/private/var/folders/1g/t_vdzkv97_n9tvjyt770c51h0000gn/T/opencode/parity-harness/modal-probe.mjs`
(Playwright; abre la página, hace scroll al centro de `#projects-scroll-wrapper`, clickea la
primera `.project-card`, espera 1.8 s y reporta diagnóstico + captura).

Resultados:

- **Chromium**: modal `.active`, título y descripción presentes (220 chars), botón X en
  `(1216, 32)` y es el elemento superior en ese punto. Cero errores de consola.
  *Nota*: en la captura de Chromium el video del modal no aparece (artefacto del motor
  headless de Playwright; en Chrome real sí se ve según el usuario).
- **WebKit**: el DOM del modal queda bien construido (título, descripción con 217 chars,
  X posicionada y clicable vía `.click()`), **PERO** la consola registra:
  ```
  Unhandled Promise Rejection: InvalidStateError:
  Multiple elements found with view-transition-name: project-title-transition
  ```
- Capturas en `/private/var/folders/1g/t_vdzkv97_n9tvjyt770c51h0000gn/T/opencode/modal-probe/`:
  `webkit-modal-open.png`, `chromium-modal-open.png`.
- Computed style en ambos motores: `color` de `.modal-close` y `.modal-desc` = `rgb(0,0,0)`
  (ver sección 3.3: el modal no hereda el `--text-color` blanco del dark-mode).

### Interpretación

En `main.js`, al abrir y al cerrar el modal se asigna **el mismo `view-transition-name` a dos
elementos vivos a la vez** (p. ej. el `<h2 class="project-title">` del card y el
`#modal-title` del modal comparten `project-title-transition` durante toda la transición):

- Al abrir (líneas 657–660): se asigna el nombre al video/título del card **y** al
  video/título del modal antes de `startViewTransition`. Ambos existen simultáneamente.
- Al cerrar (líneas 715–716): se reasigna el nombre al card mientras el modal todavía tiene
  el suyo; el del modal solo se limpia en `finished.finally()` (líneas 741–742).

**Chromium** tolera este patrón (deduplica). **WebKit lanza `InvalidStateError`**, la captura
del view transition falla y el overlay `::view-transition` puede quedar bloqueado mostrando el
snapshot antiguo: el modal vivo (con descripción y X) queda renderizado *debajo* del overlay
o nunca se muestra — exactamente el síntoma del usuario. El texto se escribe igual
(`descTextLen` = 217), solo que **invisible**.

---

## 3. Tarea 1 — Modal de Projects visible y clicable en Safari

### 3.1 Solución recomendada: hand-off correcto de `view-transition-name`

La spec de View Transitions captura el estado **ANTES** de ejecutar el callback. Por lo tanto
los nombres nunca deben coexistir: el elemento saliente tiene el nombre en la captura vieja y
el entrante lo recibe **dentro** del callback. Reescribir así en `main.js`:

**Al abrir (click en `.project-card`, ~línea 642):**
1. Antes de `startViewTransition`: asignar `view-transition-name` solo al `videoEl` y
   `titleEl` del **card** (quitar las asignaciones a `modalVideoEl`/`modalTitleEl` de las
   líneas 659–660).
2. **Dentro de `updateDOM`**: limpiar los nombres del card (`videoEl.style.viewTransitionName = 'none'`)
   y recién ahí asignarlos a `modalVideoEl`/`modalTitleEl`, además de lo que ya hace
   (título, año, src, `.active`, ocultar grid, `lenis.stop()`, overflow hidden).
3. En `finished.finally()`: limpiar los nombres del **modal** (no los del card, que ya están
   limpios), guardar `window.activeProjectCard = card`, y arrancar el typewriter.
4. Envolver la promesa con `.catch(() => {})` (o catch por separado en `updateCallbackDone`)
   para que ningún rechazo quede como *unhandled promise rejection*.

**Al cerrar (click en `#modal-close`, ~línea 708):**
1. Antes de `startViewTransition`: **no** tocar nombres (el modal ya tiene los suyos de la
   apertura).
2. **Dentro de `updateDOM`**: reasignar los nombres al card (video/título), limpiar los del
   modal, restaurar visibilidad del grid/título, quitar `.active`, pausar video,
   `lenis.start()`, restaurar overflow.
3. En `finished.finally()`: limpiar los nombres del card y `window.activeProjectCard = null`.
4. `.catch(() => {})` también aquí.

Resultado: nunca hay dos elementos vivos con el mismo nombre → WebKit no lanza
`InvalidStateError` → la transición funciona igual en Chrome y Safari.

### 3.2 Fallback de seguridad (implementar además)

- Feature-detect: si `document.startViewTransition` no existe, ya existe el camino directo
  (mantener).
- Añadir un **watchdog**: si 1.5 s después de abrir el modal el overlay sigue activo
  (`document.getAnimations()` contiene animaciones `*-view-transition` que no terminan) o si
  `ready` rechazó, forzar limpieza: quitar los 4 nombres, asegurar `.active`, `lenis.stop()`.
  Esto evita que un fallo futuro deje la página bloqueada e imposible de cerrar.

### 3.3 Colores explícitos para el modal (fix de contraste)

`.project-modal` está **fuera** de `#projects` en el DOM (ver `index.html` línea 347), por lo
que NO hereda `--text-color: #ffffff` de `.projects-section.dark-mode`; su texto resuelve a
`rgb(0,0,0)` (negro) sobre el fondo negro de la sección. En Chromium "se salva" por
circunstancias de render, pero es frágil y en Safari real contribuye a la invisibilidad.
Fix en `style.css` (~línea 1085):

```css
.project-modal {
  color: #ffffff;              /* o redefinir --text-color localmente */
}
.project-modal .modal-close {
  color: #ffffff;
}
.project-modal .modal-left {
  color: #ffffff;
}
```
(Verificar que `.modal-year` con `opacity: .5` y `.modal-desc-container` con `opacity: .8`
sigan legibles sobre negro.)

### 3.4 Criterios de aceptación (Tarea 1)

- `node modal-probe.mjs` (en `parity-harness/`) → WebKit **sin** `InvalidStateError` ni
  *unhandled rejections*; `descTextLen > 0`; `hitIsCloseBtn: true`.
- Captura `webkit-modal-open.png` mostrando X, título, descripción y video.
- En Chrome (Chromium real o Playwright Chromium headful) la transición de
  expansión/cierre del video sigue viéndose fluida (no se puede perder el efecto).
- Probar ciclo completo: abrir → cerrar → abrir otro proyecto → cerrar, sin errores.
- **Verificación en Safari real** (el Playwright WebKit no reproduce todo): usar el harness
  de ventana visible + `NSApp.run()` de los trabajos previos
  (`/private/var/folders/.../opencode/wkwebview-*`), abrir el modal, capturar snapshot y
  confirmar que se ven descripción y X.

---

## 4. Tarea 2 — Rendimiento de scroll en Safari

Diagnóstico por prioridad (los 4 primeros son los de mayor impacto):

### 4.1 Handlers de scroll por evento sin rAF ni caché

`main.js` tiene **4 listeners de `window.scroll`** (líneas 96, 337, 536 y el de Lenis), que
corren por cada evento de scroll. Safari encarece el layout/recalcado muchísimo más que
Blink.

Fix:
1. Unificar la lógica de los 3 listeners de scroll en **un solo handler throttled con rAF**
   (un flag `scrollScheduled` que agenda `requestAnimationFrame` y ejecuta todo dentro).
2. **Cachear las medidas del carrusel About** (línea 360): hoy se recalcula
   `Array.from(carouselItems).map(item => item.offsetLeft + item.offsetWidth/2)` en **cada**
   evento de scroll. Guardar `itemCenters` en una variable, recalcular solo en `load`,
   `resize` y cuando cambien las fuentes (`document.fonts.ready`). Mismo trato para
   `scrollableDistance` y `screenCenter`.
3. **Early-exit**: en el handler del carrusel, si `progress <= 0 || progress >= 1` y
   `currentActiveIndex === -1`, salir sin tocar el DOM (hoy trabaja completo aunque la
   sección esté fuera de vista).
4. En el handler de projects (línea 536): cachear `projectsScrollWrapper.getBoundingClientRect()`
   no es posible con scroll nativo, pero se puede sustituir por
   `wrapperTop = cachedOffsetTop - window.scrollY` usando `offsetTop` cacheado (recalcular en
   resize), evitando el rect completo.
5. Variables CSS (`--footer-progress`, `--split-radius`, `--split-border`, líneas 568–570):
   escribirlas solo si el valor cambió (guardar el último valor y comparar) para no invalidar
   estilo del body en cada frame.

### 4.2 Loop rAF del canvas de Projects escribe estilos en cada frame siempre

`animateProjectsCanvas()` (líneas 568–626) corre 24/7 con lerp y escribe
`projectsGrid.style.transform/opacity`, logo, título en **cada frame aunque nada cambie**,
incluso con la sección fuera de pantalla o con el modal abierto.

Fix:
- Early-out cuando `|target - current| < 0.001` para escala, opacidad y pan **y** la sección
  esté fuera de vista (o `document.hidden` / modal abierto): no escribir estilos ese frame.
  El rAF puede seguir vivo pero sin tocar el DOM (cero invalidación).
- Opcional: pausar el loop con `IntersectionObserver` sobre `#projects`.

### 4.3 Videos con autoplay fuera de pantalla

Hay **13 `<video>`** en la página. Los de las cards con `autoplay loop` siguen decodificando
aunque no se vean, lo que en Safari compite con el scroll (hardware de video + composición).

Fix: `IntersectionObserver` que haga `play()`/`pause()` según visibilidad, y
`preload="metadata"` en los videos que no están en el primer viewport. Considerar
`poster` para reducir decodificación inicial.

### 4.4 Filtros caros que se re-rasterizan durante el scroll

- `.notch-bg-layer` lleva `filter: drop-shadow(...) url('#goo')` — **conocido y validado**,
  no quitarlo (ver regla 0.2). Solo tener presente su costo.
- `.timeline-content` usa `filter: blur(15px)` → `blur(0)` con transición
  (líneas 1955/2002): animar `filter: blur` en Safari es muy caro. Propuesta: en WebKit,
  animar solo `opacity` (dejar el blur estático o mover el blur a un pseudo-elemento) —
  detectar con `CSS.supports('-webkit-touch-callout', 'none')` o UA check, o simplemente
  reducir el blur y acortar la transición.
- `backdrop-filter: blur(5px)` en `.pill-close` (línea 1654) y `blur(8px)` en la flecha móvil
  (línea 2142): costo bajo (elementos chicos), dejar salvo que siga habiendo jank medido.

### 4.5 Criterios de aceptación (Tarea 2)

- Con la herramienta de scroll-frames ya usada
  (`parity-harness/scroll-frames.mjs` como base) medir que el tiempo promedio de frame
  durante scroll continuo baja respecto del baseline; objetivo: sin frames > 32 ms
  sostenidos en WebKit.
- Un solo listener de scroll con rAF-throttle; `offsetLeft/offsetWidth` del carrusel se leen
  solo en load/resize (verificar con breakpoint o grep).
- Ningún cambio visible de comportamiento en Chrome: carrusel horizontal, split del footer,
  notch y animaciones idénticas a antes (regresión con
  `parity-harness/regression-viewports.mjs` y capturas de `docs/cross-browser-parity/`).
- Verificación manual en Safari real: scroll de arriba a abajo y vuelta, sensación fluida;
  abrir modal durante scroll y cerrar sin bloqueos.

---

## 5. Orden de implementación sugerido

1. 3.3 (colores del modal) — trivial e independiente.
2. 3.1 + 3.2 (hand-off de view-transition-name + watchdog) — corrige el bug visible.
3. 4.1 (consolidar scroll + cachés) — mayor ganancia de rendimiento.
4. 4.2 y 4.3 (canvas early-out + videos).
5. 4.4 (blur/filtros) — solo si el jank persiste tras lo anterior.
6. Regresar evidencia: capturas antes/después, consola limpia en ambos motores,
   actualización de `docs/cross-browser-parity.md` si cambia algo visual.

---

## 6. Estado de implementación (2026-11-11)

### Implementado

**Tarea 1 — modal**
- `main.js`: hand-off de `view-transition-name` corregido. Los nombres del card se
  asignan antes de `startViewTransition` y se limpian **dentro** del callback; los del
  modal se asignan en el callback y se limpian dentro del callback de cierre. Nunca
  coexisten dos elementos vivos con el mismo nombre.
- `main.js`: `.catch(() => {})` en `ready`, `updateCallbackDone` y `finished`; ya no hay
  *unhandled promise rejections* en WebKit.
- `main.js`: watchdog `maybeRecoverStuckTransition()` (1.5 s) que detecta animaciones
  `*-view-transition` colgadas, limpia nombres y restaura el estado del modal.
- `style.css`: `.project-modal`, `.modal-close` y `.modal-left` con `color: #ffffff`
  explícito (el modal está fuera de `#projects` y no hereda el `--text-color` del
  dark-mode).

**Tarea 2 — rendimiento de scroll**
- `main.js`: dispatcher único de scroll con `requestAnimationFrame` y listener pasivo
  (`registerScrollHandler`). Los 3 handlers corren una sola vez por frame.
- `main.js`: métricas cacheadas de About (`aboutSectionTop`, `carouselCenters`,
  `cachedScreenCenter`) recalculadas solo en `load`, `resize`, `fonts.ready`,
  `loadedmetadata` y `ResizeObserver` de items/track. Ya no se leen
  `offsetLeft`/`offsetWidth` por evento de scroll.
- `main.js`: early-exit del carrusel cuando la sección está completamente fuera de vista.
- `main.js`: métricas cacheadas de Projects/footer (`projectsWrapperTop`,
  `cachedFooterTop`, `cachedFooterHeight`); cero `getBoundingClientRect()` por scroll.
- `main.js`: `--footer-progress`/`--split-radius` se escriben solo cuando cambian y
  sobre `#notch-container` y `#footer` (no sobre `<body>`), reduciendo el recalcado de
  estilo a esos subárboles. Se eliminó la escritura de `--split-border` (sin uso).
- `main.js`: `animateProjectsCanvas()` se detiene (sin escribir estilos) cuando los lerps
  convergen y el mouse no se mueve; se sincroniza una vez con los targets exactos.
- `main.js`: `renderFluidCursor()` se detiene cuando el cursor está en reposo; escribe
  estilos de nuevo solo ante movimiento, hover, click o cambio de puntero.
- `main.js`: `IntersectionObserver` global que pausa los videos fuera de pantalla
  (`rootMargin: 200px`). Los videos de About siguen gestionados por `sectionObserver`.
- `main.js`/`style.css`: clase `.is-webkit` (detección por UA) que desactiva el
  `filter: blur(15px)` animado de `.timeline-content`; en WebKit se anima solo
  `opacity`/`transform`.

### Evidencia

- Playwright Chromium y WebKit (`modal-probe.mjs`, `modal-cycle.mjs`):
  - WebKit sin `InvalidStateError` y sin errores de consola.
  - `descTextLen > 0` (typewriter escribe), `hitIsCloseBtn: true`, colores `rgb(255,255,255)`.
  - Ciclo abrir → cerrar × 3 sin nombres duplicados ni overflow bloqueado.
  - `regression-viewports.mjs` (1280×800 y 1440×900): Projects sigue en `dark-mode`,
    fondo `rgb(10,10,10)`, body blanco, sin errores.
- WKWebView real (`wkwebview-fix-verify/verify.swift`):
  - Modal abierto: `descLen: 214`, desc y X blancas, `closeHit: true`,
    `names: ["project-title-transition","project-video-transition"]`, `errors: []`.
  - Modal cerrado: `active: false`, `overflow: ""`, `names: []`, `errors: []`.
- Muestreo de frames en WKWebView real (scroll completo 1280×800):
  - Antes: `avg 25.28 ms`, `p95 34 ms`, `22` frames > 32 ms.
  - Después: `avg 23.75 ms`, `p95 30 ms`, `13` frames > 32 ms.
  - Nota: el harness limita el rAF de WKWebView; sirve como comparación relativa, no
    como FPS absoluto.

### Verificación manual pendiente (Safari real por el usuario)

- Scroll completo arriba/abajo: sensación fluida, sin tirones sostenidos.
- Abrir/cerrar un proyecto: descripción y X visibles y clicables.
- Split del notch al llegar al footer sin deformaciones ni saltos.
- Confirmar que en Chrome no cambió nada visual (salvo el modal, que ahora siempre es
  blanco sobre negro).


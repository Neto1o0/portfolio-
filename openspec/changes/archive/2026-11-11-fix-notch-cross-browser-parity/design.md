# Design

## Context

Ver `proposal.md` — Why. El notch se compone de dos capas superpuestas (fondo filtrado con `filter: url(#goo)` y contenido sin filtro) y tres piezas de fondo (`#bg-left`, `#bg-bridge`, `#bg-right`). El punto de partida tenía fondos semitransparentes, `translateZ(0)` y `will-change` en las piezas. El filtro `#goo` combina `feGaussianBlur` + `feColorMatrix` de umbral alfa, y el halo se obtiene con un `drop-shadow` encadenado. `main.js` sincroniza el ancho de las capas con `ResizeObserver`, alterna la clase `scrolled` a los 50px de scroll y escribe `--split-radius` / `--footer-progress` durante el footer.

Restricción clave: WebKit rasteriza como capas independientes los descendientes compuestos (`translateZ`, `will-change`, opacidad animada) dentro de un elemento con filtro SVG, por lo que el umbral del goo nunca ve una silueta continua. Blink sí los fusiona. El diseño debe funcionar sin ramas de código específicas por navegador si es posible.

## Goals / Non-Goals

**Goals:**
- Un único conjunto de reglas CSS que produzca el mismo notch en Chrome y Safari de macOS.
- Mantener la arquitectura de dos capas (fondo filtrado + contenido nítido) y los tres estados existentes.
- Conservar el efecto gota y la fluidez de las transiciones.

**Non-Goals:**
- Diferencias de scroll-jacking y otros componentes ajenos al notch (change posterior).
- Soporte iOS/iPadOS y navegadores sin filtros SVG (queda fuera de esta etapa).
- Rediseñar el notch o cambiar su lenguaje visual.

**Handled in this change (originally deferred):**
- El fondo negro de Projects se acota a la propia sección para que no se filtre al footer mientras se hace scroll (ver D6).

## Decisions

### D1 — Quitar la composición forzada dentro del subárbol filtrado

Eliminar `translateZ(0)` y `will-change: transform, width, flex-grow, border-radius` de `.notch-bg` y `.notch-bg-bridge`; conservar solo las promociones que no estén dentro del filtro (por ejemplo, el contenedor) y reemplazar `will-change` genérico por propiedades concretas si hace falta. La transición de `flex-grow`, `width`, `border-radius` y `transform` se mantiene igual.

- **Por qué**: es la causa directa de que Safari no fusione las piezas; sin capas hijas, el filtro recibe una silueta continua.
- **Alternativas**: override exclusivo para Safari (`html.safari`). Se descarta porque duplica reglas y mantiene dos modelos visuales; solo se usará como último recurso si la fusión sigue fallando.
- **Riesgo aceptado**: la animación podría perder algo de suavidad en Safari; se mide y, si ocurre, se optimiza con `contain`/`transform` fuera del filtro, no volviendo a promover los hijos.

### D2 — Piezas sólidas y opacas; opacidad final desde el filtro

Cambiar el fondo de `.notch-bg` / `.notch-bg-bridge` a un color sólido opaco `#474747`, dejando que la silueta la aporte el umbral del `goo` y que la última `feColorMatrix` fije el alfa final en `1`.

- **Por qué**: el degradado por pieza dejaba manchas oscuras distintas en WebKit. Además, con alfa `0.9` el tono dependía del fondo (74 sobre claro, 49 sobre negro), que es exactamente el "color de antes" que aparecía al llegar al footer. Con relleno opaco y alfa final `1` el tono queda en 71–73 en Chromium y WebKit, sobre claro y sobre negro.
- **Alternativa**: mantener `rgba` y corregir el color con overrides por navegador; se descarta por fragilidad.

### D3 — Orden del filtro y caja de la capa filtrada

Mantener una sola cadena, pero con el `drop-shadow` **antes** del `goo`: `filter: drop-shadow(0 0 1px rgba(255,255,255,0.5)) url('#goo')`. Además, dar a `.notch-bg-layer` una caja más alta (`inset: -26px 0`) manteniendo las piezas centradas a 56px.

- **Por qué**: con el `drop-shadow` después del `goo`, Chromium aclaraba el interior de la cápsula (78) y WebKit no (46); con el orden actual ambos parten de la misma silueta y el tono coincide. WebKit recorta la salida del filtro a la caja del elemento (ignora `x/y/width/height` del `<filter>`), así que el lóbulo de 100px del perfil se cortaba arriba; con la capa de 108px entra completo.
- **Alternativa considerada**: sustituir todo por una silueta única con `clip-path`/SVG. Es determinista entre motores pero pierde la fusión orgánica del goo y multiplica el trabajo; queda como plan B (D5).

### D4 — Conservar la sincronización de anchos y los estados

No tocar el contrato de `main.js` con el DOM: `.notch-container.scrolled`, los IDs `bg-left`, `bg-bridge`, `bg-right`, `notch-left`, `notch-bridge`, `notch-right`, y las variables `--split-radius` / `--footer-progress` se mantienen. Si D1 obliga a reestructurar el marcado, el script se adapta en el mismo change y se valida con `ResizeObserver`.

- **Por qué**: reduce el riesgo de romper scroll, split y accesibilidad; el problema es de pintado, no de lógica.

### D5 — Verificación visual con Chrome como referencia

Matriz en Chrome y Safari de macOS, mismo viewport y contenidos, en cuatro momentos: carga inicial, scroll medio (colapsado), transición de ida y vuelta, y footer con split completo. Comparación por capturas lado a lado. Criterio de aceptación: sin costuras, mismo tono, mismo halo y gotas presentes en ambos. Además se verifica el recorrido Projects → footer en WebKit real para comprobar que el fondo negro no se filtra y que el notch conserva el tono al reaparecer.

La verificación usa tres motores: WebKit del sistema mediante un `WKWebView` en vivo (ventana en pantalla y `NSApp.run()`), Playwright WebKit 27.2/26.6 y Chromium. El WebKit headless no reproduce el recorte del lóbulo del perfil, por eso el WKWebView en vivo es la referencia para el notch.

### D6 — El fondo negro de Projects pertenece a la sección

Mover la clase `dark-mode` de `<body>` a `#projects`. La sección define `--text-color: #ffffff` y `background-color: #0a0a0a`; el `body` permanece claro.

- **Por qué**: con la clase en `<body>`, todo el viewport (incluido el footer que entra por abajo) se atenuaba a negro y volvía a blanco durante 0.8s. Al salir de la sección se veía como si el fondo negro se filtrara al footer. Al acotarlo a la sección, solo la sección se oscurece y el resto de la página queda estable.
- **Efecto secundario aceptado**: durante la entrada/salida, el negro de la sección se mezcla con el fondo claro del body; es el mismo fundido de 0.8s, pero confinado a la sección.

## Risks / Trade-offs

- **[El goo pierde fluidez al quitar las capas]** → validar primero con D1; si la animación se degrada, optimizar el filtro (reducir `stdDeviation` o el área filtrada) sin volver a promover los hijos.
- **[La región del filtro recorta el blur distinto en Safari]** → aumentar el solape del puente y, si es necesario, ajustar el área del filtro SVG; verificar en los tres estados.
- **[El `drop-shadow` encadenado sigue divergiendo]** → moverlo a un contenedor sin filtro; última opción, un borde/pseudo-elemento equivalente.
- **[Persisten diferencias de color]** → comparar con fondos claro y oscuro; como el color final depende del `feColorMatrix`, ajustar solo el alfa final del filtro, no las piezas.
- **[Romper el split del footer al tocar el marcado]** → mantener IDs y variables (D4) y probar ida/vuelta completa antes de cerrar.
- **[Sin Safari automatizado en el entorno]** → se usa un `WKWebView` en vivo como proxy del WebKit del sistema; la matriz y las capturas quedan documentadas en `docs/cross-browser-parity.md`.
- **[Cambiar el ámbito de `dark-mode` afecta a otros elementos]** → se revisó que ningún otro componente dependiera de `body.dark-mode`; el texto y los anillos de Projects usan `--text-color`, que ahora se redefine en la sección.

## Migration Plan

Sitio estático servido con Vite (`npm run dev` / `npm run build`). No hay migración de datos ni API. Despliegue = publicar el bundle con los cambios de CSS/marcado/script. Rollback = revertir esos archivos; no hay estado persistente que limpiar.

## Open Questions

- ¿Qué versiones mínimas de Safari (macOS) y Chrome se consideran soportadas? Se puede definir después sin cambiar el enfoque; conviene fijarlo al crear la matriz de verificación.

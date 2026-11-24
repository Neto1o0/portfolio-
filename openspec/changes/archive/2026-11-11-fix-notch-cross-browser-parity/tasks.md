# Tasks

## 1. Línea base y confirmación de causa

- [x] 1.1 Ejecutar `npm run dev` y capturar el notch en Chrome y Safari de macOS, mismo viewport, en cuatro estados (inicio expandido, scroll medio colapsado, transición de ida y vuelta, footer con split completo); verificar que las capturas existan y muestren el estado actual de cada navegador.
- [x] 1.2 Confirmar que las piezas de `.notch-bg` dentro de `.notch-bg-layer` se rasterizan como capas compuestas independientes cuando tienen `translateZ`/`will-change`; comprobar que al quitarlos el goo empieza a fusionar, sin dejar cambios temporales en el código.

## 2. Aplanar el subárbol filtrado

- [x] 2.1 Quitar `translateZ(0)` y la promoción de `will-change` de `.notch-bg` y `.notch-bg-bridge` en `style.css`, conservando las transiciones existentes; verificar en Safari que la silueta del notch se vea fusionada y sin rectángulos internos.
- [x] 2.2 Revisar que ninguna otra regla dentro de `.notch-bg-layer` cree capas hijas (transform, opacity animada, filter propio); verificar que el subárbol filtrado ya no tenga capas promovidas.

## 3. Tono, halo y unión

- [x] 3.1 Cambiar el fondo de las piezas a un sólido opaco `#474747` y fijar el alfa final del `feColorMatrix` en `1`; verificar en Safari y Chrome que la cápsula se perciba como una sola pieza y que el tono coincida con la captura de referencia de Chrome sobre fondo claro y sobre negro (71–73 en ambos).
- [x] 3.2 Comparar el halo/borde del notch entre navegadores: usar `drop-shadow(...) url('#goo')` (sombra antes del goo) y ampliar la caja de `.notch-bg-layer` para que WebKit no recorte el lóbulo del perfil; repetir la comparación hasta que no se distingan uniones ni se pierda el borde.
- [x] 3.3 Comprobar el efecto gota durante la compresión y expansión en ambos navegadores, incluido el hover del perfil; confirmar en WebKit real (WKWebView en vivo) que el lóbulo de 100px ya no se corta y que la silueta coincide con Chrome.

## 4. Estados y comportamiento

- [x] 4.1 Verificar que la clase `scrolled` sigue colapsando y expandiendo el notch sin bordes rectos ni saltos en Chrome y Safari; confirmar que los anchos de `#bg-left`/`#bg-right` siguen sincronizados con el `ResizeObserver` de `main.js`.
- [x] 4.2 Verificar el estado dividido del footer en `--footer-progress` 0, 0.25, 0.5, 0.75 y 1: las mitades se separan y vuelven a unir, `--split-radius` se interpola y no quedan restos visuales al subir; comprobar el mismo resultado en Chrome, Playwright WebKit y WebKit real.
- [x] 4.3 Confirmar que el contenido del notch (foto, nombre, links, redes) sigue nítido, alineado y clickeable en todos los estados; verificar que el contenido no quedó afectado por el filtro.

## 5. Verificación integral y documentación

- [x] 5.1 Repetir la matriz visual completa de cuatro estados comparando Chrome contra Safari; verificar que no haya diferencias perceptibles de tono, halo, costuras ni gotas, y anotar cualquier desviación.
- [x] 5.2 Ejecutar `npm run build` y verificar que el build termina sin errores y que el bundle publicado reproduce la misma paridad.
- [x] 5.3 Documentar la matriz de verificación, el entorno (WebKit real, Playwright WebKit y Chromium) y las capturas de referencia en `docs/cross-browser-parity.md`; verificar que el documento permita repetir la comparación sin contexto adicional.

## 6. Fondo negro de Projects (incluido en este change)

- [x] 6.1 Mover la clase `dark-mode` de `<body>` a `#projects`; definir `--text-color` y `background-color: #0a0a0a` en `.projects-section.dark-mode` para que el body y el footer permanezcan claros.
- [x] 6.2 Verificar en WebKit real (WKWebView en vivo) el recorrido de 4600 a 6350px: la sección se ve negra mientras está pinned, el footer ya no se atenúa a negro al entrar y el notch reaparece con el mismo tono; comparar contra Chromium.

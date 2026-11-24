# Proposal

## Why

El notch superior es el primer elemento de la identidad visual del portafolio y hoy se ve claramente distinto en Safari (macOS) que en Chrome: tono más oscuro, costuras visibles entre las piezas, bordes rectos durante la compresión/expansión y ausencia del efecto líquido ("gotas") al separarse. La causa observada es que WebKit no fusiona descendientes compuestos (`translateZ`, `will-change`) dentro de un `filter: url(#goo)` como sí lo hace Blink. El objetivo de esta etapa es que el look del notch sea idéntico en cualquier navegador, tomando Chrome como referencia.

## What Changes

- Normalizar el render del notch para que la cápsula se vea fusionada, con el mismo tono, los mismos bordes y las mismas gotas durante la animación en todos los navegadores soportados.
- Eliminar o reubicar los disparadores de composición (`translateZ(0)`, `will-change`) que estén dentro del subárbol filtrado del notch.
- Hacer los colores del notch robustos a las diferencias de filtro/umbral entre motores: piezas opacas y opacidad final provista por el filtro, para que el tono sea el mismo en Safari y Chrome sobre fondos claros y oscuros.
- Ajustar el solape de las piezas y la región del filtro si hace falta para eliminar costuras y conservar el lóbulo del perfil.
- Revisar el script de sincronización de anchos y los estados (expandido, colapsado, split) para que sigan funcionando si cambia la estructura de capas.
- Acotar el fondo negro de la sección Projects a la propia sección, para que no se filtre al footer mientras se hace scroll.
- Dejar una verificación visual reproducible (Chrome como referencia) para confirmar paridad en notch y futuros elementos.

## Capabilities

### New Capabilities
- `notch-header`: comportamiento visual del notch de navegación fluido — cápsula fusionada, animación de expansión/compresión/split y paridad de render entre navegadores.

### Modified Capabilities
<!-- Sin cambios: el proyecto todavía no tiene specs principales. -->

## Impact

- `style.css`: reglas del notch (`.notch-container`, `.notch-bg-layer`, `.notch-bg`, `.notch-bg-bridge`, radios, transiciones, promociones de capa) y fondo/typography de `.projects-section`.
- `index.html`: marcado del notch y definición del filtro SVG `#goo`.
- `main.js`: sincronización de anchos (`ResizeObserver`), clase `scrolled`, `--split-radius` / `--footer-progress` y el `dark-mode` acotado a `#projects`.
- Sin nuevas dependencias ni cambios de API. Fuera de alcance: diferencias de scroll-jacking y otros componentes ajenos al notch (change posterior).

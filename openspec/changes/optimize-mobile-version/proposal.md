# Proposal

## Why

La versión móvil del portafolio (ventana angosta / Safari con viewport de iPhone) presenta seis defectos visuales confirmados en pruebas reales con el usuario: el subtítulo del hero tiritan horizontalmente en todo momento, las filas de About cambian de alto mientras se escribe la descripción (haciendo saltar los videos), los videos de Projects aparecen dispersos en vez de ir en columna, el split del notch en el footer saca las mitades fuera de la pantalla, y los videos de las cards pesan ~45 MB por estar a 1080p. Chrome no presenta estos problemas: la referencia visual no cambia y la paridad de `notch-header` se respeta.

## What Changes

- **Subtítulo hero estable**: en mobile, anclar el `.subtitle` a métricas enteras (`left/right` simétricos) para eliminar la vibración horizontal causada por la re-rasterización del tile compartido con el indicador de scroll animado (fix validado por el usuario como "Test E"). Se conserva el `bounce` del indicador.
- **About sin saltos de alto**: en mobile, altura fija para `.item-desc` (la del desc más largo, medida en carga) para que la fila no cambie de alto mientras el typewriter escribe y los videos no suban/bajen.
- **Projects mobile en columna**: bajo 768px se desactivan canvas/escala/pan/lerp/pin y los videos se apilan verticalmente, con un header estático y una esfera simplificada (~140px, 2 anillos, pausada fuera de pantalla).
- **Una card activa en Projects mobile**: la card más centrada (con histéresis) reproduce su video; las demás muestran el primer frame (`preload="metadata"`) a ~0.35 de opacidad, hasta estar centradas.
- **Videos de cards optimizados**: nuevas variantes `*-720.mp4` para las fuentes pesadas, transcodificadas con `avconvert` y sus proporciones preservadas. Se usa `Preset1280x720` cuando reduce la fuente y `Preset640x480` para `macisland-1080.mp4`, que el preset mayor deja intacta. Las fuentes que ya son pequeñas, como `It.mp4` (702×396), se conservan sin reescalar. El modal usa la fuente original (1080p donde existe).
- **Notch split contenido en mobile**: factor de separación ~10vw en mobile (hoy `35vw`), para que las mitades del footer no salgan de la pantalla.

## Capabilities

### New Capabilities

- `mobile-experience`: comportamiento de la versión móvil del sitio en viewport angosto (< 768px): estabilidad del subtítulo del hero, altura fija de las descripciones de About, layout en columna de Projects con una card activa y esfera simplificada, videos de cards optimizados y split del notch contenido dentro de la pantalla. No toca los requisitos de paridad desktop de `notch-header`.

### Modified Capabilities

## Impact

- **Código**: `style.css` (media query mobile, reglas de `.subtitle`, `.item-desc`, carrusel de About, grilla de Projects, split del notch), `main.js` (detección de viewport < 768px, gestor de card activa con histéresis, pausa/reproducción de videos, pausa de esfera fuera de pantalla, medición del desc más largo), `index.html` (referencias de video de las cards, quizá marcado para columna mobile).
- **Assets**: nuevos `public/*-720.mp4` para las fuentes pesadas de las cards; las fuentes que ya son pequeñas se conservan. Los 1080p se mantienen para el modal.
- **Specs**: nueva capability `mobile-experience`; `notch-header` no cambia (sus requisitos de paridad desktop y del split permanecen; el fix mobile es una restricción adicional de viewport angosto).
- **Riesgos**: repo sin git — hacer backups de `style.css`, `main.js`, `index.html` antes de editar; verificar en Chrome que el desktop no cambia y en Safari (ventana angosta) que los seis síntomas desaparecen.

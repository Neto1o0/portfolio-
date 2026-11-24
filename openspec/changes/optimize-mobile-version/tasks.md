# Tasks

## 1. Variantes de video para las cards

- [x] 1.1 Generar variantes `*-720.mp4` con presets `avconvert` que reduzcan cada fuente pesada de Projects, preservando proporciones (`Preset640x480` para `macisland-1080.mp4`); dejar `It.mp4` (702×396) sin reescalar, asignar la fuente original de mayor calidad disponible al modal y verificar dimensiones, reducción de peso, fuentes de las siete cards y que el modal use la fuente original.

## 2. Presentación mobile

- [x] 2.1 Añadir las reglas CSS mobile para estabilizar el subtítulo, fijar el split del notch y consumir `--about-desc-height`; verificar en 390px los estilos y el split y en ≥769px que permanecen los valores desktop.
- [x] 2.2 Apilar las cards de Projects y simplificar el header/esfera solo bajo 768px; verificar que el layout mobile es vertical y que el pin/canvas desktop no cambia.

## 3. Comportamiento responsive

- [x] 3.1 Implementar la medición de altura de About y la rama mobile de Projects con una card activa con histéresis y esfera pausada fuera del viewport; verificar que solo la card más centrada reproduce video y que desktop conserva su comportamiento actual.
- [x] 3.2 Documentar en `docs/cross-browser-parity.md` la matriz de verificación mobile/desktop y ejecutar la build y las comprobaciones visuales disponibles para los seis síntomas descritos en el spec.

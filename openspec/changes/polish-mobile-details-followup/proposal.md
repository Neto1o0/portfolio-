# Proposal

## Why

El progreso compartido del notch y del título “Let’s Link!” se completa demasiado tarde porque depende del alto total del footer, no de la posición del título. En el Timeline mobile, el inicio adelantado y la curva inmediata hacen que los textos aparezcan demasiado arriba; además, las miniaturas simultáneas y el rastro por cursor distraen del cierre.

## What Changes

- En mobile, sincronizar la separación completa del notch y la entrada centrada de “Let’s Link!” cuando el centro de `.footer-hero` llegue al centro del viewport.
- Restaurar el punto inicial previo de la bola del Timeline mobile y redibujar el primer tramo recto hasta la mitad del viewport antes de curvar la ruta; alinear los puntos y su revelado con la curva.
- Eliminar la interacción de imágenes por movimiento del cursor durante el blackout en todos los tamaños.
- Sustituir las filas simultáneas de miniaturas por imágenes de mayor tamaño que aparezcan y desaparezcan en secuencia, enmarcando el contenido final en zonas superiores e inferiores.

## Capabilities

### New Capabilities

- `mobile-experience`: sincronización del footer y presentación espaciada del Timeline y su cierre visual.

### Modified Capabilities

- `notch-header`: el estado dividido mobile completa su avance cuando el centro del hero del footer llega al centro del viewport.

## Impact

- **Código**: `main.js` para medir el progreso del footer, coordinar los estados del Timeline y retirar el rastro por `mousemove`; `index.html` y `style.css` para la curva, los puntos y las imágenes animadas.
- **Especificaciones**: nueva delta spec `mobile-experience` y requisito mobile actualizado en `notch-header`.
- **Límites**: la nueva sincronización y la geometría curva se limitan a mobile; desktop conserva su secuencia actual de footer y su trazado horizontal, pero deja de depender del cursor para presentar imágenes durante el blackout.

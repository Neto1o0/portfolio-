# Tasks

## 1. Footer y notch mobile

- [x] 1.1 Derivar un progreso mobile compartido del centro de `.footer-hero`; verificar que el título y el notch completan a la vez cuando ese centro coincide con el viewport center en 390 × 844 y actualizar la matriz de `docs/cross-browser-parity.md`.

## 2. Curva y revelado del Timeline mobile

- [x] 2.1 Restaurar el inicio centrado de la bola y redibujar el path con un tramo recto hasta la mitad del viewport antes de curvar; verificar la trayectoria y el espacio disponible entre las cuatro historias en 390 × 844 y registrar los criterios en `docs/cross-browser-parity.md`.
- [x] 2.2 Vincular la visibilidad de cada historia a la llegada de la bola a su punto del path; verificar que ninguna historia aparece solo por el tiempo de entrada y que el cierre Versatility sigue abriendo y cerrando en 390 × 844.

## 3. Imágenes automáticas del blackout

- [x] 3.1 Limitar a mobile las filas fijas de imágenes con opacidad escalonada, demorar su entrada hasta que termine la expansión del blackout y conservar en desktop el rastro previo por `mousemove`; verificar cierre y `prefers-reduced-motion`, y documentar el resultado en `docs/cross-browser-parity.md`.

## 4. Verificación integrada

- [x] 4.1 Ejecutar `npm run build` y recorrer la matriz de footer, Timeline e imágenes a 390 × 844, 768px y 769px, además de desktop a 810 × 964; verificar que solo la geometría móvil cambia y actualizar cualquier limitación de Safari real en `docs/cross-browser-parity.md`.

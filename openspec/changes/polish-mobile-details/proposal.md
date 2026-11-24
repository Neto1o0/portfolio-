# Proposal

## Why

En mobile quedan detalles visuales sin resolver en el footer, el modal de Projects y el Timeline: el título del footer no entra de forma visible, la descripción del proyecto pierde contraste y el inicio y cierre del Timeline presentan contenido superpuesto o mal alineado. El blackout final también depende del movimiento del cursor para mostrar imágenes, una interacción que no existe en pantallas táctiles.

## What Changes

- Hacer que “Let’s Link!” conserve su animación de entrada al viewport en mobile.
- Cambiar a negro el texto descriptivo del modal de Projects solo en mobile.
- Ajustar el inicio de la bola del Timeline para que el primer texto no aparezca al abrir la sección.
- Centrar el contenido de “Versatility” y evitar que el punto anterior se superponga durante el blackout.
- Mostrar imágenes automáticamente en posiciones fijas arriba y abajo de la pantalla al alcanzar el blackout en mobile, sin requerir movimiento táctil.

## Capabilities

### New Capabilities

- `mobile-experience`: pulido de las transiciones del footer, la legibilidad del modal de Projects y la presentación inicial y final del Timeline en viewports mobile.

### Modified Capabilities

## Impact

- **Código**: `style.css` (reglas mobile del footer, modal y Timeline), `main.js` (progreso del footer y estados de apertura/cierre e imágenes del Timeline).
- **Especificación**: amplía el comportamiento mobile definido para la capability `mobile-experience`; no altera la paridad del notch ni la presentación desktop.

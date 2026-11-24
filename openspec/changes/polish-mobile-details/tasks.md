# Tasks

## 1. Footer y modal de Projects

- [x] 1.1 Corregir en mobile la actualización de geometría/progreso que anima “Let’s Link!” al entrar al footer; verificar la animación al recorrer el footer a 390px y documentar el resultado en `docs/cross-browser-parity.md`.
- [x] 1.2 Cambiar a negro solo la descripción del modal de Projects en mobile; verificar legibilidad a 390px y conservar el color actual a 810px.

## 2. Entrada y cierre del Timeline

- [x] 2.1 Ajustar el inicio de la bola y coordinar el umbral de visibilidad del primer punto; centrar “Versatility” y ocultar los puntos anteriores en blackout; verificar apertura, recorrido y cierre del Timeline a 390px y registrar la matriz en `docs/cross-browser-parity.md`.
- [x] 2.2 Mostrar automáticamente imágenes fijas en las zonas superior e inferior al entrar en blackout mobile, sin interacción; verificar que no cubren el texto ni el control de cierre y que desktop conserva el rastro por cursor.

## 3. Verificación integrada

- [x] 3.1 Ejecutar `npm run build` y recorrer la matriz mobile/desktop de footer, modal y Timeline; verificar los límites de 768px y anotar cualquier limitación de verificación Safari real en `docs/cross-browser-parity.md`.

# Design

## Context

Ver `proposal.md` y `specs/mobile-experience/spec.md`. El footer calcula hoy un progreso único usando el alto completo del footer, y ese valor conduce tanto la separación del notch como la entrada de sus palabras. El Timeline mobile dibuja una ruta SVG y revela historias con umbrales numéricos independientes; su referencia inicial se desplazó hacia arriba. El cierre usa miniaturas fijas y un listener global `mousemove` para el rastro de cursor.

## Goals / Non-Goals

**Goals:**

- Completar al mismo tiempo la separación del notch y el centrado del título cuando el hero del footer llega al centro del viewport mobile.
- Dar un tramo inicial legible al Timeline y hacer que su ruta, puntos y revelado compartan una referencia de progreso.
- Mostrar el material del blackout con una secuencia temporizada discreta en vez de seguir el cursor.

**Non-Goals:**

- Cambiar la animación del footer o la ruta del Timeline desktop.
- Cambiar el contenido de las historias o del cierre Versatility.

## Decisions

### Anclar el progreso mobile al centro del hero

Medir `.footer-hero` y derivar un progreso normalizado desde su entrada hasta que su centro coincida con el centro del viewport. Aplicar ese mismo valor a las propiedades que conducen el título y el notch para que ambos completen juntos. Mantener el cálculo desktop existente.

**Alternativa descartada:** usar `#footer` completo como intervalo, porque su altura incluye todo el contenido inferior y retrasa la finalización hasta casi el fin del scroll.

### Ruta mobile vertical con primer segmento recto

Restaurar el inicio de la bola a su posición centrada previa. Redibujar el path mobile para que la primera sección suba recta por el centro hasta alcanzar la mitad del viewport visible y luego comience las curvas laterales. Situar nodos e historias junto a sus secciones curvas; derivar sus activaciones de la distancia de la bola sobre el mismo path, no de umbrales que puedan adelantarse por la animación de entrada.

**Alternativa descartada:** mantener la curva inicial y desplazar solo las tarjetas; eso aumentaría el espacio sin corregir la discrepancia entre la trayectoria y el momento de revelado.

### Filas de imágenes mobile; desktop sin cambios
Limitar la secuencia automática a mobile. Al terminar la expansión del blackout, revelar dos filas fijas de tres imágenes, una arriba y otra abajo. Las imágenes no se desplazan: cada una repite una transición de opacidad de 0 a 1 y de vuelta a 0, escalonada de izquierda a derecha arriba y en sentido inverso abajo para crear un barrido reflejado. Detener la animación al salir del blackout y mostrar las imágenes estáticas con `prefers-reduced-motion`. Mantener en desktop el rastro original activado por `mousemove`.

**Alternativa descartada:** aplicar la secuencia mobile también en desktop, porque cambia una interacción que ya funcionaba y estaba fuera del alcance mobile.

## Risks / Trade-offs

- [La medición del hero puede cambiar tras cargar fuentes] → Recalcular medidas en resize y cambios de tamaño observados, usando el mismo progreso para ambos efectos.
- [El segmento recto puede retrasar la primera historia] → Alinear el primer nodo y su umbral con el final del tramo recto y verificar la entrada y el avance en 390 × 844.
- [Un ciclo de imágenes puede seguir ejecutándose después de salir del blackout] → Vincular su temporizador al estado de blackout y limpiarlo al salir, cerrar o cambiar el viewport.
- [Las imágenes pueden cubrir texto en viewports bajos] → Adaptar las dos zonas a la altura, validar 390 × 568 y dejar una presentación estática sin movimiento para usuarios con movimiento reducido.

## Migration Plan

No hay migración de datos ni dependencias nuevas. Reemplazar la lógica de progreso mobile y el seguimiento por cursor, validar el build y los tamaños de viewport descritos en las tareas. El rollback consiste en restaurar el cálculo y path previos y retirar la secuencia automática.

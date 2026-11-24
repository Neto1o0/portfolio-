# Design

## Context

Ver `proposal.md` y `specs/mobile-experience/spec.md`. La implementación actual vincula la posición del título de footer a `--footer-progress`, aplica blanco al texto completo del modal de Projects y dibuja el Timeline mobile sobre una ola SVG vertical. El contenido de los cuatro puntos y la bola de blackout son capas distintas; el contenido final vive dentro de la propia bola. El rastro de imágenes se crea con `mousemove` y dentro de un contenedor recortado por esa bola.

## Goals / Non-Goals

**Goals:**

- Hacer visibles las animaciones y textos mobile en sus estados de entrada y cierre.
- Mantener independientes del touch los ajustes que no requieren interacción y preservar el rastro actual de cursor en desktop.
- Limitar los cambios de color y layout a viewports mobile.

**Non-Goals:**

- Cambiar los textos, la forma de la ola o la interacción del Timeline desktop.
- Cambiar el contenido o la duración del blackout.

## Decisions

### Progreso del footer basado en la geometría actual

Mantener la animación existente de “Let’s Link!”, pero asegurar que el progreso usado por ella se actualice con la posición y altura reales del footer en mobile. La estructura de Projects cambia de altura al pasar a flujo normal; por ello, el valor cacheado del footer no debe dejar la animación fuera de su intervalo visible. Recalcular cuando cambien las dimensiones relevantes y conservar la interpolación actual.

**Alternativa descartada:** reemplazar la animación por una entrada independiente de CSS; duplicaría el mecanismo de progreso ya compartido con el notch y perdería la secuencia existente.

### Color del modal solo en mobile

Sobrescribir el color de `.modal-desc` dentro de la media query mobile, sin alterar los colores explícitos del modal desktop ni los títulos y controles.

**Alternativa descartada:** cambiar el color global de `.modal-left`, porque modificaría desktop y otras partes del modal.

### Inicio del Timeline coordinado con la ola

Desplazar hacia arriba el punto inicial de la bola y coordinar el umbral de visibilidad de `Origins` con la posición de esa bola. La entrada no debe revelar un punto solo porque el progreso inicial de animación haya avanzado; el primer contenido aparece al alcanzar su punto durante el scroll.

**Alternativa descartada:** ocultar únicamente el texto con una demora fija; su resultado dependería del tiempo y no de la posición del Timeline.

### Cierre final como estado exclusivo

Cuando el Timeline mobile entre en blackout, marcar un estado final que oculte los contenidos de los puntos anteriores y centre el contenido final en el viewport, no en la posición desplazada de la bola expandida. Al salir del blackout, restaurar el estado normal de los puntos.

**Alternativa descartada:** resolver el solapamiento solo con `z-index`; eso mantendría ambos textos visibles y ocultaría parte del cierre.

### Imágenes fijas en el blackout mobile

Separar la presentación automática de imágenes mobile del rastro de cursor desktop. En mobile, al entrar en blackout, mostrar las imágenes en zonas fijas superior e inferior del viewport; reutilizar los assets actuales y retirar/ocultar la presentación al salir de ese estado. En desktop, conservar la creación de imágenes por movimiento del mouse.

**Alternativa descartada:** simular movimiento de cursor o exigir `touchmove`; ambas opciones contradicen la decisión de mostrar las imágenes automáticamente.

## Risks / Trade-offs

- [El footer puede cambiar de altura tras cargar fuentes o medios] → Actualizar la geometría cuando se redimensione el contenido y verificar el inicio, mitad y final del footer en mobile.
- [El cambio de punto inicial puede desalinear el progreso dibujado de la ola] → Mantener bola, trazo y umbrales de puntos basados en la misma coordenada de progreso.
- [El texto negro del modal depende de su fondo mobile] → Verificar legibilidad sobre la superficie real del modal en mobile y no aplicar la regla a desktop.
- [Las imágenes automáticas pueden competir con el texto final] → Mantenerlas en áreas superior/inferior y verificar que no cubran “Versatility” ni el control de cierre.

## Migration Plan

No hay migración de datos ni cambio de dependencias. Aplicar los ajustes mobile y verificar la entrada/salida de los estados; rollback limitado a revertir las reglas y el manejo de estado añadidos.

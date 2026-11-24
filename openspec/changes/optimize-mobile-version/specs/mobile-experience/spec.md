# Spec Delta

## Purpose

Define el comportamiento de la versión móvil del portafolio en viewport angosto (< 768px): estabilidad del subtítulo del hero, filas de About de alto constante, Projects apilado en columna con una card activa a la vez, videos de cards a 720p y split del notch del footer contenido dentro de la pantalla. Chrome en desktop no cambia; los requisitos de paridad de `notch-header` se respetan.

## ADDED Requirements

### Requirement: Subtítulo del hero estable

En viewport mobile (< 768px), el subtítulo del hero SHALL mantener su rasterización estable en Safari: su caja SHALL anclarse con métricas enteras y simétricas (bordes `left`/`right` enteros, sin ancho fraccionario) de modo que los repintados del indicador de scroll animado no provoquen vibración horizontal de los glifos. El `bounce` del indicador de scroll SHALL conservarse.

#### Scenario: Ventana angosta en Safari sin vibración

- **WHEN** se visualiza el hero en Safari con una ventana angosta (ancho tipo iPhone, p. ej. 390px)
- **THEN** el texto del subtítulo no tiritan horizontalmente ni en reposo ni durante el scroll
- **AND** el indicador de scroll mantiene su animación de rebote

#### Scenario: Desktop sin cambios

- **WHEN** se visualiza el hero en Chrome o Safari con ventana de ancho normal (≥ 768px)
- **THEN** el subtítulo se ve igual que antes del cambio, centrado bajo el título

### Requirement: Descripciones de About de alto constante

En viewport mobile, cada fila del carrusel de About SHALL mantener su altura constante mientras la descripción se escribe con el efecto typewriter: el `.item-desc` SHALL reservar en carga la altura del desc más largo, de modo que los videos de la fila no suban ni bajen durante la escritura.

#### Scenario: Escritura del desc sin salto de video

- **WHEN** la fila activa de About escribe su descripción carácter a carácter en mobile
- **THEN** la altura de la fila y la posición vertical del video permanecen constantes hasta que el texto termina

#### Scenario: Cambio de fila activa

- **WHEN** el carrusel pasa a otra fila con una descripción más corta
- **THEN** ninguna fila colapsa ni crece al reemplazarse el texto

### Requirement: Projects mobile en columna

En viewport mobile (< 768px), la sección Projects SHALL apilar sus cards verticalmente en una sola columna: el pinned con canvas, escala, pan y lerp SHALL desactivarse y el header SHALL quedar estático con una esfera simplificada (≈140px, 2 anillos) que SHALL pausarse cuando el header sale del viewport.

#### Scenario: Scroll por Projects en mobile

- **WHEN** se navega la sección Projects en una ventana < 768px
- **THEN** las cards se recorren en columna vertical, sin dispersión horizontal ni escala por scroll
- **AND** el header permanece estático y la esfera simplificada se pausa al salir de pantalla

#### Scenario: Desktop sin cambios

- **WHEN** se navega Projects con ventana ≥ 768px
- **THEN** el comportamiento actual (canvas, escala, pan, lerp y pin) queda intacto

### Requirement: Card activa única en Projects mobile

En viewport mobile, una sola card de Projects SHALL estar activa a la vez: la más centrada en el viewport, con histéresis para evitar cambios erráticos. La card activa SHALL reproducir su video; las demás SHALL mostrar su primer frame (preload mínimo) con opacidad reducida (≈0.35) hasta quedar centradas.

#### Scenario: Centrar una card la activa

- **WHEN** el usuario scrollea hasta centrar una card de Projects en mobile
- **THEN** esa card reproduce su video con opacidad plena
- **AND** las demás cards se ven estáticas (primer frame) a ≈0.35 de opacidad

#### Scenario: Histéresis del cambio de activa

- **WHEN** el usuario hace micro-scroll cerca del punto de corte entre dos cards
- **THEN** la card activa no cambia repetidamente; el cambio ocurre solo al superar el umbral de histéresis

### Requirement: Videos de cards optimizados

Las cards de Projects SHALL usar variantes optimizadas transcodificadas con un preset `avconvert` que reduzca cada fuente pesada, preservando su relación de aspecto; las fuentes que ya sean pequeñas SHALL conservarse sin reescalar. Las variantes optimizadas SHALL usarse en desktop y mobile. El modal de detalle SHALL usar la fuente original de mayor calidad disponible (1080p cuando exista).

#### Scenario: Card carga variante optimizada

- **WHEN** se visualiza una card de Projects en desktop o mobile
- **THEN** el video reproducido/mostrado es la variante optimizada para su fuente, no la fuente pesada original
- **AND** una fuente que ya es pequeña, como `It.mp4`, no se amplía innecesariamente

#### Scenario: Modal usa la fuente original

- **WHEN** el usuario abre el detalle de un proyecto
- **THEN** el modal reproduce la fuente original de mayor calidad disponible en lugar de la variante optimizada de la card
- **AND** reproduce la variante 1080p cuando esa fuente existe

#### Scenario: Transcode reduce conservando la proporción

- **WHEN** una fuente horizontal o vertical se transcodifica con un preset `avconvert` adecuado a sus dimensiones
- **THEN** el asset resultante reduce sus dimensiones y conserva la proporción original

### Requirement: Split del notch contenido en mobile

En viewport mobile, la separación de las mitades del notch en el footer SHALL usar un factor reducido (≈10vw del ancho del viewport) de modo que ambas mitades permanezcan dentro de la pantalla durante todo el estado dividido. El desktop SHALL conservar el factor actual.

#### Scenario: Footer dividido en ventana angosta

- **WHEN** el notch se divide en el footer con un viewport de 390px de ancho
- **THEN** ninguna mitad queda fuera de la pantalla y el hueco central no desplaza las mitades más allá de sus bordes

#### Scenario: Desktop conserva factor actual

- **WHEN** el notch se divide en el footer con ventana ≥ 768px
- **THEN** la separación es la misma que antes del cambio

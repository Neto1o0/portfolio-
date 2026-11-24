# about-carousel Specification

## Purpose
Define la composición y el comportamiento del carrusel de la sección About: qué ítems existen y en qué orden, qué video usa cada uno, la longitud del scroll-jacking en desktop y la altura de las descripciones en mobile.

## Requirements

### Requirement: Composición del carrusel de About
El carrusel de About SHALL contener, en este orden: bloque introductorio "THIS IS ME", "IT Engineer" (video `It.mp4`), "Music producer" (video `pagina1-1080.mp4`), "Web designer" (video `designvid.mov`), un ítem "New title" con video `DCA-720.mp4`, "Volleyball player" (video `Voley2.mov`), y el bloque de acceso al Timeline. El ítem "New title" SHALL ser el penúltimo, inmediatamente antes de "Volleyball player".

#### Scenario: Estructura en desktop
- **WHEN** la página se abre en desktop (viewport > 768px)
- **THEN** el carrusel muestra los 6 bloques en el orden descrito, cada carousel-item con su video y su texto de título y descripción

#### Scenario: Estructura en mobile
- **WHEN** la página se abre en mobile (viewport <= 768px)
- **THEN** los ítems se presentan apilados/deslizables con el mismo orden y contenido, sin scroll-jacking horizontal

### Requirement: Texto placeholder del ítem nuevo
El ítem "New title" SHALL tener texto placeholder en ambos idiomas — título "New title" (EN) / "Nuevo título" (ES) y una descripción de relleno — que el usuario reemplazará por el texto real editando tanto el HTML inicial como las entradas del diccionario de traducción correspondientes a ese ítem.

#### Scenario: Idioma inicial
- **WHEN** la página se abre en inglés
- **THEN** el ítem muestra "New title" y su descripción placeholder en inglés

#### Scenario: Traducción del placeholder
- **WHEN** el usuario activa el toggle de traducción al español
- **THEN** el ítem muestra "Nuevo título" y su descripción placeholder en español

### Requirement: Longitud de scroll-jacking en desktop
En desktop, la sección About SHALL tener una longitud de scroll de 500vh (una ~100vh por cada uno de los 5 ítems del carrusel), de modo que el desplazamiento horizontal reparta el progreso uniformemente entre todos los ítems.

#### Scenario: Progreso uniforme
- **WHEN** el usuario recorre la sección About en desktop de principio a fin
- **THEN** el track horizontal avanza del primer ítem al último sin apretar los ítems finales y sin tramos muertos

#### Scenario: Mobile sin scroll-jacking
- **WHEN** el viewport es <= 768px
- **THEN** la sección usa altura automática según su contenido y no impone los 500vh

### Requirement: Altura fija de descripciones en mobile
En mobile, la altura común de las descripciones de los ítems (`.item-desc`) SHALL medirse en carga tomando el máximo scrollHeight de todas ellas, incluida la del ítem nuevo, de modo que el video superior no cambie de posición mientras cambia el texto visible de cada ítem.

#### Scenario: La descripción más larga define la altura
- **WHEN** la página carga en mobile (y al alternar idioma)
- **THEN** todas las descripciones tienen la misma altura fija, suficiente para la más larga de las cinco, y el video de cada ítem queda a altura constante

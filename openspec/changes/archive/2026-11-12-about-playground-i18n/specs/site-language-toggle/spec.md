# Spec Delta

## Purpose

Define el comportamiento del toggle de idioma EN/ES de la página: qué contenido se traduce al activarlo, qué textos quedan idénticos en ambos idiomas, y cómo el diccionario de traducción cubre también el modal Timeline.

## ADDED Requirements

### Requirement: Toggle de idioma
La página SHALL ofrecer un toggle que alterna todo el contenido traducible entre inglés y español con un clic, actualizando el atributo de idioma del documento y aplicando los textos del diccionario de traducción sobre los selectores registrados.

#### Scenario: Alternar a español
- **WHEN** el usuario hace clic en el toggle con la página en inglés
- **THEN** todo el contenido traducible cambia a español y el tooltip del toggle pasa a "traducir"

#### Scenario: Alternar de vuelta a inglés
- **WHEN** el usuario hace clic en el toggle con la página en español
- **THEN** todo el contenido traducible vuelve al inglés y el tooltip pasa a "translate"

### Requirement: Secciones cubiertas por la traducción
El diccionario de traducción SHALL cubrir: subtítulo del hero, navegación, textos del hero/typewriter, ítems del carrusel de About (títulos y descripciones), footer, botón de descarga de CV, disponibilidad, y el contenido del modal Timeline (los 4 bloques de paradas con su título y párrafo, el bloque final "Versatility" con su párrafo, el texto "Scroll" de la bola, y los dos botones de cierre del modal).

#### Scenario: Modal Timeline traducido
- **WHEN** la página está en español y el usuario abre el modal Timeline
- **THEN** las 4 paradas, el bloque "Versatility", el texto "Scroll" y los botones de cierre se muestran en español

#### Scenario: Traducción con el modal abierto
- **WHEN** el usuario alterna el idioma mientras el modal Timeline está abierto
- **THEN** el contenido del modal visible se traduce inmediatamente, sin necesidad de cerrar y reabrir

### Requirement: Textos sin traducción declarada
Los siguientes textos SHALL permanecer idénticos en ambos idiomas y no entrar al diccionario de traducción: el nombre de la sección "Playground" (nav y título gigante), el botón "Timeline" que abre el modal, y el enlace del footer "Work" (ES: "Trabajos").

#### Scenario: Playground estable en ambos idiomas
- **WHEN** el usuario alterna el idioma
- **THEN** la navegación y el título gigante de la sección siguen mostrando "Playground" sin cambio

#### Scenario: Timeline estable en ambos idiomas
- **WHEN** el usuario alterna el idioma
- **THEN** el botón que abre el modal sigue mostrando "Timeline" (con su letra inicial animada intacta) y el footer sigue mostrando "Work" / "Trabajos" según su traducción ya existente

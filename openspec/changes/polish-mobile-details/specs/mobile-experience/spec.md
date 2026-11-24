# Spec Delta

## Purpose

Define el pulido visual de la experiencia mobile en el footer, el modal de Projects y el Timeline interactivo, manteniendo intacta la presentación desktop y haciendo accesibles sus transiciones y contenido en pantallas táctiles.

## ADDED Requirements

### Requirement: Título del footer entra en pantalla en mobile

En viewport mobile, el título “Let’s Link!” SHALL animarse hacia una posición completamente visible cuando el footer entra en el viewport.

#### Scenario: Entrada al footer mobile

- **WHEN** el usuario llega al footer en un viewport menor o igual a 768px
- **THEN** “Let’s Link!” se desplaza desde fuera de pantalla hasta quedar visible
- **AND** la animación se completa mientras el usuario continúa recorriendo el footer

### Requirement: Descripción del proyecto legible en mobile

En viewport mobile, la descripción del proyecto en el modal SHALL mostrarse en negro; el cambio SHALL quedar limitado al modal y no alterar el texto del modal desktop.

#### Scenario: Abrir un proyecto en mobile

- **WHEN** se abre el modal de un proyecto en un viewport menor o igual a 768px
- **THEN** la descripción se muestra en negro y resulta legible sobre el fondo del modal

#### Scenario: Abrir un proyecto en desktop

- **WHEN** se abre el modal de un proyecto en un viewport mayor a 768px
- **THEN** el color actual de la descripción se conserva

### Requirement: Inicio del Timeline mobile sin texto adelantado

Al abrir el Timeline en mobile, la bola SHALL comenzar más arriba y el texto del primer punto SHALL permanecer oculto hasta que el avance de la bola llegue a ese punto.

#### Scenario: Apertura inicial del Timeline

- **WHEN** se abre el Timeline en un viewport menor o igual a 768px sin desplazarse
- **THEN** la bola aparece por encima de su posición inicial actual
- **AND** el texto de “Origins” no aparece sobre la pantalla

#### Scenario: Avance al primer punto

- **WHEN** el usuario se desplaza hasta el primer punto
- **THEN** el contenido de “Origins” se revela junto con su punto correspondiente

### Requirement: Cierre del Timeline mobile sin solapamiento

Al entrar en el estado final de blackout en mobile, el texto de “Versatility” SHALL quedar centrado y los textos de los puntos anteriores SHALL estar ocultos.

#### Scenario: Llegada al blackout final

- **WHEN** la bola alcanza el estado final de blackout en un viewport menor o igual a 768px
- **THEN** el contenido de “Versatility” queda alineado dentro del viewport
- **AND** “Multicultural awareness” y los textos de los puntos previos no se superponen con el cierre

### Requirement: Imágenes automáticas en el cierre mobile

Al alcanzar el blackout del Timeline en mobile, las imágenes SHALL aparecer automáticamente en posiciones fijas en las zonas superior e inferior del viewport, sin requerir movimiento de cursor ni interacción táctil.

#### Scenario: Entrada al blackout mobile

- **WHEN** el Timeline entra en el estado de blackout en un viewport menor o igual a 768px
- **THEN** aparecen imágenes en las zonas superior e inferior de la pantalla
- **AND** su aparición no depende de mover el cursor ni de arrastrar la pantalla

#### Scenario: Cierre de Timeline desktop

- **WHEN** el Timeline se usa en un viewport mayor a 768px
- **THEN** el comportamiento actual de las imágenes asociado al movimiento del cursor se conserva

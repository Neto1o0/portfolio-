# notch-header Specification

## Purpose

Define el comportamiento visual del notch de navegación flotante: una cápsula oscura con efecto líquido que se expande, se comprime y se divide al hacer scroll, con render idéntico en todos los navegadores soportados tomando Chrome como referencia.

## Requirements

### Requirement: Paridad de render entre navegadores

El notch SHALL verse visualmente idéntico en Chrome y Safari de macOS en estado de reposo: misma silueta de cápsula fusionada, mismo tono del relleno oscuro, mismo halo/borde y mismos radios de esquina. No MUST existir costuras, líneas de unión ni rectángulos visibles entre las piezas izquierda, puente y derecha.

#### Scenario: Carga inicial en Safari

- **WHEN** se carga la página en Safari de macOS
- **THEN** el notch se muestra como una sola cápsula continua, con el mismo color y borde que en Chrome
- **AND** no se distingue ninguna unión entre las tres piezas de fondo

#### Scenario: Carga inicial en Chrome

- **WHEN** se carga la página en Chrome sobre el mismo viewport y contenidos
- **THEN** el notch conserva el look de referencia actual (cápsula fusionada, gotas, halo)
- **AND** una comparación lado a lado con Safari no muestra diferencias perceptibles

### Requirement: Animación líquida al expandir y comprimir

Al superar el umbral de scroll, el notch SHALL comprimirse retirando el puente central, y al volver arriba SHALL expandirse de nuevo. En ambos sentidos, las piezas SHALL deformarse como un fluido (efecto gota) en todos los navegadores soportados; no MUST aparecer bordes rectos ni cortes entre piezas durante la transición.

#### Scenario: Compresión al hacer scroll

- **WHEN** el usuario hace scroll más allá del umbral que colapsa el notch
- **THEN** el puente central se retira con una deformación fluida en los extremos que se separan
- **AND** no se ven bordes rectos ni separaciones duras durante la animación

#### Scenario: Expansión al volver arriba

- **WHEN** el usuario vuelve al inicio de la página
- **THEN** el notch recupera su forma expandida con la misma deformación líquida en la unión
- **AND** el resultado final coincide con el estado inicial en Safari y Chrome

### Requirement: Estado dividido en el footer

Cuando el footer entra en viewport, el notch SHALL dividirse en dos mitades que se separan proporcionalmente al avance del footer, interpolando el radio interior desde cápsula hasta rectángulo redondeado. El estado SHALL ser visualmente consistente entre navegadores y reversible al subir.

#### Scenario: Separación progresiva

- **WHEN** el usuario llega al footer y sigue haciendo scroll
- **THEN** las mitades izquierda y derecha se separan sin saltos y el radio interior crece hasta el máximo definido
- **AND** el render es el mismo en Safari y Chrome

#### Scenario: Reversión al subir

- **WHEN** el usuario sube desde el footer
- **THEN** las mitades vuelven a unirse y el notch recupera su radio de cápsula
- **AND** no quedan restos de capas o fondos del estado dividido

### Requirement: Tono y opacidad consistentes

El notch SHALL mantener el tono de vidrio oscuro definido por el diseño sobre fondos claros y oscuros, con la misma opacidad final en todos los navegadores. El color MUST NOT variar por diferencias de composición del filtro entre motores, ni por el color de fondo de la sección sobre la que se muestra.

#### Scenario: Notch sobre fondo claro

- **WHEN** el notch se muestra sobre la grilla clara del inicio
- **THEN** el tono y la opacidad coinciden con la referencia de Chrome

#### Scenario: Notch sobre sección oscura

- **WHEN** el notch se superpone a una sección de fondo oscuro, como Projects
- **THEN** el tono se mantiene estable y legible
- **AND** no aparece un halo o borde de color distinto al de Chrome

#### Scenario: Notch al salir de Projects hacia el footer
- **WHEN** el usuario hace scroll desde la sección Projects hacia el footer y el notch vuelve a aparecer
- **THEN** el tono del notch no cambia al pasar del fondo negro al claro
- **AND** la silueta conserva la misma forma (cápsula colapsada) sin deformarse por el cambio de fondo
- **AND** el fondo negro de Projects no se extiende al footer

### Requirement: Aviso inicial de traducción
Al aparecer el control de idioma del notch por primera vez durante el desplazamiento, la página SHALL mostrar debajo un aviso visual breve que identifique la función. El aviso SHALL desaparecer después de aproximadamente tres segundos y no MUST volver a aparecer durante la misma visita a la página.

#### Scenario: Primera aparición del control de idioma
- **WHEN** el usuario se desplaza por primera vez hasta que aparece el control de idioma en el notch
- **THEN** se muestra debajo un aviso minimalista con un icono y la etiqueta de traducción durante aproximadamente tres segundos
- **AND** posteriores desplazamientos no vuelven a mostrar el aviso

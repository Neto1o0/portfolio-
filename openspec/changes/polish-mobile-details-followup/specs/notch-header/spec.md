# Spec Delta

## MODIFIED Requirements

### Requirement: Estado dividido en el footer
Cuando el footer entra en viewport, el notch SHALL dividirse en dos mitades que se separan proporcionalmente al avance del footer, interpolando el radio interior desde cápsula hasta rectángulo redondeado. En mobile, el avance completo SHALL coincidir con el momento en que el centro del hero del footer llega al centro del viewport. El estado SHALL ser visualmente consistente entre navegadores y reversible al subir.

#### Scenario: Separación progresiva
- **WHEN** el usuario llega al footer y sigue haciendo scroll
- **THEN** las mitades izquierda y derecha se separan sin saltos y el radio interior crece hasta el máximo definido
- **AND** el render es el mismo en Safari y Chrome

#### Scenario: Separación completa en mobile
- **WHEN** el centro del hero del footer llega al centro de un viewport no mayor a 768px
- **THEN** las mitades del notch alcanzan su separación y radio máximos
- **AND** “Let’s Link!” completa su animación centrada en el mismo momento

#### Scenario: Reversión al subir
- **WHEN** el usuario sube desde el footer
- **THEN** las mitades vuelven a unirse y el notch recupera su radio de cápsula
- **AND** no quedan restos de capas o fondos del estado dividido

# Spec Delta

## Purpose

Define the mobile footer and Timeline transitions so their motion follows visible viewport geometry, leaves readable space around each story, and presents the final images without cursor interaction while preserving desktop behavior.

## ADDED Requirements

### Requirement: Footer title completes at viewport center on mobile
In mobile viewports, the “Let’s Link!” entrance SHALL complete when the center of its footer hero aligns with the viewport center.

#### Scenario: Footer hero reaches viewport center
- **WHEN** the center of the footer hero reaches the center of a viewport no wider than 768px
- **THEN** “Let’s Link!” is centered and fully visible
- **AND** its entrance animation has completed

### Requirement: Mobile Timeline begins with a straight path
In mobile viewports, the Timeline path SHALL retain its prior starting position, remain straight until it reaches the viewport midpoint, and curve only after that point.

#### Scenario: Timeline enters its first curve
- **WHEN** the Timeline is opened on a viewport no wider than 768px
- **THEN** the ball starts at its prior center-based position
- **AND** its path remains straight through the viewport midpoint before curving

### Requirement: Timeline stories reveal at their path positions
In mobile viewports, each Timeline story SHALL be revealed when the ball reaches its corresponding point on the path.

#### Scenario: Ball reaches a story point
- **WHEN** the ball reaches a Timeline point on a viewport no wider than 768px
- **THEN** that point’s story appears with enough separation from adjacent stories to remain readable
- **AND** entrance animation time alone does not reveal a story before the ball reaches its point

### Requirement: Mobile blackout images animate without cursor input
During the Timeline blackout on mobile viewports, images SHALL appear in fixed upper and lower rows with a repeated, staggered opacity animation, independent of pointer movement. Desktop SHALL retain its prior pointer-following image trail.

#### Scenario: Mobile blackout image rows
- **WHEN** the Timeline enters the Versatility blackout on a viewport no wider than 768px
- **THEN** three images appear in each of two fixed rows at the upper and lower viewport margins after the blackout expands
- **AND** each image repeatedly fades in and out in a staggered sweep without translating
- **AND** the animation stops when the Timeline leaves the blackout

#### Scenario: Mobile image framing
- **WHEN** the mobile blackout image rows run
- **THEN** images occupy the upper and lower viewport margins
- **AND** they do not obscure the Versatility text or either close control

#### Scenario: Reduced motion preference
- **WHEN** the user requests reduced motion on mobile
- **THEN** the images remain visible without opacity animation

#### Scenario: Desktop image trail
- **WHEN** the Timeline enters the Versatility blackout on a viewport wider than 768px
- **THEN** the existing image trail continues to follow pointer movement
- **AND** the mobile image rows remain hidden

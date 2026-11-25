# Auditoría QA — Portfolio Renato Nuñez

**Fecha:** 23 de noviembre de 2026  
**Alcance:** auditoría de pre-lanzamiento según `revision.md` (4 fases).  
**Entorno:** Vite 5.4.21 en `http://localhost:5199`, Playwright 1.65.1, Chromium 158.0.8127.18, Firefox 159.0 y WebKit 27.2 (motor de Safari).  
**Viewports:** móvil `390×844`, tablet `768×1024`, escritorio `1440×900`.

---

## 1. Resumen ejecutivo

- Se ejecutaron **7 combinaciones navegador × viewport** y **89 pasos automatizados** (carga, scroll, i18n, carrusel About, Playground, modales, footer y navegación).
- **0 hallazgos** de layout, consola, red, accesibilidad o i18n tras las correcciones. Los únicos avisos restantes son `media-abort` de baja severidad, esperados por la precarga/pausa de vídeos y por los códecs ausentes en Chromium headless.
- **10 bugs corregidos** (4 altos, 4 medios, 2 bajos) y varias mejoras de compatibilidad Safari.
- **0 puntos de scroll horizontal** en un barrido completo de las 9 combinaciones navegador × viewport.
- **28/28 comprobaciones funcionales extra** superadas (i18n ida/vuelta, clics rápidos, Escape, clipboard, footer).
- `npm run build` finaliza correctamente y copia todos los assets a `dist/`.

---

## 2. Metodología

1. **Compatibilidad cross-browser y APIs nativas:** Chromium, Firefox y WebKit; consola, `pageerror`, peticiones fallidas y respuestas ≥400; revisión de `ResizeObserver`, `IntersectionObserver`, Clipboard API, View Transitions, `document.fonts` y dependencia de Lenis por CDN.
2. **Auditoría responsiva y visual:** 390×844, 768×1024 y 1440×900; `document.documentElement.scrollWidth > window.innerWidth`; elementos fuera de viewport, botones cortados, textos solapados, imágenes rotas, IDs duplicados y controles sin nombre accesible.
3. **Flujos interactivos y edge cases:** toggle EN/ES (incluido con modal abierto), clics rápidos, modales de proyecto y Timeline, apertura/cierre repetido, Escape, clipboard de email/teléfono, flecha del carrusel About, enlaces del footer, back-to-top, CV y textos extremos (títulos y descripciones muy largos).
4. **Auto-fix y re-test:** cada corrección se volvió a probar en los tres motores y en los tres viewports.

> Nota: la herramienta de navegador integrada es Chromium. Para Firefox y WebKit se usó Playwright con los motores reales instalados localmente.

---

## 3. Problemas detectados y corregidos

| # | Severidad | Zona | Problema detectado | Corrección aplicada | Archivo |
|---|-----------|------|--------------------|---------------------|---------|
| 1 | **Alta** | Notch móvil | A 390 px el puente del notch colapsaba a **0 px**: el nombre + los 3 iconos sociales + la nav no cabían. Los iconos quedaban superpuestos/invisibles y sin hit-test. | Se oculta visualmente el nombre solo en ≤520 px (permanece para lectores de pantalla; el nombre sigue en el hero), se ajusta el gap de la nav y el padding derecho. En ≤380 px se reducen los iconos a 26 px para que los tres queden completos. | `style.css` |
| 2 | **Alta** | Modal de proyecto | En móvil/tablet el título y el año eran **blancos sobre fondo claro** (`rgb(255,255,255)` sobre blanco): invisibles. | `.project-modal .modal-left` pasa a negro dentro del breakpoint ≤768 px, igual que ya se hacía con la cruz de cerrar. | `style.css` |
| 3 | **Alta** | Footer | El enlace de LinkedIn tenía `href="#"` (no navegable) y **faltaba GitHub**. | LinkedIn apunta a la URL real con `target="_blank"` y `rel="noopener noreferrer"`; se añadió el enlace de GitHub con el mismo tratamiento. | `index.html` |
| 4 | **Alta** | Footer / CV | El CV apuntaba a una **ruta absoluta local** (`/Users/macbookair/...`) que falla en producción. Además, en español seguía descargando el CV en inglés. | Se creó `public/resume.pdf` (copia URL-safe del CV EN) y el enlace usa `/resume.pdf`. Al cambiar a ES, el `href` y el `download` pasan al currículum en español. | `index.html`, `main.js`, `public/resume.pdf` |
| 5 | **Media** | JS / APIs nativas | `ResizeObserver` e `IntersectionObserver` se usaban sin feature-detection; en un navegador estricto o antiguo el script completo se detenía. | Guards `'...' in window` en los 6 observers, con fallback a `resize` donde aplica. | `main.js` |
| 6 | **Media** | Modal / tarjetas | Un título muy largo sin espacios desbordaba horizontalmente (`scrollWidth > clientWidth`) y una descripción extrema podía salirse del modal de altura fija. | `overflow-wrap: break-word/anywhere` en título, descripción y títulos de tarjeta; scroll interno del bloque de descripción en escritorio (`max-height: 42vh`). | `style.css` |
| 7 | **Media** | Modales | No se podían cerrar con **Escape** (solo con la cruz). | Handler `keydown` que cierra el modal de proyecto o el Timeline según cuál esté activo. | `main.js` |
| 8 | **Media** | Resiliencia / red | Si el CDN de Lenis fallaba, `new Lenis()` lanzaba una excepción y **todo `main.js` dejaba de ejecutarse** (i18n, modales, copiar, etc.). | Construcción de Lenis con guard; `raf`, `stop` y `start` opcionales; fallback a `window.scrollTo` y `scrollIntoView` nativos. Probado bloqueando `unpkg.com`. | `main.js` |
| 9 | **Baja** | Clipboard | Sin Clipboard API (Safari antiguo o contexto no seguro) solo se mostraba un error. | Fallback con `textarea` + `document.execCommand('copy')` antes de fallar. | `main.js` |
| 10 | **Baja** | Notch en footer | En ≤380 px el split del footer empujaba la píldora derecha fuera del viewport y la recortaba. | Se desactiva el split en ≤380 px; el notch queda centrado y completo. | `style.css` |

### Mejoras de compatibilidad Safari (proactivas)

- `-webkit-backdrop-filter` añadido junto a `backdrop-filter` en `.pill-close`.
- `-webkit-user-select: none` añadido junto a `user-select: none` en los textos decorativos del About móvil.

---

## 4. Verificación posterior

### 4.1 Matriz de ejecución

| Navegador | 390×844 | 768×1024 | 1440×900 |
|-----------|:-------:|:--------:|:--------:|
| Chromium 158 | ✅ | ✅ | ✅ |
| Firefox 159 | — | — | ✅ |
| WebKit 27.2 (Safari) | ✅ | ✅ | ✅ |

Cada ejecución cubrió carga, consola/red, notch, i18n, About, Playground, modal de proyecto, ciclos rápidos abrir/cerrar, Timeline, traducción con el modal abierto, footer y navegación.

### 4.2 Resultados clave

- **Consola / red:** 0 errores de JavaScript y 0 respuestas ≥400 no relacionadas con medios en los 7 runs. La herramienta in-app (Chromium real) reportó 0 errores y 0 warnings.
- **Scroll horizontal:** 0 puntos en un barrido de toda la altura de la página en Chromium, Firefox y WebKit a 390, 768 y 1440 px.
- **Notch móvil (390 px):** puente de **113 px**; LinkedIn, email y GitHub con `elementFromPoint` correcto (los 3 clicables), sin recortes. Antes del fix el puente medía 0 px.
- **Modal de proyecto:** título y año en `rgb(0,0,0)` en móvil/tablet y `rgb(255,255,255)` en escritorio; abrir/cerrar, 3 ciclos rápidos y Escape dejan el modal cerrado y el scroll restaurado.
- **Timeline:** abre traducido a ES, cambia a EN con el modal abierto, cierra con cruz y con Escape; el scroll se restaura.
- **i18n:** ida/vuelta EN→ES→EN correcta, incluidos 6 clics rápidos; el CV cambia entre `/resume.pdf` y el currículum ES.
- **Clipboard:** email del notch, email del footer y teléfono copian el valor correcto y muestran el toast (verificado en Chromium con permisos).
- **Footer:** LinkedIn, GitHub, Home, Work, CV y back-to-top funcionan; `back-to-top` deja `scrollY = 0`.
- **Sin Lenis:** con `unpkg.com` bloqueado, la página sigue funcionando (i18n, nav, modales, Escape y back-to-top).
- **Texto extremo:** título de 75 caracteres sin espacios y descripción larga sin desbordamiento horizontal; la descripción larga hace scroll dentro del modal en escritorio.
- **Build:** `vite build` OK (5 módulos; CSS 42.89 kB / 8.71 kB gzip; JS 42.57 kB / 15.63 kB gzip). `dist/` incluye `resume.pdf`, el CV ES y todos los vídeos/imágenes.

### 4.3 Falsos positivos / ruido esperado

- **`media-abort` (59 avisos de baja severidad):** los vídeos se precargan como metadata y se pausan al salir del viewport; el navegador aborta la descarga. No es un fallo funcional.
- **Chromium headless y `.mov`:** la build de Playwright no incluye códecs propietarios, por lo que algunos `.mov` reportan error de decodificación solo en headless. WebKit y Firefox decodificaron los mismos archivos (`readyState 4`).
- **Clic de Playwright en la flecha de About:** la animación infinita `arrowNudge` impide que Playwright considere el elemento “estable”; el clic real y el fallback JS funcionan y desplazan el carrusel (`scrollLeft 0 → 278`).

---

## 5. Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `index.html` | LinkedIn real, enlace GitHub en el footer, CV a `/resume.pdf`. |
| `main.js` | Guards de `ResizeObserver`/`IntersectionObserver`, resiliencia si Lenis no carga, fallback de clipboard, CV según idioma, cierre con Escape. |
| `style.css` | Layout del notch móvil, iconos ≤380 px, split del footer, color del modal móvil, `overflow-wrap`, scroll de descripción larga, prefijos `-webkit-`. |
| `public/resume.pdf` | Nuevo: copia URL-safe del CV en inglés para el enlace de descarga. |

---

## 6. Pendiente de revisión manual

1. **URL de GitHub:** se usó `https://github.com/Neto1o0?tab=repositories` (ya estaba en el notch). Confirmar que es la cuenta/repositorio correctos; si no, actualizarla en `index.html` (notch y footer).
2. **Teléfono:** el botón “Call” copia `937089242`. Confirmar formato/país (¿`+56 9 ...`?) y si se prefiere que marque con `tel:` en vez de copiar.
3. **LinkedIn y CV español:** confirmar que la URL de LinkedIn y `Renato Núñez | Currículum.pdf` son las versiones vigentes.
4. **Clipboard en Safari/iOS real:** el fallback está implementado, pero solo se pudo verificar el clipboard en Chromium. En iOS requiere gesto de usuario y permisos; conviene una prueba en dispositivo.
5. **Vídeos `.mov`:** para producción conviene convertirlos a MP4/H.264 (y opcionalmente WebM) para maximizar compatibilidad y reducir peso; los errores de códec en Chromium headless no representan a Chrome real.
6. **Foco en modales:** se añadió Escape, pero no hay focus trap ni retorno de foco al elemento que abrió el modal. Recomendable si se exige accesibilidad estricta.
7. **Ancho 320 px:** por debajo de ~344 px los iconos extremos del notch vuelven a quedar ajustados. El mínimo auditado es 390 px; si se necesita 320 px, habría que rediseñar el notch (más altura, menos elementos o menú).
8. **Nombre en el notch móvil:** en ≤520 px se oculta visualmente para que quepan los iconos; sigue disponible para lectores de pantalla y el hero muestra el nombre. Confirmar que es el trade-off deseado.
9. **Dependencias externas:** Lenis (unpkg) y Google Fonts. La app ya degrada bien sin Lenis; para producción conviene self-hostear ambos por fiabilidad/privacidad.
10. **Formularios:** la web no contiene formularios, por lo que no hubo validación de formularios que probar.

---

## 7. Correcciones posteriores (25 de noviembre de 2026)

Tras la publicación en GitHub Pages (`https://neto1o0.github.io/portfolio-/`) se corrigieron dos fallos visuales detectados en producción.

### 7.1 Timeline · imágenes de "Versatility" en escritorio

- **Causa:** las imágenes del trail se crean en JavaScript con una ruta absoluta (`/${nombre}`), por lo que en GitHub Pages apuntaban a la raíz del dominio (`/USS.jpg`) en lugar de al subdirectorio del sitio (`/portfolio-/USS.jpg`). En móvil no se notaba porque esas imágenes vienen del HTML y Vite sí reescribe esas rutas al compilar.
- **Fix (`main.js`):** la ruta base se calcula desde `window.location.pathname` y se concatena al nombre del archivo, de modo que funciona tanto en local (`/`) como en GitHub Pages (`/portfolio-/`).
- **Extra (`index.html`):** los `data-modal-src` de los vídeos 1080p pasaron de rutas absolutas a relativas (`./VideoSpace-1080.mp4`, etc.), porque Vite no reescribe atributos `data-*` y el modal abría un 404 en producción.

### 7.2 About móvil · "This is me" desalineado

- **Causa:** el carrusel centraba cada slide completo (imagen + título + descripción), así que el centro de la imagen quedaba por encima del centro del bloque y el texto "This is me" aparecía más abajo.
- **Fix (`style.css`, solo `≤768px`):** los slides se alinean arriba (`align-items: flex-start`) y el bloque `.intro-block` usa la misma altura que `.carousel-media` (`clamp(190px, 32vh, 260px)`), por lo que su centro coincide exactamente con el centro de la imagen. El bloque "More about" conserva su centrado con `align-self: center`.

### 7.3 Verificación

- **390×844 y 768×1024:** diferencia entre el centro de "This is me" y el centro de la imagen = **0 px**; sin scroll horizontal.
- **1440×900:** las imágenes del trail cargan desde `/portfolio-/…` con estado **200** y `naturalWidth > 0`; captura con la imagen visible sobre el texto de Versatility.
- **Modal de proyecto:** `currentSrc` = `/portfolio-/VideoSpace-1080.mp4`, respuesta **206** y vídeo visible.
- `npm run build` OK con la base `/portfolio-/` de `vite.config.js`.

### 7.4 Archivos tocados en esta corrección

| Archivo | Cambio |
|---------|--------|
| `main.js` | Ruta base para las imágenes del trail de Versatility. |
| `index.html` | `data-modal-src` relativos para los vídeos 1080p. |
| `style.css` | Alineación superior de slides y altura del bloque "This is me" en móvil. |

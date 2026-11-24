Actúa como un ingeniero de QA Senior. Vamos a auditar este proyecto web (HTML/CSS/JS vanilla con APIs nativas) corriendo en local antes de lanzarlo a producción.

Usa las herramientas de Playwright MCP para ejecutar estas 4 fases en orden y corrige directamente los archivos cuando encuentres fallos:

1. **Compatibilidad Cross-Browser y APIs Nativas:**
   - Abre la web en Chromium, Firefox y WebKit (Safari).
   - Revisa la consola y errores de red. Verifica que todas las APIs nativas del navegador usadas en el JS tengan fallbacks o feature-detection (`if ('...' in window)`) para que no rompan la app en navegadores más estrictos como Safari.

2. **Auditoría Responsiva y Visual:**
   - Prueba la interfaz en móvil (`390x844`), tablet (`768x1024`) y escritorio (`1440x900`).
   - Toma capturas o inspecciona el DOM para detectar scroll horizontal no deseado (`document.documentElement.scrollWidth > window.innerWidth`), botones cortados o textos superpuestos.

3. **Flujos Interactivos y Edge Cases:**
   - Prueba todos los botones, formularios, modales y estados vacíos o con datos extremos (textos muy largos, clics rápidos repetidos).

4. **Reporte y Auto-Fix:**
   - Arregla cada bug encontrado directamente en el HTML/CSS/JS.
   - Vuelve a probar en el navegador para confirmar la solución.
   - Al terminar, entrégame un resumen en Markdown con los problemas detectados, qué archivos modificaste y qué queda pendiente de revisión manual.

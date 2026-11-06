# Cambios de poderes — 5 de noviembre de 2026

La referencia se recuperó de `assets/js/poder-datos.js` en el commit
`c103451` (HEAD al implementar esta comparación). La última modificación
confirmada de ese archivo era del 10 de agosto de 2026, commit `d12564c`.

- `assets/js/poder-anterior.js`: copia fija de nombres y lecturas anteriores,
  incluidas las transformaciones, con la procedencia completa.
- `assets/js/poder-cambios.js`: comparación por nombre, sin distinguir tildes,
  mayúsculas o espacios sobrantes. Alias confirmado por su misma foto:
  Wolf Silverfang corresponde a Wolf.
- Se comparan cantidades de poder, no puestos del ranking.
- Las lecturas desconocidas no cuentan como cero ni como subida/bajada.
  Un personaje ya existente que recibe poder se marca «Primera lectura».
- Los personajes y formas ausentes de la referencia se marcan «Nuevo» con
  estrella amarilla y resplandor. Se respeta la preferencia de movimiento reducido.
- La referencia permanece fija al recargar o publicar. Para una futura revisión,
  actualizar esta copia con los datos previos antes de editar los poderes,
  junto con la fecha visible en `poder.html` y las versiones de recursos.

Resultado inicial: 137 subidas, 1 bajada, 39 personajes nuevos,
13 primeras lecturas y 14 sin cambios. David Martínez baja de 110 a 65 millones.
Los retirados no se vuelven a incorporar. Las formas se comparan por separado.

Comprobación: `node scripts/test-poder-cambios.cjs` y sintaxis JavaScript.
Las pruebas ejercitan también el renderizado y los filtros con un DOM simulado;
no sustituyen una revisión visual en el navegador.

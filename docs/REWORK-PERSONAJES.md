# Rework de Personajes · 13/09/2026

- Rediseño del archivo con cabecera compacta, resumen global y filtros laterales en ordenador; filtros desplegables en móvil.
- Conservados los 1.440 registros y las modificaciones previas de personajes-datos.js.
- Paginación de 48 personajes, vistas de tarjetas y lista compacta.
- Fichas accesibles con nombre, serie, dueño y notas disponibles, y accesos para consultar la misma serie o dueño.
- Búsqueda por varias palabras, sin distinción de tildes, incluyendo notas.
- Filtros combinables por dueño y serie, indicadores removibles de filtros activos, estados vacíos y reinicio coherente.
- Series agrupadas por texto normalizado (mayúsculas, tildes y espacios); no se fusionan títulos distintos por similitud aproximada.
- Dueños normalizados solo en la interfaz: espacios eliminados y variantes Yisus/Yisuss incluidas en el mismo grupo. Datos de origen sin cambios.
- Orden aleatorio estable entre páginas; registros sin nombre identificable al final en los demás órdenes.
- Estadísticas de resultados en un panel desplegable, sin dependencia de Chart.js ni fuentes externas.
- Exportación CSV de todos los resultados filtrados, con notas y soporte de caracteres españoles.
- Preferencias en una clave propia; Limpiar ya no borra el almacenamiento de otras páginas. Recuperación ante preferencias guardadas inválidas.
- Diálogos con teclado, Escape y foco; atajo Ctrl/⌘+K para buscar.

## Comprobación
Revisión visual a 1280 y 390 px, sin desbordamiento horizontal. Comprobados navegación de páginas, filtros, fichas, vacío de resultados, exportación filtrada (35 personajes) y completa (1.440), búsquedas con/sin tildes, orden aleatorio y conservación de preferencias ajenas. Sin errores de JavaScript.

Cambios locales, sin publicación.

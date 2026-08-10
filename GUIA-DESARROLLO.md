# Guía rápida de Web-Rol

## Dónde está cada cosa

- `index.html`: contenedor principal y reproductor persistente.
- `hub.html`: portada y buscador del RP HUB.
- `assets/css/`: apariencia de las páginas principales.
- `assets/js/`: comportamiento de las páginas principales.
- `*-datos.js`: contenido estructurado que se actualiza con frecuencia.
- Las carpetas temáticas agrupan páginas e imágenes de cada sección.

Fuentes de datos compartidas importantes:

- `personajes-datos.js`: lista general utilizada por Personajes y Equipo Ideal.
- `centro-inazuma-datos.js`: jugadores, equipos y partidos del Centro Inazuma.
- `Hijos Inazuma/hijos-inazuma-datos.js`: familias e hijos.
- `Series/series-datos.js`: biblioteca base de series.

## Qué archivo editar

- Para cambiar colores, tamaños o distribución, abre el archivo correspondiente de `assets/css/`.
- Para cambiar botones, filtros o cálculos, abre el archivo correspondiente de `assets/js/`.
- Para cambiar nombres, fichas o registros, busca primero un archivo `*-datos.js`.
- Para cambiar el texto o la estructura visible, abre el `.html`.

Las páginas principales ya no mezclan todo en un único archivo. El nombre del HTML, CSS y JS coincide para que sea fácil encontrarlos.

Los cambios rápidos realizados desde Series, Centro Inazuma, Posiciones o Equipo Ideal se guardan en el navegador. Cuando una página ofrezca guardar o descargar el archivo de datos, usa esa opción para convertirlos en cambios permanentes del proyecto.

## Añadir una página

1. Incluye idioma, codificación, adaptación móvil, título y descripción en el `<head>`.
2. Comprueba bien la ruta del botón para volver al HUB.
3. Añade texto alternativo a las imágenes que aportan información; usa `alt=""` en las decorativas.
4. Añade la página a la lista del HUB.
5. Prueba la página tanto desde su archivo directo como navegando desde `index.html`.

## Antes de publicar

- Revisa que ningún botón apunte a una página que todavía no existe.
- Comprueba la vista móvil y el teclado.
- Evita duplicar datos dentro del HTML si ya viven en un archivo `*-datos.js`.
- Conserva los archivos de copia solo cuando tengan un propósito claro y no los enlaces desde producción.

# Guía rápida de Web-Rol

El [README](README.md) contiene el mapa completo de carpetas. Las herramientas
locales están en `scripts/` y los informes de mantenimiento en `docs/`.
Para comprobar referencias locales, ejecuta `python scripts/audit_site.py`.

El catálogo `juegos/index.html` utiliza `assets/css/juegos.css` y
`assets/js/juegos.js`. Cada tarjeta indica su estado con `data-status`
(`live`, `dev` o `coming`); los contadores y filtros se calculan a partir de él.
Al añadir una tarjeta, colócala también dentro de la sección de su estado.

## Archivo de Makai

- `makai.html`: centro de villanos, enlazado desde Dragon Ball en el HUB.
- `makai-datos.js`: fichas base; `assets/css/makai.css` y `assets/js/makai.js`:
  apariencia e interacción. Los retratos están en `assets/img/makai/`.
- Permite crear y editar fichas, buscar, filtrar por estado y afiliación,
  exportar/importar copias JSON y descargar el archivo de datos actualizado.
- El guardado local usa `rp-makai-v1`. Las fichas locales prevalecen sobre las
  fichas base con el mismo identificador. Las copias importadas se combinan
  por identificador, con confirmación antes de actualizar registros existentes.
- «Guardar archivo de datos» descarga `makai-datos.js`; sustituye el archivo del
  proyecto para incorporar esos cambios a la web. Los retratos se referencian
  por ruta o URL y no se incluyen en las copias JSON.
- Los estados vitales son `Vivo`, `Muerto` y `Sin confirmar`. La afiliación y el
  nivel de amenaza son campos independientes. No deduzcas pertenencia a la Liga
  simplemente por figurar en Makai.
- Las dos fichas iniciales proceden de «Diseñar don villano» y «Nombrar don de
  recuerdos». Solo se incorporaron datos confirmados por el usuario; las ideas
  propuestas sin aceptación están señaladas como pendientes.

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

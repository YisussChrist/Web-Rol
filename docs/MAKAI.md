# Makai — Centro de villanos

## Contenido inicial

- **Marionette / Taygeta**, «Maestra de los Hilos»: don **Titiritero**,
  control corporal mediante contacto con hilos rojos, sin alterar la mente.
  Se incorpora el retrato aportado en la conversación «Nombrar don de recuerdos».
- **Villana de los recuerdos**: etiqueta provisional para la villana que
  adquiere todos los recuerdos de una persona al clavarle las uñas.
  No se ha asignado un nombre definitivo al don ni al personaje.
- Ciudad **Makai**, con una sección propia para la **Liga de Villanos**.
  No hay miembros confirmados todavía en las fuentes consultadas.

La información procede de las conversaciones «Diseñar don villano» y
«Nombrar don de recuerdos». El estado vital, la afiliación y el nivel de amenaza
no se han inventado. Cada ficha conserva una nota de procedencia.

## Funciones

Búsqueda sin distinción de tildes o mayúsculas, filtros por estado vital y
afiliación, expediente detallado, contadores, creación y edición de fichas,
guardado local, copia JSON, importación que combina por identificador y
exportación del archivo de datos para actualizar el proyecto.

Cada ficha incluye nombre, identidad, título, imagen, estado vital, afiliación,
amenaza, última ubicación, don, explicación, activación, límites, historia y
procedencia. Las imágenes se conservan por referencia y no se empaquetan en
el JSON. El guardado es local al navegador, no una base de datos compartida.

## Comprobaciones

Probado en Edge: las dos fichas base, el retrato, búsqueda y filtros,
estados vacíos, edición y persistencia tras recargar, miembros de la Liga,
creación, tratamiento seguro de texto HTML, exportación JSON/JS, importación
sin duplicar identificadores y rechazo de archivos inválidos.

También se comprobaron la vista móvil de 390 píxeles sin desbordamiento,
el cierre del editor con Escape y la carga dentro del reproductor de
`index.html#route=makai.html`. Comprobación de sintaxis JavaScript y auditoría
de referencias locales sin incidencias. No se ha publicado la página.


## Ampliación del 11 de septiembre de 2026

Añadidas 13 fichas a partir de las imágenes aportadas por el usuario: Zoya
(Revancha), Arlecchino (Repetición), Querehsha (Entumecer), Gal / Farion
(Alcance), Yelan (Desfase), Jane Doe (Punto ciego), Sage (inteligencia artificial),
Bete Noire (sin don), Goetia (sin don), Drunken Goddess (Bar), Sweetheart
(sin don), Kaldea (Mirada ígnea) y Demon Human (Aislamiento).

Zoya figura como jefa de los villanos y abre el expediente inicial. Su liderazgo
se muestra también en la sección de la Liga. Las dos imágenes de Goetia
corresponden a una sola ficha. Se conservan las dos fichas previas: 15 en total.
Los estados vitales no aparecen en las imágenes y permanecen sin confirmar;
no se han asignado afiliaciones individuales no especificadas, salvo Zoya.

Las 13 láminas originales se guardan en assets/img/makai/ con nombres
identificables. Cada expediente permite abrir la imagen completa. La lista
se puede desplazar para mantener accesible el detalle en escritorio y móvil.
Se actualizaron las versiones de recursos para evitar la caché anterior.

Comprobado en Edge: 15 fichas, carga de las 13 imágenes, Goetia sin duplicados,
liderazgo de Zoya, búsqueda sin tildes, conservación de fichas locales anteriores,
edición, cierre con Escape y vista de 390 píxeles sin desbordamiento horizontal.

## Confirmación de estados y Antiquiles

Añadido Antiquiles con Cadenas de Aquiles y su lámina original. Actualizada
la ficha existente de Marionette con la nueva imagen, sin duplicarla.
El usuario confirma que todos están vivos salvo Marionette: 16 fichas,
15 vivos y 1 fallecida. No se ha inventado la causa de su muerte.
La actualización corrige una sola vez los estados de las copias locales
anteriores, conserva las notas propias y permite cambios de estado posteriores.
Comprobados contadores, filtro de fallecidos, imágenes y migración local.

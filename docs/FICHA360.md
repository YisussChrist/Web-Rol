# Ficha 360: edición desde la página

Abre una ficha y pulsa **Editar ficha**. El formulario permite completar o
corregir nombre, alias, edad, género, raza, estado, rol, afiliación, origen,
descripción, retrato y la marca de hijo/a. También incluye los datos propios
del universo: equipo, posición, técnicas, poder, transformaciones y Pokémon.

**Guardar cambios** guarda en ese navegador y actualiza la ficha, la búsqueda
y los filtros. Vaciar un campo lo deja pendiente. **Usar original** vuelve a
heredar ese campo de su fuente, incluso si había un complemento publicado.
Los registros originales no se modifican y el identificador permanece estable
al cambiar el nombre; los homónimos padre/hijo conservan sus claves diferentes.

Las listas se editan con una entrada por línea. Una entrada cuyo nombre no
cambia conserva sus detalles originales; los detalles especializados de una
técnica, transformación o Pokémon se gestionan desde su archivo de origen.
Las familias, relaciones, fechas y crónicas se gestionan desde los accesos
«Abrir archivo» de cada sección.

## Copias y publicación

- **Descargar copia** genera JSON con los complementos publicados y locales.
- **Importar copia** combina los campos de la copia con los existentes; pregunta
  antes de reemplazar valores personalizados diferentes. Valida la copia antes
  de escribir y conserva identidades no disponibles sin crear nuevos personajes.
- **Descargar archivo de datos** genera `ficha360-datos.js`. Para que todos vean
  los cambios, sustituye ese archivo en la raíz del proyecto y publica la web.
  Descargar o guardar en el navegador no publica ni sincroniza entre dispositivos.

El almacenamiento local usa `rp-ficha360-edits-v1`. La prioridad es: cambios
locales, complementos de `ficha360-datos.js`, fuentes originales. Las claves
omitidas heredan; un valor vacío marca pendiente; `null` vuelve al original.
La exportación para publicar elimina las anulaciones `null`, de forma que el archivo publicado
también herede las futuras actualizaciones del original.
Las copias JSON sí conservan estas anulaciones para poder trasladarlas entre navegadores.

El porcentaje usa nombre, edad, género, raza, estado, rol, origen y descripción;
para jugadores añade equipo, posición y elemento; para Dragon Dex añade poder;
para entrenadores añade región y objetivo. Alias y afiliación son opcionales.
«Sin clasificar» y otros marcadores de ausencia no cuentan como datos completos.
Un cero explícito sí cuenta como dato. Los vínculos no afectan al porcentaje.

Fuentes de identidad: Inazuma Central, familias de Inazuma, Dragon Dex y
entrenadores de Etruria. `personajes.html` y `personajes-datos.js` están excluidos.

Verificación: `node scripts/test-ficha360-editor.cjs`.

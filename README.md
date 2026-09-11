# Web-Rol

Colección de webs y herramientas para los universos de rol de Dragon Ball,
Inazuma y Pokémon. La entrada principal es `index.html`, que mantiene el
reproductor musical mientras se navega por el HUB.

## Cómo abrir la web

Desde esta carpeta, ejecuta `python -m http.server 8000` y abre
<http://localhost:8000>. No hace falta compilar las páginas estáticas.
Los servicios del bot y del juego de cartas tienen su propia configuración.

## Mapa de carpetas

| Ubicación | Contenido |
| --- | --- |
| `index.html`, `resonance-shell.*` | Entrada y reproductor persistente |
| `hub.html`, `assets/css/hub.css`, `assets/js/hub.js` | Portada y buscador general |
| `assets/css/`, `assets/js/` | Estilos y lógica separados por página |
| `*-datos.js`, `personajes.json` | Datos de las páginas del directorio principal |
| `makai.html`, `makai-datos.js` | Archivo editable de villanos de Makai y la Liga de Villanos |
| `Pokemon/` | Webs de Etruria, Pokédex, equipos y radio |
| `Hijos/`, `Hijos Inazuma/` | Recursos y página de familias |
| `estadísticas Inazuma/`, `historial/`, `plantillas_inazuma/`, `miximaxes/` | Estadísticas, partidos, alineaciones y miximaxes |
| `Hub/` | Sección de misiones, equipos y canciones; distinta de `hub.html` |
| `InaMarkt/`, `Series/`, `sts/` | Tienda, biblioteca de series y sección STS |
| `juegos/` | Catálogo, Copero, Equipo Ideal, ¿Quién es? y Duelo de Resonancia |
| `OST/`, `music/` | Resonance y archivos de audio |
| `backgrounds/`, `fotos-poderes/`, `Sellos/` | Imágenes compartidas y recursos temáticos |
| `compromised/`, `nintendo_direct_bingo_todas_opciones/`, `rol-app/` | Aplicaciones independientes |
| `DiscordWebBot/` | Bot de Discord y sus dependencias |
| `Mis Cosas/` | Archivos personales auxiliares |
| `scripts/` | Herramientas locales de mantenimiento y traductor de pantalla |
| `docs/` | Auditoría, registro de cambios y capturas de comprobación |
| `.github/workflows/` | Publicación y notificaciones configuradas |

Se conservan los nombres y rutas de las secciones para mantener sus enlaces.
Las copias históricas `OST/backup-before-purple-2026-07-23/` y
`parejasdragonball.antes-rediseño.html`, además de las copias locales
`*.backup-before-*`, se conservan en su ubicación: sus rutas relativas dependen
de ella. No son las versiones activas que se deben editar.

## Mantenimiento

- Consulta [la guía de desarrollo](GUIA-DESARROLLO.md) antes de añadir páginas.
- Ejecuta `python scripts/audit_site.py` para regenerar
  [la auditoría de referencias locales](docs/auditoria-enlaces.json).
- Consulta [los cambios de esta revisión](docs/CAMBIOS-2026-09-07.md).
- Para el juego de cartas, consulta `juegos/ina-cards/README.md` y
  `juegos/ina-cards/server/README.md`.

La auditoría comprueba referencias estáticas `src`, `href`, `poster` de HTML
y `url()` de CSS. Excluye dependencias, copias de seguridad y archivos internos
de Git. No valida servicios externos, rutas generadas en JavaScript,
fragmentos de página ni las reglas de cada juego.

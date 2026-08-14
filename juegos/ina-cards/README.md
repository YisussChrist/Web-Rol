# Inazuma: Duelo de Resonancia

Primera base jugable del juego de cartas para dos personas.

## Qué incluye

- Salas privadas mediante un código de seis caracteres.
- Partidas sincronizadas y validadas por un servidor de Cloudflare.
- Modo de prueba local para jugar los dos turnos en un mismo dispositivo.
- Doce cartas iniciales, con buffs, debuffs y cuatro versiones mejoradas.
- Reglas, cartas y apariencia separadas para poder modificarlas sin rehacer todo.

## Dónde cambiar cada parte

- `cards.js`: personajes, costes, efectos, textos y versiones mejoradas.
- `engine.js`: reglas y resolución de turnos.
- `styles.css`: diseño visual para PC y móvil.
- `config.js`: dirección pública del servidor de partidas.
- `server/`: servidor gratuito de Cloudflare.

## Estado actual

El modo local funciona sin configurar nada. Para crear salas online hay que publicar una vez el
servidor de `server/` y pegar su dirección en `config.js`.

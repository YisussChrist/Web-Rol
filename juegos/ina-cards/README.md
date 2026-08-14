# Inazuma: Duelo de Resonancia

Primera base jugable del juego de cartas para dos personas.

## Qué incluye

- Salas privadas mediante un código de seis caracteres.
- Partidas sincronizadas y validadas por un servidor de Cloudflare.
- Modo de prueba local para jugar los dos turnos en un mismo dispositivo.
- Veinticinco cartas: seis iniciales y diecinueve desbloqueables mediante desafíos.
- Afinidades, talentos de descarte, buffs, debuffs y entrenadores aleatorios.
- Reglas, cartas y apariencia separadas para poder modificarlas sin rehacer todo.

## Dónde cambiar cada parte

- `cards.js`: personajes, costes, efectos, textos y versiones mejoradas.
- `engine.js`: reglas y resolución de turnos.
- `styles.css`: diseño visual para PC y móvil.
- `config.js`: dirección pública del servidor de partidas.
- `server/`: servidor gratuito de Cloudflare.

## Estado actual

El modo local y las salas online están operativos. El servidor está publicado en Cloudflare y su
dirección ya está configurada en `config.js`. El juego está abierto como primera Beta; la historia,
las versiones despertadas, el equilibrio definitivo y el diseño visual continúan en construcción.

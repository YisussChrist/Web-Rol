# Servidor de partidas

Este servidor usa Cloudflare Workers y Durable Objects. Cada sala tiene un estado privado y el
servidor comprueba de quién es el turno, qué cartas tiene cada jugador y si una jugada es válida.

## Servidor publicado

La versión de producción está disponible en:

`https://ina-duelo-resonancia.web-rol-yisuss.workers.dev`

Para publicar futuras actualizaciones desde esta carpeta:

1. Instalar las dependencias con `npm install`.
2. Validar el paquete con `npx wrangler deploy --dry-run`.
3. Publicar con `npm run deploy` o mediante la integración de Cloudflare.

Las salas usan WebSockets hibernables, se guardan en un Durable Object independiente y caducan
automáticamente tras 24 horas sin actividad.

No se guardan contraseñas ni secretos dentro del repositorio. El acceso de cada jugador a una sala
se genera automáticamente al crearla o unirse.

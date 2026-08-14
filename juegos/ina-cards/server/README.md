# Servidor de partidas

Este servidor usa Cloudflare Workers y Durable Objects. Cada sala tiene un estado privado y el
servidor comprueba de quién es el turno, qué cartas tiene cada jugador y si una jugada es válida.

## Publicación inicial

1. Iniciar sesión en una cuenta de Cloudflare.
2. Instalar las dependencias de esta carpeta.
3. Publicar el Worker.
4. Copiar la dirección terminada en `workers.dev` dentro de `../config.js`.

No se guardan contraseñas ni secretos dentro del repositorio. El acceso de cada jugador a una sala
se genera automáticamente al crearla o unirse.

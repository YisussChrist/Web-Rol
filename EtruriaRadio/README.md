# Etruria Radio

Reproductor estático para el rol de Pokémon de la región de Etruria. Se puede alojar directamente en GitHub Pages y no necesita instalar ni compilar nada.

## Añadir canciones

1. Guarda el MP3 en `audio/`.
2. Guarda la portada en `img/`.
3. Abre `data.js`.
4. Copia el bloque de ejemplo que hay dentro de `characters` y cambia sus datos.
5. En `station` usa `route`, `city`, `league` o `mystery`.

El formato sigue la misma organización que Resonance: cada personaje contiene su lista `tracks`, y la lista general se genera automáticamente.

## Publicar

La página de entrada es `index.html`. Al estar dentro de `Web-Rol/EtruriaRadio`, GitHub Pages podrá servirla como una carpeta más del sitio existente.

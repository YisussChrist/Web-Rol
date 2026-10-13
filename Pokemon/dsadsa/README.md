# PokéDamage

Calculadora estática de Pokémon para Etruria y randomlockes. Abrir `index.html` o servir el repositorio con cualquier servidor estático. No necesita instalación ni compilación para utilizarse.

## Motor y datos

Usa **@smogon/calc 0.12.0**, con reglas de generación 9, distribuido bajo MIT. Los dos archivos de `vendor/` son copias sin modificaciones de `dist/data/production.min.js` y `dist/production.min.js` del paquete oficial:

- Paquete: https://registry.npmjs.org/@smogon/calc/-/calc-0.12.0.tgz
- Código y documentación: https://github.com/smogon/damage-calc
- Licencia: `vendor/LICENSE-smogon.txt`.

El catálogo incluye 583 objetos, 942 movimientos y 320 habilidades. Incluye datos históricos para formas y reglas mixtas; su presencia no implica que un Pokémon, objeto o movimiento sea legal en Escarlata/Púrpura. Los datos de cálculo funcionan sin conexión tras cargar la página; las ilustraciones de Pokémon Showdown son opcionales y requieren red.

## Funcionamiento

- Cargar un movimiento oficial conserva efectos como potencia variable, daño fijo, contacto, multigolpe y estadísticas alternativas.
- Editar sus datos activa el modo manual, sin heredar los efectos especiales del movimiento anterior. En ese modo se configuran potencia, tipo, categoría, contacto, etiqueta, efecto secundario y ataque de área.
- Las naturalezas afectan a las seis estadísticas según las reglas del juego. Los cambios de Ataque/Ataque Especial y Defensa/Defensa Especial se configuran en sus filas respectivas.
- Los tipos de los Pokémon son editables. STAB y el contacto con el suelo se calculan a partir de tipos, habilidades, objetos, Tera y Gravedad.
- Habilidades condicionales como Absorbe Fuego se activan explícitamente; las habilidades ligadas a PS utilizan los PS actuales. `0` representa vida completa.
- Los objetos por tipo, bayas, Mineral Evolutivo y objetos exclusivos de especies se resuelven mediante el motor. Los objetos sin efecto sobre el daño directo pueden no cambiar el rango.
- La configuración se guarda solo en `localStorage`, bajo `pokedamage-v2`. Modificarla marca el resultado como pendiente hasta recalcular. «Cargar ejemplo» reinicia los controles al combate Charizard contra Scizor.

## Alcance del resultado

Se muestran los extremos del daño directo y los PS restantes. Para un golpe único, la probabilidad de KO se cuenta sobre los valores aleatorios del motor, incluyendo Banda Focus, Robustez y la probabilidad de supervivencia de Cinta Focus. El rango de potencia del golpe no se recorta al activar estos efectos de supervivencia.

Los ataques multigolpe muestran el rango total, pero no una probabilidad de KO. Recuperación, retroceso, estados al final del turno, trampas de entrada y recuperación entre impactos no se incorporan a los PS restantes. No se presenta un 2HKO como garantizado ignorando esos efectos. El desglose en inglés procede del motor y puede incluir sus propias estimaciones de turnos.

Los ataques Z se conservan como escenarios de reglas mixtas junto a las reglas modernas; no están disponibles en Escarlata/Púrpura. La interfaz no simula turnos completos, legalidad de equipos, Alquitranazo ni la adición de un tercer tipo mediante Halloween o Condena Silvana. Para Respiro se puede retirar manualmente el tipo Volador del defensor.

## Verificación

Con Node.js, Playwright y un navegador compatible:

```text
node scripts/test-pokedamage.cjs
```

El script está en la raíz del repositorio. Usa Edge por defecto; `POKEDAMAGE_BROWSER` permite elegir otro canal de Playwright. `POKEDAMAGE_SCREENSHOTS` puede apuntar a una carpeta existente para guardar capturas de escritorio y móvil.

Las pruebas cargan la página local con acceso remoto bloqueado y cubren inmunidades, críticos, naturalezas, objetos, bayas, efectos de supervivencia, multigolpe, modo manual, ataques Z, validación de estadísticas, persistencia y ausencia de desbordamiento de página a 1024, 390 y 320 píxeles.

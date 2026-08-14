/*
 * INAMARKT — DATOS EDITABLES DEL MERCADO
 *
 * Esta es la fuente de los factores manuales de InaMarkt. La pestaña
 * «Administrar» permite editarla sin tocar el texto a mano.
 *
 * Los jugadores que no aparezcan en profiles usan valores neutrales. Si ya
 * poseen Talento, Espíritu Guerrero, Armadura o Miximax en Inazuma Central,
 * InaMarkt les asigna provisionalmente el nivel 3 (o dominio 2 en Armadura)
 * hasta que el administrador lo revise.
 */
window.INAMARKT_DATA = {
  version: 2,
  lastUpdate: "2026-08-14",
  currency: "EUR",
  passwordHash: "acdcd41b19395b7d3681664310fe85a01d52b89992cf646b63696ab905d66a80",
  profiles: {
    /*
     * Ejemplo de ficha editable:
     * "renzu-ito": {
     *   talentTier: 4,
     *   spiritTier: 4,
     *   armorTier: 0,
     *   miximaxTier: 4,
     *   narrativeScore: 5,
     *   narrativeReason: "Eje central del arco actual.",
     *   clubRole: "key",
     *   performance: "excellent",
     *   injury: "none",
     *   contract: "long",
     *   demand: 4,
     *   rumor: 2,
     *   change: 2500000,
     *   manualValue: null
     * }
     */
  },
  transfers: [
    /*
     * { playerId: "renzu-ito", from: "Raimon", to: "Universal",
     *   type: "Traspaso", fee: 22000000, date: "2026-08-13" }
     */
  ],
  teamColors: {
    "Raimon": "#f1ad18",
    "Universal": "#7548dd",
    "Galaxia": "#1167f3",
    "Espejismo": "#2d9e9b",
    "Alpino": "#48aee8",
    "Lyon": "#d84255",
    "Olimpique Lyonnais": "#d84255",
    "Future Raimon": "#ef7a31",
    "Agente Libre": "#77849a"
  }
};

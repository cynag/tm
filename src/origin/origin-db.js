export const OriginDB = [
  {
    id: "nobre",
    name: "Nobre",
    img: "systems/tm/assets/origin/nobre.webp",
    description: "Você cresceu entre os privilégios da aristocracia ou da elite dominante.",
    origin_effect_script: `async function(actor) {
      actor.system.player_letality += 100;
      actor.system.player_virtue += 100;
    }`
  },
  {
    id: "batedor",
    name: "Batedor",
    img: "systems/tm/assets/origin/batedor.webp",
    description: "Você foi treinado para se mover rápido, detectar perigos e sobreviver em território hostil.",
    origin_effect_script: `async function(actor) {
      actor.system.player_dexterity += 100;
      actor.system.player_impulse += 100;
    }`
  }
];

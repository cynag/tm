export const EffectsDB = [

  {
    id: "cego",
    name: "Cego",
    effect: ["@{player_reflex}==@{player_reflex}/2",
            "@{player_movement}==@{player_movement}/2"],
    description: "Não enxerga. Não distingue aliados. –2d6 em ataques. REF e MOV pela metade",
    duration: 3,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/blind.webp"
  },
  {
    id: "mudo",
    name: "Mudo",
    effect: "",
    description: "Não pode falar. Impede conjuração com componente verbal.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/silence.webp"
  },
  {
    id: "atordoado",
    name: "Atordoado", 
    effect: ["@{player_pa_max}==@{player_pa_max}/2",
            "@{player_reflex}==@{player_reflex}/2"],
    description: "PA e REF pela metade. Não pode fazer reações.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/stunned.webp"
  },
  {
    id: "enfeitiçado",
    name: "Enfeitiçado",
    effect: "",
    description: "Não pode agir contra quem o enfeitiçou. Esse alvo tem vantagem.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/charmed.webp"
  },
  {
    id: "apavorado",
    name: "Apavorado",
    effect: "@{player_movement}==@{player_movement}/2",
    description: "MOV pela metade. –1d6 em ataques. Resistências com desvantagem. Se falhar de novo, vira Pânico.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/fear_1.webp"
  },
  {
    id: "panico",
    name: "Pânico",
    effect: "@{player_movement}==2",
    description: "MOV 2m. –1d6 em ataques. Resistências com desvantagem. Não se aproxima da fonte do medo. Essa fonte tem vantagem.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/fear_2.webp"
  },
  {
    id: "sufocado",
    name: "Sufocado",
    effect: [
  "-3 @{player_movement}",
  "-3 @{player_reflex}",
  "@{token_vision}==8"],
    description: "–3 MOV e REF. Visão reduzida a 8m. Se falhar de novo, vira Asfixiado.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/choked_2.webp"
  },
  {
    id: "asfixiado",
    name: "Asfixiado",
    effect: [
    "-6 @{player_movement}",
    "-6 @{player_reflex}",
    "@{token_vision}==3"],
    description: "–6 MOV e REF. Resistências com desvantagem. Visão a 3m. –1d6 em ataques. Se falhar de novo, desmaia.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/choked_1.webp"
  },
  {
    id: "inconsciente",
    name: "Inconsciente",
    effect: "@{player_reflex}==0",
    description: "Desacordado. REF = 0. +3d6 em ataques sofridos. Críticos causam mutilação.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/fallen.webp"
  },
  {
    id: "prostrado",
    name: "Prostrado",
    effect: "@{player_reflex}==2",
    description: "Caído. REF = 2. –1d6 em ataques. +1d6 em ataques recebidos. Levantar custa 6 PA.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/fallen.webp"
  },
  {
    id: "dominado",
    name: "Dominado",
    effect: "",
    description: "Sem vontade. –1d6 em ataques. Resistências com desvantagem.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/dominated.webp"
  },
  {
    id: "imobilizado",
    name: "Imobilizado",
    effect: "@{player_reflex}==@{player_reflex}/2",
    description: "Sem movimento. REF pela metade. +2d6 em ataques sofridos.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/imobilized.webp"
  },
  {
    id: "paralisado",
    name: "Paralisado",
    effect: "@{player_reflex}==0",
    description: "Não pode agir nem mover. REF = 0. +4d6 em ataques sofridos.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/paralised.webp"
  },
  {
    id: "exposto",
    name: "Exposto",
    effect: "",
    description: "+1d6 em ataques sofridos.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/exposed.webp"
  },
  {
    id: "perturbado",
    name: "Perturbado",
    effect: "",
    description: "–1d6 em ataques. Perde concentrações.",
    duration: 1,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/apavored.webp"
  },
  {
    id: "desgastado",
    name: "Desgastado",
    effect: [
    "-1 @{mod_arcana}",
    "-1 @{mod_erudition}",
    "-1 @{mod_virtue}"],
    description: "–1 em ARC, ERU e VIR.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/outworn.webp"
  },
  {
    id: "desmoralizado",
    name: "Desmoralizado",
    effect: [
  "-1 @{mod_letality}",
  "-1 @{mod_dexterity}",
  "-1 @{mod_impulse}"],
    description: "–1 em LET, DES e IMP.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/desmoralized.webp",
    stackable: true,
  },
  {
    id: "confuso",
    name: "Confuso",
    effect: "",
    description: "No início do turno: 1-2 age normal, 3-4 ataca o mais próximo, 5-6 perde o turno.",
    duration: 1,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/placeholder.webp"
  },
  {
    id: "flanqueando",
    name: "Flanqueando",
    effect: "",
    description: "+1d6 no ataque contra alvo flanqueado.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/placeholder.webp"
  },
  {
    id: "retaguarda",
    name: "Retaguarda",
    effect: "",
    description: "+2d6 no ataque contra alvo desprevenido por trás.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/placeholder.webp"
  },
  {
    id: "preparado",
    name: "Preparado",
    effect: "+2 @{player_reflex}",
    description: "+2 REF.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/222.webp"
  }
,
  {
    id: "test",
    name: "test",
    effect: "+1 @{player_movement}",
    description: "+2 REF.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/222.webp"
  }
];

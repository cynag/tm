export const EffectsDB = [

  {
  id: "sufocado",
  name: "Sufocado",
  effects: [
    "-2 @{player_reflex}",
    "-2 @{mod_letality}"
  ],
  description: "–2 em ataques e Reflexo. Após 1 rodada, se reaplicado, torna-se Asfixiado.",
  duration: 1,
  effect_type: "rf",
  img: "systems/tm/styles/assets/effects/1a.webp"
}
,
  {
    id: "asfixiado",
    name: "Asfixiado",
    effect: "-3 @{mod_reflex}",
    description: "Não respira. Metade dos PA e REF. –1d6 em ataques. Após 2 turnos, testa RF com desvantagem ou desmaia.",
    duration: 2,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/asfixiado.webp"
  },
  {
    id: "cegueira_parcial",
    name: "Cegueira Parcial",
    effect: "-1 @{mod_reflex}",
    description: "–1d6 em ataques, –2 REF, movimento custa o dobro.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/cegueira-parcial.webp"
  },
  {
    id: "cegueira_total",
    name: "Cegueira Total",
    effect: "-6 @{mod_reflex}",
    description: "–2d6 em ataques, –6 REF. Não reconhece aliados. Movimento exige teste de DES.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/cegueira-total.webp"
  },
  {
    id: "constringido",
    name: "Constringido",
    effect: "-4 @{mod_reflex}",
    description: "–4 REF, –1d6 ataques, –4 dano. Sem movimento.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/constringido.webp"
  },
  {
    id: "imobilizado",
    name: "Imobilizado",
    effect: "-999 @{mod_reflex}",
    description: "Não pode se mover ou sair do chão. Reflexo = 0. Críticos se tornam mutilação. (1 rodada)",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/imobilizado.webp"
  },
  {
    id: "prostrado",
    name: "Prostrado",
    effect: "-6 @{mod_reflex}",
    description: "Caído. –6 REF, –2d6 em ataques. Vulnerável a corpo a corpo.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/prostrado.webp"
  },
  {
    id: "exposto",
    name: "Exposto",
    effect: "-2 @{mod_reflex}",
    description: "–2 REF, sem reações defensivas.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/exposto.webp"
  },
  {
    id: "desorientado",
    name: "Desorientado",
    effect: "-2 @{pa_max}",
    description: "Perde 2 PA e não pode fazer reações.",
    duration: 1,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/desorientado.webp"
  },
  {
    id: "apavorado",
    name: "Apavorado",
    effect: "-2 @{mod_reflex}",
    description: "–2m movimento, –25% em perícia/conhecimento, –2 REF.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/apavorado.webp"
  },
  {
    id: "amedrontado",
    name: "Amedrontado",
    effect: "-4 @{mod_reflex}",
    description: "–4m movimento, –50% em perícia/conhecimento, –4 REF.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/amedrontado.webp"
  },
  {
    id: "atordoado",
    name: "Atordoado",
    effect: "-2 @{mod_reflex}",
    description: "Metade dos PA, –2 REF. Sem reações.",
    duration: 1,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/atordoado.webp"
  },
  {
    id: "desgastado",
    name: "Desgastado (x)",
    effect: "-1 @{arcana}",
    description: "–1 em ARC, ERU, VIR. Cumulativo.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/desgastado.webp"
  },
  {
    id: "desmoralizado",
    name: "Desmoralizado (x)",
    effect: "-1 @{letality}",
    description: "–1 em LET, DES, IMP. Cumulativo.",
    duration: null,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/desmoralizado.webp"
  },
  {
    id: "perturbado",
    name: "Perturbado",
    effect: "+2 @{pa_cost}",
    description: "Próxima ação custa +2 PA.",
    duration: 1,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/perturbado.webp"
  },
  {
    id: "desfocado",
    name: "Desfocado",
    effect: "-3 @{mod_ataque}",
    description: "–3 em ataques.",
    duration: 1,
    effect_type: "rm",
    img: "systems/tm/styles/assets/effects/desfocado.webp"
  },
  {
    id: "em_chamas",
    name: "Em Chamas",
    effect: "1d6 @{fire_damage}",
    description: "Sofre 1d6 de dano no início e fim do turno. Pode apagar com ação padrão.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/em-chamas.webp"
  },
  {
    id: "sangrando",
    name: "Sangrando",
    effect: "1d4 @{bleed_damage}",
    description: "Sofre 1d4 de dano físico por turno. –2 REF. Não regenera PV por descanso.",
    duration: null,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/sangrando.webp"
  },
  {
    id: "preparado",
    name: "Preparado",
    effect: "+2 @{mod_reflex}",
    description: "+2 REF.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/preparado.webp"
  },
  {
    id: "flanqueando",
    name: "Flanqueando",
    effect: "+1 @{bonus_attack}",
    description: "+1d6 no ataque contra alvo flanqueado.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/flanqueando.webp"
  },
  {
    id: "retaguarda",
    name: "Retaguarda",
    effect: "+2 @{bonus_attack}",
    description: "+2d6 no ataque contra alvo desprevenido por trás.",
    duration: 1,
    effect_type: "rf",
    img: "systems/tm/styles/assets/effects/retaguarda.webp"
  }

];

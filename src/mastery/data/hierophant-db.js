const HierophantDB = [

  {
    id: "hierophant_1A",
    mastery_name: "Estocada Perfeita",
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",
    //mastery_desc: 6,
    mastery_nd: 1,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    //mastery_auto_hit: false,
    mastery_range: "weapon_range",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1A.webp",
    mastery_description: `Você desfere uma estocada centrada nos pontos mais vulnerá-veis do inimigo, mirando brechas entre placas ou falhas na guarda. Ao acertar o golpe, ignore -2/NDi de proteção do alvo. Se o alvo estiver sofrendo qualquer penalidade física (que necessite de um teste de RF para resistir), você recebe +1d6/NDi na rolagem de ataque. `,
    //mastery_limitation: " ",
    mastery_requirements: [
      { subtype: ["spear", "sword"] }
    ],
    weapon_attack_bonus: "if[target|has_physical_effect:true,+1d6/NDi,0]",
    //weapon_attack_bonus_2: "",
    //weapon_damage_bonus: "",
    //weapon_damage_bonus_2: "",
    weapon_extra: "target.prot = -2/NDi",

    evolution_a: {
    id: "hierophant_1B",
    mastery_name: "Estocada Cirúrgica",
    maestry_points_value: 1,
    mastery_type: "action",
    mastery_class: "melee",
    mastery_range: "weapon_range",
    mastery_roll_type: "mastery-melee-attack",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1B.webp",
    mastery_description: "Passa a ignorar -3/NDi pontos de armadura.",
    mastery_cost: 4,
    mastery_cd: 3,
    weapon_attack_bonus: "if[target|has_physical_effect:true,+1d6/NDi,0]",
    weapon_extra: "target.prot = -3/NDi",
  },
  evolution_b: {
    id: "hierophant_1C",
    mastery_name: "Estocada Sanguinária",
    maestry_points_value: 1,
    mastery_type: "action",
    mastery_class: "melee",
    mastery_range: "weapon_range",
    mastery_roll_type: "mastery-melee-attack",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1C.webp",
    mastery_description: "Se acertar, o alvo deve resistir à um teste de RF contra ‘exposto’.",
    mastery_cost: 4,
    mastery_cd: 3,
    weapon_attack_bonus: "if[target|has_physical_effect:true,+1d6/NDi,0]",
    //weapon_attack_bonus_2: "",
    //weapon_damage_bonus: "",
    //weapon_damage_bonus_2: "",
    weapon_extra: "target.prot = -2/NDi",
  }
  },
    {
    id: "hierophant_2A",
    mastery_name: "Postura do Sol",
    mastery_type: "posture",
    mastery_class: "melee",
effect: [
  "if[actor|player_domain_hierophant_level:1,+2/NDi,0] @{player_damage_bonus.sword}",
  "if[actor|player_domain_hierophant_level:1,+2/NDi,0] @{player_damage_bonus.spear}"
]

,
    duration: null,
    mastery_roll_type: "mastery-melee-attack",
    mastery_nd: 1,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 1,
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/2a.webp",
    mastery_description: `Você eleva sua lâmina acima da cabeça, em posição agressiva. Enquanto mantiver esta postura, você ganha +2/NDi de dano extra com armas. Além disso, ao entrar nesta postura, seu próximo ataque recebe +1d6 de dano, +1m de alcance, e move você 1 metro para frente (se possível). Se atingir um alvo, ele é forçado a recuar 1 metro.`,
    has_roll: false,

        evolution_a: {
    id: "hierophant_2B",
    mastery_name: "Postura da Estrela",
    mastery_type: "posture",
    mastery_class: "melee",
    effect: [
  "-2 @{mod_dexterity}",
  "@{player_reflex}==@{player_reflex}/2"
  ],
    duration: null,
    mastery_roll_type: "mastery-melee-attack",
    mastery_nd: 1,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 1,
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/2b.webp",
    mastery_description: `Você eleva sua lâmina acima da cabeça, em posição agressiva. Enquanto mantiver esta postura, você ganha +2/NDi de dano extra com armas. Além disso, ao entrar nesta postura, seu próximo ataque recebe +1d6 de dano, +1m de alcance, e move você 1 metro para frente (se possível). Se atingir um alvo, ele é forçado a recuar 1 metro.`,
    has_roll: false,
  },
  evolution_b: {
    id: "hierophant_3C",
    mastery_name: "Postura da Luz",
    mastery_type: "posture",
    mastery_class: "melee",
    effect: [
  "-2 @{mod_dexterity}",
  "@{player_reflex}==@{player_reflex}/2"
  ],
    duration: null,
    mastery_roll_type: "mastery-melee-attack",
    mastery_nd: 1,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 1,
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/2a.webp",
    mastery_description: `Você eleva sua lâmina acima da cabeça, em posição agressiva. Enquanto mantiver esta postura, você ganha +2/NDi de dano extra com armas. Além disso, ao entrar nesta postura, seu próximo ataque recebe +1d6 de dano, +1m de alcance, e move você 1 metro para frente (se possível). Se atingir um alvo, ele é forçado a recuar 1 metro.`,
    has_roll: false,
  }   
  },




  
  {
    id: "hierophant_3A",
    mastery_name: "escalonavel",
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",
    mastery_nd: 2,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: "weapon_range",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1A.webp",
    mastery_description: `Você desfere uma estocada centrada nos pontos mais vulneráveis do inimigo, mirando brechas entre placas ou falhas na guarda. Se acertar o golpe, ignora 2 de proteção do alvo e causa 1d6 + 1d6/2ND de dano adicional. Se o alvo estiver sofrendo qualquer penalidade física (que necessita de um teste de RF para evitar), você recebe +1/ND na rolagem de ataque.`,
    mastery_limitation: " ",
    mastery_requirements: [
      { subtype: ["spear", "sword"] }
    ],
    weapon_attack_bonus: "",
    weapon_attack_bonus_2: "",
    weapon_damage_bonus: "+100/ND",
    weapon_damage_bonus_2: "+100/ND",
    weapon_extra: "target.reflex =-2",
  },
      {
    id: "hierophant_4A",
    mastery_name: "condicional",
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",
    mastery_nd: 3,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: "weapon_range",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1A.webp",
    mastery_description: `Você desfere uma estocada centrada nos pontos mais vulneráveis do inimigo, mirando brechas entre placas ou falhas na guarda. Se acertar o golpe, ignora 2 de proteção do alvo e causa 1d6 + 1d6/2ND de dano adicional. Se o alvo estiver sofrendo qualquer penalidade física (que necessita de um teste de RF para evitar), você recebe +1/ND na rolagem de ataque.`,
    mastery_limitation: " ",
    mastery_requirements: [
      { subtype: ["spear", "sword"] }
    ],
    weapon_attack_bonus: "+1d12",
    weapon_attack_bonus_2: "",
    weapon_damage_bonus: "",
    weapon_damage_bonus_2: "",
    weapon_extra: "target.reflex =-2",
  },

];

for (const m of HierophantDB) {
  m.mastery_domain = "hierophant";
}

export const domainHierophant = HierophantDB;

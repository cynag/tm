const FireDB = [

  {
    id: "fire_1A",
    mastery_name: "Magia bonus fixos",
    mastery_type: "action",
    mastery_class: "magic",
    mastery_roll_type: "mastery-magic-attack",
    mastery_nd: 1,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 6,
    mastery_auto_hit: false,
    mastery_targets: 2, //se for ilimitado colocar "all"
    mastery_img: "systems/tm/styles/assets/masterys/fire/1a.webp",
    mastery_description: `...`,
    mastery_attack_formula: "default",
    mastery_damage_formula: "1d4",
    mastery_element: "fire",
    spell_attack_bonus: "+100",
    spell_attack_bonus_2:"+100",
    spell_damage_bonus: "+999",
    spell_damage_bonus_2: "+999",
    spell_extra: ""
  },
    {
    id: "fire_2A",
    mastery_name: "Magia bonus em dados",
    mastery_type: "action",
    mastery_class: "magic",
    mastery_roll_type: "mastery-magic-attack",
    mastery_nd: 2,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 6,
    mastery_auto_hit: false,
    mastery_targets: 2, //se for ilimitado colocar "all"
    mastery_img: "systems/tm/styles/assets/masterys/fire/1a.webp",
    mastery_description: `...`,
    mastery_attack_formula: "default",
    mastery_damage_formula: "1d4",
    mastery_element: "fire",
    spell_attack_bonus: "+1d6",
    spell_attack_bonus_2:"+1d4",
    spell_damage_bonus: "+1d8",
    spell_damage_bonus_2: "+1d2",
    spell_extra: ""
  },
    {
    id: "fire_3A",
    mastery_name: "Magia bonus em dados com condição",
    mastery_type: "action",
    mastery_class: "magic",
    mastery_roll_type: "mastery-magic-attack",
    mastery_nd: 3,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 6,
    mastery_auto_hit: false,
    mastery_targets: 2, //se for ilimitado colocar "all"
    mastery_img: "systems/tm/styles/assets/masterys/fire/1a.webp",
    mastery_description: `...`,
    mastery_attack_formula: "default",
    mastery_damage_formula: "1d4",
    mastery_element: "fire",
    spell_attack_bonus: "+1d12/ND", // +1D12 A CADA NIVEL DE DOMINIO
    spell_attack_bonus_2:"+3/NDp", // +3 A CADA NIVEL DE DOMINIO PAR (2,4,6,8,10...)
    spell_damage_bonus: "+1d8/NDi", // +1D8 A CADA NIVEL DE DOMINIO IMPAR (1,3,5,7,9...)
    spell_damage_bonus_2: "+1d2/NP", //+1D2 A CADA NIVEL DE PERSONAGEM "s.player_level"
    spell_extra: ""
  },
];

for (const m of FireDB) {
  m.mastery_domain = "fire";
}

export const domainFire = FireDB;

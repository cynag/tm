const FireDB = [

  {
    id: "fire_1A",
    mastery_name: "Magia bonus fixos",
    mastery_type: "action",
    mastery_class: "magic",
    mastery_roll_type: "mastery-magic-attack",
    mastery_nd: 1,
    mastery_desc: 1,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 6,
    mastery_arcane_type: "fire",
    mastery_arcane_charges: 2,
    mastery_auto_hit: false,
    mastery_targets: 2, //se for ilimitado colocar "all"
    mastery_img: "systems/tm/styles/assets/masterys/fire/1a.webp",
    mastery_description: `...`,
    mastery_attack_formula: "default",
    mastery_damage_formula: "1d4",
    mastery_element: "fire",
    spell_attack_bonus: "+1",
    spell_attack_bonus_2:"",
    spell_damage_bonus: "",
    spell_damage_bonus_2: "",
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
    spell_attack_bonus: "+1d12/NDi",
    spell_attack_bonus_2:"+1d4/NDi",
    spell_damage_bonus: "+1d8/NDi",
    spell_damage_bonus_2: "+1d2/NDi",
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
    mastery_damage_type: "ironbreaker", //ou piercing ou ironbreaker
    spell_attack_bonus: "",
    spell_attack_bonus_2: "",
    spell_damage_bonus: "", 
    spell_damage_bonus_2: "", 
    spell_extra: "target.reflex =-2",
  },
      {
    id: "fire_4A",
    mastery_name: "Magixx",
    mastery_type: "action",
    mastery_class: "magic",
    mastery_roll_type: "mastery-magic-attack",
    mastery_nd: 4,
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
    spell_attack_bonus: "+1d12/NDp", // +1D12 A CADA NIVEL DE DOMINIO impar
    spell_attack_bonus_2: "+1d12/NDp", // +1D12 A CADA NIVEL DE DOMINIO impar
    spell_damage_bonus: "+1d12/NDp", // +1D12 A CADA NIVEL DE DOMINIO impar
    spell_damage_bonus_2: "+1d12/NDp", // +1D12 A CADA NIVEL DE DOMINIO impar
    spell_extra: ""
  },
];

for (const m of FireDB) {
  m.mastery_domain = "fire";
}

export const domainFire = FireDB;

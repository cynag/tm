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
    mastery_name: "Clarão Eterno",
    mastery_type: "conjuration",
    mastery_class: "magic",
    effect: [
  "-2 @{mod_dexterity}",
  "@{player_reflex}==@{player_reflex}/2"
  ],
    duration: null,
    mastery_roll_type: "mastery-magic-attack",
    mastery_nd: 1,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 2,
    mastery_range: 1,
    mastery_img: "systems/tm/styles/assets/masterys/fire/2a.webp",
    mastery_description: `Seu corpo irradia calor magico tão intenso que o ar ao seu redor se contorce. Enquanto este feitiço estiver ativo, inimigos que estiverem a até 3m de você no início do seu turno devem realizar um teste de RM contra ‘desfocado’. `,
    has_roll: false,
  },
];

for (const m of FireDB) {
  m.mastery_domain = "fire";
}

export const domainFire = FireDB;

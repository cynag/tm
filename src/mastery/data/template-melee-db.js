export const TemplateMeleeDB = [
  {
  id: "temp_attack",
  mastery_name: "template_attack",
  mastery_type: "action",
  mastery_class: "melee",
  mastery_roll_type: "mastery-melee-attack",

  mastery_nd: 1,
  maestry_points_value: 1,

  mastery_cost: 4,
  mastery_cd: 3,
  mastery_range: "weapon_range",

  mastery_img: "systems/tm/styles/assets/masterys/hierophant/1A.webp",
  mastery_description: `template test description`,
  mastery_limitation: " ",
  mastery_requirements: [
    { subtype: ["sword"] }
  ],

  weapon_attack_bonus: `(actor, target) => {
    return 1;
  }`,
  weapon_damage_bonus: `(actor) => {
    return 1;
  }`,
  weapon_extra: `(actor, target) => {
    return;
  }`,

  evolution_a: {
    id: "temp_attack_A",
    mastery_name: "temp_attack_EVOA",
    maestry_points_value: 1,
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1B.webp",
    mastery_description: "Evolução A da técnica.",
    mastery_cost: 4,
    mastery_cd: 2,
    mastery_range: "weapon_range",
    weapon_attack_bonus: `(actor, target) => { return 2; }`,
    weapon_damage_bonus: `(actor) => { return 2; }`,
    weapon_extra: `(actor, target) => { return; }`
  },

  evolution_b: {
    id: "temp_attack_B",
    mastery_name: "temp_attack_EVOB",
    maestry_points_value: 1,
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1C.webp",
    mastery_description: "Evolução B da técnica.",
    mastery_cost: 5,
    mastery_cd: 4,
    mastery_range: "weapon_range",
    weapon_attack_bonus: `(actor, target) => { return 0; }`,
    weapon_damage_bonus: `(actor) => { return 3; }`,
    weapon_extra: `(actor, target) => { return; }`
  }
}
,
    {
    id: "temp_attack2",
    mastery_name: "template_attack2",
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",

    mastery_nd: 2,
    maestry_points_value: 1,

    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: "weapon_range",

    mastery_img: "systems/tm/styles/assets/masterys/hierophant/2A.webp",
    mastery_description: `template test description`,
    mastery_limitation: " ",
    mastery_requirements: [
      { subtype: ["sword"] }
    ],

    weapon_attack_bonus: `(actor, target) => {
      return 1;
    }`,
    weapon_damage_bonus: `(actor) => {
      return 1;
    }`,
    weapon_extra: `(actor, target) => {
      return;
    }`,

    evolution_a: {
    id: "temp_attack_B2",
    mastery_name: "temp_attack_EVOA",
    maestry_points_value: 1,
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",
    mastery_img: "systems/tm/styles/assets/masterys/hierophant/2B.webp",
    mastery_description: "Evolução A da técnica.",
    mastery_cost: 4,
    mastery_cd: 2,
    mastery_range: "weapon_range",
    weapon_attack_bonus: `(actor, target) => { return 2; }`,
    weapon_damage_bonus: `(actor) => { return 2; }`,
    weapon_extra: `(actor, target) => { return; }`
  }
  },
      {
    id: "temp_attack3",
    mastery_name: "template_attack2",
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",

    mastery_nd: 3,
    maestry_points_value: 1,

    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: "weapon_range",

    mastery_img: "systems/tm/styles/assets/masterys/hierophant/3A.webp",
    mastery_description: `template test description`,
    mastery_limitation: " ",
    mastery_requirements: [
      { subtype: ["sword"] }
    ],

    weapon_attack_bonus: `(actor, target) => {
      return 1;
    }`,
    weapon_damage_bonus: `(actor) => {
      return 1;
    }`,
    weapon_extra: `(actor, target) => {
      return;
    }`
  }
];

export const templateMelee = TemplateMeleeDB;

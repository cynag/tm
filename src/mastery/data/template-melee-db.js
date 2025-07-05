export const TemplateMeleeDB = [
  {
    id: "perfect_thrust",
    mastery_name: "Estocada Perfeita",
    mastery_type: "action",              // ação, reação, conjuração, postura, passiva
    mastery_class: "melee",              // corporal, a_distancia
    mastery_roll_type: "mastery-melee-attack",  // tipo de rolagem usada

    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: "weapon_range",

    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1a.webp",
    mastery_description: `Ignora -2 de proteção. +1d6/2ND de dano. +1/ND se alvo estiver penalizado fisicamente.`,
    mastery_limitation: "Requer arma perfurante ou estocada.",
    mastery_requirements: ["Arma corporal"],

    weapon_attack_bonus: `(actor, target) => {
    return 1; // +1d6 no ataque
    }`,

  weapon_damage_bonus: `(actor) => {
    return 1; // +1 de dano fixo
    }`,

  weapon_extra: `(actor, target) => {
    return;
    }`
  },
{
    id: "perfect_thrust2",
    mastery_name: "Estocada Perfeita",
    mastery_type: "action",              // ação, reação, conjuração, postura, passiva
    mastery_class: "melee",              // corporal, a_distancia
    mastery_roll_type: "mastery-melee-attack",  // tipo de rolagem usada

    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: "weapon_range",

    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1a.webp",
    mastery_description: `Ignora -2 de proteção. +1d6/2ND de dano. +1/ND se alvo estiver penalizado fisicamente.`,
    mastery_limitation: "Requer arma perfurante ou estocada.",
    mastery_requirements: ["Arma corporal"],

    weapon_attack_bonus: `(actor, target) => {
    return 2; // +1d6 no ataque
    }`,

  weapon_damage_bonus: `(actor) => {
    return 100; // +1 de dano fixo
    }`,

  weapon_extra: `(actor, target) => {
    return;
    }`
  }
];

export const templateMelee = TemplateMeleeDB;

export const TemplateMeleeDB = [
  {
    id: "temp_attack",
    mastery_name: "template_attack",
    mastery_type: "action",              // ação, reação, conjuração, postura, passiva
    mastery_class: "melee",              // corporal, a_distancia
    mastery_roll_type: "mastery-melee-attack",  // tipo de rolagem usada

    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: "weapon_range",

    mastery_img: "systems/tm/styles/assets/masterys/hierophant/1b.webp",
    mastery_description: `template test description`,
    mastery_limitation: " ",
    mastery_requirements: [
{ subtype: ["sword"] }],

    weapon_attack_bonus: `(actor, target) => {
    return 1; // +1d6 no ataque
    }`,
    weapon_damage_bonus: `(actor) => {
    return 1; // +1 de dano fixo
    }`,
    weapon_extra: `(actor, target) => {
    return;
    }`
  }
];

export const templateMelee = TemplateMeleeDB;

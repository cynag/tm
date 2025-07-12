export const TemplateMeleeDB = [

    {
  id: "hierophant_1A",
  mastery_name: "Estocada Perfeita",
  mastery_type: "action",
  mastery_class: "melee",
  mastery_roll_type: "mastery-melee-attack",

  mastery_nd: 1,
  maestry_points_value: 1,

  mastery_cost: 4,
  mastery_cd: 3,
  mastery_range: "weapon_range",

  mastery_img: "systems/tm/styles/assets/masterys/hierophant/1B.webp",
  mastery_description: `Você desfere uma estocada centrada nos pontos mais vulneráveis do inimigo. Ignora 2 de PROT do alvo e causa +1d6 +1d6/NDp de dano adicional.`,

  mastery_limitation: " ",
  mastery_requirements: [
    { subtype: ["spear", "sword"] }
  ],

  weapon_attack_bonus: "1d4",
  weapon_attack_bonus_2: "+2",
  weapon_damage_bonus: "+1d10",
  weapon_damage_bonus_2: "+3", 
  weapon_extra: "target.reflex = -1",

},
{
  id: "hierophant_2A",
  mastery_name: "Rajada de Golpes",
  mastery_type: "action",
  mastery_class: "melee",
  mastery_roll_type: "mastery-melee-attack",

  mastery_nd: 1,
  maestry_points_value: 1,

  mastery_cost: 4,
  mastery_cd: 4,
  mastery_range: "weapon_range",

  mastery_img: "systems/tm/styles/assets/masterys/hierophant/1B.webp",
  mastery_description: ``,

  mastery_limitation: " ",
  mastery_requirements: [
    { subtype: ["spear", "sword"] }
  ],

  weapon_attack_bonus: "2d8",

},

];

for (const m of TemplateMeleeDB) {
  m.mastery_domain = "template_melee";
}

export const templateMelee = TemplateMeleeDB;


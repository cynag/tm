const HierophantDB = [

  {
    id: "hierophant_1Aa",
    mastery_name: "Estocada Perfeita",
    mastery_type: "action",
    mastery_class: "melee",
    mastery_roll_type: "mastery-melee-attack",
    mastery_nd: 1,
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
    weapon_attack_bonus: "if[target|has_physical_effect:true,+1000,0]",
    weapon_damage_bonus: "+1d6",
    weapon_damage_bonus_2: "+1d6/NDp",
    weapon_extra: "target.prot =-2",
  },

];

for (const m of HierophantDB) {
  m.mastery_domain = "hierophant";
}

export const domainHierophant = HierophantDB;

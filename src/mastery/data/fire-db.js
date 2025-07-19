const FireDB = [

  {
    id: "fire_1Aa",
    mastery_name: "Chama Ascendente",
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
    mastery_description: `Você invoca uma labareda ascendente sob os pés do inimigo. O alvo sofre 1d6 + 1d6/NDp de dano mágico de fogo. Não exige teste de ataque.`,
    mastery_attack_formula: "default",
    mastery_damage_formula: "1d4",
    mastery_element: "fire",
    spell_attack_bonus: "+100",
    spell_attack_bonus_2:"+1d6",
    spell_damage_bonus: "+1d6",
    spell_damage_bonus_2: "+999",
    spell_extra: ""
  },

];

for (const m of FireDB) {
  m.mastery_domain = "fire";
}

export const domainFire = FireDB;

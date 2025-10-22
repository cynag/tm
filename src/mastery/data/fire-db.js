const FireDB = [

  {
    id: "fire_1A",
    mastery_name: "Magia bonus fixos",
    mastery_type: "action",
    mastery_class: "magic",
    mastery_roll_type: "mastery-magic-attack",
    mastery_nd: 1,
    mastery_desc: 6,
    maestry_points_value: 1,
    mastery_cost: 4,
    mastery_cd: 3,
    mastery_range: 6,
    mastery_arcane_type: "fire",
    mastery_arcane_charges: 2,
    mastery_auto_hit: false,
    mastery_targets: 2, //se for ilimitado colocar "all"
    mastery_img: "systems/tm/styles/assets/masterys/fire/1a.webp",
    mastery_description: `...`, // colocar depois
    mastery_attack_formula: "default",
    mastery_damage_formula: "3d8",
    mastery_element: "fire",
    spell_attack_bonus: "",
    spell_attack_bonus_2:"",
    spell_damage_bonus: "",
    spell_damage_bonus_2: "",
    spell_extra: ""
  },
    /*{
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
  },*/

/* 
construindo maestria de cura:

maestrias de cura são simples rolagens que descartam alguns parametros estabelecidos nas maestrias de ataque magicas.

1- não tem rolagem de ataque (a cura sempre acerta)
2 - tem apenas rolagem de dano (que é a cura em si)
3 - não tem elemento (a cura não tem elemento)
4 - não tem bônus de ataque (a cura não tem bônus de ataque)
5 - pode ter bônus de dano (que é o bonus de cura)


precisa ter:

mastery_class:"cure", defino que a rolagem é uma cura
mastery_damage_formula: "1d8", //apesar da chave dizer dano, o sistema vai entender que é cura
spell_damage_bonus: ""1d8/NDp"", //apesar de estar escrito damage, o sistema vai entender que é bonus de cura, igual as magias tem
*/

{
  id: "naid_touch_heal",
  mastery_name: "Toque Reparador",
  mastery_type: "action",
  mastery_class: "cure",
  mastery_nd: 1,
  mastery_cost: 4,
  mastery_cd: 0,
  mastery_range: 1,
  mastery_img: "systems/tm/.../heal.png",
  mastery_description: "Energias restauradoras fecham feridas.",
  mastery_damage_formula: "1d8",   // cura base
  spell_damage_bonus: "1d8/NDp"    // bonus de cura
},

{
  id: "cure_fire_scaling_ndp_d10",
  mastery_name: "Chama Restauradora",
  mastery_type: "action",
  mastery_class: "cure",
  mastery_nd: 2,
  maestry_points_value: 1,

  mastery_cost: 4,
  mastery_cd: 2,
  mastery_range: 6,
  mastery_targets: 2,                // ou "all" se quiser

  mastery_arcane_type: "fire",       // consome foco de fogo
  mastery_arcane_charges: 2,

  mastery_img: "systems/tm/styles/assets/masterys/naiad/cure_fire.webp",
  mastery_description: "Canaliza calor vital para fechar feridas. Escala com ND par.",

  // ⚠️ Cura não tem ataque nem elemento
  mastery_attack_formula: "direct",
  mastery_damage_formula: "0",       // base 0
  spell_damage_bonus: "1d10/NDp",    // bônus de cura (escala por ND par)
  spell_damage_bonus_2: "",

  mastery_element: "",               // deixe vazio ou remova
  spell_attack_bonus: "",
  spell_attack_bonus_2: "",
  spell_extra: ""
}
];

for (const m of FireDB) {
  m.mastery_domain = "fire";
}

export const domainFire = FireDB;

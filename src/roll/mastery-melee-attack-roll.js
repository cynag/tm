// mastery-melee-attack-roll.js
import { BasicActionsDB } from "../actions/basic-actions-db.js";

export async function rollMasteryAttack({ attacker, target, mastery, hand = "right", forcedDice }) {
  const slotKey = hand === "right" ? "slot_weapon1" : "slot_weapon2";
  const equipped = attacker.system.gearSlots?.[slotKey];
  const item = equipped ? attacker.items.get(equipped.itemId) : null;
  const isUnarmed = !item;

  if (!attacker || !target) return ui.notifications.warn("Selecione um atacante e um alvo.");
  const targetActor = target?.actor;
  if (!targetActor) return ui.notifications.warn("O alvo não possui ficha de ator.");

  const DieTerm = foundry.dice.terms.Die;
  const attackerSystem = attacker.system;
  const targetSystem = targetActor.system;

  const subtype = isUnarmed ? "unarmed" : item.system?.subtype?.toLowerCase();
  const damageType = isUnarmed ? "impacto" : item.system?.weapon_subtypes_2 || "impacto";
  const size = isUnarmed ? null : item.system?.weapon_subtypes_3;
  const traits = isUnarmed ? {} : item.system?.weapon_traits || {};

  const masteryAtkFn = mastery.weapon_attack_bonus ? eval(mastery.weapon_attack_bonus) : () => 0;
  const masteryDmgFn = mastery.weapon_damage_bonus ? eval(mastery.weapon_damage_bonus) : () => 0;

  const masteryAtkBonus = masteryAtkFn(attacker, target);
  const masteryDmgBonus = masteryDmgFn(attacker);

  const extraDice = (attackerSystem.player_extra_dice?.[subtype] ?? 0)
    + (attackerSystem.player_extra_dice?.[damageType] ?? 0);

  const actionDiceBase = Number(attackerSystem?.player_action_dice) || 3;
  
  const atkBase = forcedDice ?? actionDiceBase;
const atkDice = atkBase + extraDice + masteryAtkBonus;



  const atkRoll = await new Roll(`${atkDice}d6`).evaluate();

  const atkBonus = (attackerSystem.mod_dexterity ?? 0)
    + (attackerSystem.player_attack_bonus?.[subtype] ?? 0)
    + (attackerSystem.player_attack_bonus?.[damageType] ?? 0)
    + (attackerSystem.player_attack_bonus?.[size] ?? 0);

  const atkTotal = atkRoll.total + atkBonus;

  const ref = targetSystem.player_reflex ?? 10;
  const hit = atkTotal > ref;
  const weaponDamage = isUnarmed ? "1d2" : (item.system.weapon_damage || "1d2");

  let weaponDamageBase = weaponDamage;
let elementalRaw = null;

const matchCustom = weaponDamage.match(/^(.+?)\{\{(.+?)\}\}$/);
if (matchCustom) {
  weaponDamageBase = matchCustom[1].trim(); // Ex: "2d6"
  elementalRaw = matchCustom[2].trim();     // Ex: "+2d4(Fogo)"
}

let baseRoll = null, baseDmg = 0, dmgBonus = 0;
if (hit) {
  baseRoll = await new Roll(weaponDamageBase).evaluate();

  const rollMatch = weaponDamage.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  const weaponBonusFlat = rollMatch && rollMatch[3] ? parseInt(rollMatch[3]) : 0;

  baseDmg = baseRoll.total - weaponBonusFlat;

  dmgBonus += (attackerSystem.mod_letality ?? 0)
    + (attackerSystem.player_damage_bonus?.[subtype] ?? 0)
    + (attackerSystem.player_damage_bonus?.[damageType] ?? 0)
    + (attackerSystem.player_damage_bonus?.[size] ?? 0)
    + weaponBonusFlat
    + masteryDmgBonus;
}




  
  let finalDmg = hit ? baseDmg + dmgBonus : 0;



  
// === CRÍTICO, RESISTÊNCIA, PROTEÇÃO, DANO FINAL ===
const atkDiceObjs = [];
let dieCount = 0;
for (const term of atkRoll.terms) {
  if (term instanceof DieTerm) {
    for (const r of term.results) {
      const isExtra = dieCount >= 3;

      atkDiceObjs.push({ result: r.result, faces: term.faces, isExtra });
      dieCount++;
    }
  }
}

const first3Dice = atkDiceObjs.slice(0, 3);
const count6 = first3Dice.filter(d => d.result === 6).length;
const count1 = first3Dice.filter(d => d.result === 1).length;

let critMult = 1;
let resultLabel = "";
if (count6 === 3 || (count6 === 2 && traits.weapon_trait_desc > 0 && first3Dice.some(d => d.result === traits.weapon_trait_desc))) {
  critMult = 3;
  resultLabel = "MUTILAÇÃO!";
} else if (count6 === 2) {
  critMult = 2;
  resultLabel = "Crítico";
} else if (count1 === 3) {
  resultLabel = "Catastrófica";
} else if (count1 === 2) {
  resultLabel = "Crítica";
} else {
  resultLabel = "Comum";
}

const protBase = targetSystem.mod_protection ?? 0;
const armorIsMetal = !!targetSystem.player_armor_is_metal;

let protFinal = protBase;
if (traits.weapon_trait_ironbreaker || (damageType === "perfurante" && !armorIsMetal)) {
  protFinal = Math.floor(protBase / 2);
}

const typeMap = {
  cortante: "slashing",
  perfurante: "piercing",
  impacto: "bludgeoning"
};
const resistKey = typeMap[damageType] || damageType;
const resistRaw = targetSystem?.resistances?.[resistKey] ?? 0;

let mitigatedDmg = Math.max(1, ((baseDmg * critMult) + dmgBonus) - resistRaw);
let rawPhysical = mitigatedDmg > protFinal ? mitigatedDmg : Math.floor(mitigatedDmg / 2);
if (rawPhysical < 1) rawPhysical = 1;

let elementalRoll = null, elementalDamage = 0, elementalLabel = null;
let resist = 0, elementalKeyRaw = "";

if (elementalRaw && hit && resultLabel !== "Catastrófica" && resultLabel !== "Crítica" && resultLabel !== "Comum") {

  const match = elementalRaw.match(/^\+?(\d+d\d+)\s*\(([^)]+)\)/);
  if (match) {
    const [, eleRollRaw, eleType] = match;
    elementalRoll = await new Roll(eleRollRaw.trim()).evaluate();

    const elementMap = {
      fogo: "fire", gelo: "cold", eletrico: "electricity",
      veneno: "poison", acido: "acid", mental: "psychic",
      radiante: "radiant", necrotico: "necrotic", caotico: "chaotic"
    };

    const resistances = targetSystem.resistances || {};
    const key = eleType?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const resistKey = elementMap[key] || key;
    const elementalResist = resistances[resistKey] ?? 0;

    resist = elementalResist;
    elementalDamage = Math.max(0, elementalRoll.total - elementalResist);
    elementalDamage *= critMult;
    elementalLabel = `${elementalDamage} ${eleType}`;
    elementalKeyRaw = key;
  }
}
let dmgFinal = hit ? rawPhysical + elementalDamage : 0;
finalDmg = dmgFinal;

// DADOS DE DANO FÍSICO PARA EXIBIÇÃO
const dmgDiceObjs = [];
if (baseRoll) {
  for (const term of baseRoll.terms) {
    if (term instanceof DieTerm) {
      for (const r of term.results) {
        dmgDiceObjs.push({ result: r.result, faces: term.faces });
      }
    }
  }
}





  // === VISUAL DO CHAT IGUAL AO ATTACK-ROLL.JS ===
  const traitLabels = [];
  if (traits.weapon_trait_desc) traitLabels.push(`DES 6.6.${traits.weapon_trait_desc}`);
  if (traits.weapon_trait_fast) traitLabels.push(`RAP`);
  if (traits.weapon_trait_ironbreaker) traitLabels.push(`QBF`);
  else if (damageType === "perfurante") traitLabels.push(`PEN`);
  if (traits.weapon_trait_vulnerable) traitLabels.push(`VUL`);


  
  /////////////////////////
  const tmDetailsHTML = `
  <div class="tm-details" style="display: none; margin-top: 6px; font-size: 12px; color: #aaa; padding: 6px; background: #111; border: 1px solid #333; border-radius: 6px;">
  <strong>Detalhes:</strong><br>

    <div style="display: flex; justify-content: center; align-items: center; gap: 12px; font-size: 14px; font-weight: bold; margin: 6px 0;">

  <!-- REFLEXO -->
  <div style="
    position: relative;
    width: 32px;
    height: 32px;
    background-image: url('systems/tm/styles/assets/ui/hex-2.svg');
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-shadow: 1px 1px 2px black;">
    ${ref >= 0 ? "+" + ref : ref}
  </div>

 

  <!-- PROTEÇÃO -->
  <div style="
    position: relative;
    width: 32px;
    height: 32px;
    background-image: url('systems/tm/styles/assets/ui/${(traits.weapon_trait_ironbreaker || (damageType === 'perfurante' && !armorIsMetal)) ? 'shield-broken' : 'shield'}.svg');
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-shadow: 1px 1px 2px black;">
    ${protFinal >= 0 ? "+" + protFinal : protFinal}
  </div>

  </div>



  <!-- Dados de ataque -->
  <div style="
    display: flex;
    justify-content: center;
    gap: 6px;
    margin: 4px 0 6px 0;
    flex-wrap: wrap;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
    ">


    ${atkDiceObjs.map(die => {
      console.log(`[RENDER] Dado ${die.result} | isExtra? ${die.isExtra}`);
      return `
      <div class="dice-icon${die.isExtra ? ' dice-extra' : ''}">
        <div class="dice-bg" style="background-image: url('systems/tm/styles/assets/dices/d${die.faces}.svg');"></div>
        <div class="dice-number${die.isExtra ? ' dice-extra' : ''}">
          ${die.result}
        </div>
      </div>
      `;
    }).join("")}

</div>

<!-- Dados de dano + elementais juntos -->
<div style="
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 4px 0 6px 0;
  flex-wrap: wrap;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
">
  ${[
    ...dmgDiceObjs.map(die => ({
      ...die,
      type: "physical"
    })),
    ...(elementalRoll?.terms
      .filter(t => t instanceof DieTerm)
      .flatMap(t => t.results.map(r => ({
        result: r.result,
        faces: t.faces,
        type: "elemental"
      }))) ?? [])
  ].map(die => {
  const isElemental = die.type === "elemental";
  const eleKey = (elementalLabel?.split(" ")[1] || "").toLowerCase().trim();
  const colorClass = isElemental ? `dice-${eleKey}` : "";


  return `
  <div class="dice-icon ${colorClass}">
    <div class="dice-bg" style="background-image: url('systems/tm/styles/assets/dices/d${die.faces}.svg');"></div>
    <div class="dice-number">${die.result}</div>
  </div>
`;

}).join("")}
</div>

<hr />

<div style="margin-top: 10px; font-size: 13px; color: #ccc; display: flex; flex-direction: column; gap: 6px;">

  <div style="display: flex; justify-content: space-between; padding: 2px 0;">

    <span>Dados de Ataque:</span>
    <span>${atkRoll.total}</span>
  </div>

  ${atkBonus !== 0 ? `
  <div style="display: flex; justify-content: space-between; padding: 2px 0;">

    <span>Acréscimos:</span>
    <span>${atkBonus > 0 ? "+" + atkBonus : atkBonus}</span>
  </div>
` : ""}


  <div style="display: flex; justify-content: space-between; font-weight: bold;">
    <span>Valor Final:</span>
    <span>${atkTotal}</span>
  </div>
</div>


<hr style="border: 0; border-top: 1px solid #444; margin: 6px 0 4px 0;" />

${hit ? `
<div style="font-size: 12px; color: #ccc; display: flex; flex-direction: column; gap: 4px;">
  <div style="display: flex; justify-content: space-between; padding: 2px 0;">

    <span>Dados de Dano:</span>
    <span>
  ${(baseDmg * critMult)}
  ${critMult > 1 ? `<span style="font-weight: normal; color: #888;">(${baseDmg}x${critMult})</span>` : ""}
</span>



  </div>

  ${dmgBonus !== 0
  ? `<div style="display: flex; justify-content: space-between; padding: 2px 0;">

      <span>Acréscimos:</span>
      <span>${dmgBonus > 0 ? "+" + dmgBonus : dmgBonus}</span>
    </div>`
  : ""}


  ${(() => {
  const typeMap = {
    cortante: "slashing",
    perfurante: "piercing",
    impacto: "bludgeoning"
  };
  const resistKey = typeMap[damageType] || damageType;
  const resistRaw = targetSystem?.resistances?.[resistKey] ?? 0;

    if (resistRaw < 0) {
      return `
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">

          <span>Fraqueza inimiga contra ${damageType}:</span>
          <span>+${Math.abs(resistRaw)}</span>

        </div>
      `;
    } else if (resistRaw > 0) {
      return `
        <div style="display: flex; justify-content: space-between; padding: 2px 0;">

          <span>Resistência inimiga contra ${damageType}:</span>
          <span>-${resistRaw}</span>
        </div>
      `;
    }
    return "";
  })()}
  ${protFinal >= ((baseDmg * critMult) + dmgBonus - resistRaw)
  ? `<div style="display: flex; justify-content: space-between; padding: 2px 0;">
       <span>A armadura mitigou o dano.</span>
       <span>
        (${(baseDmg * critMult) + dmgBonus - resistRaw} / 2)
       </span>
     </div>`
  : `<div style="display: flex; justify-content: space-between; padding: 2px 0;">
       <span>A armadura foi transpassada.</span>
       <span></span>
     </div>`
}


${elementalRoll ? `
  <div style="display: flex; justify-content: space-between; padding: 2px 0;">
    <span>Dano Elemental (${elementalKeyRaw}):</span>
      <span>
      ${(elementalRoll.total * critMult)}
      ${critMult > 1 ? `<span style="font-weight: normal; color: #888;">(${elementalRoll.total}x${critMult})</span>` : ""}
      </span>

  </div>

  ${resist !== 0 ? `
    <div style="display: flex; justify-content: space-between; padding: 2px 0;">
      <span>${resist < 0 ? "Fraqueza" : "Resistência"} inimiga contra ${elementalKeyRaw}:</span>
      <span>${resist < 0 ? "+" + Math.abs(resist) : "-" + resist}</span>
    </div>
  ` : ""}
` : ""}








  <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; color: white;">
    <span>Dano Final:</span>
    <span>${dmgFinal}</span>
  </div>
` : ""}
`;
  /////////////////////////

    const outcomeHTML = `
  <div class="tm-outcome">

    <div class="tm-row ${hit ? "tm-success" : "tm-failure"}" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <span style="font-weight: bold; ${hit ? 'color: #33cc33;' : 'color: #cc3333;'}">
        ${hit ? "Sucesso" : "Falha"}
      </span>

      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background-image: url('systems/tm/styles/assets/ui/hex-2.svg');
        background-size: cover;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-shadow: 1px 1px 2px black;
        font-weight: bold;
      ">
        ${atkTotal}
      </div>

      <span style="font-weight: bold; color: ${
        resultLabel === "MUTILAÇÃO!" ? "#ff5555" :
        resultLabel === "Crítico" || resultLabel === "Crítica" ? "#33cc33" :
        resultLabel === "Catastrófica" ? "#cc0000" :
        "#999"
      };">
        ${resultLabel}
      </span>
    </div>

    ${hit ? `
      <div class="tm-row tm-damage" style="gap: 8px; justify-content: center;">
        <span style="font-weight: bold;">Dano</span>
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          background-image: url('systems/tm/styles/assets/ui/hex-2.svg');
          background-size: cover;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-shadow: 1px 1px 2px black;
          font-weight: bold;
        ">
          ${dmgFinal}
        </div>
        <span style="text-transform: lowercase;">${damageType}</span>
      </div>
    ` : ""}

    ${tmDetailsHTML}

  </div>
  `;
  /////////////////////////
    const msgContent = `
    <div class="chat-attack" style="font-family: var(--font-primary); font-size: 1.1em;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
        <img src="${mastery.mastery_img}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
        <div>
          <h2 style="margin: 0 0 4px 0; font-size: 16px;">${mastery.mastery_name}</h2>
          <div style="margin-bottom: 2px;">
            <span class="tag">${item.system.weapon_damage || "1d2"} ${damageType}</span>
            <span class="tag">${item.system.weapon_range || "–"}m</span>
          </div>
          <div style="margin-bottom: 2px;">
            ${traitLabels.map(t => `<span class="tag">${t}</span>`).join(" ")}
          </div>
          <div style="margin-bottom: 2px;">
            <span class="tag">🎯 ${target.name}</span>
          </div>
        </div>
      </div>
      <div style="font-size: 13px; color: var(--color-text-light); margin-bottom: 8px;">
        ${mastery.mastery_description || "<i>Sem descrição</i>"}
      </div>
      ${outcomeHTML}
    </div>
  `;



  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: attacker }),
    flavor: msgContent,
    rolls: hit ? [atkRoll, baseRoll] : [atkRoll]
  });

  if (mastery.weapon_extra) {
    try {
      eval(mastery.weapon_extra);
    } catch (e) {
      console.warn("Erro ao executar script extra da maestria:", e);
    }
  }


  Hooks.on("renderChatMessage", (msg, html) => {
  if (html.hasClass("tm-processed")) return;
  html.addClass("tm-processed");

  html.find(".tm-outcome").on("click", function () {
    const details = $(this).closest(".tm-outcome").find(".tm-details");
    if (details.length) details.slideToggle(150);
  });
});

}

export const MasteryMeleeAttackRoll = { roll: rollMasteryAttack };

// attack-roll.js
import { BasicActionsDB } from "../actions/basic-actions-db.js";

export async function rollAttack({ attacker, target, actionId, forcedDice }) {
  if (!attacker || !target) return ui.notifications.warn("Selecione um atacante e um alvo.");
  const targetActor = target?.actor;
  if (!targetActor) return ui.notifications.warn("O alvo não possui ficha de ator.");

  const DieTerm = foundry.dice.terms.Die;
  const attackerSystem = attacker.system;
  const targetSystem = targetActor.system;

  let elementalKeyRaw = "";

  
  const isRight = actionId === "attack_right";
  const slotKey = isRight ? "slot_weapon1" : "slot_weapon2";
  const equipped = attackerSystem.gearSlots?.[slotKey];
  const item = equipped ? attacker.items.get(equipped.itemId) : null;
  const isUnarmed = !item;
  if (isUnarmed) console.warn("[ActionRoll] Ataque desarmado permitido.");

  const actionData = BasicActionsDB.find(a => a.id === actionId);
  const subtype = isUnarmed ? "unarmed" : item.system?.subtype?.toLowerCase();
  const damageType = isUnarmed ? "impacto" : item.system?.weapon_subtypes_2 || "impacto";
  const size = isUnarmed ? null : item.system?.weapon_subtypes_3;

  const traits = isUnarmed ? {} : item.system?.weapon_traits || {};
  const traitLabels = [];
  if (traits.weapon_trait_desc) traitLabels.push(`DES 6.6.${traits.weapon_trait_desc}`);
  if (traits.weapon_trait_fast) traitLabels.push(`RAP`);
  if (traits.weapon_trait_ironbreaker) traitLabels.push(`QBF`);
  else if (damageType === "perfurante") traitLabels.push(`PEN`);
  if (traits.weapon_trait_vulnerable) traitLabels.push(`VUL`);

  const extraDice = (attackerSystem.player_extra_dice?.[subtype] ?? 0)
  + (attackerSystem.player_extra_dice?.[damageType] ?? 0);

  const actionDiceBase = Number(attackerSystem?.player_action_dice) || 3;

const atkBase = forcedDice
  ? Math.max(3, actionDiceBase)
  : actionDiceBase;


  const atkDice = forcedDice ?? (atkBase + extraDice);
  console.log(`[DEBUG] atkBase = ${atkBase}, atkDice = ${atkDice}, extraDice = ${extraDice}`);




  const atkRoll = await new Roll(`${atkDice}d6`).evaluate();

  const atkBonus = (attackerSystem.mod_dexterity ?? 0)
    + (attackerSystem.player_attack_bonus?.[subtype] ?? 0)
    + (attackerSystem.player_attack_bonus?.[damageType] ?? 0)
    + (attackerSystem.player_attack_bonus?.[size] ?? 0);

  const atkTotal = atkRoll.total + atkBonus;

  const atkDiceObjs = [];
let dieCount = 0;
for (const term of atkRoll.terms) {
  if (term instanceof DieTerm) {
    for (const r of term.results) {
      const isExtra = dieCount >= atkBase;
      console.log(`[DADO] ${dieCount + 1} = ${r.result} | isExtra = ${isExtra}`);
      atkDiceObjs.push({
        result: r.result,
        faces: term.faces,
        isExtra
      });
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

  const ref = targetSystem.player_reflex ?? 10;
  const hit = atkTotal > ref;
  const weaponDamage = isUnarmed ? "1d2" : (item.system.weapon_damage || "1d2");


  let earlyFailMsgContent = null;
if (!hit) {
  earlyFailMsgContent = `
    <div class="chat-attack" style="font-family: var(--font-primary); font-size: 1.1em;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
        <img src="${actionData?.img_default || "icons/svg/sword.svg"}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
        <div>
          <h2 style="margin: 0 0 4px 0; font-size: 16px;">${isUnarmed ? "Ataque Desarmado" : `Atacar com ${item.name?.trim() || "arma"}`}</h2>
          <div style="margin-bottom: 2px;">
            ${(() => {
  const tags = [];

  const match = weaponDamage.match(/^(.+?)\{\{(.+?)\}\}$/);
  if (match) {
    const base = match[1].trim(); // ex: 1d4
    const extra = match[2].trim(); // ex: +2d4 (Fogo)

    tags.push(`<span class="tag">${base} ${damageType}</span>`);

    const extraMatch = extra.match(/^([+−-]?\s*\d+d\d+)\s*\(([^)]+)\)/i);
    if (extraMatch) {
      const [, bonusDice, elementType] = extraMatch;
      tags.push(`<span class="tag">${bonusDice.trim().replace("+", "")} ${elementType.trim().toLowerCase()}</span>`);

    }
  } else {
    tags.push(`<span class="tag">${weaponDamage} ${damageType}</span>`);
  }

  return tags.join(" ");
})()}

            <span class="tag">${item?.system?.weapon_range || "–"}m</span>
          </div>
          <div style="margin-bottom: 2px;">
            ${traitLabels.map(t => `<span class="tag">${t}</span>`).join(" ")}
          </div>
          <div style="margin-bottom: 2px;">
            <span class="tag">🎯 ${targetActor.name}</span>
          </div>
        </div>
      </div>
      <div style="font-size: 13px; color: var(--color-text-light); margin-bottom: 8px;">
        ${actionData?.description || "<i>Sem descrição</i>"}
      </div>
    `;
}


let weaponDamageBase = weaponDamage;
let elementalRaw = null;

const matchCustom = weaponDamage.match(/^(.+?)\{\{(.+?)\}\}$/);
if (matchCustom) {
  weaponDamageBase = matchCustom[1].trim(); // Ex: "1d8"
  elementalRaw = matchCustom[2].trim();     // Ex: "+2d4(fogo)"
}

let baseRoll = null, baseDmg = 0, dmgDiceObjs = [], dmgBonus = 0;
if (hit) {
  baseRoll = await new Roll(weaponDamageBase).evaluate();
  const rollMatch = weaponDamageBase.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  const weaponBonusFlat = rollMatch && rollMatch[3] ? parseInt(rollMatch[3]) : 0;




  baseDmg = baseRoll.total - weaponBonusFlat;

  dmgBonus += (attackerSystem.mod_letality ?? 0)
  + (attackerSystem.player_damage_bonus?.[subtype] ?? 0)
  + (attackerSystem.player_damage_bonus?.[damageType] ?? 0)
  + (attackerSystem.player_damage_bonus?.[size] ?? 0)
  + weaponBonusFlat;

  
  const ammoBonus = isRight
  ? (attackerSystem.ammo_damage_bonus_right ?? 0)
  : (attackerSystem.ammo_damage_bonus_left ?? 0);

  if (ammoBonus > 0) {
  dmgBonus += ammoBonus;
  console.log(`[AMMO BONUS] +${ammoBonus} de dano da munição`);
}

  dmgDiceObjs = baseRoll.terms
    .filter(t => t instanceof DieTerm)
    .flatMap(t => t.results.map(r => ({ result: r.result, faces: t.faces })));
}



  

  let finalDmg = (baseDmg * critMult) + dmgBonus;


  let elementalRoll = null, elementalDamage = 0, elementalLabel = null;
  let resist = 0; // ✅ aqui
  
  if (elementalRaw) {
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




  
  const protBase = targetSystem.mod_protection ?? 0;
  const armorIsMetal = !!targetSystem.player_armor_is_metal;

  let protFinal = protBase;
  if (traits.weapon_trait_ironbreaker || (damageType === "perfurante" && !armorIsMetal)) protFinal = Math.floor(protBase / 2);


  // 1. Aplica resistência física (se houver)
const typeMap = {
  cortante: "slashing",
  perfurante: "piercing",
  impacto: "bludgeoning"
};

const resistKey = typeMap[damageType] || damageType;
const resistRaw = targetSystem?.resistances?.[resistKey] ?? 0;

let mitigatedDmg = Math.max(1, finalDmg - resistRaw); // não pode ser menor que 1

// 2. Aplica proteção
let rawPhysical;
if (mitigatedDmg > protFinal) {
  rawPhysical = mitigatedDmg;
} else {
  rawPhysical = Math.floor(mitigatedDmg / 2);
}
if (rawPhysical < 1) rawPhysical = 1;

if (rawPhysical < 1) rawPhysical = 1; // garante no mínimo 1

// 3. Soma dano elemental, se houver
let dmgFinal = rawPhysical + (hit ? elementalDamage : 0);


if (dmgFinal < 1) dmgFinal = 1; // segurança final



  const bonusAtk = (attackerSystem.player_attack_bonus?.[subtype] ?? 0)
  + (attackerSystem.player_attack_bonus?.[damageType] ?? 0)
  + (attackerSystem.player_attack_bonus?.[size] ?? 0);

const bonusDmg = (attackerSystem.player_damage_bonus?.[subtype] ?? 0)
  + (attackerSystem.player_damage_bonus?.[damageType] ?? 0)
  + (attackerSystem.player_damage_bonus?.[size] ?? 0);


  // 🟩 OUTCOME VISUAL – este bloco vem ANTES do msgContent
  const elementMap = {
  fogo: "fire", gelo: "cold", eletrico: "electricity",
  veneno: "poison", acido: "acid", psiquico: "psychic",
  radiante: "radiant", necrótico: "necrotic", caótico: "chaotic"
};
const rawKey = (elementalLabel?.split(" ")[1] || "").toLowerCase().trim();
const elementalKey = elementMap[rawKey] || rawKey;

/////////////////
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
  ${critMult > 1 ? `<span style="font-weight: normal; color: #888;">(${resultLabel} x${critMult})</span>` : ""}
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
    <span>${elementalRoll.total} ×${critMult} = ${elementalRoll.total * critMult}</span>
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
/////////////////
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


  // 🔽 depois de outcomeHTML
  let actionName;
  const rangedTypes = ["bow", "crossbow", "gun"];
  if (isUnarmed) actionName = "Ataque Desarmado";
  else if (rangedTypes.includes(subtype)) actionName = `Atirar com ${item.name?.trim() || "arma"}`;
  else actionName = `Atacar com ${item.name?.trim() || "arma"}`;

  const actionImg = actionData?.[`img_${subtype}`] || actionData?.img_default || "icons/svg/sword.svg";
  const range = isUnarmed ? "1" : (item.system?.weapon_range || "–");
  const description = actionData?.description || "<i>Sem descrição</i>";

  const msgContent = `
  ${earlyFailMsgContent || `
    <div class="chat-attack" style="font-family: var(--font-primary); font-size: 1.1em;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
        <img src="${actionImg}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
        <div>
          <h2 style="margin: 0 0 4px 0; font-size: 16px;">${actionName}</h2>
          <div style="margin-bottom: 2px;">
            ${(() => {
  const tags = [];

  const match = weaponDamage.match(/^(.+?)\{\{(.+?)\}\}$/);
  if (match) {
    const base = match[1].trim();
    const extra = match[2].trim();

    tags.push(`<span class="tag">${base} ${damageType}</span>`);

    const extraMatch = extra.match(/^([+−-]?\s*\d+d\d+)\s*\(([^)]+)\)/i);
    if (extraMatch) {
      const [, bonusDice, elementType] = extraMatch;
      tags.push(`<span class="tag">${bonusDice.trim().replace("+", "")} ${elementType.trim().toLowerCase()}</span>`);

    }
  } else {
    tags.push(`<span class="tag">${weaponDamage} ${damageType}</span>`);
  }

  return tags.join(" ");
})()}

            <span class="tag">${range}m</span>
          </div>
          <div style="margin-bottom: 2px;">
            ${traitLabels.map(t => `<span class="tag">${t}</span>`).join(" ")}
          </div>
          <div style="margin-bottom: 2px;">
            <span class="tag">🎯 ${targetActor.name}</span>
          </div>
        </div>
      </div>
      <div style="font-size: 13px; color: var(--color-text-light); margin-bottom: 8px;">
        ${description}
      </div>
  `}
  ${outcomeHTML}
</div>
`;


  const rolls = hit ? [atkRoll, baseRoll] : [atkRoll];
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: attacker }),
    flavor: msgContent,
    rolls
  });

  


}

Hooks.on("renderChatMessage", (msg, html) => {
  if (html.hasClass("tm-processed")) return;
  html.addClass("tm-processed");

  html.find(".dice-roll").remove();
  html.find(".dice-formula").remove();
  html.find("h4.dice-total").remove();

  html.find(".tm-outcome").on("click", function () {
    const details = $(this).closest(".tm-outcome").find(".tm-details");
    if (details.length) details.slideToggle(150);
  });
});


Hooks.once("ready", () => {
  // Corrige rolagens antigas no chat após F5
  for (const msg of game.messages.contents) {
    const htmlPromise = msg.getHTML?.();
    if (!htmlPromise) continue;

    htmlPromise.then(html => {
      const content = html[0]?.querySelector(".chat-attack");
      if (!content || content.classList.contains("tm-processed")) return;

      content.classList.add("tm-processed");

      content.querySelectorAll(".tm-outcome").forEach(outcome => {
        outcome.addEventListener("click", () => {
          const details = outcome.closest(".tm-outcome")?.querySelector(".tm-details");
          if (details) {
            details.style.display = details.style.display === "none" ? "block" : "none";
          }
        });
      });
    });
  }
});

export const AttackRoll = { rollAttack };

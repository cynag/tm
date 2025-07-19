import { MasteryParser } from "../mastery/mastery-parser.js";

export async function rollMagicMastery({ attacker, targets = [], mastery, forcedDice }) {
console.log("🧪 DEBUG ATTACKER:", attacker);
console.log("🧪 DEBUG TARGETS:", targets);


  if (!attacker) {
  ui.notifications.warn("Você precisa selecionar um atacante.");
  return;
}

if (!Array.isArray(targets) || targets.length === 0) {
  ui.notifications.warn("Você precisa selecionar ao menos um alvo.");
  return;
}




  const actorSystem = attacker.system;

for (const target of targets) {
  const targetSystem = target.actor?.system;
  if (!targetSystem) continue;


  const DieTerm = foundry.dice.terms.Die;
  const attackFormula = mastery.mastery_attack_formula || "direct";
  const damageFormula = mastery.mastery_damage_formula || "0";
  
  const rawElement = mastery.mastery_element?.toLowerCase() || "fire";

// 🧪 Tabela de tradução de banco de dados → classe CSS
const elementMap = {
  fire: "fogo",
  ice: "gelo",
  electric: "eletrico",
  poison: "veneno",
  acid: "acido",
  psychic: "mental",
  radiant: "radiante",
  necrotic: "necrotico",
  chaotic: "caotico"
};

// 🧪 Escolhe o melhor bônus elemental disponível
const elementOptions = rawElement.split("||").map(e => e.trim());
let selectedElement = elementOptions[0];
let highestBonus = -999;
for (let elem of elementOptions) {
  const bonus = actorSystem.player_damage_bonus?.[elem] ?? 0;
  if (bonus > highestBonus) {
    highestBonus = bonus;
    selectedElement = elem;
  }
}

// 🔥 Corrige para a classe CSS correspondente
const elementClass = elementMap[selectedElement] || selectedElement;


  // 🎲 Avalia dano
  let hit = true;
let atkRoll = null;
let atkTotal = "–";
let resultLabel = "Direto";
let atkBonusTotal = 0;
let dmgBonusTotal = 0;

if (attackFormula === "default") {
  if (mastery.mastery_auto_hit === true) {
    hit = true;
    resultLabel = "Automático";
    atkTotal = "✔️";
    atkBonusTotal = 0;
  } else {
    const baseDice = Number(actorSystem.player_action_dice ?? 3);
    const extraDice = (actorSystem.player_extra_dice?.[selectedElement] ?? 0);
    const totalDice = forcedDice ?? (baseDice + extraDice);
    const baseRoll = new Roll(`${totalDice}d6`);
    await baseRoll.evaluate();
    atkRoll = baseRoll;

    const modDex = actorSystem.mod_dexterity ?? 0;
    const atkBonusElement = actorSystem.player_attack_bonus?.[selectedElement] ?? 0;
    atkBonusTotal = modDex + atkBonusElement;

    const modArc = actorSystem.mod_arcana ?? 0;
    const dmgBonusElement = actorSystem.player_damage_bonus?.[selectedElement] ?? 0;
    dmgBonusTotal = modArc + dmgBonusElement;

    atkTotal = atkRoll.total + atkBonusTotal;
    const ref = targetSystem.player_reflex ?? 10;
    hit = atkTotal > ref;

    const DieTerm = foundry.dice.terms.Die;
    const first3 = atkRoll.terms
      .filter(t => t instanceof DieTerm)
      .flatMap(t => t.results)
      .slice(0, 3);

    const count6 = first3.filter(d => d.result === 6).length;
    const count1 = first3.filter(d => d.result === 1).length;

    if (count6 === 3) resultLabel = "MUTILAÇÃO!";
    else if (count6 === 2) resultLabel = "Crítico";
    else if (count1 === 3) resultLabel = "Catastrófica";
    else if (count1 === 2) resultLabel = "Crítica";
    else resultLabel = hit ? "Comum" : "Falha";
  }
}



let dmgResult = null;
let dmgBase = 0;
let dmgRoll = null;
let resist = 0;
let rawDamage = 0;
let finalDamage = 0;

if (hit) {
  dmgResult = await MasteryParser.evaluate(damageFormula, attacker, target.actor, "roll", mastery.mastery_domain);
  dmgBase = dmgResult?.value ?? 0;
  dmgRoll = dmgResult?.roll;
  resist = targetSystem.resistances?.[selectedElement] ?? 0;
  rawDamage = dmgBase + dmgBonusTotal - resist;

  finalDamage = (targetSystem.mod_protection >= rawDamage)
    ? Math.max(1, Math.floor(rawDamage / 2))
    : Math.max(1, Math.floor(rawDamage));
}




  const dmgDiceObjs = [];
if (dmgRoll) {
  for (const term of dmgRoll.terms) {
    if (term instanceof DieTerm) {
      for (const r of term.results) {
        dmgDiceObjs.push({
          result: r.result,
          faces: term.faces,
          type: "elemental"
        });
      }
    }
  }
}


  // 💬 Detalhes colapsáveis


const tmDetailsHTML = `
<div class="tm-details" style="display: none; margin-top: 6px; font-size: 12px; color: #aaa; padding: 6px; background: #111; border: 1px solid #333; border-radius: 6px;">
  <strong>Detalhes:</strong><br>

  <!-- Reflexo e proteção -->
  <div class="dice-tray" style="display: flex; justify-content: center; align-items: center; gap: 12px; font-size: 14px; font-weight: bold; margin: 6px 0;">
    <!-- REF -->
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
      ${targetSystem.player_reflex >= 0 ? "+" + targetSystem.player_reflex : targetSystem.player_reflex}
    </div>

    <!-- PROT -->
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      background-image: url('systems/tm/styles/assets/ui/shield.svg');
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-shadow: 1px 1px 2px black;">
      ${(targetSystem.mod_protection ?? 0) >= 0 ? "+" + (targetSystem.mod_protection ?? 0) : (targetSystem.mod_protection ?? 0)}
    </div>
  </div>

  <!-- Dados de ataque -->
<div class="dice-tray" style="display: flex; justify-content: center; gap: 6px; margin: 4px 0 6px 0; flex-wrap: wrap; max-width: 320px; margin-left: auto; margin-right: auto;">
  ${(() => {
    const atkDiceObjs = [];
    let dieCount = 0;
    if (atkRoll) {
  for (const term of atkRoll.terms) {

      if (term instanceof DieTerm) {
        for (const r of term.results) {
          const isExtra = dieCount >= 3;
          atkDiceObjs.push({ result: r.result, faces: term.faces, isExtra });
          dieCount++;
        }
      }
    }
  }
    return atkDiceObjs.map(die => `
      <div class="dice-icon${die.isExtra ? ' dice-extra' : ''}">
        <div class="dice-bg" style="background-image: url('systems/tm/styles/assets/dices/d${die.faces}.svg');"></div>
        <div class="dice-number${die.isExtra ? ' dice-extra' : ''}">${die.result}</div>
      </div>
    `).join("");
  })()}
</div>
<!-- Dados de dano -->
${hit && dmgRoll ? `
  <div class="dice-tray" style="display: flex; justify-content: center; gap: 6px; margin: 4px 0 6px 0; flex-wrap: wrap; max-width: 320px; margin-left: auto; margin-right: auto;">
    ${dmgDiceObjs.map(die => {
      const eleClass = `dice-${elementClass}`;
      return `
      <div class="dice-icon ${eleClass}">
        <div class="dice-bg" style="background-image: url('systems/tm/styles/assets/dices/d${die.faces}.svg');"></div>
        <div class="dice-number">${die.result}</div>
      </div>`;
    }).join("")}
  </div>
` : ""}

<hr style="border: 0; border-top: 1px solid #444; margin: 6px 0 4px 0;" />

${atkRoll ? `
<!-- Texto de ataque refinado -->
<div class="details-attack" style="font-size: 13px; color: #ccc; display: flex; flex-direction: column; gap: 4px;">

  <div style="display: flex; justify-content: space-between;">
    <span>Dados de Ataque:</span>
    <span>${atkRoll.total}</span>
  </div>

  ${atkBonusTotal !== 0 ? `
  <div style="display: flex; justify-content: space-between;">
    <span>Acréscimos:</span>
    <span>${atkBonusTotal >= 0 ? "+" : ""}${atkBonusTotal}</span>
  </div>` : ""}

  <div style="display: flex; justify-content: space-between; font-weight: bold;">
    <span>Valor Final:</span>
    <span>${atkTotal}</span>
  </div>

</div>
<hr style="border: 0; border-top: 1px solid #444; margin: 6px 0 4px 0;" />

` : ""}


<!-- Texto de dano refinado -->
${dmgRoll ? `
  <div class="details-damage"  style="margin-top: 6px; font-size: 13px; color: #ccc; display: flex; flex-direction: column; gap: 4px;">

    <div style="display: flex; justify-content: space-between;">
      <span>Dados de Dano (${elementClass}):</span>

      <span>${dmgRoll.total}</span>
    </div>

      ${dmgBonusTotal !== 0 ? `
  <div style="display: flex; justify-content: space-between;">
    <span>Acréscimos:</span>
    <span>${dmgBonusTotal >= 0 ? "+" : ""}${dmgBonusTotal}</span>
  </div>` : ""}


    ${resist !== 0 ? `
    <div style="display: flex; justify-content: space-between;">
      <span>${resist < 0 ? "Fraqueza contra" : "Resistência contra"} ${elementClass}:</span>

    <span>${resist < 0 ? "+" + Math.abs(resist) : "-" + resist}</span>
    </div>` : ""}

    ${(targetSystem.mod_protection ?? 0) >= finalDamage ? `
      <div style="display: flex; justify-content: space-between;">
        <span>A armadura inimiga mitigou o dano:</span>
        <span>(${rawDamage}/2)</span>

      </div>` : `
      <div style="display: flex; justify-content: space-between;">
        <span>A armadura foi transpassada</span>
      </div>`}

    <div style="display: flex; justify-content: space-between; font-weight: bold;">
      <span>Dano Final:</span>
      <span>${Math.max(1, Math.floor(finalDamage))}</span>
    </div>

  </div>
` : ""}



</div>
`;



  // 🧾 Hexágono principal
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
    ${finalDamage}
  </div>
  <span style="text-transform: capitalize;">${elementClass}</span>

  </div>` : ""}

    ${tmDetailsHTML}
  </div>`;


  // 🧾 Mensagem final
  const msgContent = `
  <div class="chat-roll" style="font-family: var(--font-primary); font-size: 1.1em;">
  <div class="chat-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
    <img class="chat-img" src="${mastery.mastery_img}" width="35" height="35" style="border:1px solid #555; border-radius:4px;" />
    <div>
      <h2 class="chat-roll-name" style="margin: 0 0 4px 0; font-size: 16px;">${mastery.mastery_name}</h2>

      <!-- Linha 1: Tipo, PA, CD -->
      <div class="chat-tags" style="display: flex; gap: 4px; justify-content: flex-end; margin-bottom: 2px;">
        <span class="tag">${{
          action: "AÇÃO", conjuration: "CONJURAÇÃO", reaction: "REAÇÃO", stance: "POSTURA", passive: "PASSIVA"
        }[mastery.mastery_type] || mastery.mastery_type}</span>
        <span class="tag">${mastery.mastery_cost || "–"} PA</span>
        <span class="tag">CD ${mastery.mastery_cd || "–"}</span>
        <span class="tag">${mastery.mastery_range || "–"}m</span>
      </div>

      <!-- Linha 2: Dano e Alcance -->
      <div  class="chat-tags" style="display: flex; gap: 4px; justify-content: flex-end; margin-bottom: 2px;">
        <span class="tag">${damageFormula} ${elementMap[selectedElement] || selectedElement}</span>
        <span class="tag">🎯 ${target.name}</span>
      </div>
    </div>
  </div>
  <div class="chat-description" style="font-size: 13px; color: var(--color-text-light); margin-bottom: 8px;">
    ${mastery.mastery_description || "<i>Sem descrição</i>"}
  </div>
  
  ${outcomeHTML}
  </div>`;

  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: attacker }),
    flavor: msgContent,
    rolls: [atkRoll, dmgRoll].filter(r => r instanceof Roll)

  });
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


export const MasteryMagicAttackRoll = { roll: rollMagicMastery };

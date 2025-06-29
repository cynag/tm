// action-roller.js
import { BasicActionsDB } from "./basic-actions-db.js";

export async function rollAttack({ attacker, target, actionId, forcedDice }) {
  if (!attacker || !target) return ui.notifications.warn("Selecione um atacante e um alvo.");
  const targetActor = target?.actor;
  if (!targetActor) return ui.notifications.warn("O alvo não possui ficha de ator.");

  const attackerSystem = attacker.system;
  const targetSystem = targetActor.system;

  const isRight = actionId === "attack_right";
  const slotKey = isRight ? "slot_weapon1" : "slot_weapon2";
  const equipped = attackerSystem.gearSlots?.[slotKey];
  const item = equipped ? attacker.items.get(equipped.itemId) : null;
  const isUnarmed = !item;
  if (isUnarmed) console.warn("[ActionRoller] Ataque desarmado permitido.");

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

  const atkBase = attackerSystem.player_action_dice || 3;
  const extraDice = (attackerSystem.player_extra_dice?.[subtype] ?? 0) + (attackerSystem.player_extra_dice?.[damageType] ?? 0);
  const atkDice = forcedDice || (atkBase + extraDice);
  const atkRoll = await new Roll(`${atkDice}d6`).evaluate();

  const atkBonus = (attackerSystem.mod_dexterity ?? 0)
    + (attackerSystem.player_attack_bonus?.[subtype] ?? 0)
    + (attackerSystem.player_attack_bonus?.[damageType] ?? 0)
    + (attackerSystem.player_attack_bonus?.[size] ?? 0);

  const atkTotal = atkRoll.total + atkBonus;
  const atkDiceObjs = atkRoll.terms
  .filter(t => t instanceof Die)
  .flatMap(t => t.results.map(r => ({ result: r.result, faces: t.faces })));
  const count6 = atkDiceObjs.filter(d => d.result === 6).length;


  let critMult = 1;
  if (count6 === 2) critMult = 2;
  if (count6 === 3) critMult = 3;
  if (count6 === 2 && traits.weapon_trait_desc > 0 && atkDiceObjs.some(d => d.result === traits.weapon_trait_desc)) critMult = 3;


  const weaponDamage = isUnarmed ? "1d2" : (item.system.weapon_damage || "1d2");
  const baseRoll = await new Roll(weaponDamage.replace(/\(.*?\)/g, "").trim()).evaluate();
  const baseDmg = baseRoll.total;

  const dmgDiceObjs = baseRoll.terms
  .filter(t => t instanceof Die)
  .flatMap(t => t.results.map(r => ({ result: r.result, faces: t.faces })));


  const dmgBonus = (attackerSystem.mod_letality ?? 0)
    + (attackerSystem.player_damage_bonus?.[subtype] ?? 0)
    + (attackerSystem.player_damage_bonus?.[damageType] ?? 0)
    + (attackerSystem.player_damage_bonus?.[size] ?? 0);

  let finalDmg = (baseDmg + dmgBonus) * critMult;

  let elementalRoll = null, elementalDamage = 0, elementalLabel = null;
  let resist = 0; // ✅ aqui
  if (weaponDamage.includes("+")) {
    const parts = weaponDamage.split("+").map(s => s.trim());
    const eleRaw = parts[1];
    const match = eleRaw.match(/^(\d+d\d+)\s*\(([^)]+)\)/);
    
    if (match) {
  const [, eleRollRaw, eleType] = match;
  elementalRoll = await new Roll(eleRollRaw.trim()).evaluate();

  const elementMap = {
    fogo: "fire",
    gelo: "cold",
    eletrico: "electricity",
    veneno: "poison",
    acido: "acid",
    psiquico: "psychic",
    radiante: "radiant",
    necrótico: "necrotic",
    caótico: "chaotic"
  };

  const resistances = targetSystem.resistances || {};
  const resistKey = elementMap[eleType?.toLowerCase()] || eleType;
  resist = resistances[resistKey] ?? 0;

  elementalDamage = Math.max(0, elementalRoll.total - resist);

  elementalLabel = `${elementalDamage} ${eleType}`;
}

  }

  const ref = targetSystem.player_reflex ?? 10;
  const protBase = targetSystem.mod_protection ?? 0;
  const armorIsMetal = !!targetSystem.player_armor_is_metal;

  let protFinal = protBase;
  if (traits.weapon_trait_ironbreaker || (damageType === "perfurante" && !armorIsMetal)) protFinal = Math.floor(protBase / 2);

  const hit = atkTotal > ref;
  const dmgFinal = hit ? (finalDmg > protFinal ? finalDmg : Math.floor(finalDmg / 2)) : 0;

  const bonusAtk = (attackerSystem.player_attack_bonus?.[subtype] ?? 0)
  + (attackerSystem.player_attack_bonus?.[damageType] ?? 0)
  + (attackerSystem.player_attack_bonus?.[size] ?? 0);

const bonusDmg = (attackerSystem.player_damage_bonus?.[subtype] ?? 0)
  + (attackerSystem.player_damage_bonus?.[damageType] ?? 0)
  + (attackerSystem.player_damage_bonus?.[size] ?? 0);


  // 🟩 OUTCOME VISUAL – este bloco vem ANTES do msgContent
  const outcomeHTML = `
  <div class="tm-outcome">
    <div class="tm-row ${hit ? "tm-success" : "tm-failure"}">
      <span>${hit ? "Sucesso" : "Falha"}</span>
      <div class="tm-value">${atkTotal}</div>
      ${
        hit && critMult === 3
          ? `<span class="tm-mutilation">Mutilação</span>`
          : hit && critMult === 2
          ? `<span>Crítico</span>`
          : ""
      }
    </div>
    ${
      hit
        ? `
      <div class="tm-row tm-damage">
        <span>Dano</span>
        <div class="tm-value">${finalDmg}</div>
        <span>${damageType}</span>
      </div>`
        : ""
    }
  </div>
  <div class="tm-details" style="display: none; margin-top: 6px; font-size: 12px; color: #aaa; padding: 6px; background: #111; border: 1px solid #333; border-radius: 6px;">
  <strong>Detalhes da Rolagem:</strong><br>


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



  <div style="display: flex; gap: 6px; margin: 6px 0;">
    ${atkDiceObjs.map(die => `
    <div style="
    width: 32px;
    height: 32px;
    background-image: url('systems/tm/styles/assets/dices/d${die.faces}.svg');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 14px;
    text-shadow: 1px 1px 2px black;">
    ${die.result}
  </div>
`).join("")}
  </div>
<div style="display: flex; gap: 6px; margin: 4px 0 6px 0;">
  ${dmgDiceObjs.map(die => `
    <div style="
      width: 32px;
      height: 32px;
      background-image: url('systems/tm/styles/assets/dices/d${die.faces}.svg');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 14px;
      text-shadow: 1px 1px 2px black;">
      ${die.result}
    </div>
  `).join("")}
</div>


<hr />
<div style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
  <div style="display: flex; justify-content: space-between;">
    <span>Total do Ataque:</span>
    <span>${atkRoll.total}</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span>Bônus de Destreza:</span>
    <span>${(attackerSystem.mod_dexterity >= 0 ? "+" : "") + (attackerSystem.mod_dexterity ?? 0)}</span>
  </div>
  ${bonusAtk !== 0 ? `
  <div style="display: flex; justify-content: space-between;">
    <span>Bônus de Superioridade:</span>
    <span>${(bonusAtk >= 0 ? "+" : "") + bonusAtk}</span>
  </div>` : ""}
  <div style="display: flex; justify-content: space-between; font-weight: bold;">
    <span>Valor Final:</span>
    <span>${atkTotal}</span>
  </div>
</div>
  <hr style="border: 0; border-top: 1px solid #444; margin: 6px 0;" />
<div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
  <div style="display: flex; justify-content: space-between;">
    <span>Total do Dano:</span>
    <span>${baseDmg}</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span>Bônus de Letalidade:</span>
    <span>${(attackerSystem.mod_letality >= 0 ? "+" : "") + (attackerSystem.mod_letality ?? 0)}</span>
  </div>
  ${bonusDmg !== 0 ? `
  <div style="display: flex; justify-content: space-between;">
    <span>Bônus de Superioridade:</span>
    <span>${(bonusDmg >= 0 ? "+" : "") + bonusDmg}</span>
  </div>` : ""}
  <div style="display: flex; justify-content: space-between; font-weight: bold;">
    <span>Dano Total:</span>
    <span>${finalDmg}</span>
  </div>
</div>


<hr style="border: 0; border-top: 1px solid #444; margin: 10px 0 6px 0;" />
<div style="font-size: 12px; color: #ccc;">
  <div style="font-weight: bold; margin-bottom: 4px;">🜂 Dano Elemental:</div>
  <div style="display: flex; justify-content: space-between;">
    <span>Rolagem Base:</span>
    <span>${elementalRoll?.total ?? "–"}</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span>Resistência (${elementalLabel?.split(" ")[1] ?? "?"}):</span>
    <span>${elementalRoll ? resist : "–"}</span>
    </div>
  <div style="display: flex; justify-content: space-between; font-weight: bold;">
    <span>Dano Final:</span>
    <span>${elementalRoll ? elementalDamage : "–"}</span>
  </div>
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
    <div class="chat-attack" style="font-family: var(--font-primary); font-size: 1.1em;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
        <img src="${actionImg}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
        <div>
          <h2 style="margin: 0 0 4px 0; font-size: 16px;">${actionName}</h2>
          <div style="margin-bottom: 2px;">
            <span class="tag">${weaponDamage} ${damageType}</span>
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
      ${outcomeHTML}
    </div>
  `;

  const rolls = [atkRoll, baseRoll];
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: attacker }),
    flavor: msgContent,
    rolls
  });

  Hooks.once("renderChatMessage", (msg, html) => {
  html.find(".dice-roll").remove();       // Remove bloco inteiro da rolagem
  html.find(".dice-formula").remove();    // Fórmula
  html.find("h4.dice-total").remove();    // Total

  html.find(".tm-outcome").on("click", function () {
    const details = $(this).next(".tm-details");
    if (details.length) {
      details.slideToggle(150);
    }
  });
});


}

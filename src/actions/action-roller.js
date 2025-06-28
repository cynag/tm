import { BasicActionsDB } from "./basic-actions-db.js";

// action-roller.js

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
if (isUnarmed) {
  console.warn("[ActionRoller] Ataque desarmado permitido.");
}


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

  // === Rolagem de ataque ===
  const atkBase = attackerSystem.player_action_dice || 3;
  const extraDice = (attackerSystem.player_extra_dice?.[subtype] ?? 0) + (attackerSystem.player_extra_dice?.[damageType] ?? 0);
  const atkDice = forcedDice || (atkBase + extraDice);
  const atkRoll = await new Roll(`${atkDice}d6`).evaluate();

  const atkBonus = (attackerSystem.mod_dexterity ?? 0)
    + (attackerSystem.player_attack_bonus?.[subtype] ?? 0)
    + (attackerSystem.player_attack_bonus?.[damageType] ?? 0)
    + (attackerSystem.player_attack_bonus?.[size] ?? 0);

  const atkTotal = atkRoll.total + atkBonus;
  const atkDiceArray = atkRoll.terms.filter(t => t.constructor.name === "Die").flatMap(t => t.results.map(r => r.result));
  const count6 = atkDiceArray.filter(n => n === 6).length;

  let critMult = 1;
  if (count6 === 2) critMult = 2;
  if (count6 === 3) critMult = 3;
  if (count6 === 2 && traits.weapon_trait_desc > 0 && atkDiceArray.includes(traits.weapon_trait_desc)) critMult = 3;

  // === Dano base ===
  const weaponDamage = isUnarmed ? "1d2" : (item.system.weapon_damage || "1d2");


  const baseRoll = await new Roll(weaponDamage.replace(/\(.*?\)/g, "").trim()).evaluate();
  const baseDmg = baseRoll.total;

  const dmgBonus = (attackerSystem.mod_letality ?? 0)
    + (attackerSystem.player_damage_bonus?.[subtype] ?? 0)
    + (attackerSystem.player_damage_bonus?.[damageType] ?? 0)
    + (attackerSystem.player_damage_bonus?.[size] ?? 0);

  let finalDmg = (baseDmg + dmgBonus) * critMult;

  // === Dano elemental ===
  let elementalRoll = null, elementalDamage = 0, elementalLabel = null;
if (weaponDamage.includes("+")) {
  const parts = weaponDamage.split("+").map(s => s.trim());
  const eleRaw = parts[1]; // ex: "1d8 (fogo)" ou "1d8"
  const match = eleRaw.match(/^(\d+d\d+)\s*\(([^)]+)\)/);
  if (match) {
    const [, eleRollRaw, eleType] = match;
    elementalRoll = await new Roll(eleRollRaw.trim()).evaluate();
    const resistances = targetSystem.resistances || {};
    const resist = resistances[eleType] ?? 0;
    elementalDamage = Math.max(0, elementalRoll.total + resist);
    elementalLabel = `${elementalDamage} ${eleType}`;
  }
}




  // === Defesa do alvo ===
  const ref = targetSystem.player_reflex ?? 10;
  const protBase = targetSystem.mod_protection ?? 0;
  const armorIsMetal = !!targetSystem.player_armor_is_metal;

  let protFinal = protBase;
  if (traits.weapon_trait_ironbreaker || (damageType === "perfurante" && !armorIsMetal)) protFinal = Math.floor(protBase / 2);

  const hit = atkTotal > ref;
  const dmgFinal = hit ? (finalDmg > protFinal ? finalDmg : Math.floor(finalDmg / 2)) : 0;

  // === Visual: mensagem no chat ===
  
  let actionName;
const rangedTypes = ["bow", "crossbow", "gun"];

if (isUnarmed) {
  actionName = "Ataque Desarmado";
} else if (rangedTypes.includes(subtype)) {
  actionName = `Atirar com ${item.name?.trim() || "arma"}`;
} else {
  actionName = `Atacar com ${item.name?.trim() || "arma"}`;
}




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
    </div>
  `;

  const rolls = [atkRoll, baseRoll];
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: attacker }),
    flavor: msgContent,
    rolls
  });

  Hooks.once("renderChatMessage", (msg, html) => {
    html.find("h4.dice-total").remove();
  });
}


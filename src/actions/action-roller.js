// action-roller.js

export async function rollAttack({ attacker, target, actionId }) {
  if (!attacker || !target) {
    ui.notifications.warn("Selecione um atacante e um alvo.");
    return;
  }

  const attackerSystem = attacker.system;
  const targetActor = target?.actor;
  if (!targetActor) {
    ui.notifications.warn("O alvo não possui ficha de ator.");
    return;
  }
  const targetSystem = targetActor.system;

  const isRight = actionId === "attack_right";
  const slotKey = isRight ? "slot_weapon1" : "slot_weapon2";
  const equipped = attackerSystem.gearSlots?.[slotKey];
  const item = equipped ? attacker.items.get(equipped.itemId) : null;

  if (!item) {
    ui.notifications.warn("Nenhuma arma equipada nesse slot.");
    return;
  }

  const weaponDamage = item?.system?.weapon_damage || "1d2";
  const damageType = item?.system?.weapon_subtypes_2 || "impacto";
  const traitDesc = item?.system?.weapon_traits?.weapon_trait_desc ?? 0;
  const traitIronbreaker = item?.system?.weapon_traits?.weapon_trait_ironbreaker;
  const subtype = item?.system?.subtype;
  const size = item?.system?.weapon_subtypes_3;

  // ATAQUE
  const atkDiceBase = attackerSystem.player_action_dice || "3d6";
  const atkExtra = (attackerSystem.player_extra_dice?.[subtype] ?? 0) + (attackerSystem.player_extra_dice?.[damageType] ?? 0);
  const atkFormula = `${atkDiceBase} + ${atkExtra}d6`;
  const atkRoll = new Roll(atkFormula);
  await atkRoll.evaluate();

  const atkMod = (attackerSystem.mod_dexterity ?? 0) +
    (attackerSystem.player_attack_bonus?.[subtype] ?? 0) +
    (attackerSystem.player_attack_bonus?.[damageType] ?? 0) +
    (attackerSystem.player_attack_bonus?.[size] ?? 0);

  const atkTotal = atkRoll.total + atkMod;
  const atkDice = atkRoll.terms
    .filter(t => t?.constructor?.name === "Die")
    .flatMap(t => t.results.map(r => r.result));

  const count6 = atkDice.filter(d => d === 6).length;
  let critMult = 1;
  if (count6 === 2) critMult = 2;
  if (count6 === 3) critMult = 3;
  if (count6 === 2 && traitDesc > 0) {
    const lastDie = atkDice.find(d => d !== 6);
    if (lastDie >= traitDesc) critMult = 3;
  }

  // DANO
  const baseDamageRoll = new Roll(weaponDamage);
  await baseDamageRoll.evaluate();
  const baseDamage = baseDamageRoll.total;

  const dmgBonus = (attackerSystem.mod_letality ?? 0) +
    (attackerSystem.player_damage_bonus?.[subtype] ?? 0) +
    (attackerSystem.player_damage_bonus?.[damageType] ?? 0) +
    (attackerSystem.player_damage_bonus?.[size] ?? 0);

  let finalDamage = (baseDamage + dmgBonus) * critMult;

  // DANO ELEMENTAL
  const damageParts = weaponDamage.split("+").map(s => s.trim());
  const extraElement = damageParts.length > 1 ? damageParts[1] : null;
  let elementalDamage = 0;
  let elementalLabel = null;
  let eleRollResult = null;

 if (extraElement) {
  const [eleRoll, eleTypeRaw] = extraElement.split("[");
  const eleType = eleTypeRaw?.replace("]", "").trim();
  eleRollResult = new Roll(eleRoll.trim());
  await eleRollResult.evaluate();

  elementalDamage = eleRollResult.total;
  const resist = targetSystem.resistances?.[eleType] ?? 0;
  elementalDamage = Math.max(0, elementalDamage + resist);
  elementalLabel = `${elementalDamage} ${eleType}`;
  // 🔇 nada de rolls.push aqui
}

  // DEFESAS
  const ref = targetSystem.player_reflex ?? 10;
  const prot = targetSystem.mod_protection ?? 0;
  const armorIsMetal = targetSystem.player_armor_is_metal;

  let protFinal = prot;
  if (traitIronbreaker) {
    protFinal = Math.floor(prot / 2);
  } else if (damageType === "perfurante" && !armorIsMetal) {
    protFinal = Math.floor(prot / 2);
  }

  const hit = atkTotal > ref;
  const dmgFinal = hit ? (finalDamage > protFinal ? finalDamage : Math.floor(finalDamage / 2)) : 0;

  // TRAÇOS
  const traits = item?.system?.weapon_traits || {};
  const traitLabels = [];

  if (traits.weapon_trait_desc)
    traitLabels.push(`📄 DES (6.6.${traits.weapon_trait_desc})`);
  if (traits.weapon_trait_fast)
    traitLabels.push(`📄 RAP (+${traits.weapon_trait_fast})`);
  if (traits.weapon_trait_ironbreaker)
    traitLabels.push(`📄 QBF`);
  else if (damageType === "perfurante")
    traitLabels.push(`📄 PER`);

  const tagsHtml = traitLabels.length > 0
    ? `<hr><div style="margin-top: 5px;">${traitLabels.map(t => `<div>${t}</div>`).join("")}</div>`
    : "";

  // MENSAGEM
  const msgContent = `
    <div class="chat-attack" style="font-size: 1.1em;">
      <table style="width: 100%; text-align: center; margin-bottom: 10px;">
        <tr>
          <td>
            <strong>${atkTotal}</strong><br>
            <span style="font-size: 0.9em;">[${atkDice.join(", ")} + ${atkMod}]<br>vs REF ${ref}</span>
          </td>
          <td>
            <strong>${finalDamage}</strong><br>
            <span style="font-size: 0.9em;">[${baseDamage} + ${dmgBonus} x${critMult}]<br>vs PROT ${protFinal}</span>
          </td>
        </tr>
      </table>

      ${hit ? (() => {
        let resultado = "";
        if (critMult === 3) resultado += `<p><strong style="color:darkred;">MUTILAÇÃO!!</strong></p>`;
        else if (critMult === 2) resultado += `<p><strong style="color:darkorange;">Acerto Crítico!</strong></p>`;
        else resultado += `<p><strong>Acerto normal.</strong></p>`;

        resultado += protFinal < finalDamage
          ? `<p>A proteção é transpassada</p>`
          : `<p>A proteção absorve parte do impacto</p>`;

        resultado += `<p><strong>O dano final é ${Math.max(dmgFinal, 1)}</strong></p>`;
        return resultado;
      })() : `<p><strong style="color:gray;">O ataque errou.</strong></p>`}

      ${elementalLabel ? `<p><strong>Dano elemental extra:</strong> ${elementalLabel}</p>` : ""}
      ${tagsHtml}
    </div>
  `;

  const rolls = [atkRoll, baseDamageRoll]; // não inclua eleRollResult aqui


  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: attacker }),
    flavor: msgContent,
    rolls
  });

Hooks.once("renderChatMessage", (msg, html) => {
  html.find("h4.dice-total").remove();

});


}

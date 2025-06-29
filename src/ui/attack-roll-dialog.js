// attack-roll-dialog.js
import { BasicActionsDB } from "../actions/basic-actions-db.js";

export class AttackRollDialog {
  static show({ actor, actionId }) {
    const isRight = actionId === "attack_right";
    const slotKey = isRight ? "slot_weapon1" : "slot_weapon2";

    const equipped = actor.system.gearSlots?.[slotKey];
    const item = equipped ? actor.items.get(equipped.itemId) : null;

    const isUnarmed = !item;
if (isUnarmed) {
  console.warn("[AttackRollDialog] Ataque desarmado");
}


    const actionData = BasicActionsDB.find(a => a.id === actionId);
    const subtype = isUnarmed ? "unarmed" : item.system?.subtype?.toLowerCase();

    const imgKey = subtype ? `img_${subtype}` : "img_default";
    const actionImg = actionData?.[imgKey] || actionData?.img_default || "icons/svg/sword.svg";

    const traits = isUnarmed ? {} : (item?.system?.weapon_traits || {});

const damageType = isUnarmed ? "impacto" : (item?.system?.weapon_subtypes_2 || "impacto");




    const extraDice = (actor.system.player_extra_dice?.[subtype] ?? 0) +
                      (actor.system.player_extra_dice?.[damageType] ?? 0);

    const bonusAtk = actor.system.player_attack_bonus?.[subtype] ?? 0;
    const bonusDmg = actor.system.player_damage_bonus?.[subtype] ?? 0;

    let diceCountRef = { value: 3 + extraDice };

    const line1Tags = [];

    if (!isUnarmed) {
  if (item.system?.weapon_damage && item.system?.weapon_subtypes_2) {
  const base = item.system.weapon_damage;
  const bonusLet = actor.system.mod_letality ?? 0;
  const bonusDmg = actor.system.player_damage_bonus?.[subtype] ?? 0;
  const totalBonus = bonusLet + bonusDmg;
  const totalString = totalBonus > 0 ? ` +${totalBonus}` : "";
  line1Tags.push(`${base}${totalString} ${item.system.weapon_subtypes_2}`);
}

  if (item.system?.weapon_range)
    line1Tags.push(`${item.system.weapon_range}m`);
} else {
  line1Tags.push("1d2 impacto");
  line1Tags.push("1m");
}


    const line2Tags = [];
    if (traits.weapon_trait_2h) line2Tags.push("2H");
    if (traits.weapon_trait_pom) line2Tags.push("POM");
    if (traits.weapon_trait_heavy) line2Tags.push("LENTA");
    if (traits.weapon_trait_defensive) line2Tags.push("DEF");
    if (traits.weapon_trait_shield) line2Tags.push("ESC");
    if (traits.weapon_trait_desc) line2Tags.push(`DES 6.6.${traits.weapon_trait_desc}`);
    if (traits.weapon_trait_fast) line2Tags.push("RAP");
    if (traits.weapon_trait_ironbreaker) line2Tags.push("QBF");
    else if (damageType === "perfurante") line2Tags.push("PEN");
    if (traits.weapon_trait_vulnerable) line2Tags.push("VUL");

    const recharge = traits.weapon_trait_recharge || 0;
    if (recharge >= 8) line2Tags.push("REL");
    else if (recharge >= 4) line2Tags.push("REC");

    const line3Tags = [];
    const bonusDice = diceCountRef.value - 3;
    if (bonusDice > 0) line3Tags.push(`+${bonusDice}d6`);
    if (bonusAtk > 0) line3Tags.push(`+${bonusAtk} BA`);
    if (bonusDmg > 0) line3Tags.push(`+${bonusDmg} BD`);

    const html = `
      <div class="attack-roll-dialog" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${actionImg}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
          <div>
           <h2 style="margin:0; font-size: 16px;">${isUnarmed ? "Ataque Desarmado" : `Atacar com ${item.name}`}</h2>
            <div style="margin-top:4px;">
              ${line1Tags.map(t => `<span class="tag">${t}</span>`).join(" ")}
            </div>
            <div>
              ${line2Tags.map(t => `<span class="tag">${t}</span>`).join(" ")}
            </div>
            <div>
              ${line3Tags.map(t => `<span class="tag">${t}</span>`).join(" ")}
            </div>
          </div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-light);">
          ${actionData?.description || "<i>Sem descrição</i>"}
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
          <button class="step-down">▼</button>
          <div><strong><span class="dice-count">${diceCountRef.value}</span>d6</strong></div>
          <button class="step-up">▲</button>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: isUnarmed ? "Ataque Desarmado" : `Atacar com ${item.name}`,
      content: html,
      buttons: {
        cancel: { label: "Cancelar" },
        confirm: {
          icon: '<i class="fas fa-fist-raised"></i>',
          label: "Usar Ação",
          callback: async () => {
            console.log(`[AttackRollDialog] Ação confirmada com ${diceCountRef.value}d6`);
            await game.tm.ActionRoller.rollAttack({
              attacker: actor,
              target: Array.from(game.user.targets)[0],
              actionId,
              forcedDice: diceCountRef.value
            });
          }
        }
      },
      default: "confirm"
    });

    dialog.render(true);

    Hooks.once("renderDialog", (app, htmlEl) => {
      if (app.appId !== dialog.appId) return;

      const dom = htmlEl;
      dom.find(".step-up").on("click", () => {
        diceCountRef.value = Math.min(diceCountRef.value + 1, 10);
        dom.find(".dice-count").text(diceCountRef.value);
      });

      dom.find(".step-down").on("click", () => {
        diceCountRef.value = Math.max(diceCountRef.value - 1, 1);
        dom.find(".dice-count").text(diceCountRef.value);
      });
    });
  }
}

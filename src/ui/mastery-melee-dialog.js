import { MasteryMeleeAttackRoll } from "../roll/mastery-melee-attack-roll.js";

export class MasteryMeleeDialog {
  static async show({ actor, mastery }) {
    const diceCountRef = { value: 3 };
    let dialogHtml = null;

    const html = `
      <div class="attack-roll-dialog" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${mastery.mastery_img}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
          <div>
            <h2 style="margin:0; font-size: 16px;">${mastery.name}</h2>
            <div style="margin-top:4px;">
              <span class="tag">${mastery.mastery_cost || "–"} PA</span>
              <span class="tag">CD ${mastery.mastery_cd || "–"}</span>
              <span class="tag">${mastery.mastery_range || "–"}m</span>
            </div>
          </div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-light);">
          ${mastery.description || "<i>Sem descrição</i>"}
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 6px;">
          <label>Dados:</label>
          <button class="step-down">▼</button>
          <strong><span class="dice-count">${diceCountRef.value}</span>d6</strong>
          <button class="step-up">▲</button>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
          <label>Mão:</label>
          <select class="hand-select">
            <option value="right">Direita</option>
            <option value="left">Esquerda</option>
          </select>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: mastery.name,
      content: html,
      buttons: {
        cancel: { label: "Cancelar" },
        confirm: {
          icon: '<i class="fas fa-fist-raised"></i>',
          label: "Usar Maestria",
          callback: async () => {
            const target = Array.from(game.user.targets)[0];
            const selectedHand = dialogHtml.find(".hand-select").val() || "right";
            const slotKey = selectedHand === "right" ? "slot_weapon1" : "slot_weapon2";
            const equipped = actor.system.gearSlots?.[slotKey];
            const item = equipped ? actor.items.get(equipped.itemId) : null;

            if (!item) {
              ui.notifications.warn("Você precisa equipar uma arma");
              return;
            }

            const subtype = item?.system?.subtype?.toLowerCase();
            const damage = item?.system?.weapon_subtypes_2?.toLowerCase();
            const size = item?.system?.weapon_subtypes_3?.toLowerCase();
            const requirements = mastery.mastery_requirements;

            const fails = requirements && Array.isArray(requirements) && !requirements.some(req => {
              const okSubtype = !req.subtype || req.subtype.includes(subtype);
              const okDamage  = !req.damage  || req.damage.includes(damage);
              const okSize    = !req.size    || req.size.includes(size);
              return okSubtype && okDamage && okSize;
            });

            if (fails) {
              const reqList = requirements.map(req => {
                const parts = [];
                if (req.subtype) parts.push(`subtipo: ${req.subtype.join(", ")}`);
                if (req.damage)  parts.push(`dano: ${req.damage.join(", ")}`);
                if (req.size)    parts.push(`porte: ${req.size.join(", ")}`);
                return parts.join(" | ");
              }).join(" ou ");

              ui.notifications.warn(`Esta maestria requer: ${reqList}`);
              return;
            }

            await game.tm.MasteryMeleeAttackRoll.roll({
  attacker: actor,
  target,
  mastery,
  item,
  hand: selectedHand, // 👈 ISSO AQUI FALTAVA
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
      dialogHtml = htmlEl;

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

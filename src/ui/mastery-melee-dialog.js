// mastery-melee-dialog.js
import { MasteryMeleeAttackRoll } from "../roll/mastery-melee-attack-roll.js";

export class MasteryMeleeDialog {
  static async show({ actor, mastery }) {
    const diceCountRef = { value: 3 }; // base padrão
    const handRef = { value: "right" };

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
            console.log(`[MasteryDialog] Confirmado: ${diceCountRef.value}d6 com mão ${handRef.value}`);
            
            const target = Array.from(game.user.targets)[0];
const slotKey = handRef.value === "right" ? "slot_weapon1" : "slot_weapon2";
const equipped = actor.system.gearSlots?.[slotKey];
const item = equipped ? actor.items.get(equipped.itemId) : null;

if (!item) {
  ui.notifications.warn("Nenhuma arma encontrada na mão selecionada.");
  return;
}

await game.tm.MasteryMeleeAttackRoll.roll({
  attacker: actor,
  target,
  mastery,
  item,
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

      dom.find(".hand-select").on("change", (ev) => {
        handRef.value = ev.target.value;
      });
    });
  }
}

import { MasteryMagicAttackRoll } from "../roll/mastery-magic-attack-roll.js";

export class MasteryMagicDialog {
  static async show({ actor, mastery }) {
    const diceCountRef = { value: 3 };
    let dialogHtml = null;

    const html = `
      <div class="attack-roll-dialog" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${mastery.mastery_img}" width="48" height="48" style="border:1px solid #555; border-radius:4px;" />
          <div>
            <h2 style="margin:0; font-size: 16px;">${mastery.mastery_name}</h2>
            <div style="margin-top:4px;">
              <span class="tag">${mastery.mastery_cost || "–"} PA</span>
              <span class="tag">CD ${mastery.mastery_cd || "–"}</span>
              <span class="tag">${mastery.mastery_range || "–"}m</span>
            </div>
          </div>
        </div>
        <div style="font-size: 13px; color: var(--color-text-light);">
          ${mastery.mastery_description || "<i>Sem descrição</i>"}
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 6px;">
          <label>Dados:</label>
          <button class="step-down">▼</button>
          <strong><span class="dice-count">${diceCountRef.value}</span>d6</strong>
          <button class="step-up">▲</button>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: mastery.mastery_name,
      content: html,
      buttons: {
        cancel: { label: "Cancelar" },
        confirm: {
          icon: '<i class="fas fa-fire"></i>',
          label: "Conjurar Maestria",
          callback: async () => {
            const target = Array.from(game.user.targets)[0];
            if (!target) {
              ui.notifications.warn("Você precisa selecionar um alvo.");
              return;
            }

            const cdKey = {
              mastery_domain: mastery.mastery_domain ?? "unknown",
              mastery_name: mastery.mastery_name ?? "unnamed",
              mastery_nd: mastery.mastery_nd ?? "nd0"
            };

            if (game.tm.MasteryCooldown.isOnCooldown(actor, cdKey)) {
              const turns = game.tm.MasteryCooldown.getRemaining(actor, cdKey);
              ui.notifications.warn(`"${cdKey.mastery_name}" ainda está em recarga por ${turns} turno(s).`);
              return;
            }

            await MasteryMagicAttackRoll.roll({
              attacker: actor,
              target,
              mastery,
              forcedDice: diceCountRef.value
            });

            const cd = mastery.mastery_cd ?? 0;
            if (cd > 0 && mastery.id && game.combat?.started) {
              game.tm.MasteryCooldown.setCooldown(actor, mastery, cd);
            }

            if (actor.sheet?.rendered) {
              const html = $(actor.sheet.element);
              await game.tm.ActionsPanel.render(html, actor);
            }
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

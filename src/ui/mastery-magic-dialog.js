import { MasteryMagicAttackRoll } from "../roll/mastery-magic-attack-roll.js";
import { MasteryPersistent } from "../mastery/mastery-persistent.js";

export class MasteryMagicDialog {
  static async show({ actor, mastery }) {
    const isPersistentActive = (await actor.getFlag("tm", "persistentMasteryId")) === mastery.id;
    const diceCountRef = { value: 3 };
    let dialogHtml = null;

const html = isPersistentActive
  ? `<div style="padding: 10px; font-size: 14px;">
      <p>Essa maestria está ativa.<br>Deseja desativá-la?</p>
    </div>`
  : `<div class="attack-roll-dialog" style="display: flex; flex-direction: column; gap: 8px;">
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
${mastery.has_roll === false ? "" : `
  <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 6px;">
    <label>Dados:</label>
    <button class="step-down">▼</button>
    <strong><span class="dice-count">${diceCountRef.value}</span>d6</strong>
    <button class="step-up">▲</button>
  </div>
`}

    </div>`;


    const dialog = new Dialog({
      title: mastery.mastery_name,
      content: html,
buttons: isPersistentActive
  ? {
      cancel: { label: "Não" },
      confirm: {
        label: "Sim",
callback: async () => {
  await MasteryPersistent.deactivate(actor, mastery.id);
  ui.notifications.info("Maestria desativada.");

  const sheet = actor.sheet;
  if (sheet?.rendered) {
    const html = $(sheet.element);
    await game.tm.ActionsPanel.render(html, actor);
  }

}

      }
    }
  : {
      cancel: { label: "Cancelar" },
      confirm: {
        icon: '<i class="fas fa-fire"></i>',
        label: "Usar Maestria",
        callback: async () => {
////////////////////////////////////////////////
  // === VERIFICA SE PRECISA DE FOCO ARCANO
  const arcaneType = mastery.mastery_arcane_type;
  let arcaneCost = mastery.mastery_arcane_charges ?? 0;

  if (arcaneType && arcaneCost > 0) {
    const focus = actor.system.arcaneFocus?.[arcaneType];

    if (!focus || focus.charges < arcaneCost) {
      ui.notifications.warn(`⚠️ Você precisa de ${arcaneCost} carga(s) do foco arcano "${arcaneType}" para usar esta maestria.`);
      return;
    }

    // === REMOVE AS CARGAS DE UM DOS ITENS EQUIPADOS
    for (const itemId of focus.items) {
      const item = actor.items.get(itemId);
      const current = item.system.gear_arcaneCharges ?? 0;

      if (current <= 0) continue;

      const remove = Math.min(current, arcaneCost);
      arcaneCost -= remove;

      await item.update({ "system.gear_arcaneCharges": current - remove });

      if (arcaneCost <= 0) break;
    }
  }

// === VERIFICA SE TEM PA SUFICIENTE
const paCost = mastery.mastery_cost ?? 0;
const currentPA = actor.system.player_pa ?? 0;

if (paCost > 0) {
  if (currentPA < paCost) {
    ui.notifications.warn(`⚠️ Você precisa de ${paCost} PA para usar essa maestria, mas só tem ${currentPA}.`);
    return;
  }

  await actor.update({ "system.player_pa": currentPA - paCost });
}

// === VERIFICA ALVOS
const selectedTargets = Array.from(game.user.targets);
  const maxTargets = mastery.mastery_targets;

  if (!selectedTargets.length) {
    ui.notifications.warn("Você precisa selecionar ao menos um alvo.");
    return;
  }

  if (maxTargets !== "all" && selectedTargets.length > maxTargets) {
    ui.notifications.warn(`Essa maestria permite no máximo ${maxTargets} alvo(s).`);
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
    targets: selectedTargets,
    mastery,
    forcedDice: diceCountRef.value
  });

  const cd = mastery.mastery_cd ?? 0;
if (cd > 0 && mastery.id && game.combat?.started && !["posture", "conjuration"].includes(mastery.mastery_type)) {
  game.tm.MasteryCooldown.setCooldown(actor, mastery, cd);
}

if (["posture", "conjuration"].includes(mastery.mastery_type)) {
  await MasteryPersistent.activate(actor, mastery);
}

  if (actor.sheet?.rendered) {
    const html = $(actor.sheet.element);
    await game.tm.ActionsPanel.render(html, actor);
  }
}

/////////////////////////////////////////////////

        }
      },
      default: "confirm"
    });

    dialog.render(true);

Hooks.once("renderDialog", (app, htmlEl) => {
  if (app.appId !== dialog.appId) return;
  if (isPersistentActive) return;

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

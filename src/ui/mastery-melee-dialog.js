import { MasteryMeleeAttackRoll } from "../roll/mastery-melee-attack-roll.js";
import { MasteryPersistent } from "../mastery/mastery-persistent.js";

export class MasteryMeleeDialog {
  static async show({ actor, mastery }) {
    const diceCountRef = { value: 3 };
    let dialogHtml = null;
    const isPersistentActive = (await actor.getFlag("tm", "persistentMasteryId")) === mastery.id;

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
${mastery.has_roll !== false ? `
  <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
    <label>Mão:</label>
    <select class="hand-select">
      <option value="right">Direita</option>
      <option value="left">Esquerda</option>
    </select>
  </div>
` : ""}

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
  icon: '<i class="fas fa-fist-raised"></i>',
  label: "Usar Maestria",
  callback: async () => {
const needTarget = mastery.need_target !== false; // default = true
const target = Array.from(game.user.targets)[0] || null;

if (needTarget && !target) {
  ui.notifications.warn("Você precisa selecionar um alvo.");
  return;
}
console.log("[Dialog][NeedTarget]", { needTarget, hasTarget: !!target });


const selectedHand = dialogHtml.find(".hand-select").val() || "right";
const slotKey = selectedHand === "right" ? "slot_weapon1" : "slot_weapon2";
const equipped = actor.system.gearSlots?.[slotKey];
const item = equipped ? actor.items.get(equipped.itemId) : null;

const needWeapon = mastery.need_weapon !== false; // default = true
if (needWeapon && !item) {
  ui.notifications.warn("Você precisa equipar uma arma");
  return;
}



    const cdKey = {
      mastery_domain: mastery.mastery_domain ?? mastery.system?.domain ?? "unknown",
      mastery_name: mastery.mastery_name ?? mastery.name ?? "unnamed",
      mastery_nd: mastery.mastery_nd ?? mastery.system?.nd ?? "nd0"
    };

    if (game.tm.MasteryCooldown.isOnCooldown(actor, cdKey)) {
      const turns = game.tm.MasteryCooldown.getRemaining(actor, cdKey);
      ui.notifications.warn(`"${cdKey.mastery_name}" ainda está em recarga por ${turns} turno(s).`);
      return;
    }

const subtype = item?.system?.subtype?.toLowerCase() || null;
const damage  = item?.system?.weapon_subtypes_2?.toLowerCase() || null;
const size    = item?.system?.weapon_subtypes_3?.toLowerCase() || null;

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
      hand: selectedHand,
      forcedDice: diceCountRef.value
    });

    if (["posture", "conjuration"].includes(mastery.mastery_type)) {
      await game.tm.MasteryPersistent.activate(actor, mastery);
    }

    const cd = mastery.mastery_cd ?? 0;
if (
  cd > 0 &&
  mastery.id &&
  game.combat?.started &&
  !["posture", "conjuration"].includes(mastery.mastery_type)
) {
  game.tm.MasteryCooldown.setCooldown(actor, mastery, cd);
}


    const sheet = actor.sheet;
    if (sheet?.rendered) {
      const html = $(sheet.element);
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

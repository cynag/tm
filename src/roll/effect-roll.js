import { EffectsDB } from "../effects/effects-db.js";
import { EffectApply } from "../effects/effect-apply.js";

export async function rollEffectResistance({ target, effectId, isAdvantage = false, isDisadvantage = false }) {
  if (!target || !effectId) {
    ui.notifications.warn("Alvo e efeito devem ser definidos.");
    return;
  }

  const targetActor = target.actor;
  if (!targetActor) return ui.notifications.warn("O alvo não possui ficha de ator.");

  const effect = EffectsDB.find(e => e.id === effectId);
  if (!effect) {
    ui.notifications.warn(`Efeito "${effectId}" não encontrado no banco.`);
    return;
  }

  const isRM = effect.effect_type === "rm";
  const resistLabel = isRM ? "RESISTÊNCIA MENTAL:" : "RESISTÊNCIA FÍSICA:";
  const resistValue = isRM ? (targetActor.system.player_resistance_mental ?? 0) : (targetActor.system.player_resistance_phys ?? 0);

  const rollFormula = (isAdvantage || isDisadvantage) ? "2d100" : "1d100";
  const roll = new Roll(rollFormula);
  await roll.evaluate();

  let final = roll.total;
  let labelRoll = `${roll.result}`;
  let chosenRolls = [];

  if (isAdvantage || isDisadvantage) {
    const results = roll.terms[0].results.map(r => r.result);
    final = isAdvantage ? Math.min(...results) : Math.max(...results);
    labelRoll = `${results[0]} / ${results[1]} → ${final}`;
    chosenRolls = results;
  } else {
    chosenRolls = [final];
  }

  const passed = final <= resistValue;
  const outcome = passed ? "Resistido" : "Falha";
  const outcomeClass = passed ? "tm-success" : "tm-failure";
  const rollId = foundry.utils.randomID();

  const details = `
    <div class="tm-details" data-rollid="${rollId}" style="display: none; margin-top: 6px; font-size: 12px; color: #aaa; padding: 6px; background: #111; border: 1px solid #333; border-radius: 6px;">
      <div class="dice-tray" style="display: flex; justify-content: center; gap: 6px; margin: 8px 0;">
        ${chosenRolls.map(v => `
          <div class="dice-icon">
            <div class="dice-bg" style="background-image: url('systems/tm/styles/assets/dices/d100.svg');"></div>
            <div class="dice-number">${v}</div>
          </div>
        `).join("")}
      </div>
      <hr style="border: 0; border-top: 1px solid #444; margin: 6px 0 4px 0;" />
      <div class="details-effect" style="font-size: 13px; color: #ccc; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Valor do dado:</span><span>${labelRoll}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>${isRM ? "Resistência Mental" : "Resistência Física"}:</span><span>${resistValue}</span>
        </div>
        <hr style="border: 0; border-top: 1px solid #444; margin: 6px 0 4px 0;" />
      </div>
    </div>`;

  const html = `
    <div class="chat-attack tm-processed" style="font-family: var(--font-primary); font-size: 1.1em;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
        <img src="${effect.img || "icons/svg/aura.svg"}" width="35" height="35" style="border:1px solid #555; border-radius:4px;" />
        <div>
          <h2 style="margin: 0 0 4px 0; font-size: 16px;">Resistência contra ${effect.name}</h2>
          <div style="margin-bottom: 2px;"><span class="tag">🎯 ${targetActor.name}</span></div>
          <div style="margin-bottom: 2px;"><span class="tag">${isRM ? "RM" : "RF"}: ${resistValue}</span></div>
        </div>
      </div>
      <div style="font-size: 13px; color: var(--color-text-light); margin-bottom: 8px;">
        ${effect.description || "<i>Sem descrição</i>"}
      </div>
      <div class="tm-outcome ${outcomeClass}" data-rollid="${rollId}" style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; cursor: pointer;">
        <span style="font-weight: bold;">${outcome}</span>
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
        ">${final}</div>
      </div>
      ${details}
    </div>`;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: targetActor }),
    content: html,
    rolls: [roll]
  });

  if (!passed) {
    await EffectApply.apply({ actor: targetActor, effectId: effect.id });
  }

  console.log(`[🎯] Rolagem de resistência (${effect.name}):`, {
    actor: targetActor.name,
    resultado: final,
    resistencia: resistValue,
    sucesso: passed
  });
}

// 🪛 Gatilho para expandir detalhes
Hooks.on("renderChatMessage", (msg, html) => {
  const rollId = html[0]?.querySelector(".tm-outcome")?.dataset?.rollid;
  if (!rollId) return;

  html[0].querySelectorAll(`[data-rollid="${rollId}"].tm-outcome`).forEach(outcome => {
    outcome.addEventListener("click", () => {
      const details = html[0].querySelector(`[data-rollid="${rollId}"].tm-details`);
      if (details) {
        const $details = $(details);
        $details.stop(true, true).slideToggle(150);
      }
    });
  });
});

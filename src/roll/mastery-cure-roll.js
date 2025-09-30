// src/roll/mastery-cure-roll.js
import { MasteryParser } from "../mastery/mastery-parser.js";

export class MasteryCureRoll {
  /**
   * Cura não tem ataque, nem elemento. Só rola cura e aplica em cada alvo.
   * Usa:
   *  - mastery.mastery_damage_formula  (cura base)
   *  - mastery.spell_damage_bonus      (bônus de cura opcional)
   *  - mastery.spell_damage_bonus_2    (bônus de cura opcional)
   */
  static async roll({ caster, targets = [], mastery }) {
    try {
      if (!caster) { ui.notifications.warn("Selecione o conjurador."); return { ok:false, reason:"NO_CASTER" }; }
      if (!Array.isArray(targets) || targets.length === 0) { ui.notifications.warn("Selecione ao menos um alvo."); return { ok:false, reason:"NO_TARGETS" }; }

      const domain = mastery.mastery_domain || mastery.system?.domain || null;
      console.log("[CURE][roll] start", { masteryId: mastery.id, targets: targets.map(t => t.name) });
const targetNames = targets.map(t => t.name || "???");
console.log("[CURE] targets:", targetNames);

      // 1) Cura base
      const baseRes = await MasteryParser.evaluate(mastery.mastery_damage_formula || "0", caster, null, "roll", domain);
      let totalHeal = Number(baseRes?.value ?? 0);

      // 2) Bônus de cura (mesmas chaves de dano das magias)
      const bonusRolls = [];
      async function addBonus(expr) {
        if (!expr) return 0;
        if (expr.includes("d")) {
          const r = await MasteryParser.evaluate(expr, caster, null, "roll", domain);
          if (r?.roll) bonusRolls.push(r.roll);
          return Number(r?.value ?? 0);
        } else {
          const r = await MasteryParser.evaluate(expr, caster, null, "number", domain);
          return Number(r?.value ?? 0);
        }
      }
      totalHeal += await addBonus(mastery.spell_damage_bonus);
      totalHeal += await addBonus(mastery.spell_damage_bonus_2);
      totalHeal = Math.max(0, totalHeal);

      console.log("[CURE][roll] totals", {
        base: mastery.mastery_damage_formula,
        bonusA: mastery.spell_damage_bonus,
        bonusB: mastery.spell_damage_bonus_2,
        totalHeal
      });

// 3) Sem aplicar PV — só log
const results = [];
for (const t of targets) {
  const ta = t.actor; if (!ta) continue;
  results.push({ name: ta.name }); // mantém shape mínimo
  console.log("[CURE] skip apply HP (disabled):", { target: ta.name, heal: totalHeal });
}


      // 4) Chat (agregado)
      const bonusTag = [mastery.spell_damage_bonus, mastery.spell_damage_bonus_2].filter(Boolean).join(" + ");
      const rollsToShow = [baseRes?.roll, ...bonusRolls].filter(Boolean);

      const content = `
        <div class="chat-roll" style="font-family: var(--font-primary); font-size: 1.1em;">
          <div class="chat-header" style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <img class="chat-img" src="${mastery.mastery_img}" width="35" height="35" style="border:1px solid #555;border-radius:4px;" />
            <div>
              <h2 class="chat-roll-name" style="margin:0 0 4px 0;font-size:16px;">${mastery.mastery_name}</h2>
              <div class="chat-tags" style="display:flex;gap:4px;justify-content:flex-end;margin-bottom:2px;">
                <span class="tag">${{ action:"AÇÃO", conjuration:"CONJURAÇÃO", reaction:"REAÇÃO", stance:"POSTURA", passive:"PASSIVA" }[mastery.mastery_type] || mastery.mastery_type}</span>
                <span class="tag">${mastery.mastery_cost || "–"} PA</span>
                <span class="tag">CD ${mastery.mastery_cd || "–"}</span>
                <span class="tag">${mastery.mastery_range || "–"}m</span>
              </div>
              <div class="chat-tags" style="display:flex;gap:4px;justify-content:flex-end;margin-bottom:2px;">
                <span class="tag">${mastery.mastery_damage_formula || "0"}${bonusTag ? " + " + bonusTag : ""}</span>
<span class="tag">🩹 Cura</span>
<span class="tag">🎯 ${targetNames.join(", ")}</span>

              </div>
            </div>
          </div>

          <div class="chat-description" style="font-size:13px;color:var(--color-text-light);margin-bottom:8px;">
            ${mastery.mastery_description || "<i>Sem descrição</i>"}
          </div>

          
    <div class="tm-outcome">
  <div class="tm-row tm-damage" style="gap:8px;justify-content:center;">
    <span style="font-weight:bold;">Cura</span>
    <div style="position:relative;width:32px;height:32px;background-image:url('systems/tm/styles/assets/ui/hex-2.svg');background-size:cover;display:flex;align-items:center;justify-content:center;color:white;text-shadow:1px 1px 2px black;font-weight:bold;">
      ${totalHeal}
    </div>
    <span></span>
  </div>

  <!-- 🔽 Detalhes que abrem ao clicar no hex -->
  <div class="tm-details" style="display:none;margin-top:6px;font-size:12px;color:#aaa;padding:6px;background:#111;border:1px solid #333;border-radius:6px;">
    <strong>Detalhes da Cura:</strong>

    <!-- Dados da rolagem (base + bônus) -->
    <div class="dice-tray" style="display:flex;justify-content:center;gap:6px;margin:6px 0;flex-wrap:wrap;max-width:320px;margin-left:auto;margin-right:auto;">
      ${(() => {
        const diceObjs = [];
        // base
        if (baseRes?.roll) {
          for (const term of baseRes.roll.terms) {
            if (term instanceof foundry.dice.terms.Die) {
              for (const r of term.results) {
                diceObjs.push({ result: r.result, faces: term.faces });
              }
            }
          }
        }
        // bônus
        for (const roll of bonusRolls) {
          for (const term of roll.terms) {
            if (term instanceof foundry.dice.terms.Die) {
              for (const r of term.results) {
                diceObjs.push({ result: r.result, faces: term.faces });
              }
            }
          }
        }
        return diceObjs.map(die => `
          <div class="dice-icon dice-heal">
            <div class="dice-bg" style="background-image:url('systems/tm/styles/assets/dices/d${die.faces}.svg');"></div>
            <div class="dice-number">${die.result}</div>
          </div>
        `).join("");
      })()}
    </div>

  </div>
</div>
`;

      await ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: caster }),
        flavor: content,
        rolls: rollsToShow
      });

      Hooks.once("renderChatMessage", (msg, html) => {
        if (html.hasClass("tm-processed")) return;
        html.addClass("tm-processed");
        html.find(".tm-outcome").on("click", function () {
          const details = $(this).closest(".tm-outcome").find(".tm-details");
          if (details.length) details.slideToggle(150);
        });
      });

      return { ok:true, totalHeal, targets: results };
    } catch (err) {
      console.error("[CURE][roll] error", err);
      ui.notifications.error("Falha ao processar a cura.");
      return { ok:false, error:err };
    }
  }
}

// Disponibiliza no namespace global como os demais
if (!globalThis.game?.tm) globalThis.game.tm = {};
globalThis.game.tm.MasteryCureRoll = MasteryCureRoll;

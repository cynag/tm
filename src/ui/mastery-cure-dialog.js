// src/ui/mastery-cure-dialog.js
import { MasteryCureRoll } from "../roll/mastery-cure-roll.js";
import { MasteryPersistent } from "../mastery/mastery-persistent.js";

export class MasteryCureDialog {
  static async show({ actor, mastery }) {
    console.log("[Dialog][CURE] open", { id: mastery.id, name: mastery.mastery_name });

    const isPersistentActive = (await actor.getFlag("tm", "persistentMasteryId")) === mastery.id;

    const html = isPersistentActive
      ? `<div style="padding: 10px; font-size: 14px;">
          <p>Essa maestria está ativa.<br>Deseja desativá-la?</p>
        </div>`
      : `<div class="attack-roll-dialog" style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${mastery.mastery_img}" width="48" height="48" style="border:1px solid #555;border-radius:4px;" />
            <div>
              <h2 style="margin:0;font-size:16px;">${mastery.mastery_name}</h2>
              <div style="margin-top:4px;">
                <span class="tag">${mastery.mastery_cost || "–"} PA</span>
                <span class="tag">CD ${mastery.mastery_cd || "–"}</span>
                <span class="tag">${mastery.mastery_range || "–"}m</span>
              </div>
            </div>
          </div>
          <div style="font-size:13px;color:var(--color-text-light);">
            ${mastery.mastery_description || "<i>Sem descrição</i>"}
          </div>
          <!-- Cura não tem rolagem de ataque/controle de dados -->
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
                if (actor.sheet?.rendered) {
                  const el = $(actor.sheet.element);
                  await game.tm.ActionsPanel.render(el, actor);
                }
              }
            }
          }
        : {
            cancel: { label: "Cancelar" },
            confirm: {
              icon: '<i class="fas fa-plus-square"></i>',
              label: "Usar Maestria",
              callback: async () => {
                // === FOCO ARCANO (se existir custo)
                const arcaneType = mastery.mastery_arcane_type;
                let arcaneCost = mastery.mastery_arcane_charges ?? 0;

                if (arcaneType && arcaneCost > 0) {
                  const focus = actor.system.arcaneFocus?.[arcaneType];
                  if (!focus || focus.charges < arcaneCost) {
                    ui.notifications.warn(`⚠️ Você precisa de ${arcaneCost} carga(s) do foco "${arcaneType}".`);
                    return;
                  }
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

                // === PA
                const paCost = mastery.mastery_cost ?? 0;
                const currentPA = actor.system.player_pa ?? 0;
                if (paCost > 0) {
                  if (currentPA < paCost) {
                    ui.notifications.warn(`⚠️ Você precisa de ${paCost} PA (tem ${currentPA}).`);
                    return;
                  }
                  await actor.update({ "system.player_pa": currentPA - paCost });
                }

                // === Alvos
                const selectedTargets = Array.from(game.user.targets);
                const maxTargets = mastery.mastery_targets;
                if (!selectedTargets.length) { ui.notifications.warn("Selecione ao menos um alvo."); return; }
                if (maxTargets !== "all" && selectedTargets.length > maxTargets) {
                  ui.notifications.warn(`Essa maestria permite no máximo ${maxTargets} alvo(s).`);
                  return;
                }

                // === Cooldown
                const cdKey = {
                  mastery_domain: mastery.mastery_domain ?? "unknown",
                  mastery_name: mastery.mastery_name ?? "unnamed",
                  mastery_nd: mastery.mastery_nd ?? "nd0"
                };
                if (game.tm.MasteryCooldown.isOnCooldown(actor, cdKey)) {
                  const turns = game.tm.MasteryCooldown.getRemaining(actor, cdKey);
                  ui.notifications.warn(`"${cdKey.mastery_name}" em recarga por ${turns} turno(s).`);
                  return;
                }

                // === Rola e aplica a CURA
                await MasteryCureRoll.roll({
                  caster: actor,
                  targets: selectedTargets,
                  mastery
                });

                // === Seta o CD (se houver) — igual às magias
                const cd = mastery.mastery_cd ?? 0;
                if (cd > 0 && mastery.id && game.combat?.started && !["posture","conjuration"].includes(mastery.mastery_type)) {
                  game.tm.MasteryCooldown.setCooldown(actor, mastery, cd);
                }

                // === Postura/conjuração (não usual para cura, mas mantemos comportamento)
                if (["posture","conjuration"].includes(mastery.mastery_type)) {
                  await MasteryPersistent.activate(actor, mastery);
                }

                // Atualiza painel
                if (actor.sheet?.rendered) {
                  const el = $(actor.sheet.element);
                  await game.tm.ActionsPanel.render(el, actor);
                }
              }
            }
          },
      default: "confirm"
    });

    dialog.render(true);
  }
}

// Disponibiliza no namespace global (mesmo padrão do MagicDialog)
if (!globalThis.game?.tm) globalThis.game.tm = {};
globalThis.game.tm.MasteryCureDialog = MasteryCureDialog;

import { EffectApply } from "../effects/effect-apply.js";
import { EffectParser } from "../effects/effect-parser.js";
import { MasteryParser } from "../mastery/mastery-parser.js";

export class MasteryPersistent {
static async activate(actor, mastery) {
  if (!actor || !mastery) return;

  // 🔹 PASSIVE: aplica e sai (sem flag, sem toggle)
  if (mastery.mastery_type === "passive") {
    const effectId = `passive-${mastery.id}`;

    // remove duplicados desta passiva
    const existing = actor.effects.filter(e => e.getFlag("tm", "effectId") === effectId);
    for (const ef of existing) await ef.delete();

    // calcula changes a partir de mastery_effect
    const changesMap = await MasteryParser.extractEffects(
      mastery.mastery_effect || "",
      actor,
      null,
      mastery.mastery_domain || mastery.system?.domain || null
    );

    const changes = Object.entries(changesMap).map(([k, v]) => ({
      key: `system.${k}`,
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: v
    }));

    const [created] = await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: mastery.mastery_name,
      icon: mastery.mastery_img,
      origin: `Actor.${actor.id}`,
      disabled: false,
      duration: {},
      changes,
      flags: {
        tm: {
          source: "passive-mastery",
          isMastery: true,
          persistentId: mastery.id,
          effectId,
          customEffect: mastery.mastery_effect || ""
        }
      }
    }]);

    console.log(`[✅ Passive] Aplicada: ${mastery.mastery_name}`, created?.toObject());
    const sheet = actor.sheet;
    if (sheet?.rendered) await sheet.render(true);
    return; // ⬅️ encerra aqui para não cair na lógica de postura/conjuração
  }

  // 🔸 POSTURE/CONJURATION: fluxo com flag/toggle
  const previous = await actor.getFlag("tm", "persistentMasteryId");
  if (previous && previous !== mastery.id) {
    await this.deactivate(actor, previous);
  }

  // só seta flag para postura/conjuração
  if (["posture", "conjuration"].includes(mastery.mastery_type)) {
    await actor.setFlag("tm", "persistentMasteryId", mastery.id);
  }



  // 🧼 Remove qualquer efeito duplicado com o mesmo ID antes de aplicar
  const effectId = `posture-${mastery.id}`;
  const existingEffects = actor.effects.filter(e => e.getFlag("tm", "effectId") === effectId);
  for (const effect of existingEffects) await effect.delete();

  // 🧪 Aplica efeito visual personalizado (uma vez)
  await EffectApply.applyCustom({
    actor,
    effectId,
    label: mastery.mastery_name,
    img: mastery.mastery_img,
    duration: mastery.duration ?? null,
    commands: await this.#evaluateEffectCommands(actor, mastery),
    isMastery: true
  });

  // 🧾 Cria ActiveEffect registrado (base para reaplicações legítimas)
  await actor.createEmbeddedDocuments("ActiveEffect", [
    {
      name: mastery.mastery_name,
      icon: mastery.mastery_img,
      origin: `Actor.${actor.id}`,
      disabled: false,
      duration: {},
      changes: [],
      flags: {
        core: {
          statusId: effectId
        },
        tm: {
          source: "resistance-roll",
          appliedFrom: "persistent-mastery",
          effectId,
          isMastery: true,
          persistentId: mastery.id,
          customEffect: mastery.effect || []
        }
      }
    }
  ]);

  await actor.prepareData();
  console.log(`[🔥] Postura/Conjuração ativada: ${mastery.mastery_name}`);

  const sheet = actor.sheet;
  if (sheet?.rendered) await sheet.render(true);
}


static async deactivate(actor, masteryId) {
  if (!actor || !masteryId) return;

  // Descobre tipo da maestria
  const allDomains = Object.values(game.tm?.DomainsDB ?? {}).flat();
  const mastery = allDomains.find(m => m.id === masteryId);
  const type = mastery?.mastery_type ?? "unknown";

  // 🔹 PASSIVE: remove efeito e sai (não usa flag)
  if (type === "passive") {
    const passiveEffects = actor.effects.filter(e =>
      e.getFlag("tm", "persistentId") === masteryId &&
      e.getFlag("tm", "source") === "passive-mastery"
    );
    for (const ef of passiveEffects) await ef.delete();
    console.log(`[🧹 Passive] Removida: ${masteryId} (deleted=${passiveEffects.length})`);

    const sheet = actor.sheet;
    if (sheet?.rendered) await sheet.render(true);
    return; // ⬅️ encerra aqui; nada de flag/visual
  }

  // 🔸 POSTURE/CONJURATION: fluxo antigo com flag/toggle
  const current = await actor.getFlag("tm", "persistentMasteryId");
  if (current !== masteryId) return;

  await actor.unsetFlag("tm", "persistentMasteryId");

  if (mastery && mastery.mastery_cd > 0 && game.combat?.started) {
    game.tm.MasteryCooldown.setCooldown(actor, mastery, mastery.mastery_cd);
  }

  // Remove o efeito visual (posture-*)
  await EffectApply.remove(actor, `posture-${masteryId}`);

  // Remove qualquer ActiveEffect ligado a esta persistente
  const effects = actor.effects.filter(e => e.getFlag("tm", "persistentId") === masteryId);
  for (const effect of effects) {
    await effect.delete();
  }

  console.log(`[💨] Postura/Conjuração removida: ${masteryId}`);
}


static async #evaluateEffectCommands(actor, mastery) {
  const evaluated = [];

  for (let raw of mastery.effect || []) {
    const match = raw.match(/^if\[actor\|player_domain_(.+?)_level:(\d+),\s*([+\-]?\d+)\/(NDi|NDp|ND),\s*0\]\s*@\{(.+?)\}$/i);
    if (match) {
      const domain = match[1];
      const minLevel = parseInt(match[2]);
      const base = parseInt(match[3]);
      const keyND = match[4];
      const targetAttr = match[5];

      const current = actor.system?.[`player_domain_${domain}_level`] ?? 0;
      if (current >= minLevel) {
        const result = await MasteryParser.evaluate(`${base}/${keyND}`, actor, null, "number", domain);
        const value = result?.value ?? 0;
        evaluated.push(`${value >= 0 ? "+" + value : value} @{${targetAttr}}`);
      }
    } else {
      evaluated.push(raw);
    }
  }

  console.log("[✅ Commands Finalizados]", evaluated);
  return evaluated;
}
  



}

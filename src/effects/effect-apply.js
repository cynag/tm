import { EffectsDB } from "./effects-db.js";
import { EffectParser } from "./effect-parser.js";
import { EffectRender } from "./effect-render.js";

export class EffectApply {
  static async apply({ actor, effectId }) {
    if (!actor || !effectId) return ui.notifications.warn("Ator e efeito devem ser definidos.");

    const effect = EffectsDB.find(e => e.id === effectId);
    if (!effect) return ui.notifications.warn(`Efeito "${effectId}" não encontrado.`);

    const current = actor.system.activeEffects ?? [];
    const same = current.filter(e => e.id === effectId);
    const alreadyHas = same.length > 0;

    if (alreadyHas && !effect.stackable) {
      console.log(`[🛑] Efeito "${effect.name}" já está aplicado e não empilha.`);
      return;
    }

    // Aplica modificadores diretos
    if (effect.effect) {
      const count = same.length + 1;
      for (let i = 0; i < count; i++) {
        EffectParser.apply(actor, effect.effect);
      }
    }

    // Atualiza system.activeEffects
    const updatedList = [...current];
    if (effect.stackable) {
      updatedList.push({ id: effect.id });
    } else {
      updatedList.push({ id: effect.id });
    }

    await actor.update({ "system.activeEffects": updatedList });

    // Cria o ActiveEffect visual
    const currentCount = same.length + 1;
    const label = effect.stackable ? `${effect.name} (${currentCount})` : effect.name;

const effectData = {
  id: effect.id,
  name: label,
  label: label,
  icon: effect.img || "icons/svg/aura.svg",
  origin: `Actor.${actor.id}`,
  duration: { rounds: effect.duration || 1 },
  changes: EffectParser.toFoundryChanges(effect.effect),
  flags: {
    tm: {
      source: "resistance-roll",
      appliedFrom: "direct-apply",
      effectId: effect.id,
      stackCount: currentCount
    }
  }
};


    const existing = actor.effects.find(e => e.getFlag("tm", "effectId") === effect.id);

    if (existing && effect.stackable) {
      const match = existing.name.match(/\((\d+)\)$/);
      const existingCount = match ? parseInt(match[1]) : 1;
      const nextCount = existingCount + 1;
      await existing.update({ name: `${effect.name} (${nextCount})` });
    } else if (!existing) {
      await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }

    // Atualiza visuais
    await EffectRender.update(actor);

    console.log(`[🧪] Efeito "${label}" aplicado a ${actor.name}`);
  }
  
  static async remove(actor, effectId) {
  const effect = EffectsDB.find(e => e.id === effectId);
  if (!effect) return;

  // Remove modificadores aplicados manualmente
  if (effect.effect) {
    EffectParser.remove(actor, effect.effect);
  }

  // Remove da lista de efeitos ativos no system
  const current = actor.system.activeEffects ?? [];
  const updated = current.filter(e => e.id !== effectId);
  await actor.update({ "system.activeEffects": updated });

  // Remove ActiveEffect real
  const real = actor.effects.find(e => e.getFlag("tm", "effectId") === effectId);
  if (real) {
    await actor.deleteEmbeddedDocuments("ActiveEffect", [real.id]);

    const token = actor.getActiveTokens()[0];
    if (token && token.document.overlayEffect === real.icon) {
      await token.document.update({ overlayEffect: null });
    }
  }

  // Atualiza visuais
  await EffectRender.update(actor);
  console.log(`[🧽] Efeito "${effect.name}" removido de ${actor.name}`);
}

}

export class EffectDuration {
  static async reduceAll(actor) {
    const current = actor.system.activeEffects ?? [];
    const updated = [];

    for (const e of current) {
      const data = EffectsDB.find(d => d.id === e.id);
      if (!data || !data.duration) {
        updated.push(e); // efeito permanente
        continue;
      }

      e._remaining = (e._remaining ?? data.duration) - 1;

      if (e._remaining > 0) {
        updated.push(e);
      } else {
        console.log(`[⏳] Removendo efeito expirado: ${data.name}`);

// Remove modificadores
EffectParser.remove(actor, data.effect);

// Remove ActiveEffect real
const real = actor.effects.find(ae => ae.getFlag("tm", "effectId") === data.id);
if (real) {
  await actor.deleteEmbeddedDocuments("ActiveEffect", [real.id]);

  const token = actor.getActiveTokens()[0];
  if (token && token.document.overlayEffect === real.icon) {
    await token.document.update({ overlayEffect: null });
  }
}

      }
    }

    await actor.update({ "system.activeEffects": updated });
    await EffectRender.update(actor);
  }
}

import { EffectApply } from "../effects/effect-apply.js";
import { EffectParser } from "../effects/effect-parser.js";

export class MasteryPersistent {
  static async activate(actor, mastery) {
    if (!actor || !mastery) return;

    const previous = await actor.getFlag("tm", "persistentMasteryId");
    if (previous && previous !== mastery.id) {
      await this.deactivate(actor, previous);
    }

    await actor.setFlag("tm", "persistentMasteryId", mastery.id);

// Aplica modificadores diretamente no actor (efeito imediato)
EffectParser.apply(actor, mastery.effect);

// Cria o efeito visual + ActiveEffect
await EffectApply.applyCustom({
  actor,
  effectId: `posture-${mastery.id}`,
  label: mastery.mastery_name,
  img: mastery.mastery_img,
  duration: mastery.duration ?? null,
  commands: mastery.effect || [],
  isMastery: true,
  effect: mastery.effect // ← adiciona explicitamente a lista de efeitos

});

await actor.createEmbeddedDocuments("ActiveEffect", [
  {
    name: mastery.mastery_name,
    icon: mastery.mastery_img,
    origin: `Actor.${actor.id}`,
    disabled: false,
    duration: {}, // obrigatório para exibição
    changes: [],
    flags: {
      core: {
        statusId: `posture-${mastery.id}`
      },
      tm: {
        source: "resistance-roll", // ← ESSENCIAL para o overlay
        appliedFrom: "persistent-mastery",
        effectId: `posture-${mastery.id}`,
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

  const current = await actor.getFlag("tm", "persistentMasteryId");
  if (current !== masteryId) return;

  await actor.unsetFlag("tm", "persistentMasteryId");

  const allDomains = Object.values(game.tm?.DomainsDB ?? {}).flat();
const mastery = allDomains.find(m => m.id === masteryId);

if (mastery && mastery.mastery_cd > 0 && game.combat?.started) {
  game.tm.MasteryCooldown.setCooldown(actor, mastery, mastery.mastery_cd);
}


  // Remove o efeito visual
  await EffectApply.remove(actor, `posture-${masteryId}`);

  // Remove o ActiveEffect do token/ficha
  const effects = actor.effects.filter(e => e.getFlag("tm", "persistentId") === masteryId);
  for (const effect of effects) {
    await effect.delete();
  }

  console.log(`[💨] Postura/Conjuração removida: ${masteryId}`);
}

}

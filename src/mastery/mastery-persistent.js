import { EffectApply } from "../effects/effect-apply.js";

export class MasteryPersistent {
  static async activate(actor, mastery) {
    if (!actor || !mastery) return;

    const previous = await actor.getFlag("tm", "persistentMasteryId");
    if (previous && previous !== mastery.id) {
      await this.deactivate(actor, previous);
    }

    await actor.setFlag("tm", "persistentMasteryId", mastery.id);

    // Aplica o efeito visual no token
    await EffectApply.applyCustom({
  actor,
  effectId: `posture-${mastery.id}`,
  label: mastery.mastery_name,
  img: mastery.mastery_img,
  duration: { rounds: undefined }, // ← evita o erro de validação
  commands: mastery.effect || [],
  duration: mastery.duration ?? null,
  isMastery: true // ← flag opcional que podemos usar pra exibir "MAESTRIA" no painel
});


    console.log(`[🔥] Postura/Conjuração ativada: ${mastery.mastery_name}`);
  }

  static async deactivate(actor, masteryId) {
    if (!actor || !masteryId) return;

    const current = await actor.getFlag("tm", "persistentMasteryId");
    if (current !== masteryId) return;

    await actor.unsetFlag("tm", "persistentMasteryId");

    // Remove o efeito visual
    await EffectApply.remove(actor, `posture-${masteryId}`);

    console.log(`[💨] Postura/Conjuração removida: ${masteryId}`);
  }
}

export class MasteryCooldown {
  static getCooldownKey(mastery) {
    const domain = mastery.system?.domain || mastery.mastery_domain || "unknown";
    const name = (mastery.name || mastery.mastery_name || "unnamed").slugify({ strict: true });
    const nd = mastery.system?.nd || mastery.mastery_nd || "nd0";
    return `${domain}_${name}_${nd}`;
  }

  static setCooldown(actor, mastery, turns) {
    const key = this.getCooldownKey(mastery);
    const cds = foundry.utils.duplicate(actor.system.masteryCooldowns || {});
    const current = cds[key] ?? 0;
    cds[key] = Math.max(current, turns);

    actor.update({ "system.masteryCooldowns": cds });
    console.log(`[CD] ${key} definido para ${cds[key]} turnos.`);
  }

  static getRemaining(actor, key) {
    if (!actor || !key) return 0;
    const k = typeof key === "string" ? key : MasteryCooldown.getCooldownKey(key);
    const cds = actor.system.masteryCooldowns || {};
    return cds[k] ?? 0;
  }

  static isOnCooldown(actor, mastery) {
    const key = this.getCooldownKey(mastery);
    return (actor.system.masteryCooldowns?.[key] ?? 0) > 0;
  }

  static async reduceAllCooldowns(actor) {
    if (!actor) return;

    const cds = foundry.utils.duplicate(actor.system.masteryCooldowns || {});
    let changed = false;

    for (const key in cds) {
      const value = cds[key];
      if (typeof value === "number" && value > 0) {
        cds[key] = value - 1;
        changed = true;
      }
    }

    if (!changed) return;

    console.log("[CD] Cooldowns atualizados para:", cds);
    await actor.update({ "system.masteryCooldowns": cds });
  }

  static clearCooldown(actor, mastery) {
    const key = this.getCooldownKey(mastery);
    const cds = foundry.utils.duplicate(actor.system.masteryCooldowns || {});

    if (cds[key]) {
      delete cds[key];
      actor.update({ "system.masteryCooldowns": cds });
      console.log(`[CD] ${key} removido manualmente.`);
    }
  }

  static getAllCooldowns(actor) {
    return actor.system.masteryCooldowns || {};
  }

  static async resetAll(actor) {
  if (!actor || !actor.update) {
    console.warn("[CD] Nenhum ator válido selecionado para reset.");
    ui.notifications.warn("Selecione um token válido antes de resetar cooldowns.");
    return;
  }

  const cds = foundry.utils.duplicate(actor.system.masteryCooldowns || {});
  const keys = Object.keys(cds);
  if (!keys.length) {
    console.log(`[CD RESET] Nenhum cooldown para resetar: ${actor.name}`);
    return;
  }

  for (const key of keys) {
    cds[key] = 0;
  }

  await actor.update({ "system.masteryCooldowns": cds });
  console.log(`[CD RESET] Cooldowns marcados como 0 para: ${actor.name}`);
}



}

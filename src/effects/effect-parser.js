// src/effects/effect-parser.js
export class EffectParser {
  static apply(actor, effectCommand) {
    const commands = Array.isArray(effectCommand) ? effectCommand : [effectCommand];

    for (const raw of commands) {
      const resolved = this.#resolveCommand(actor, raw);
      if (!resolved) continue;

      const { value, key } = resolved;

      actor.flags ??= {};
      actor.flags.tm ??= {};
      actor.flags.tm.appliedEffects ??= {};

      if (actor.flags.tm.appliedEffects[key]?.includes(raw)) continue;

      const current = getProperty(actor.system, key) ?? 0;
      const updated = current + value;
      setProperty(actor.system, key, updated);

      actor.flags.tm.appliedEffects[key] = [
        ...(actor.flags.tm.appliedEffects[key] ?? []),
        raw,
      ];

      console.log(`[EffectParser] Aplicado ${value} em ${key} → ${current} → ${updated}`);
    }
  }

  static remove(actor, effectCommand) {
    const commands = Array.isArray(effectCommand) ? effectCommand : [effectCommand];

    for (const raw of commands) {
      const resolved = this.#resolveCommand(actor, raw);
      if (!resolved) continue;

      const { value, key } = resolved;
      const applied = actor.flags?.tm?.appliedEffects?.[key];
      if (!applied || !applied.includes(raw)) continue;

      const current = getProperty(actor.system, key) ?? 0;
      const updated = current - value;
      setProperty(actor.system, key, updated);

      actor.flags.tm.appliedEffects[key] = applied.filter(e => e !== raw);

      console.log(`[EffectParser] Removido ${value} de ${key} → ${current} → ${updated}`);
    }
  }

  static #resolveCommand(actor, raw) {
    if (!raw.includes("@{")) return null;

    const np = actor.system.player_level ?? 1;
    const npp = np % 2 === 0 ? np : 0;
    const npi = np % 2 !== 0 ? np : 0;

    const parsed = raw
      .replaceAll("NPp", npp)
      .replaceAll("NPi", npi)
      .replaceAll(/([+\-]?\d+)\s*\*\s*NP\b/g, (_, num) => `${parseInt(num) * np}`)
      .replaceAll(/\bNP\b/g, `${np}`);

    const match = parsed.match(/^([+\-]?\d+)(?:\s*\/\/\s*(\d+))?\s*@\{(.+?)\}$/);
    if (!match) {
      console.warn("[EffectParser] Comando mal formatado:", raw);
      return null;
    }

    const value = parseInt(match[1]);
    const divisor = parseInt(match[2]) || 1;
    const key = match[3];
    const finalValue = Math.floor(value / divisor);

    return { value: finalValue, key, raw };
  }
}

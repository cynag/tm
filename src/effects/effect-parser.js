// src/effects/effect-parser.js
export class EffectParser {
    static apply(actor, effectCommand) {
    const commands = Array.isArray(effectCommand) ? effectCommand : [effectCommand];

    for (const raw of commands) {
      // tenta set
      let resolved = this.#resolveSetCommand(actor, raw);
      let isSet = true;

      // se falhar, tenta soma
      if (!resolved) {
        resolved = this.#resolveCommand(actor, raw);
        isSet = false;
      }
      if (!resolved) continue;

      const { value, key } = resolved;

      actor.flags ??= {};
      actor.flags.tm ??= {};
      actor.flags.tm.appliedEffects ??= {};

      const existing = actor.flags.tm.appliedEffects[key] ?? [];
if (existing.includes(raw)) continue; // 🛑 já aplicado

const current = foundry.utils.getProperty(actor.system, key) ?? 0;
const updated = isSet ? value : current + value;

foundry.utils.setProperty(actor.system, key, updated);
actor.flags.tm.appliedEffects[key] = [...existing, raw];

//console.log(`[EffectParser] ${isSet ? "SET" : "MOD"} ${key}: ${current} → ${updated}`);
}
  }

    static remove(actor, effectCommand) {
      const commands = Array.isArray(effectCommand) ? effectCommand : [effectCommand];

      for (const raw of commands) {
        let resolved = this.#resolveSetCommand(actor, raw);
        let isSet = true;

        if (!resolved) {
          resolved = this.#resolveCommand(actor, raw);
          isSet = false;
        }
        if (!resolved) continue;

        const { value, key } = resolved;
        const applied = actor.flags?.tm?.appliedEffects?.[key];
        if (!applied || !applied.includes(raw)) continue;

        const current = getProperty(actor.system, key) ?? 0;
        const updated = isSet ? 0 : current - value;
        setProperty(actor.system, key, updated);

        actor.flags.tm.appliedEffects[key] = applied.filter(e => e !== raw);

        console.log(`[EffectParser] Removido ${isSet ? "SET" : "MOD"}: ${value} de ${key} → ${current} → ${updated}`);
      }
  }

    static #resolveSetCommand(actor, raw) {
  const match = raw.match(/^@{(.+?)}\s*==\s*(.+)$/);
  if (!match) return null;

  const key = match[1].trim();
  const formula = match[2].trim();

  // SET com divisão: @{player_reflex}/2
  const divideMatch = formula.match(/^@{(.+?)}\s*\/\s*(\d+)$/);
  if (divideMatch) {
    const refKey = divideMatch[1];
    const divisor = parseInt(divideMatch[2]) || 1;
    const base = getProperty(actor.system, refKey) ?? 0;
    const value = Math.floor(base / divisor);
    return { key, value, raw };
  }

  // SET fixo: == número
  const fixedMatch = formula.match(/^(\d+)$/);
  if (fixedMatch) {
    const value = parseInt(fixedMatch[1]);
    return { key, value, raw };
  }

  console.warn("[EffectParser] Fórmula SET inválida:", formula);
  return null;
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

    // Novo formato: @{key} / divisor
    const matchDivide = parsed.match(/^@{(.+?)}\s*\/\s*(\d+)$/);
    if (matchDivide) {
      const key = matchDivide[1];
      const divisor = parseInt(matchDivide[2]) || 1;
      const base = getProperty(actor.system, key) ?? 0;
      const value = Math.floor(base / divisor);
      return { value, key, raw };
    }

    // Antigo formato: +4 //@{key}
    const match = parsed.match(/^([+\-]?\d+)(?:\s*\/\/\s*(\d+))?\s*@\{(.+?)\}$/);
    if (!match) {
      console.warn("[EffectParser] Comando mal formatado:", raw);
      return null;
    }

    let value = parseInt(match[1]);
    const divisor = parseInt(match[2]) || 1;
    const key = match[3];
    value = Math.floor(value / divisor);

    return { value, key, raw };
  }

  static toFoundryChanges(effectCommand) {
  const commands = Array.isArray(effectCommand) ? effectCommand : [effectCommand];
  const changes = [];

  for (const raw of commands) {
    const clean = raw.trim();
    if (!clean) continue;

    // SET fixo: @{key}==10
    let match = clean.match(/^@{(.+?)}\s*==\s*(\d+)$/);
    if (match) {
      changes.push({
        key: `system.${match[1].trim()}`,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: match[2],
        priority: 20
      });
      continue;
    }

    // SET por divisão: @{key}==@{key}/2
    match = clean.match(/^@{(.+?)}\s*==\s*@{.+?}\/(\d+)$/);
    if (match) {
      const key = match[1].trim();
      const divisor = parseInt(match[2]) || 1;
      const value = (1 / divisor).toFixed(3);
      changes.push({
        key: `system.${key}`,
        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
        value: value,
        priority: 20
      });
      continue;
    }

    // MOD: +X @{key} ou -X @{key}
    match = clean.match(/^([+\-]?\d+)\s*@{(.+?)}$/);
    if (match) {
      const value = match[1].trim();
      const key = match[2].trim();
      changes.push({
        key: `system.${key}`,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: value,
        priority: 20
      });
      continue;
    }

    // ⚠️ Não reconhecido
    console.warn("[toFoundryChanges] Comando ignorado:", raw);
  }

  return changes;
}

}

// src/effects/effect-parser.js
export class EffectParser {
static apply(actor, effect, domain = null) {
  if (!actor || !effect || !Array.isArray(effect)) return [];

  const commands = effect
    .map(raw => this.#resolveCommand(raw, actor, domain))
    .filter(entry => entry !== null);

  return commands.map(entry => ({
    key: entry.key,
    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
    value: entry.value
  }));
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

static #resolveCommand(raw, actor, domain) {
  if (!raw || typeof raw !== "string") return null;

  const NP = actor.system?.player_level ?? 1;
  const nd = domain ? (actor.system?.[`player_domain_${domain}_level`] ?? 0) : 0;
  const ndp = Math.floor(nd / 2);
  const ndi = Math.floor((nd + 1) / 2);
  const npp = NP % 2 === 0 ? NP : 0;
  const npi = NP % 2 !== 0 ? NP : 0;

  // Substitui tokens especiais
  const prepared = raw
    .replaceAll("NPp", npp)
    .replaceAll("NPi", npi)
    .replaceAll("NDp", ndp)
    .replaceAll("NDi", ndi)
    .replaceAll("ND", nd)
    .replaceAll(/([+\-]?\d+)\s*\/\s*NDi\b/g, (_, num) => `${parseInt(num) * ndi}`)
    .replaceAll(/([+\-]?\d+)\s*\/\s*NDp\b/g, (_, num) => `${parseInt(num) * ndp}`)
    .replaceAll(/([+\-]?\d+)\s*\/\s*ND\b/g, (_, num) => `${parseInt(num) * nd}`);

  // Extrai valor e chave de efeito
  const matchBasic = prepared.match(/^([+\-]?\d+)\s*@\{(.+?)\}$/);
  if (matchBasic) {
    const value = parseInt(matchBasic[1]);
    const key = matchBasic[2];
    return { value, key, raw };
  }

  console.warn("[toFoundryChanges] Comando ignorado:", raw);
  return null;
}



static toFoundryChanges(effectCommand, actor) {
  const commands = Array.isArray(effectCommand) ? effectCommand : [effectCommand];
  const changes = [];

  const np = actor?.system?.player_level ?? 1;
  const domain = actor?.getFlag("tm", "activeDomain") ?? "none";
  const nd = actor?.system?.[`player_domain_${domain}_level`] ?? 0;
  const ndp = Math.floor(nd / 2);
  const ndi = Math.floor((nd + 1) / 2);
  const npp = np % 2 === 0 ? np : 0;
  const npi = np % 2 !== 0 ? np : 0;

  for (const raw of commands) {
    const clean = raw.trim();
    if (!clean) continue;

    // Substituições reais
    const parsed = clean
      .replaceAll("NPp", npp)
      .replaceAll("NPi", npi)
      .replaceAll("NDp", ndp)
      .replaceAll("NDi", ndi)
      .replaceAll("ND", nd)
      .replaceAll(/([+\-]?\d+)\s*\/\s*NDi\b/g, (_, num) => `${parseInt(num) * ndi}`)
      .replaceAll(/([+\-]?\d+)\s*\/\s*NDp\b/g, (_, num) => `${parseInt(num) * ndp}`)
      .replaceAll(/([+\-]?\d+)\s*\/\s*ND\b/g, (_, num) => `${parseInt(num) * nd}`);

    let match;

    // SET fixo: @{key}==10
    match = parsed.match(/^@{(.+?)}\s*==\s*(\d+)$/);
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
    match = parsed.match(/^@{(.+?)}\s*==\s*@{.+?}\/(\d+)$/);
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

    // MOD: +X @{key}
match = parsed.match(/^([+\-]?\d+)\s*@{(.+?)}$/);
if (match) {
  const value = parseInt(match[1]);
  const key = match[2].trim();

  if (!value || isNaN(value) || !key) {
    console.warn(`[toFoundryChanges] ❌ Comando inválido após parsing: ${parsed}`);
    console.warn("→ Valor:", value);
    console.warn("→ Chave:", key);
    console.warn("→ Original:", raw);
    continue;
  }

  changes.push({
    key: `system.${key}`,
    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
    value: value,
    priority: 20
  });
  continue;
}


    console.warn("[toFoundryChanges] Comando ignorado após parsing:", parsed);
  
  }

  return changes;
}




}

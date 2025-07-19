export const MasteryParser = {
  async evaluate(raw, actor, target, mode = "number", domain = null) {
    if (!raw || typeof raw !== "string") {
      return mode === "roll" ? { value: 0, roll: null } : 0;
    }

    raw = raw.trim();

    let nd = 0, ndp = 0, ndi = 0;
    if (domain) {
      const field = `player_domain_${domain}_level`;
      nd = actor.system?.[field] ?? 0;
      ndp = Math.floor(nd / 2);
      ndi = Math.floor((nd + 1) / 2);
    }

    // Substitui @{atributo} por valores do actor
    let parsed = raw.replace(/@\{(.*?)\}/g, (_, attr) => {
      const val = actor.system?.[attr];
      if (val === undefined) console.warn(`⚠️ Atributo '${attr}' não encontrado em actor.system`);
      return val ?? 0;
    });

    // Interpreta condicional simples: if[target|has_physical_effect:true,+2,0]
    parsed = parsed.replace(/if\[(.*?)\]/g, (_, expr) => {
      const [condRaw, valTrue, valFalse] = expr.split(",");
      if (!condRaw || !valTrue || valFalse === undefined) return 0;

      const [scope, keyVal] = condRaw.split("|");
      const [key, expectedRaw] = keyVal.split(":");
      const expected = expectedRaw === "true";

      let actual = false;
      if (scope === "target") {
        actual = target?.system?.[key] ?? false;
      } else if (scope === "actor") {
        actual = actor?.system?.[key] ?? false;
      }

      return actual === expected ? valTrue.trim() : valFalse.trim();
    });

    // Remove anotação de multiplicador
    parsed = parsed.split("//")[0].trim();

// Substitui s.player_level por valor real do ator
const playerLevel = actor.system?.player_level ?? 1;
parsed = parsed.replace(/\bs\.player_level\b/g, playerLevel);

// Substitui ND, NDp, NDi por valores reais dentro da fórmula
parsed = parsed.replace(/\bNDp\b/g, ndp);
parsed = parsed.replace(/\bNDi\b/g, ndi);
parsed = parsed.replace(/\bND\b/g, nd);


// ⚠️ Protege contra divisão por zero
parsed = parsed.replace(/\/\s*0+/g, "/1");
const rep = 1;


    if (!parsed.match(/\d/) || rep === 0) {
      return mode === "roll" ? { value: 0, roll: null } : 0;
    }

    // ROLAGEM
    if (mode === "roll" && parsed.includes("d")) {
      const formula = Array(rep).fill(parsed).join(" + ").trim();

      try {
        const roll = new Roll(formula);
        await roll.evaluate();
        return { value: roll.total, roll };
      } catch (e) {
        console.error(`❌ Erro ao avaliar fórmula "${formula}":`, e);
        return { value: 0, roll: null };
      }
    }

    // FIXO
    if (mode === "number") {
      const expr = `${parsed} * ${rep}`.trim();
      try {
        const roll = new Roll(expr);
        await roll.evaluate();
        return { value: roll.total, roll: null };
      } catch (e) {
        console.error(`❌ Erro ao avaliar número fixo "${expr}":`, e);
        return 0;
      }
    }

    return mode === "roll" ? { value: 0, roll: null } : 0;
  },

  async extractEffects(raw, actor, target, domain = null) {
    const result = {};
    if (!raw || typeof raw !== "string") return result;

    const lines = raw.split(";").map(s => s.trim()).filter(Boolean);

    for (let line of lines) {
      const match = line.match(/^target\.(\w+)\s*=\s*(.+)$/i);
      if (match) {
        const key = match[1];
        const formula = match[2].trim();
        const value = await MasteryParser.evaluate(formula, actor, target, "number", domain);
        result[key] = value?.value ?? 0;
      }
    }

    return result;
  }
};

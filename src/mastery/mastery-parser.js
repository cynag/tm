export const MasteryParser = {
  async evaluate(raw, actor, target, mode = "number", domain = null) {
    if (!raw || typeof raw !== "string") {
      return mode === "roll" ? { value: 0, roll: null } : 0;
    }

    raw = raw.trim();

    let nd = 0, ndp = 0, ndi = 0, np = 0, npp = 0, npi = 0;
    if (domain) {
      const field = `player_domain_${domain}_level`;
      nd = actor.system?.[field] ?? 0;
      ndp = Math.floor(nd / 2);
      ndi = Math.floor((nd + 1) / 2);

      const trees = actor.system?.masteryTrees?.[domain] ?? {};
      for (let levelStr of Object.keys(trees)) {
        const level = parseInt(levelStr.replace("ND", ""));
        const maestrias = trees[levelStr] ?? [];
        const count = Array.isArray(maestrias) ? maestrias.length : 0;
        np += count;
        if (level % 2 === 0) npp += count;
        else npi += count;
      }
    }

    // Substitui @{atributo}
    let parsed = raw.replace(/@\{(.*?)\}/g, (_, attr) => {
      const val = actor.system?.[attr];
      if (val === undefined) console.warn(`⚠️ Atributo '${attr}' não encontrado`);
      return val ?? 0;
    });

    // Condicional: if[target|has_effect:true,+2,0]
    parsed = parsed.replace(/if\[(.*?)\]/g, (_, expr) => {
      const [condRaw, valTrue, valFalse] = expr.split(",");
      if (!condRaw || !valTrue || valFalse === undefined) return 0;
      const [scope, keyVal] = condRaw.split("|");
      const [key, expectedRaw] = keyVal.split(":");
      const expected = expectedRaw === "true";
      let actual = false;
      if (scope === "target") actual = target?.system?.[key] ?? false;
      else if (scope === "actor") actual = actor?.system?.[key] ?? false;
      return actual === expected ? valTrue.trim() : valFalse.trim();
    });

    // Remove comentários
    parsed = parsed.split("//")[0].trim();

    // Substituições simples
    const playerLevel = actor.system?.player_level ?? 1;
    parsed = parsed.replace(/\bs\.player_level\b/g, playerLevel);
    parsed = parsed.replace(/\bNDp\b/g, ndp);
    parsed = parsed.replace(/\bNDi\b/g, ndi);
    parsed = parsed.replace(/\bND\b/g, nd);
    parsed = parsed.replace(/\bNPp\b/g, npp);
    parsed = parsed.replace(/\bNPi\b/g, npi);
    parsed = parsed.replace(/\bNP\b/g, np);

    // Proteção contra /0
    parsed = parsed.replace(/\/\s*0+/g, "/1");

    // ROLAGEM
    if (mode === "roll" && parsed.includes("d")) {
      const formula = parsed.replace(/(\+|-)?\s*(\d*)d(\d+)\s*\/\s*(NDp|NDi|ND|NPp|NPi|NP|\d+)/g, (_, sign, qtd, faces, divisorKey) => {
      const base = Number(qtd || 1);
      const divValue = {
        NDp: ndp, NDi: ndi, ND: nd,
        NPp: npp, NPi: npi, NP: np
      }[divisorKey] ?? Number(divisorKey || 1);

      const total = base * divValue;
      if (total <= 0) return "";
      return `${sign || ""}${total}d${faces}`;
    });


  if (!formula || formula.trim() === "" || formula.trim() === "+") {
    console.warn("⚠️ Fórmula de rolagem vazia ou inválida:", raw, "→", formula);
    return { value: 0, roll: null };
  }

  try {
    const roll = new Roll(formula);
    await roll.evaluate();
    return { value: roll.total, roll };
  } catch (e) {
    console.error(`❌ Erro ao avaliar fórmula "${formula}":`, e);
    return { value: 0, roll: null };
  }
}
if (mode === "number") {
  const expr = parsed.replace(/(\+|-)?\s*(\d+)\s*\/\s*(\d+)/g, (_, sign, val, div) => {
    const total = Math.floor(Number(val) / Number(div));
    if (total === 0) return "";
    return `${sign || "+"}${total}`;
  });

  if (!expr || expr.trim() === "" || expr.trim() === "+") {
    console.warn("⚠️ Expressão numérica inválida:", raw, "→", expr);
    return 0;
  }

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

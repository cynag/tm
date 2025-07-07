export const MasteryParser = {
  async evaluate(raw, actor, target, mode = "number", domain = null) {
    if (!raw || typeof raw !== "string") {
    return mode === "roll" ? { value: 0, roll: null } : 0;
    }
    raw = raw.trim();


    let nd = 0, ndp = 0, ndi = 0;
    if (domain) {
      const field = `player_domain_${domain}_level`;
      console.log("🧪 [DEBUG] actor.id:", actor.id);
      console.log("🧪 [DEBUG] ND field lookup:", field);
      console.log("🧪 [DEBUG] actor.system:", actor.system);
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

    // Captura multiplicador ND
    const repBase =
      raw.includes("//NDp") ? ndp :
      raw.includes("//NDi") ? ndi :
      raw.includes("//ND")  ? nd  : 1;
    const rep = repBase;


    parsed = parsed.split("//")[0].trim();

    console.log(`[Parser] Domínio: ${domain} | ND: ${nd} | Fórmula: ${parsed} | rep: ${rep}`);

    if (!parsed.match(/\d/) || rep === 0) {
  return mode === "roll" ? { value: 0, roll: null } : 0;
}


    if (mode === "roll" && parsed.includes("d")) {
      const formula = Array(rep).fill(parsed).join(" + ").trim();

      try {
        console.log(`[Roll] Fórmula final para Roll: "${formula}"`);
        const roll = new Roll(formula);
        await roll.evaluate();
        return { value: roll.total, roll };
      } catch (e) {
        console.error(`❌ Erro ao avaliar fórmula "${formula}":`, e);
        return { value: 0, roll: null };
      }
    }

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

// src/effects/effects-panel.js
import { EffectsDB } from "./effects-db.js";

function isPersistentMastery(effect) {
  return effect?.flags?.tm?.appliedFrom === "persistent-mastery";
}

export class EffectsPanel {
  static async render(html, actor) {
    const container = html.find("#effects-panel-container");
    if (!container.length) return;

    const section = $(`<section class="talent-section"></section>`);
    const block = $(`<div class="talent-block"><table class="talent-table"><tbody></tbody></table></div>`);
    const tbody = block.find("tbody");

    const active = actor.system.activeEffects || [];

    // Agrupar efeitos por ID
    const grouped = {};
    for (const effect of active) {
      if (!grouped[effect.id]) grouped[effect.id] = [];
      grouped[effect.id].push(effect);
    }

for (const [id, group] of Object.entries(grouped)) {
  const baseEffect = group[0];
  const isCustomMastery = isPersistentMastery(baseEffect);

let fullData = EffectsDB.find(e => e.id === id);
if (!fullData) {
  const custom = group[0]?.flags?.tm?.customEffect;
  fullData = {
    name: baseEffect.name || id,
    img: baseEffect.img || baseEffect.icon || "icons/svg/aura.svg",
    duration: baseEffect.duration?.rounds ?? null,
    isMastery: isCustomMastery,
    effect: custom || [],
    description: isCustomMastery ? "Efeito proveniente de uma maestria ativa." : "Sem descrição."
  };
}





      const count = group.length;

      const name = (baseEffect.name || fullData.name || id) + (count > 1 ? ` (${count})` : "");
      const description = fullData.description || "Sem descrição.";
let tagText = fullData.isMastery ? "MAESTRIA" :
              (fullData.duration !== null ? `${fullData.duration} rodadas` : "Permanente");

      // Traduções dos atributos para exibição
      const labelMap = {
        "mod_letality": "LET",
        "mod_dexterity": "DES",
        "mod_impulse": "IMP",
        "mod_arcana": "ARC",
        "mod_erudition": "ERU",
        "mod_virtue": "VIR",
        "player_pa_max": "PA",
        "player_reflex": "REF",
        "player_movement": "MOV",
        "token_vision": "VISÃO"

      };

      // Coletar efeitos e somar acumulados
      const rawEffects = (Array.isArray(fullData.effect) ? fullData.effect : [fullData.effect])
  .filter(e => typeof e === "string")
  .map(e => e.trim())
  .filter(Boolean);


      const effectSumMap = {};

      for (const raw of rawEffects) {
        const parts = raw.split(",").map(p => p.trim());
        
          for (const part of parts) {
  // Match tipo MOD: -1 @{player_reflex}
  const matchMod = part.match(/^([+\-]?\d+)\s*@\{(.+?)\}$/);

  // Match tipo SET: @{player_reflex}==@{player_reflex}/2
  const matchSet = part.match(/^@{(.+?)}==@{.+?}\/(\d+)$/);

  if (matchMod) {
    const value = parseInt(matchMod[1]);
    const key = matchMod[2];
    effectSumMap[key] = (effectSumMap[key] || 0) + (value * count);
  }

  if (matchSet) {
    const key = matchSet[1];
    const divisor = parseInt(matchSet[2]);
    const percent = Math.round((1 - 1 / divisor) * -100); // Ex: /2 = -50%
    effectSumMap[key] = (effectSumMap[key] || 0) + (percent * count);
  }
  // SET fixo: @{chave}==2
const matchSetFixed = part.match(/^@{(.+?)}==\s*(\d+)$/);
if (matchSetFixed) {
  const key = matchSetFixed[1];
  const value = parseInt(matchSetFixed[2]);
  // usamos "v=" como flag interna pra mostrar como SET
  effectSumMap[key] = `v=${value}`;
    }
  }
}

      const effectTags = Object.entries(effectSumMap).map(([key, val]) => {
  const label = labelMap[key] || key;

  if (typeof val === "string" && val.startsWith("v=")) {
    const fixed = val.slice(2);
    return `<span class="tag">${label} = ${fixed}</span>`;
  }

  const isPercent = Math.abs(val) < 100 && val % 10 === 0;
  const sign = val > 0 ? "+" : "";
  const valueText = isPercent ? `${sign}${val}%` : `${sign}${val}`;
  return `<span class="tag">${valueText} ${label}</span>`;
});



      const row = $(`
        <div class="talent-row effect-row" data-id="${id}">
          <div class="talent-icon">
            <img src="${fullData.img || "icons/svg/aura.svg"}" width="40" height="40"/>
          </div>
          <div class="effect-content">
            <div class="talent-name">${name}</div>
            <div class="talent-tags">
              ${tagText ? `<span class="tag">${tagText}</span>` : ""}
              ${effectTags.join("")}
            </div>
          </div>
        </div>
      `);

      row.on("mouseenter", e => {
        const tooltip = `<strong>${name}</strong><br>${description}`;
        $(e.currentTarget).attr("data-tooltip", tooltip);
      });

      tbody.append(row);
    }

    section.append(block);
    container.empty().append(section);
  }
}

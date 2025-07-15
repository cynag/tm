// src/effects/effects-panel.js
import { EffectsDB } from "./effects-db.js";

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
      const fullData = EffectsDB.find(e => e.id === id) ?? {};
      const baseEffect = group[0];
      const count = group.length;

      const name = (baseEffect.name || fullData.name || id) + (count > 1 ? ` (${count})` : "");
      const description = fullData.description || "Sem descrição.";
      const tagText = fullData.duration !== null ? `${fullData.duration} rodadas` : "Permanente";

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
        "player_movement": "MOV"
      };

      // Coletar efeitos e somar acumulados
      const rawEffects = fullData.effects ?? (Array.isArray(fullData.effect) ? fullData.effect : [fullData.effect])
      .filter(e => typeof e === "string")
      .map(e => e.trim())
      .filter(Boolean);

      const effectSumMap = {};

      for (const raw of rawEffects) {
        const parts = raw.split(",").map(p => p.trim());
        for (const part of parts) {
          const match = part.match(/^([+\-]?\d+)\s*@\{(.+?)\}$/);
          if (!match) continue;
          const value = parseInt(match[1]);
          const key = match[2];
          effectSumMap[key] = (effectSumMap[key] || 0) + (value * count);
        }
      }

      const effectTags = Object.entries(effectSumMap).map(([key, val]) => {
        const label = labelMap[key] || key;
        const sign = val > 0 ? "+" : "";
        return `<span class="tag">${sign}${val} ${label}</span>`;
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

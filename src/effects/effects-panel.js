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

    for (const effect of active) {
      const fullData = EffectsDB.find(e => e.id === effect.id) ?? {};
      const name = effect.name || fullData.name || effect.id;
      const description = fullData.description || "Sem descrição.";
      const tagText = fullData.duration !== null ? `${fullData.duration} rodadas` : "Permanente";
      const type = fullData.effect_type ?? "";

    const row = $(`
    <div class="talent-row effect-row" data-id="${effect.id}">
        <div class="talent-icon">
        <img src="${fullData.img || "icons/svg/aura.svg"}" width="40" height="40"/>
        </div>
        <div class="effect-content">
        <div class="talent-name">${name}</div>
        <div class="talent-tags">
            ${tagText ? `<span class="tag">${tagText}</span>` : ""}
            ${(fullData.effects || [fullData.effect])
            .map(e => `<span class="tag">${e}</span>`)
            .join("")}


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

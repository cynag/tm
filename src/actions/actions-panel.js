import { MovementDB } from "./movement-db.js";
import { BasicActionsDB } from "./basic-actions-db.js";
import { MovementDialog } from "../ui/movement-dialog.js";

// 🔹 Movement actions: simplified visual with PA + range
function renderMovementTable(data, actor) {
  const s = actor.system;
  const table = $(`<div class="talent-block"><table class="talent-table"><tbody></tbody></table></div>`);
  const tbody = table.find("tbody");

  data.forEach(entry => {
    const range = Math.floor(s.player_movement * entry.scale);
    const row = $(`
      <div class="talent-row movement-row" data-id="${entry.id}">
        <img class="talent-icon" src="${entry.img}" width="40" height="40"/>
        <div class="talent-info">
          <div class="talent-name">${entry.name}</div>
          <div class="talent-tags">
            <span class="tag">${entry.cost} ${game.i18n.localize("TM.Label.AP")}</span>
            <span class="tag">${range} ${game.i18n.localize("TM.Label.Meters")}</span>
          </div>
        </div>
      </div>
    `);

    row.find(".talent-name").on("click", ev => {
      ev.stopPropagation();
      const entryWithActor = { ...entry, actorId: actor.id };
      MovementDialog.show(entryWithActor, range);
    });

    tbody.append(row);
  });

  return table;
}

// 🔸 Basic actions: full layout with "Use" button
function renderActionTable(title, data, type) {
  const table = $(`
    <div class="talent-block">
      <table class="talent-table">
        <tbody></tbody>
      </table>
    </div>`);

  const tbody = table.find("tbody");

  data.forEach(entry => {
    const row = $(`
      <div class="talent-row" data-id="${entry.id}" data-type="${type}">
        <img class="talent-icon" src="${entry.img}" width="40" height="40"/>
        <div class="talent-info">
          <div class="talent-name">${entry.name}</div>
          <div class="talent-level">${entry.cost} ${game.i18n.localize("TM.Label.AP")}</div>
        </div>
        <div class="talent-attr"></div>
        <div class="talent-bonus"></div>
        <div class="talent-points"></div>
        <div class="talent-buttons">
          <button class="use" data-id="${entry.id}">${game.i18n.localize("TM.Button.Use")}</button>
        </div>
      </div>
    `);

    tbody.append(row);
  });

  return table;
}

export class ActionsPanel {
  static async render(html, actor) {
    const container = html.find("#actions-panel-container");
    if (!container.length) return;

    const section = $(`<section class="talent-section"></section>`);
    section.append(renderMovementTable(MovementDB, actor));
    section.append(`<div class="talent-separator">//--//</div>`);
    section.append(renderActionTable(game.i18n.localize("TM.Section.BasicActions"), BasicActionsDB, "basic"));

    container.empty().append(section);

    section.find("button.use").on("click", ev => {
      const id = ev.currentTarget.dataset.id;
      console.log(`[ActionPanel] Basic action used: ${id}`);
    });
  }
}

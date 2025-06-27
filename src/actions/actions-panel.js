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
            <span class="tag">${entry.cost} PA</span>
            <span class="tag">${range} metros</span>
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

// 🔸 Basic attack actions: dynamic tag display from equipped weapons
function renderActionTable(data, actor) {
  const table = $(`<div class="talent-block"><table class="talent-table"><tbody></tbody></table></div>`);
  const tbody = table.find("tbody");

  data.forEach(entry => {
    const slotKey = entry.id === "attack_right" ? "slot_weapon1" : "slot_weapon2";
    const equipped = actor.system.gearSlots?.[slotKey];
    const item = equipped ? actor.items.get(equipped.itemId) : null;

    let name = entry.name;
    const tags = [];

    if (item?.type === "gear" && item.system.gear_type === "weapon") {
      const sys = item.system;

      name = `Atacar com ${item.name}`;

      if (sys.weapon_damage && sys.weapon_subtypes_2)
        tags.push(`${sys.weapon_damage} ${sys.weapon_subtypes_2}`);

      if (sys.weapon_range)
        tags.push(`${sys.weapon_range}m`);

      const traits = sys.weapon_traits || {};
      if (traits.weapon_trait_desc)
        tags.push(`DES 6.6.${traits.weapon_trait_desc}`);
      if (traits.weapon_trait_piercing_ironbreaker)
        tags.push("QBF");
      if (traits.weapon_trait_fast)
        tags.push("RAP");
    } else {
      // Ataque desarmado
      tags.push("1d2 impacto");
      tags.push("1m");
    }

    const tagHTML = tags.map(t => `<span class="tag">${t}</span>`).join(" ");

    const subtype = item?.system?.subtype?.toLowerCase();
    const imgKey = subtype ? `img_${subtype}` : "img_default";
    const iconPath = entry[imgKey] || entry.img_default;
    const flip = entry.id === "attack_left" ? 'style="transform: scaleX(-1);"' : "";

    const row = $(`  
      <div class="talent-row" data-id="${entry.id}" data-type="basic">
        <img class="talent-icon" src="${iconPath}" width="40" height="40" ${flip}/>
        <div class="talent-info">
          <div class="talent-name">${name}</div>
          <div class="talent-tags">${tagHTML}</div>
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
    section.append(renderActionTable(BasicActionsDB, actor));

    container.empty().append(section);
  }
}

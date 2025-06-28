import { MovementDB } from "./movement-db.js";
import { BasicActionsDB } from "./basic-actions-db.js";
import { MovementDialog } from "../ui/movement-dialog.js";
import { AttackRollDialog } from "../ui/attack-roll-dialog.js";

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
    const isRight = entry.id === "attack_right";
    const slotKey = isRight ? "slot_weapon1" : "slot_weapon2";
    const equipped = actor.system.gearSlots?.[slotKey];
    const item = equipped ? actor.items.get(equipped.itemId) : null;

    // ⛔ Oculta ataque da esquerda se a arma da direita for 2H
    if (!isRight) {
      const rightItemId = actor.system.gearSlots?.slot_weapon1?.itemId;
      const rightItem = rightItemId ? actor.items.get(rightItemId) : null;
      if (rightItem?.system?.weapon_traits?.weapon_trait_2h) return;
    }

    let name = entry.name;
    const tags = [];

    if (item?.type === "gear" && item.system.gear_type === "weapon") {
      const sys = item.system;
      const traits = sys.weapon_traits || {};

     const subtype = item?.system?.subtype?.toLowerCase() || "";
const rangedTypes = ["bow", "crossbow", "gun"];
name = rangedTypes.includes(subtype)
  ? `Atirar com ${item.name}`
  : `Atacar com ${item.name}`;


// tag_action_cost
tags.push(`4 PA`);

// tag_weapon_damage
if (item.system?.weapon_damage && item.system?.weapon_subtypes_2)
  tags.push(`${item.system.weapon_damage} - ${item.system.weapon_subtypes_2}`);

// tag_weapon_range
if (item.system?.weapon_range)
  tags.push(`${item.system.weapon_range}m`);
    } else {
      // Desarmado
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
          <div class="talent-name action-roll" data-id="${entry.id}">${name}</div>

          <div class="talent-tags">${tagHTML}</div>
        </div>
      </div>
    `);

    tbody.append(row);
  });
  
  table.find(".action-roll").on("click", async (ev) => {
  const actionId = ev.currentTarget.dataset.id;
  AttackRollDialog.show({ actor, actionId });
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

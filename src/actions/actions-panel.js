import { MovementDB } from "./movement-db.js";
import { BasicActionsDB } from "./basic-actions-db.js";
import { MovementDialog } from "../ui/movement-dialog.js";
import { AttackRollDialog } from "../ui/attack-roll-dialog.js";
import { AttackRoll } from "../roll/attack-roll.js";

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
if (item.system?.weapon_damage && item.system?.weapon_subtypes_2) {
  const damageCode = item.system.weapon_damage.trim();
  const dmgType = item.system.weapon_subtypes_2;
  const match = damageCode.match(/^(.+?)\{\{(.+?)\}\}$/);

  if (match) {
    const base = match[1].trim(); // ex: 1d4
    const extra = match[2].trim(); // ex: +2d4 (Fogo)

    tags.push(`${base} ${dmgType}`);

    const extraMatch = extra.match(/^([+−-]?\s*\d+d\d+)\s*\(([^)]+)\)/i);
    if (extraMatch) {
      const [, bonusDice, elementType] = extraMatch;
      tags.push(`${bonusDice.trim().replace("+", "")} ${elementType.trim().toLowerCase()}`);

    }
  } else {
    tags.push(`${damageCode} ${dmgType}`);
  }
}


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

    // 🔥 Maestrias desbloqueadas
    const masteryBlock = this.#renderMasteryPanel(actor);
    if (masteryBlock) {
      section.append(`<div class="talent-separator">//--//</div>`);
      section.append(masteryBlock);
    }

    container.empty().append(section);
  }

  static #renderMasteryPanel(actor) {
    const trees = foundry.utils.duplicate(actor.system.masteryTrees || {});


    if (!trees) return null;

    const entries = [];

    for (const domain in trees) {
      for (const level in trees[domain]) {


        for (const entry of trees[domain][level]) {
  const base = game.tm?.DomainsDB?.[domain]?.find(m => m.id === entry.id);
  if (!base) continue;

  const evolved = entry.evolved;
  if (evolved === "A" && base.evolution_a) {
  entries.push({
    ...base.evolution_a,
    id: base.id,
    level,
    actor,
    mastery_name: base.evolution_a.mastery_name,

    mastery_nd: base.mastery_nd,
    mastery_domain: domain,
    system: { domain }
  });
} else if (evolved === "B" && base.evolution_b) {
  entries.push({
    ...base.evolution_b,
    id: base.id,
    level,
    actor,
    mastery_name: base.evolution_b.mastery_name,

    mastery_nd: base.mastery_nd,
    mastery_domain: domain,
    system: { domain }
  });
} else {
  entries.push({
    ...base,
    id: base.id,
    level,
    actor,
    mastery_name: base.mastery_name,
    mastery_nd: base.mastery_nd,
    mastery_domain: domain,
    system: { domain }
  });
}

}


      }
    }

    if (!entries.length) return null;

    const block = $(`<div class="talent-block"><table class="talent-table"><tbody></tbody></table></div>`);
    const tbody = block.find("tbody");

    for (const m of entries) {



const cdTurns = game.tm.MasteryCooldown.getRemaining(actor, m);

const isOnCooldown = cdTurns > 0;



const isActive = actor.flags?.tm?.persistentMasteryId === m.id;

const row = $(`
  <div class="talent-row mastery-row ${isOnCooldown ? 'cooldown-active' : ''} ${isActive ? 'mastery-active' : ''}" data-id="${m.id}">
  <div class="cooldown-wrapper">
      <img class="talent-icon" src="${m.mastery_img}" width="40" height="40"/>
      ${isOnCooldown ? `<div class="cooldown-overlay">${cdTurns}</div>` : ""}
    </div>
    <div class="talent-info">
      <div class="talent-name">${m.mastery_name}</div>
      <div class="talent-tags" style="display: flex; justify-content: space-between; width: 100%;">
        <div>
          <span class="tag">ND${m.mastery_nd ?? m.level}</span>
          <span class="tag">${m.mastery_cost ?? "?"} PA</span>
          <span class="tag">CD ${m.mastery_cd ?? "?"}</span>


        </div>
        <div>
          <span class="tag" style="opacity: 0.5;">${m.mastery_domain ?? "?"}</span>
        </div>
      </div>
    </div>
  </div>
`);


  row.on("mouseenter", e => game.tm?.CardTooltip?.show?.(m, e));
  row.on("mouseleave", () => game.tm?.CardTooltip?.close?.());

    row.on("click", async () => {
      const actor = m.actor;
      if (!actor) {
        ui.notifications.warn("Ator não encontrado para esta maestria.");
        return;
      }

      const cls = m.mastery_class?.toLowerCase();
      console.log("[ActionsPanel][mastery-click]", { id: m.id, cls });

      if (cls === "melee") {
        await game.tm.MasteryMeleeDialog.show({ actor, mastery: m });
      } else if (cls === "magic") {
        await game.tm.MasteryMagicDialog.show({ actor, mastery: m });
      } else if (cls === "cure") {
        await game.tm.MasteryCureDialog.show({ actor, mastery: m });
      } else {
        ui.notifications.info("Esse tipo de maestria ainda não é suportado.");
      }
    });


  tbody.append(row);
}


    return block;
  }
}



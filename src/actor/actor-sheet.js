import { GridUtils } from "../grid/grid-utils.js";
import { GridRenderer } from "../grid/grid-renderer.js";

export class TMActorSheet extends foundry.appv1.sheets.ActorSheet {
  constructor(...args) {
    super(...args);
    this._onDropBound = this._onDrop.bind(this);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "actor"],
      width: 600,
      height: "auto",
      resizable: true,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  get template() {
    return `systems/tm/templates/actor/actor-sheet.hbs`;
  }

  async getData() {
    return await super.getData();
  }

  activateListeners(html) {
  super.activateListeners(html);

  if (!this._gridListenersBound) {
    html[0].removeEventListener("drop", this._onDropBound);
    html[0].addEventListener("drop", this._onDropBound);
    this._gridListenersBound = true;
  }

  const container = html.find("#grid-inventory")[0];
  if (container) {
    const grid = game.tm.GridUtils.createVirtualGrid(this.actor);
    game.tm.GridRenderer.renderGrid(container, grid);
  }
}


  async _onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (data.type !== "Item") return;

    let itemData = await Item.implementation.fromDropData(data);
    if (itemData instanceof Item) itemData = itemData.toObject();

    const created = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    const newItem = created[0];
    if (!newItem) return;

    const original = {
      w: newItem.system.grid?.w ?? 1,
      h: newItem.system.grid?.h ?? 1
    };

    const rotated = {
      w: original.h,
      h: original.w
    };

    const grid = GridUtils.createVirtualGrid(this.actor);

    // Tenta encaixar original
    for (let x = 0; x < GridUtils.GRID_WIDTH; x++) {
      for (let y = 0; y < GridUtils.GRID_HEIGHT; y++) {
        if (GridUtils.isSpaceFree(grid, x, y, original.w, original.h)) {
          await newItem.update({
            "system.grid.w": original.w,
            "system.grid.h": original.h
          });
          game.tm.GridPositioner.placeItem(this.actor, newItem, x, y, false);
          return;
        }
      }
    }

    // Tenta encaixar rotacionado
    if (original.w > 1 || original.h > 1) {
      for (let x = 0; x < GridUtils.GRID_WIDTH; x++) {
        for (let y = 0; y < GridUtils.GRID_HEIGHT; y++) {
          if (GridUtils.isSpaceFree(grid, x, y, rotated.w, rotated.h)) {
            await newItem.update({
              "system.grid.w": rotated.w,
              "system.grid.h": rotated.h
            });
            game.tm.GridPositioner.placeItem(this.actor, newItem, x, y, true);
            return;
          }
        }
      }
    }

    ui.notifications.warn("No available space in inventory grid.");
  }
}

import { InventoryGridManager } from "./inventory-grid-manager.js";

export class TMActorSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["tm", "sheet", "actor"],
      template: "systems/tm/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: []
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Ativa o InventoryGridManager
    InventoryGridManager.init(html, this.actor);
  }

  // 🚀 Intercepta DROP externo
  async _onDropItem(event, data) {
    console.log("[TMActorSheet] _onDropItem chamado!", data);
    return this.actor.onDropItem(event, data);
  }

  async getData(options = {}) {
  const context = await super.getData(options);
  context.system = this.actor.system;
  context.pickupItemId = InventoryGridManager._currentPickupItemId;
  context.resolvedItems = this.actor.items.contents;

  //console.log("[TMActorSheet] getData resolvedItems:", context.resolvedItems.length);
  //context.resolvedItems.forEach(i => {
  //console.log(`[DEBUG][getData] Item=${i.name} | gridX=${i.system.gridX} | gridY=${i.system.gridY} | gridW=${i.system.gridWidth} | gridH=${i.system.gridHeight} | rotated=${i.system.rotated}`);
  //});
  return context;
}


}

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

  // 🚀 Adiciona o getData para expor pickupItemId
  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.actor.system;

    context.pickupItemId = InventoryGridManager._currentPickupItemId;

    // FORÇA os embedded documents atualizados
    context.resolvedItems = await this.actor.getEmbeddedCollection("Item");

    return context;
  }

}

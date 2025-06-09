import { InventoryManager } from "./inventory-manager.js";

export class TMActorSheet extends ActorSheet {

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
    // Corrigido com caminho certo:
    return `systems/tm/templates/actor/actor-sheet.hbs`;
  }

  async getData() {
    const context = await super.getData();

    // Prepara resolvedItems
    context.resolvedItems = this.actor.items.contents.sort((a, b) => {
      return (a.system.gridY - b.system.gridY) || (a.system.gridX - b.system.gridX);
    });

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // 🚀 Inicializa InventoryManager a cada render
    InventoryManager.init(html, this.actor);

    // Botão Organizar Inventário (placeholder)
    html.find(".inventory-sort").on("click", async () => {
      ui.notifications.info("Organizar Inventário não implementado ainda.");
    });
  }

  async _onDropItem(event, data) {
    console.log("[TMActorSheet] _onDropItem chamado!", data);

    // 🚀 Garante que todo drop chama TMActor.onDropItem
    return this.actor.onDropItem(event, data);
  }

}

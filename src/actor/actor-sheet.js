import { GridUtils } from "../grid/grid-utils.js";
import { GridRenderer } from "../grid/grid-renderer.js";
import { GridAutoPosition } from "../grid/grid-auto-position.js";

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

    html.find(".auto-sort-btn").on("click", () => {
      console.log("[AutoSort] 🔁 Auto-sort iniciado");
      game.tm.GridAutoSort.sort(this.actor);
    });

    const gearContainer = html.find("#gear-slots")[0];
    if (gearContainer) {
      game.tm.GearRenderer.render(gearContainer, this.actor);
    }

    const gridContainer = html.find("#grid-inventory")[0];
    if (gridContainer) {
      const grid = game.tm.GridUtils.createVirtualGrid(this.actor);
      game.tm.GridRenderer.renderGrid(gridContainer, grid);
    }
  }

  async render(force, options) {
    const rendered = await super.render(force, options);
    const gearContainer = this.element.find("#gear-slots")[0];
    if (gearContainer) {
      game.tm.GearRenderer.render(gearContainer, this.actor);
    }
    return rendered;
  }

  async close(...args) {
    if (game.tm?.GridPickup?.pickupData?.actorId === this.actor.id) {
      game.tm.GridPickup.cancel();
    }
    return super.close(...args);
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

    game.tm.GridAutoPosition.placeNewItem(this.actor, newItem);
  }
}

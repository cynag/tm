// actor-sheet.js
import { GridUtils } from "../grid/grid-utils.js";
import { GridRenderer } from "../grid/grid-renderer.js";
import { GridAutoPosition } from "../grid/grid-auto-position.js";

export class TMActorSheet extends foundry.appv1.sheets.ActorSheet {
  constructor(...args) {
    super(...args);
    this._onDropBound = this._onDrop.bind(this);
    this._isRendering = false;
    this._activeTab = "attributes";
  }

  static get defaultOptions() {
  return foundry.utils.mergeObject(super.defaultOptions, {
    classes: ["tm", "sheet", "actor"],
    width: 750,
    height: 750,
    resizable: false,
    tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".main-content", initial: "attributes" }]
  });
}

  get template() {
    return `systems/tm/templates/actor/actor-sheet.hbs`;
  }

  async getData() {
    return await super.getData();
  }

  async render(force, options) {
    if (this._isRendering) return;
    this._isRendering = true;

    const rendered = await super.render(force, options);

    requestAnimationFrame(() => {
      const html = this.element;
      const tabId = this._activeTab;

      // 🧩 Tabs
      const tabs = html.find(".tab");
      const activeTab = html.find(`.tab[data-tab="${tabId}"]`);
      const allButtons = html.find(".tab-button");

      tabs.hide();
      activeTab.show();
      allButtons.removeClass("active");
      allButtons.filter(`[data-tab="${tabId}"]`).addClass("active");

      // 🧱 Inventário e Equipamento
      const gear = html.find("#gear-slots")[0];
      const grid = html.find("#grid-inventory")[0];

      if (gear) game.tm.GearRenderer.render(gear, this.actor);
      if (grid) {
        const vGrid = GridUtils.createVirtualGrid(this.actor);
        GridRenderer.renderGrid(grid, vGrid);
      }

      // 📏 Corrige overflow
      const wrapper = html.closest(".app");
      const winContent = wrapper?.find(".window-content")[0];
      if (winContent) winContent.style.overflow = "hidden";

      this._isRendering = false;
    });

    return rendered;
    
  }

  activateListeners(html) {
    super.activateListeners(html);

    // 🖱️ Drag & Drop
    if (!this._gridListenersBound) {
      html[0].removeEventListener("drop", this._onDropBound);
      html[0].addEventListener("drop", this._onDropBound);
      this._gridListenersBound = true;
    }

    // 🧽 Auto-sort
    html.find(".auto-sort-btn").on("click", () => {
      console.log("[AutoSort] 🔁 Auto-sort iniciado");
      game.tm.GridAutoSort.sort(this.actor);
    });

    // 🗑️ Deletar item
    html.find(".item-delete").on("click", async (ev) => {
      const li = ev.currentTarget.closest("[data-item-id]");
      const itemId = li?.dataset.itemId;
      if (itemId) await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });

    // 🧭 Tabs laterais
    html.find(".tab-button").on("click", (ev) => {
      const tabId = ev.currentTarget.dataset.tab;
      this._activeTab = tabId;
      this.render(false, {});
    });
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

    // ❌ Duplicata de carta
    if (itemData.type === "card") {
      const exists = this.actor.items.find(i => i.type === "card" && i.name === itemData.name);
      if (exists) {
        ui.notifications.warn(`Você já possui a carta "${itemData.name}".`);
        return;
      }
    }

    const created = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    const newItem = created[0];
    if (!newItem) return;

    game.tm.GridAutoPosition.placeNewItem(this.actor, newItem);
  }
}

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
    width: 730,
    height: "auto",
    resizable: true,
    tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".main-content", initial: "attributes" }]
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

  // Drag & Drop grid
  if (!this._gridListenersBound) {
    html[0].removeEventListener("drop", this._onDropBound);
    html[0].addEventListener("drop", this._onDropBound);
    this._gridListenersBound = true;
  }

  // Auto-sort inventário
  html.find(".auto-sort-btn").on("click", () => {
    console.log("[AutoSort] 🔁 Auto-sort iniciado");
    game.tm.GridAutoSort.sort(this.actor);
  });

  // Render gear slots
  const gearContainer = html.find("#gear-slots")[0];
  if (gearContainer) {
    game.tm.GearRenderer.render(gearContainer, this.actor);
  }

  // Render grid
  const gridContainer = html.find("#grid-inventory")[0];
  if (gridContainer) {
    const grid = game.tm.GridUtils.createVirtualGrid(this.actor);
    game.tm.GridRenderer.renderGrid(gridContainer, grid);
  }

  // Deletar item (ícone de lixeira)
  html.find(".item-delete").on("click", async (ev) => {
    const li = ev.currentTarget.closest("[data-item-id]");
    const itemId = li?.dataset.itemId;
    if (itemId) {
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }
  });

  // Tabs laterais customizadas
  html.find(".tab-button").on("click", (event) => {
  const btn = event.currentTarget;
  const tabId = btn.dataset.tab;

  this._activeTab = tabId; // ✅ salva a aba ativa

  html.find(".tab").hide();
  html.find(`.tab[data-tab="${tabId}"]`).show();

  html.find(".tab-button").removeClass("active");
  btn.classList.add("active");
});

}

async render(force, options) {
  if (!this._activeTab) this._activeTab = "inventory"; // ou a aba padrão que quiser

  console.log("[TMActorSheet] 🌀 render iniciado");
  const rendered = await super.render(force, options);
  console.log("[TMActorSheet] ✅ super.render concluído");


  /////////////////////////////
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    console.log("[TMActorSheet] 🕓 requestAnimationFrame disparado");

    const html = this.element;
    const tabId = this._activeTab ?? "attributes";

    // Tabs
    const tabs = html.find(".tab");
    const activeTab = html.find(`.tab[data-tab="${tabId}"]`);
    const allButtons = html.find(".tab-button");
    const activeButton = html.find(`.tab-button[data-tab="${tabId}"]`);

    console.log("[TMActorSheet] 🔎 Tabs totais:", tabs.length);
    console.log("[TMActorSheet] 🔎 Tab ativa encontrada?", !!activeTab.length);
    console.log("[TMActorSheet] 🔘 Botões totais:", allButtons.length);
    console.log("[TMActorSheet] 🔘 Botão ativo encontrado?", !!activeButton.length);

    tabs.hide();
    activeTab.show();
    allButtons.removeClass("active");
    if (activeButton.length) activeButton.addClass("active");

    // Overflow fixo
    const appWrapper = html.closest(".app");
    const winContent = appWrapper?.find(".window-content")[0];
    if (winContent) {
      console.log("[TMActorSheet] 📦 window-content encontrado, aplicando overflow:hidden");
      winContent.style.overflow = "hidden";
    } else {
      console.warn("[TMActorSheet] ❗ window-content NÃO encontrado");
    }

    // 🔁 Força re-render do inventário
    const gearContainer = html.find("#gear-slots")[0];
    if (gearContainer) {
      console.log("[TMActorSheet] 🔁 Re-render gear slots");
      game.tm.GearRenderer.render(gearContainer, this.actor);
    }

    const gridContainer = html.find("#grid-inventory")[0];
    if (gridContainer) {
      console.log("[TMActorSheet] 🔁 Re-render grid inventory");
      const grid = game.tm.GridUtils.createVirtualGrid(this.actor);
      game.tm.GridRenderer.renderGrid(gridContainer, grid);
    }

    // Altura final
    if (!this._positionApplied) {
  this.setPosition({ width: 730, height: "auto" });
  this._positionApplied = true;
}

    console.log("[TMActorSheet] 📐 this.setPosition(height: auto) aplicado");
  });
});






/////////////////////////////

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

  // 🔒 Bloqueia carta duplicada
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

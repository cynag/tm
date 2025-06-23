// actor-sheet.js
import { GridUtils } from "../grid/grid-utils.js";
import { GridRenderer } from "../grid/grid-renderer.js";
import { GridAutoPosition } from "../grid/grid-auto-position.js";
import { TalentPanel } from "../talents/talent-panel.js";


export class TMActorSheet extends foundry.appv1.sheets.ActorSheet {
  
  constructor(...args) {
    super(...args);
    this._onDropBound = this._onDrop.bind(this);
    this._isRendering = false;
    this._activeTab = "attributes";
    this._scrollTop = 0;
    this._blockScrollSave = false;


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
  const data = await super.getData();

  const raceData = this.actor.getFlag("tm", "raceData");
  const subRaceData = this.actor.getFlag("tm", "subRaceData");
  const originId = this.actor.getFlag("tm", "originId");
  const origin = game.tm?.OriginDB?.find(o => o.id === originId);

  data.actor.flags.tm = foundry.utils.mergeObject(data.actor.flags.tm ?? {}, {
    raceData: raceData || null,
    subRaceData: subRaceData || null,
    originId: originId || null
  });

  data.originName = origin?.name || null;

  return data;
}

async render(force = false, options = {}) {
  const el = this.element?.find(".main-content")[0];

  // Salva scroll apenas se já renderizado, não bloqueado e scroll ≠ 0
  if (!this._blockScrollSave && this.rendered && el && el.scrollTop > 0) {
    const key = `scroll-${this.actor.id}`;
    sessionStorage.setItem(key, el.scrollTop);
    console.log("[TMActorSheet] Scroll salvo:", el.scrollTop);
  }

  this._blockScrollSave = false;



  if (this._isRendering) return;
  this._isRendering = true;

  const rendered = await super.render(force, options);

  requestAnimationFrame(() => {
    const html = this.element;
    const tabId = this._activeTab;

    const tabs = html.find(".tab");
    const activeTab = html.find(`.tab[data-tab="${tabId}"]`);
    const allButtons = html.find(".tab-button");

    tabs.hide();
    activeTab.show();
    allButtons.removeClass("active");
    allButtons.filter(`[data-tab="${tabId}"]`).addClass("active");

    const gear = html.find("#gear-slots")[0];
    const grid = html.find("#grid-inventory")[0];

    if (gear) game.tm.GearRenderer.render(gear, this.actor);
    if (grid) {
      const vGrid = GridUtils.createVirtualGrid(this.actor);
      GridRenderer.renderGrid(grid, vGrid);
    }

    const wrapper = html.closest(".app");
    const winContent = wrapper?.find(".window-content")[0];
    if (winContent) winContent.style.overflow = "hidden";

    const talentPanel = html.find(".tab[data-tab='skills']")[0];
    if (talentPanel) {
      game.tm.TalentPanel.render($(talentPanel), this.actor);
    }

    // 🟨 Retry até restaurar scroll corretamente
    const key = `scroll-${this.actor.id}`;
    const scrollValue = parseInt(sessionStorage.getItem(key) || "0");
    let attempts = 0;

    const tryRestoreScroll = () => {
      const el = this.element.find(".main-content")[0];
      if (el) {
        el.scrollTop = scrollValue;
        console.log("[TMActorSheet] Scroll restaurado:", scrollValue);
        if (el.scrollTop === scrollValue || attempts >= 5) return;
      }
      if (attempts < 5) {
        attempts++;
        setTimeout(tryRestoreScroll, 100);
      }
    };

    tryRestoreScroll();

    this._isRendering = false;
  });

  setTimeout(async () => {
    const hasRace = await this.actor.getFlag("tm", "raceConfirmed");
    if (!hasRace) {
      console.log("[RaceSelector] Exibindo tela de seleção de raça");
      const { RaceSelector } = await import("../race/race-selector.js");
      new RaceSelector(this.actor).render(true);
    }
  }, 10);

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

    html.find(".resource-btn").on("click", async (ev) => {
  const btn = ev.currentTarget;
  const path = btn.dataset.target;
  const step = parseInt(btn.dataset.step);
  const current = foundry.utils.getProperty(this.actor.system, path.split(".").slice(1).join("."));
  await this.actor.update({ [path]: current + step });
});

  html.find("[data-action='show-race']").on("click", async () => {
  const { RaceSelector } = await import("../race/race-selector.js");
  const selector = new RaceSelector(this.actor, { readOnly: false });
  selector.render(true);
});

html.find("[data-action='show-origin']").on("click", async () => {
  const { OriginSelector } = await import("../origin/origin-selector.js");
  new OriginSelector(this.actor).render(true);
});

html.find("[data-target='system.base_erudition']").on("change", async () => {
  const el = this.element?.find(".main-content")[0];
  if (el) {
    const key = `scroll-${this.actor.id}`;
    sessionStorage.setItem(key, el.scrollTop);
    console.log("[TMActorSheet] Scroll pré-update salvo:", el.scrollTop);
  }

  const erud = this.actor.system.base_erudition;
  const sab = 14 + erud;
  await this.actor.update({ "system.player_knowledge": sab });

  this._blockScrollSave = true; // <- só BLOQUEIA após update

  console.log(`[Atualização] Sabedoria recalculada: ${sab}`);
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


    const created = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    const newItem = created[0];
    if (!newItem) return;

    game.tm.GridAutoPosition.placeNewItem(this.actor, newItem);
}

}

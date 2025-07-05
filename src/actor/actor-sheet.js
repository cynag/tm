// actor-sheet.js
import { GridUtils } from "../grid/grid-utils.js";
import { GridRenderer } from "../grid/grid-renderer.js";
import { GridAutoPosition } from "../grid/grid-auto-position.js";
import { ActionsPanel } from "../actions/actions-panel.js";
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
  data.activeTab = this._activeTab;
  data.isGM = game.user.isGM;


  data.attackBonusKeys = Object.keys(this.actor.system.player_attack_bonus || {});
data.attackBonus = this.actor.system.player_attack_bonus || {};
data.damageBonus = this.actor.system.player_damage_bonus || {};
data.extraDice = this.actor.system.player_extra_dice || {};



  return data;
}

async render(force = false, options = {}) {
  const el = this.element?.find(".main-content")[0];

  // Salva scroll apenas se já renderizado, não bloqueado e scroll ≠ 0
  if (!this._blockScrollSave && this.rendered && el && typeof el.scrollTop === "number") {
  const key = `scroll-${this.actor.id}`;
  sessionStorage.setItem(key, el.scrollTop);
  //console.log("[TMActorSheet] Scroll salvo:", el.scrollTop);
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

tabs.removeClass("active").hide();
activeTab.addClass("active").show();
allButtons.removeClass("active");
const activeButton = allButtons.filter(`[data-tab="${tabId}"]`);
if (activeButton.length) activeButton.addClass("active");


    // 🟨 Retry até restaurar scroll corretamente
    const key = `scroll-${this.actor.id}`;
    const scrollValue = parseInt(sessionStorage.getItem(key) || "0");
    let attempts = 0;

    const tryRestoreScroll = () => {
      const el = this.element.find(".main-content")[0];
      if (el) {
        el.scrollTop = scrollValue;
        //console.log("[TMActorSheet] Scroll restaurado:", scrollValue);
        if (el.scrollTop === scrollValue || attempts >= 5) return;
      }
      if (attempts < 5) {
        attempts++;
        setTimeout(tryRestoreScroll, 100);
      }
    };

    tryRestoreScroll();

    if (this._activeTab === "cards" && options.tabClicked === true) {
  //console.log("[CardPanel] ResetAnimation (por clique real na aba)");
  if (game.tm?.CardPanel?.resetAnimation) {
    game.tm.CardPanel.resetAnimation(this.actor.id);
  }
}



    this._isRendering = false;

    this.element?.attr("data-tab", this._activeTab);

  });

  setTimeout(async () => {
    const hasRace = await this.actor.getFlag("tm", "raceConfirmed");
    if (!hasRace) {
      //console.log("[RaceSelector] Exibindo tela de seleção de raça");
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
      //console.log("[AutoSort] 🔁 Auto-sort iniciado");
      game.tm.GridAutoSort.sort(this.actor);
    });

    // 🗑️ Deletar item
    html.find(".item-delete").on("click", async (ev) => {
      const li = ev.currentTarget.closest("[data-item-id]");
      const itemId = li?.dataset.itemId;
      if (itemId) await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });

    // 🧭 Tabs laterais (sem re-render)
html.find(".tab-button").on("click", (ev) => {
  const tabId = ev.currentTarget.dataset.tab;
  this._activeTab = tabId;

  const tabs = html.find(".tab");
  const allButtons = html.find(".tab-button");

  tabs.hide();
  html.find(`.tab[data-tab="${tabId}"]`).show();
  allButtons.removeClass("active");
  html.find(`.tab-button[data-tab="${tabId}"]`).addClass("active");
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
    //console.log("[TMActorSheet] Scroll pré-update salvo:", el.scrollTop);
  }

  const erud = this.actor.system.base_erudition;
  const sab = 14 + erud;
  await this.actor.update({ "system.player_knowledge": sab });

  this._blockScrollSave = true; // <- só BLOQUEIA após update

  //console.log(`[Atualização] Sabedoria recalculada: ${sab}`);
});

html.find('.sheet-tabs[data-group="main-tabs"]').on("click", "button[data-tab='cards']", async () => {
  this._activeTab = "cards";

  await this.render(true);

});







// ✅ Renders obrigatórios sempre que a sheet abre
const gear = html.find("#gear-slots")[0];
const grid = html.find("#grid-inventory")[0];
const talentPanel = html.find(".tab[data-tab='skills']")[0];

if (gear) game.tm.GearRenderer.render(gear, this.actor);
if (grid) {
  const vGrid = game.tm.GridUtils.createVirtualGrid(this.actor);
  game.tm.GridRenderer.renderGrid(grid, vGrid);
}
if (talentPanel) {
  game.tm.TalentPanel.render($(talentPanel), this.actor);
}
const actionsPanel = html.find(".tab[data-tab='actions']")[0];
if (actionsPanel) {
  game.tm.ActionsPanel.render($(actionsPanel), this.actor);
}
const domainsPanel = html.find(".tab[data-tab='domains']")[0];
if (domainsPanel) {
  game.tm.DomainsPanel.render($(domainsPanel), this.actor);
}





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

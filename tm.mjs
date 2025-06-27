// === IMPORTS ===

import { SkillsDB } from "./src/talents/skills-db.js";
import { KnowledgesDB } from "./src/talents/knowledges-db.js";
import { TalentPanel } from "./src/talents/talent-panel.js";
import { TalentRollDialog } from "./src/ui/talent-roll-dialog.js";

import { TMActor } from "./src/actor/actor.js";
import { TMObject } from "./src/item/item.js";
import { TMActorSheet } from "./src/actor/actor-sheet.js";

import { ConsumableSheet } from "./src/item/consumable-sheet.js";
import { GearSheet } from "./src/item/gear-sheet.js";
import { LanguageSheet } from "./src/item/language-sheet.js";
import { TraitSheet } from "./src/item/trait-sheet.js";

import { RaceSelector } from "./src/race/race-selector.js";
import { RaceDB } from "./src/race/race-db.js";
import { SubRaceSelector } from "./src/race/subrace-selector.js";
import { OriginSelector } from "./src/origin/origin-selector.js";
import { OriginDB } from "./src/origin/origin-db.js";

import { ActionsPanel } from "./src/actions/actions-panel.js";

import { GridInventory } from "./src/grid/grid-inventory.js";
import { GridUtils } from "./src/grid/grid-utils.js";
import { GridRenderer } from "./src/grid/grid-renderer.js";
import { GridPositioner } from "./src/grid/grid-positioner.js";
import { GridPickup } from "./src/grid/grid-pickup.js";
import { GridRotate } from "./src/grid/grid-rotate.js";
import { GridOverlay } from "./src/grid/grid-overlay.js";
import { GridPreview } from "./src/grid/grid-preview.js";
import { GridSwap } from "./src/grid/grid-swap.js";
import { GridAutoPosition } from "./src/grid/grid-auto-position.js";
import { GridDelete } from "./src/grid/grid-delete.js";
import { GridAutoSort } from "./src/grid/grid-auto-sort.js";

import { GearSlots } from "./src/gear/gear-slots.js";
import { GearManager } from "./src/gear/gear-manager.js";
import { GearUtils } from "./src/gear/gear-utils.js";
import { GearRenderer } from "./src/gear/gear-renderer.js";
import { GearConstants } from "./src/gear/gear-constants.js";
import { GearOverlay } from "./src/gear/gear-overlay.js";

import { ItemTooltip } from "./src/ui/item-tooltip.js";
import { ItemContextMenu } from "./src/ui/item-context-menu.js";

import { CardPanel } from "./src/cards/card-panel.js";
import { CardsDB } from "./src/cards/cards-db.js";
import { CardTooltip } from "./src/ui/card-tooltip.js";

import { MovementDialog } from "./src/ui/movement-dialog.js";

// === INIT ===

Hooks.once("init", async function () {
  const templates = await foundry.applications.handlebars.loadTemplates([
    "systems/tm/templates/actor/partials/card-panel.hbs"
  ]);
  
  // 🔧 Registra manualmente como partial com nome canônico
  Handlebars.registerPartial("tm.actor.partials.card-panel", templates[0]);

  console.log("Terras Malditas | System initialized");

  CONFIG.Actor.documentClass = TMActor;
  CONFIG.Item.documentClass = TMObject;

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Actors.registerSheet("tm", TMActorSheet, { makeDefault: true });
  foundry.documents.collections.Items.registerSheet("tm", ConsumableSheet, { types: ["consumable"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("tm", GearSheet, { types: ["gear"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("tm", TraitSheet, { types: ["trait"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("tm", LanguageSheet, { types: ["language"], makeDefault: true });

  GridInventory.init();

  

  // ✅ Handlebars Helpers
  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("neq", (a, b) => a !== b);
  Handlebars.registerHelper("and", (a, b) => a && b);
  Handlebars.registerHelper("or", (a, b) => a || b);
  Handlebars.registerHelper("not", a => !a);
  Handlebars.registerHelper("array", (...args) => args.slice(0, -1));
  Handlebars.registerHelper("abs", value => Math.abs(value));
  Handlebars.registerHelper("multiply", (a, b) => a * b);

  Handlebars.registerHelper("hasOrigin", (items) => {
  return items?.some?.(i => i.type === "origin");
});

Handlebars.registerHelper("floorDiv", function (value, divisor) {
  return Math.floor(value / divisor);
});

Handlebars.registerHelper("lookup", (obj, key) => obj?.[key]);
Handlebars.registerHelper("switch", function(value, options) {
  this._switch_value_ = value;
  return options.fn(this);
});

Handlebars.registerHelper("case", function(value, options) {
  if (value === this._switch_value_) {
    return options.fn(this);
  }
});




});


// === READY ===

Hooks.once("ready", () => {
  game.tm = {
    GridInventory,
    GridUtils,
    GridRenderer,
    GridPositioner,
    GridPickup,
    GridRotate,
    GridOverlay,
    GridPreview,
    GridAutoPosition,
    GridSwap,
    GridDelete,
    GridAutoSort,

    // Gear system
    GearSlots,
    GearManager,
    GearUtils,
    GearRenderer,
    GearConstants,
    GearOverlay,

    ItemTooltip,
    ItemContextMenu,
    CardPanel,
    CardsDB,
    CardTooltip,

    RaceSelector,
    RaceDB,
    SubRaceSelector,
    OriginSelector,
    OriginDB,

    SkillsDB,
    KnowledgesDB,
    TalentPanel,
    TalentRollDialog,

    ActionsPanel,
    MovementDialog

  };

  Hooks.on("renderTMActorSheet", (app, html, data) => {
  const container = html[0].querySelector(".card-panel-container");
  if (!container) return;
  game.tm.CardPanel.render(data.actor, container);
});

  console.log("Terras Malditas | Sistema pronto");
});

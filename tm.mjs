// === IMPORTS ===

import { TMActor } from "./src/actor/actor.js";
import { TMObject } from "./src/item/item.js";
import { TMActorSheet } from "./src/actor/actor-sheet.js";

import { ConsumableSheet } from "./src/item/consumable-sheet.js";
import { GearSheet } from "./src/item/gear-sheet.js";
import { CardSheet } from "./src/item/card-sheet.js";

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



// === INIT ===

Hooks.once("init", function () {
  console.log("Terras Malditas | System initialized");

  CONFIG.Actor.documentClass = TMActor;
  CONFIG.Item.documentClass = TMObject;

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

  foundry.documents.collections.Actors.registerSheet("tm", TMActorSheet, { makeDefault: true });
  foundry.documents.collections.Items.registerSheet("tm", ConsumableSheet, { types: ["consumable"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("tm", GearSheet, {types: ["gear"],makeDefault: true});
  foundry.documents.collections.Items.registerSheet("tm", CardSheet, { types: ["card"], makeDefault: true });

  GridInventory.init();
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

    ItemTooltip
  };

  console.log("Terras Malditas | Sistema pronto");
});

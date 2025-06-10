// === IMPORTS ===
import { TMActor } from "./src/actor/actor.js";
import { TMObject } from "./src/item/item.js";
import { TMActorSheet } from "./src/actor/actor-sheet.js";
import { TMObjectSheet } from "./src/item/object-sheet.js";

import { GridInventory } from "./src/grid/grid-inventory.js";
import { GridUtils } from "./src/grid/grid-utils.js";
import { GridRenderer } from "./src/grid/grid-renderer.js";
import { GridPositioner } from "./src/grid/grid-positioner.js";
import { DragManager } from "./src/grid/drag-manager.js";
import { GridPickup } from "./src/grid/grid-pickup.js";
import { GridRotate } from "./src/grid/grid-rotate.js";
import { GridOverlay } from "./src/grid/grid-overlay.js";

// === INIT ===
Hooks.once("init", function () {
  console.log("Terras Malditas | System initialized");

  CONFIG.Actor.documentClass = TMActor;
  CONFIG.Item.documentClass = TMObject;

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

  foundry.documents.collections.Actors.registerSheet("tm", TMActorSheet, { makeDefault: true });
  foundry.documents.collections.Items.registerSheet("tm", TMObjectSheet, { makeDefault: true });

  GridInventory.init();
});

Hooks.once("ready", () => {
  GridRotate.register();
});

// === GLOBAL ACCESS (DEV) ===
Hooks.once("ready", () => {
  GridRotate.register();

  // === GLOBAL ACCESS (DEV) ===
  game.tm = {
    GridInventory,
    GridUtils,
    GridRenderer,
    GridPositioner,
    DragManager,
    GridPickup,
    GridRotate,
    GridOverlay
  };
});

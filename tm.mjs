import { TMActor } from "./src/actor/tm-actor.js";
import { TMActorSheet } from "./src/actor/tm-actor-sheet.js";
import { TMItem } from "./src/item/tm-item.js";
import { TMItemSheet } from "./src/item/tm-item-sheet.js";

Hooks.once("init", async function() {
  console.log("🛠️ [TM] Init Terras Malditas - RPG");

  // Actor registration
  CONFIG.Actor.documentClass = TMActor;
  CONFIG.Actor.sheetClasses["actor"] = {
    ["tm.TMActorSheet"]: {
      id: "tm.TMActorSheet",
      label: "Terras Malditas - Actor Sheet",
      sheetClass: TMActorSheet,
      types: ["actor"],
      default: true
    }
  };

  // Item registration
  CONFIG.Item.documentClass = TMItem;
  CONFIG.Item.sheetClasses["object"] = {
    ["tm.TMItemSheet"]: {
      id: "tm.TMItemSheet",
      label: "Terras Malditas - Item Sheet",
      sheetClass: TMItemSheet,
      types: ["object"],
      default: true
    }
  };

  console.log("🛠️ [TM] Actor and Item registered.");
});

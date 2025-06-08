// tm.mjs

// === IMPORTS ===
import { TMActor } from "./src/actor/actor.js";
import { TMObject } from "./src/item/item.js";
import { TMActorSheet } from "./src/actor/actor-sheet.js";
import { TMObjectSheet } from "./src/item/object-sheet.js";

// === REGISTER HELPERS ===
Handlebars.registerHelper("add", function (a, b) {
  return Number(a) + Number(b);
});
Handlebars.registerHelper("debug", function(...args) {
  console.log("HANDLEBARS DEBUG:", ...args);
});

// === INIT ===
Hooks.once("init", async function() {
  console.log("TM | Initializing Terras Malditas 1ª Edição System");

  // Register Actor class
  CONFIG.Actor.documentClass = TMActor;

  // Register Actor Sheet
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("tm", TMActorSheet, {
    label: "TM Character Sheet",
    makeDefault: true,
    types: ["actor"]
  });

  // Register Item class
  CONFIG.Item.documentClass = TMObject;

  // Register Item Sheet
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("tm", TMObjectSheet, {
    label: "TM Object Sheet",
    makeDefault: true,
    types: ["object"]
  });
});

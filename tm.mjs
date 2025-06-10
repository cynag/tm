// === IMPORTS ===
import { TMActor } from "./src/actor/actor.js";
import { TMObject } from "./src/item/item.js";
import { TMActorSheet } from "./src/actor/actor-sheet.js";
import { TMObjectSheet } from "./src/item/object-sheet.js";

// === CONFIG ===
Hooks.once("init", function () {
  console.log("Terras Malditas | Sistema inicializado");

  CONFIG.Actor.documentClass = TMActor;
  CONFIG.Item.documentClass = TMObject;

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Actors.registerSheet("tm", TMActorSheet, { makeDefault: true });
  Items.registerSheet("tm", TMObjectSheet, { makeDefault: true });
});

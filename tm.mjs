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

import { AttackRollDialog } from "./src/ui/attack-roll-dialog.js";
import { AttackRoll } from "./src/roll/attack-roll.js";

import {DomainsPanel} from "./src/mastery/domains-panel.js";
import { DomainsDB } from "./src/mastery/data/domains-index.js";



import { MasteryMeleeAttackRoll } from "./src/roll/mastery-melee-attack-roll.js";
import { MasteryMeleeDialog } from "./src/ui/mastery-melee-dialog.js";
import { MasteryParser } from "./src/mastery/mastery-parser.js";
import { MasteryCooldown } from "./src/mastery/cooldown.js";

import { EffectsPanel } from "./src/effects/effects-panel.js";
import { EffectsDB } from "./src/effects/effects-db.js";
import { EffectParser } from "./src/effects/effect-parser.js";
import { EffectRender } from "./src/effects/effect-render.js";
import { EffectApply } from "./src/effects/effect-apply.js";
import { EffectDuration } from "./src/effects/effect-apply.js";

import { rollEffectResistance } from "./src/roll/effect-roll.js";



// === INIT ===

Hooks.once("init", async function () {
  const templates = await foundry.applications.handlebars.loadTemplates([
  "systems/tm/templates/actor/partials/card-panel.hbs",
  "systems/tm/templates/chat/roll-attack.hbs"
]);

// 🔧 Registra partials
Handlebars.registerPartial("tm.actor.partials.card-panel", templates[0]);
// (Opcional) se quiser nomear o segundo também
Handlebars.registerPartial("tm.chat.roll-attack", templates[1]);

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
    MovementDialog,

    AttackRoll,
    AttackRollDialog,

    DomainsPanel,

    MasteryMeleeAttackRoll,
    MasteryMeleeDialog,
    MasteryParser,
    MasteryCooldown,

    EffectsPanel,
    EffectsDB,
    EffectParser,
    EffectRender,
    EffectApply,
    EffectDuration,
    rollEffectResistance,

  };

  Hooks.on("renderTMActorSheet", (app, html, data) => {
  const container = html[0].querySelector(".card-panel-container");
  if (!container) return;
  game.tm.CardPanel.render(data.actor, container);
});

  Hooks.on("renderTMActorSheet", (app, html, data) => {
    const container = html[0].querySelector("#effects-panel-container");
    if (container) game.tm.EffectsPanel.render($(html), data.actor);
});

  Hooks.on("updateCombat", async (combat, changes) => {
  console.log("[HOOK] updateCombat chamado", combat, changes);

  // ⛔ Só reage quando o turno muda
  if (!("turn" in changes)) return;

  const currentCombatant = combat.combatants.get(combat.current.combatantId);
  const actor = currentCombatant?.actor;
  if (!actor) return;

  console.log("[CD] Reduzindo cooldowns do ator:", actor.name);

  // 🔻 Reduz todos os cooldowns
  await game.tm.MasteryCooldown.reduceAllCooldowns(actor);
  await game.tm.EffectDuration.reduceAll(actor);

  await actor.update({});

  // 🔁 Re-renderiza painel de ações (evita refresh completo)
  if (actor.sheet?.rendered) {
  await actor.sheet.render(false); // Força rerender da ficha inteira, com novo cooldown
}

});

Hooks.on("deleteCombat", async (combat) => {
  console.log("[CD] Combate encerrado, resetando cooldowns.");

  for (const combatant of combat.combatants) {
    const actor = combatant.actor;
    if (!actor) continue;

    await game.tm.MasteryCooldown.resetAll(actor);

    if (actor.sheet?.rendered) {
      const html = $(actor.sheet.element);
      await game.tm.ActionsPanel.render(html, actor);
    }
  }
});

game.tm.DomainsDB = DomainsDB;



// ✅ Ativa os hooks internos para efeitos visuais
EffectRender.bindHooks();

  console.log("Terras Malditas | Sistema pronto");
});

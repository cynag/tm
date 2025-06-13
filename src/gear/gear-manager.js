// src/gear/gear-manager.js
export class GearManager {
  static async equipItem(actor, item, slotId) {
    // 🛑 Já está equipado nesse slot → não faz nada
    if (actor.system.gearSlots[slotId]?.itemId === item.id) {
      console.log(`[GearManager] ⚠️ ${item.name} já está equipado em ${slotId}`);
      return;
    }

    const current = actor.system.gearSlots[slotId]?.itemId;
    if (current && current !== item.id) {
      await this.unequipItem(actor, slotId);
    }

    await item.update({ "system.equippedSlot": slotId });
    await actor.update({ [`system.gearSlots.${slotId}.itemId`]: item.id });

    const meta = actor.system.gridInventory.items.find(i => i.id === item.id);
    if (meta) meta.rotated = false;

    console.log(`[GearManager] ✅ ${item.name} equipado em ${slotId}`);

    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    if (app) {
      const gearContainer = app.element.find("#gear-slots")[0];
      if (gearContainer) game.tm.GearRenderer.render(gearContainer, actor);

      const gridContainer = app.element.find("#grid-inventory")[0];
      if (gridContainer) {
        const grid = game.tm.GridUtils.createVirtualGrid(actor);
        game.tm.GridRenderer.renderGrid(gridContainer, grid);
      }
    }
  }

  static async unequipItem(actor, slotId) {
    const current = actor.system.gearSlots[slotId]?.itemId;
    if (!current) return;

    const item = actor.items.get(current);
    if (!item) return;

    await item.update({ "system.equippedSlot": null });
    await actor.update({ [`system.gearSlots.${slotId}.itemId`]: null });

    console.log(`[GearManager] ❌ ${item.name} desequipado de ${slotId}`);

    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    if (app) {
      const gearContainer = app.element.find("#gear-slots")[0];
      if (gearContainer) game.tm.GearRenderer.render(gearContainer, actor);

      const gridContainer = app.element.find("#grid-inventory")[0];
      if (gridContainer) {
        const grid = game.tm.GridUtils.createVirtualGrid(actor);
        game.tm.GridRenderer.renderGrid(gridContainer, grid);
      }
    }
  }
}

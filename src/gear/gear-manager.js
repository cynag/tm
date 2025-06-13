// src/gear/gear-manager.js
export class GearManager {
  static _equiping = new Set();
  static _unequiping = new Set();

  static async equipItem(actor, item, slotId) {
    const key = `${actor.id}-${item.id}-${slotId}`;
    if (this._equiping.has(key)) return;
    this._equiping.add(key);

    if (actor.system.gearSlots[slotId]?.itemId === item.id) {
      console.log(`[GearManager] ⚠️ ${item.name} já está equipado em ${slotId}`);
      this._equiping.delete(key);
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

    setTimeout(() => this._equiping.delete(key), 100);
  }

  static async unequipItem(actor, slotId) {
    const key = `${actor.id}-${slotId}`;
    if (this._unequiping.has(key)) return;
    this._unequiping.add(key);

    const current = actor.system.gearSlots[slotId]?.itemId;
    if (!current) {
      this._unequiping.delete(key);
      return;
    }

    const item = actor.items.get(current);
    if (!item) {
      this._unequiping.delete(key);
      return;
    }

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

    setTimeout(() => this._unequiping.delete(key), 100);
  }
}

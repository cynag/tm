// src/gear/gear-manager.js
import { GearConstants } from "./gear-constants.js";

export class GearManager {
  static equipItem(actor, item, slotId) {
    const slot = actor.system.gearSlots[slotId];
    if (!slot) return;

    // Remove item anterior (se houver)
    if (slot.itemId && slot.itemId !== item.id) {
      this.unequipItem(actor, slotId);
    }

    // Atualiza slot
    actor.system.gearSlots[slotId].itemId = item.id;

    // Atualiza item
    item.update({
      "system.equippedSlot": slotId,
      "system.grid.w": slot.width,
      "system.grid.h": slot.height
    });

    // Força rotação nula ao equipar
    const meta = actor.system.gridInventory?.items?.find(i => i.id === item.id);
    if (meta) {
      meta.rotated = false;
      meta.w = slot.width;
      meta.h = slot.height;
    }

    console.log(`[GearManager] ✅ ${item.name} equipado em ${slotId}`);
  }

  static unequipItem(actor, slotId) {
    const slot = actor.system.gearSlots[slotId];
    if (!slot || !slot.itemId) return;

    const item = actor.items.get(slot.itemId);
    if (item) {
      item.update({ "system.equippedSlot": null });
      console.log(`[GearManager] ❌ ${item.name} desequipado de ${slotId}`);
    }

    actor.system.gearSlots[slotId].itemId = null;
  }

  static swapItem(actor, newItem, slotId) {
    const slot = actor.system.gearSlots[slotId];
    if (!slot) return;

    if (slot.itemId && slot.itemId !== newItem.id) {
      this.unequipItem(actor, slotId);
    }

    this.equipItem(actor, newItem, slotId);
  }
}

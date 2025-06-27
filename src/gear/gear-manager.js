// src/gear/gear-manager.js
export class GearManager {
  static _equiping = new Set();
  static _unequiping = new Set();

static async equipItem(actor, item, slotId) {
  const key = `${actor.id}-${item.id}-${slotId}`;
  if (this._equiping.has(key)) return;
  this._equiping.add(key);

  const isTwoHanded = item.system.weapon_traits?.weapon_trait_2h;

  // Força uso do weapon1 em armas 2m
  if (isTwoHanded && slotId === "slot_weapon2") {
    console.log(`[GearManager] 🛑 Arma 2m forçada para slot_weapon1`);
    slotId = "slot_weapon1";
  }
  // 💥 Se arma 2m for equipada e slot_weapon2 estiver ocupado, desequipa o outro item
if (isTwoHanded && actor.system.gearSlots?.slot_weapon2?.itemId && actor.system.gearSlots.slot_weapon2.itemId !== item.id) {
  const id2 = actor.system.gearSlots.slot_weapon2.itemId;
  const item2 = actor.items.get(id2);
  if (item2) {
    console.warn(`[GearManager] 💥 ${item2.name} foi removido de slot_weapon2 para equipar arma 2m`);
    await this.unequipItem(actor, "slot_weapon2");
  }
}


  // Remove o item de qualquer outro slot
  for (const [id, slot] of Object.entries(actor.system.gearSlots)) {
    if (slot.itemId === item.id && id !== slotId) {
      console.debug(`[GearManager] 🧹 Removendo ${item.name} de ${id}`);
      await this.unequipItem(actor, id);
    }
  }

  // Se o item já estiver no slot alvo, sai
  if (actor.system.gearSlots[slotId]?.itemId === item.id) {
    console.log(`[GearManager] ⚠️ ${item.name} já está equipado em ${slotId}`);
    this._equiping.delete(key);
    return;
  }

  // Se outro item estiver no slot, desequipa
  const currentId = actor.system.gearSlots[slotId]?.itemId;
  if (currentId && currentId !== item.id) {
    await this.unequipItem(actor, slotId);
  }

  // Remove da grid se ainda estiver lá
  const gridItems = foundry.utils.deepClone(actor.system.gridInventory?.items ?? []);
  const updatedGrid = gridItems.filter(i => i.id !== item.id);

  // Marca como equipado
await item.update({ "system.equippedSlot": slotId });

await actor.update({
  [`system.gearSlots.${slotId}.itemId`]: item.id,
  "system.gridInventory.items": updatedGrid
});

// 🧹 Força limpeza do estado de pickup para evitar duplicação
if (game.tm.GridPickup.pickupData?.itemId === item.id) {
  game.tm.GridPickup.pickupData = null;
  game.tm.GridPickup._removePreview();
  game.tm.GridPickup._removeOverlay();
  game.tm.GridPickup._removeListeners();
  game.tm.GridDelete.disable();
  console.log(`[GearManager] 🧽 Pickup encerrado após equipar ${item.name}`);
}


  // Render
  const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
  if (app) {
    const gear = app.element.find("#gear-slots")[0];
    const grid = app.element.find("#grid-inventory")[0];
    if (gear) game.tm.GearRenderer.render(gear, actor);
    if (grid) {
      const g = game.tm.GridUtils.createVirtualGrid(actor);
      game.tm.GridRenderer.renderGrid(grid, g);
    }
  }

  console.log(`[GearManager] ✅ ${item.name} equipado em ${slotId}`);
  setTimeout(() => this._equiping.delete(key), 100);
}



  static async unequipItem(actor, slotId) {
  const key = `${actor.id}-${slotId}`;
  if (this._unequiping.has(key)) return;
  this._unequiping.add(key);

  const slotData = actor.system.gearSlots[slotId];
  const current = slotData?.itemId;
  if (!current) {
    this._unequiping.delete(key);
    return;
  }

  const item = actor.items.get(current);
  if (!item) {
    this._unequiping.delete(key);
    return;
  }

  // ⚠️ Se for 2m, verifica e limpa os dois slots
  const isTwoHanded = item.system.weapon_traits?.weapon_trait_2h;
  const updatedSlots = {};

  for (const [id, slot] of Object.entries(actor.system.gearSlots)) {
    if (slot.itemId === item.id) {
      updatedSlots[`system.gearSlots.${id}`] = { itemId: null, width: 0, height: 0 };
    }
  }

  await item.update({ "system.equippedSlot": null });
  await actor.update(updatedSlots);

  console.log(`[GearManager] ❌ ${item.name} desequipado de todos slots`);

  setTimeout(() => {
    const isPickup = game.tm.GridPickup?.pickupData?.itemId === item.id;
    if (!isPickup) {
      game.tm.GridAutoPosition.placeNewItem(actor, item);
    } else {
      console.log(`[GearManager] ⏳ Ignorando reposicionamento de ${item.name} (pickup ativo)`);
    }
  }, 50);

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

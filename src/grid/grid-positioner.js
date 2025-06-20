export class GridPositioner {
  static placeItem(actor, item, x, y, rotated = false) {
    if (["race"].includes(item.type)) {
  console.warn(`[GridPositioner] ⛔ Ignorado tipo não físico: ${item.type}`);
  const current = actor.system.gridInventory?.items ?? [];
  const updated = current.filter(i => i.id !== item.id);
  actor.update({ "system.gridInventory.items": updated });
  return;
}

    const rawW = item?.system?.grid?.w ?? 1;
    const rawH = item?.system?.grid?.h ?? 1;

    const w = rotated ? rawH : rawW;
    const h = rotated ? rawW : rawH;

    const current = actor.system.gridInventory?.items ?? [];
    const filtered = current.filter(i => i.id !== item.id);
    const updated = [...filtered, { id: item.id, x, y, w, h, rotated }];

    actor.update({ "system.gridInventory.items": updated });
  }

  static removeItem(actor, itemId) {
    const current = actor.system.gridInventory?.items ?? [];
    const updated = current.filter(i => i.id !== itemId);
    actor.update({ "system.gridInventory.items": updated });
  }
}

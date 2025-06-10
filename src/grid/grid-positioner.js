export class GridPositioner {
  static placeItem(actor, item, x, y, rotated = false) {
    const w = item?.system?.grid?.w ?? 1;
    const h = item?.system?.grid?.h ?? 1;

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

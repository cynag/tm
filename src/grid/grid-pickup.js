export class GridPickup {
  static current = null; // { item, w, h, rotated }

  static start(item) {
    const w = item?.system?.grid?.w ?? 1;
    const h = item?.system?.grid?.h ?? 1;
    GridPickup.current = { item, w, h, rotated: false };
    console.log(`[GridPickup] Started: ${item.name}`);
  }

  static cancel() {
    console.log("[GridPickup] Cancelled");
    GridPickup.current = null;
  }

  static rotate() {
    if (!GridPickup.current) return;

    const { w, h } = GridPickup.current;
    if (w === 1 && h === 1) return;

    GridPickup.current = {
      ...GridPickup.current,
      w: h,
      h: w,
      rotated: !GridPickup.current.rotated
    };

    console.log(`[GridPickup] Rotated. Now: ${h}x${w}`);
  }

  static isValid(actor, x, y) {
    if (!GridPickup.current) return false;

    const grid = game.tm.GridUtils.createVirtualGrid(actor);
    const { w, h } = GridPickup.current;
    return game.tm.GridUtils.isSpaceFree(grid, x, y, w, h);
  }
}

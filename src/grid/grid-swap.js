export class GridSwap {
  /**
   * Verifica se uma área (x, y, w, h) intercepta exatamente 1 item no grid.
   * Retorna o item encontrado ou null se não for swap válido.
   */
  static detectSingleItemInArea(grid, actor, x, y, w, h) {
    const foundItemIds = new Set();

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const cx = x + dx;
        const cy = y + dy;
        if (!game.tm.GridUtils._isInsideBounds(cx, cy)) return null;

        const cell = grid[cy][cx];
        if (cell.occupied && cell.itemId) {
          foundItemIds.add(cell.itemId);
        } else if (cell.blocked) {
          return null; // ❌ bloqueio = sem swap
        }
      }
    }

    if (foundItemIds.size === 1) {
      const itemId = [...foundItemIds][0];
      return actor.items.get(itemId) ?? null;
    }

    return null; // ❌ mais de um item ou nenhum
  }

  static attemptSwap(x, y) {
    const pickup = game.tm.GridPickup.pickupData;
    if (!pickup) return;

    const actor = game.actors.get(pickup.actorId);
    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    const container = app?.element.find("#grid-inventory")[0];
    const gridEl = container?.querySelector(".grid");
    if (!gridEl) return;

    const bounds = gridEl.getBoundingClientRect();
    const relX = x - bounds.left;
    const relY = y - bounds.top;

    const gridX = Math.floor(relX / 50);
    const gridY = Math.floor(relY / 50);

    const w = pickup.w;
    const h = pickup.h;

    const grid = game.tm.GridUtils.createVirtualGrid(actor);
    const occupyingItem = this.detectSingleItemInArea(grid, actor, gridX, gridY, w, h);
    if (!occupyingItem) return;

    const meta = actor.system.gridInventory?.items?.find(i => i.id === occupyingItem.id);
    if (!meta) return;

    const canPlaceHere = game.tm.GridUtils.isSpaceFree(grid, gridX, gridY, w, h);

    if (!canPlaceHere && occupyingItem.id !== this.detectSingleItemInArea(grid, actor, gridX, gridY, w, h)?.id) {
      return; // ❌ área inválida ou múltiplos itens
    }

    console.log(`[GridSwap] 🔁 Swap: ${pickup.itemId} ↔ ${occupyingItem.id}`);

    // Remove itemB do grid e coloca itemA
    game.tm.GridPositioner.removeItem(actor, occupyingItem.id);
    game.tm.GridPositioner.placeItem(actor, actor.items.get(pickup.itemId), gridX, gridY, pickup.rotated);

    // Atualiza pickup para itemB
    game.tm.GridPickup.pickupData = {
      actorId: actor.id,
      itemId: occupyingItem.id,
      w: meta.rotated ? meta.h : meta.w,
      h: meta.rotated ? meta.w : meta.h,
      rotated: meta.rotated,
      origin: null,
      img: occupyingItem.img,
      fromGrid: true,
      mousePos: { x, y }
    };

    game.tm.GridPreview.remove();
    game.tm.GridPreview.create(game.tm.GridPickup.pickupData);
    game.tm.GridInventory.refresh(app);
  }
}

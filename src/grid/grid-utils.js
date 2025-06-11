export const GridUtils = {
  GRID_WIDTH: 10,
  GRID_HEIGHT: 5,

  createVirtualGrid(actor) {
  const grid = this.createEmptyGrid();

  const pickup = game.tm.GridPickup.pickupData;
  const excludeId = pickup?.fromGrid && pickup?.actorId === actor.id ? pickup.itemId : null;

  for (const item of actor.items) {
    if (item.id === excludeId) continue;

    const metaList = actor.system.gridInventory?.items ?? [];
    const meta = metaList.find(i => i.id === item.id);
    if (!meta || meta.x === undefined || meta.y === undefined) continue;

    const { x: baseX, y: baseY, w, h } = meta;

    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const x = baseX + dx;
        const y = baseY + dy;

        if (this._isInsideBounds(x, y)) {
          grid[y][x].occupied = true;
          grid[y][x].itemId = item.id; // ✅ necessário para swap por qualquer célula
          grid[y][x].origin = dx === 0 && dy === 0;
        }
      }
    }
  }

  return grid;
},

  isSpaceFree(grid, x, y, w, h) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const cx = x + dx;
        const cy = y + dy;

        if (!this._isInsideBounds(cx, cy)) return false;
        const cell = grid[cy][cx];
        if (cell.occupied || cell.blocked) return false;
      }
    }
    return true;
  },

  _isInsideBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.GRID_WIDTH && y < this.GRID_HEIGHT;
  },

  createEmptyGrid() {
    const grid = [];
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        row.push({ blocked: false, occupied: false, origin: false });
      }
      grid.push(row);
    }
    return grid;
  },

  getItemByCell(x, y, actor) {
  const items = actor.system.gridInventory?.items ?? [];
  for (const meta of items) {
    if (
      x >= meta.x &&
      x < meta.x + meta.w &&
      y >= meta.y &&
      y < meta.y + meta.h
    ) {
      return actor.items.get(meta.id) ?? null;
    }
  }
  return null;
},

getItemsUnderArea(x, y, w, h, actor) {
  const ids = new Set();
  const items = actor.system.gridInventory?.items ?? [];

  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      const cx = x + dx;
      const cy = y + dy;

      for (const meta of items) {
        if (
          cx >= meta.x &&
          cx < meta.x + meta.w &&
          cy >= meta.y &&
          cy < meta.y + meta.h
        ) {
          ids.add(meta.id);
        }
      }
    }
  }

  return [...ids];
},

getItemsUnderAreaFromGrid(grid, x, y, w, h) {
  const ids = new Set();
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      const cx = x + dx;
      const cy = y + dy;
      if (!this._isInsideBounds(cx, cy)) continue;
      const cell = grid[cy][cx];
      if (cell.itemId) ids.add(cell.itemId);
    }
  }
  return [...ids];
},

getItemIdUnderPickup(grid, x, y, w, h) {
  const ids = new Set();

  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      const cx = x + dx;
      const cy = y + dy;
      if (!this._isInsideBounds(cx, cy)) continue;

      const cell = grid[cy]?.[cx];
      if (cell?.itemId) ids.add(cell.itemId);
      else return null; // célula vazia ou inválida => não é swap válido
    }
  }

  return ids.size === 1 ? [...ids][0] : null;
},

isItemRotated(actor, itemId) {
  const item = actor.items.get(itemId);
  if (!item) return false;

  const meta = actor.system.gridInventory?.items?.find(i => i.id === itemId);
  if (!meta) return false;

  const original = item.flags?.["tm"]?.originalSize;
  if (!original) return false;

  return (
    (meta.w === original.h && meta.h === original.w) ||
    (meta.w < meta.h && original.w > original.h) ||
    (meta.w > meta.h && original.w < original.h)
  );
}

};

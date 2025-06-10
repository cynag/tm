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

      const w = meta.rotated ? meta.h : meta.w;
      const h = meta.rotated ? meta.w : meta.h;

      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          const x = meta.x + dx;
          const y = meta.y + dy;

          if (grid[y] && grid[y][x]) {
            grid[y][x].occupied = true;
            if (dx === 0 && dy === 0) {
              grid[y][x].origin = true;
              grid[y][x].itemId = item.id;
            }
          }
        }
      }
    }

    return grid;
  },

  _markOccupiedCells(grid, item) {
    for (let dy = 0; dy < item.h; dy++) {
      for (let dx = 0; dx < item.w; dx++) {
        const x = item.x + dx;
        const y = item.y + dy;
        if (!this._isInsideBounds(x, y)) continue;

        const cell = grid[y][x];
        cell.occupied = true;
        cell.itemId = item.id;
        if (dx === 0 && dy === 0) cell.origin = true;
      }
    }
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

  
};

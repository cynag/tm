export const GridUtils = {
  GRID_WIDTH: 10,
  GRID_HEIGHT: 5,

  createVirtualGrid(actor) {
    const grid = [];

    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      grid[y] = [];
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        grid[y][x] = {
          occupied: false,
          blocked: false,
          itemId: null,
          origin: false
        };
      }
    }

    const blockedCells = actor.system.gridInventory?.blocked ?? [];
    for (const cell of blockedCells) {
      if (this._isInsideBounds(cell.x, cell.y)) {
        grid[cell.y][cell.x].blocked = true;
      }
    }

    const items = actor.system.gridInventory?.items ?? [];
    for (const item of items) {
      this._markOccupiedCells(grid, item);
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
  }
};

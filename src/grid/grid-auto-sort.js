export class GridAutoSort {
  static sort(actor) {
    const items = actor.items.filter(i =>
      i.system.grid &&
      !i.system.equippedSlot &&
      !["origin", "trait", "language"].includes(i.type)

    );

    const sorted = [...items].sort((a, b) => {
      const aw = a.system.grid.w ?? 1;
      const ah = a.system.grid.h ?? 1;
      const bw = b.system.grid.w ?? 1;
      const bh = b.system.grid.h ?? 1;
      return (bw * bh) - (aw * ah); // maior área primeiro
    });

    const placed = [];
    const grid = game.tm.GridUtils.createEmptyGrid();

    for (let item of sorted) {
      const rawW = item.system.grid.w ?? 1;
      const rawH = item.system.grid.h ?? 1;
      let pos = null;
      let rotated = false;

      // Tenta em pé
      for (let x = 0; x < game.tm.GridUtils.GRID_WIDTH; x++) {
        for (let y = 0; y < game.tm.GridUtils.GRID_HEIGHT; y++) {
          if (game.tm.GridUtils.isSpaceFree(grid, x, y, rawW, rawH)) {
            pos = { x, y };
            break;
          }
        }
        if (pos) break;
      }

      // Tenta deitado
      if (!pos) {
        for (let x = 0; x < game.tm.GridUtils.GRID_WIDTH; x++) {
          for (let y = 0; y < game.tm.GridUtils.GRID_HEIGHT; y++) {
            if (game.tm.GridUtils.isSpaceFree(grid, x, y, rawH, rawW)) {
              pos = { x, y };
              rotated = true;
              break;
            }
          }
          if (pos) break;
        }
      }

      if (pos) {
        for (let dx = 0; dx < (rotated ? rawH : rawW); dx++) {
          for (let dy = 0; dy < (rotated ? rawW : rawH); dy++) {
            const cx = pos.x + dx;
            const cy = pos.y + dy;
            grid[cy][cx].occupied = true;
            grid[cy][cx].itemId = item.id;
            grid[cy][cx].origin = dx === 0 && dy === 0;
          }
        }

        placed.push({ id: item.id, x: pos.x, y: pos.y, w: rotated ? rawH : rawW, h: rotated ? rawW : rawH, rotated });
        console.log(`[AutoSort] ✅ ${item.name} colocado em ${pos.x},${pos.y} ${rotated ? '(rotacionado)' : ''}`);
      } else {
        console.warn(`[AutoSort] ❌ Sem espaço para ${item.name}`);
      }
    }

    actor.update({ "system.gridInventory.items": placed });
    const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
    if (app) game.tm.GridInventory.refresh(app);
  }
}

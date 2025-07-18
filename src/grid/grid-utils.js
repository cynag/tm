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
},

canStackItems(itemA, itemB) {
  if (!itemA || !itemB) return false;
  if (itemA.id === itemB.id) return false;
  if (itemA.type !== "consumable") return false;
  if (itemB.type !== "consumable") return false;
  if (itemA.system?.category !== "ammo") return false;
  if (itemB.system?.category !== "ammo") return false;
  if (itemA.name !== itemB.name) return false;

  const max = itemA.system?.stack_value ?? 10;
  const total = (itemA.system?.ammo_quantity ?? 0) + (itemB.system?.ammo_quantity ?? 0);
  return total <= max;
},

getAmmoSprite(item) {
  if (!item || !item.system) return "";

  const sprites = item.system.ammo_sprites;
  const qty = item.system.ammo_quantity ?? 0;
  const max = item.system.stack_value ?? 1;

  if (!sprites || max === 0) return item.img;

  const percent = (qty / max) * 100;

  if (percent >= 100 && sprites.s6) return sprites.s6;
  if (percent >= 80 && sprites.s5) return sprites.s5;
  if (percent >= 60 && sprites.s4) return sprites.s4;
  if (percent >= 40 && sprites.s3) return sprites.s3;
  if (percent >= 20 && sprites.s2) return sprites.s2;
  if (percent >= 1 && sprites.s1) return sprites.s1;

  return item.img;
},


async tryStackItem(actor, item) {
  const isAmmo = item.type === "consumable" && item.system.category === "ammo";
  if (!isAmmo) return false;

  const stackRoot = item.flags?.tm?.originalStackId || item.id;

  const inv = actor.items.filter(i => {
    const sameType = i.type === "consumable" && i.system?.category === "ammo";
    const sameName = i.name === item.name;
    const notSelf = i.id !== item.id;
    const spaceLeft = (i.system?.ammo_quantity ?? 0) < (i.system?.stack_value ?? 1);

    const iRoot = i.flags?.tm?.originalStackId || i.id;
      // ✅ Só impede stack no item original IMEDIATO, não em irmãos
  const sameOrigin = i.id === stackRoot;

    return sameType && sameName && notSelf && spaceLeft && !sameOrigin;

  });

  if (inv.length === 0) return false;

  console.log(`[DEBUG] Tentando stackar '${item.name}' (${item.system.ammo_quantity}) com outros stacks válidos:`);
  for (const i of inv) {
    console.log(`- [${i.id}] ${i.name} (${i.system.ammo_quantity}/${i.system.stack_value})`);
  }

  for (const target of inv) {
    const current = target.system.ammo_quantity ?? 0;
    const max = target.system.stack_value ?? 10;
    const add = item.system.ammo_quantity ?? 0;

    if (current >= max) continue;

    const total = current + add;
    const newQty = Math.min(max, total);
    const remainder = Math.max(0, total - max);

    await target.update({ "system.ammo_quantity": newQty });

    if (remainder > 0) {
      await item.update({ "system.ammo_quantity": remainder });
      console.log(`[STACK] ${item.name}: parcial (${newQty} + ${remainder})`);
      return false;
    }

    await actor.deleteEmbeddedDocuments("Item", [item.id]);
    console.log(`[STACK] ${item.name}: total → fundido em [${target.id}] = ${newQty}`);

    if (game.tm.GridPickup?.pickupData?.itemId === item.id) {
      game.tm.GridPickup.pickupData = null;
      game.tm.GridPickup._removePreview?.();
      game.tm.GridPickup._removeOverlay?.();
      game.tm.GridPickup._removeListeners?.();
    }

    return true;
  }

  return false;
}







};
game.tm = game.tm || {};
game.tm.GridUtils = GridUtils;

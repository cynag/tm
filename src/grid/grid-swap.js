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

static async attemptSwap(x, y) {
  console.log("[GridSwap] 🔍 attemptSwap acionado");

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

  const gridSim = game.tm.GridUtils.createVirtualGrid(actor);
const targetIds = game.tm.GridUtils.getItemsUnderAreaFromGrid(gridSim, gridX, gridY, w, h);
  if (targetIds.length !== 1) return;

  const itemA = actor.items.get(pickup.itemId); // item em mão
  const itemB = actor.items.get(targetIds[0]);  // alvo do clique

  // 🧠 Verifica se itemB é uma arma equipada no slot_weapon1 ou slot_weapon2
if (itemB?.type === "gear" && itemB.system.gear_type === "weapon") {
  const slot = itemB.system.equippedSlot;

  if (slot === "slot_weapon1" || slot === "slot_weapon2") {
    console.log(`[GridSwap] 💥 Arma equipada no ${slot} será substituída por swap`);

    // 1️⃣ Desequipar munição vinculada
    await game.tm.GearManager.unlinkAmmoFromWeapon(actor, itemB.id);

    // 2️⃣ Desequipar arma atual
    await game.tm.GearManager.unequipItem(actor, slot);

    // 3️⃣ Equipar itemA no lugar (ainda será movido visualmente depois)
    await game.tm.GearManager.equipItem(actor, itemA, slot);

    // 4️⃣ Força itemB a entrar em pickup
    game.tm.GridPickup.pickupData = {
      actorId: actor.id,
      itemId: itemB.id,
      w: itemB.system.grid?.w ?? 1,
      h: itemB.system.grid?.h ?? 1,
      rotated: false,
      origin: null,
      img: itemB.img,
      fromGrid: false,
      mousePos: { x, y },
      original: {
        w: itemB.system.grid?.w ?? 1,
        h: itemB.system.grid?.h ?? 1
      }
    };

    console.log(`[GridSwap] 🧤 ${itemB.name} agora está em pickup`);
    return; // Encerra aqui — não executa o swap padrão
  }
}


  const item = actor.items.get(pickup.itemId);
  if (!itemA) {
  console.warn("[STACK] ❌ itemA undefined");
  return;
}

// ✅ Tentativa de stack direto com o alvo (antes do swap)
if (itemA && itemB) {
  const stacked = await GridSwap.tryAmmoStackOnSwap(actor, itemA, itemB);
  if (stacked) {
    console.log("[GridSwap] ✅ Stack direto no alvo. Swap cancelado.");
    return;
  }
  
}



  if (!itemA || !itemB) return;


  console.log("[GridSwap] 🧾 Tentando localizar meta de:", itemB.id);
console.log("Itens no gridInventory:", actor.system.gridInventory?.items.map(i => i.id));

  const metaB = actor.system.gridInventory?.items?.find(i => i.id === itemB.id);
if (!metaB) {
  console.warn("[GridSwap] ❌ Meta do itemB ausente");
  return;
}

const metaA = {
  x: pickup.origin?.x ?? 0,
  y: pickup.origin?.y ?? 0,
  w: pickup.w,
  h: pickup.h
};


  // Simula grid sem A e B
  const grid = game.tm.GridUtils.createVirtualGrid(actor);
  for (let dx = 0; dx < metaA.w; dx++) {
    for (let dy = 0; dy < metaA.h; dy++) {
      const cx = metaA.x + dx;
      const cy = metaA.y + dy;
      if (game.tm.GridUtils._isInsideBounds(cx, cy)) {
        grid[cy][cx].occupied = false;
        grid[cy][cx].origin = false;
        grid[cy][cx].itemId = null;
      }
    }
  }

  for (let dx = 0; dx < metaB.w; dx++) {
    for (let dy = 0; dy < metaB.h; dy++) {
      const cx = metaB.x + dx;
      const cy = metaB.y + dy;
      if (game.tm.GridUtils._isInsideBounds(cx, cy)) {
        grid[cy][cx].occupied = false;
        grid[cy][cx].origin = false;
        grid[cy][cx].itemId = null;
      }
    }
  }

  const canPlace = game.tm.GridUtils.isSpaceFree(grid, gridX, gridY, w, h);
  if (!canPlace) {
    console.warn("[GridSwap] ❌ Espaço inválido para reposicionar itemA");
    return;
  }

  console.log(`[GridSwap] 🔁 Swap executado: ${itemA.id} ↔ ${itemB.id}`);

  // Atualiza grid real: remove os dois
  game.tm.GridPositioner.removeItem(actor, itemA.id);
  game.tm.GridPositioner.removeItem(actor, itemB.id);

  // Coloca itemA no lugar de itemB
  game.tm.GridPositioner.placeItem(actor, itemA, gridX, gridY, pickup.rotated);

  // Atualiza pickup com itemB (ordem corrigida)
const rotatedB = !!metaB.rotated;


game.tm.GridPickup.pickupData = {
  actorId: actor.id,
  itemId: itemB.id,
  w: metaB.w,
h: metaB.h,
  rotated: !!metaB.rotated,

  origin: { x: metaB.x, y: metaB.y },
  img: itemB.img,
  fromGrid: true,
  mousePos: { x, y },
  original: {
    w: itemB.system.grid?.w ?? 1,
    h: itemB.system.grid?.h ?? 1
  }
};



await actor.update({});

GridSwap.finalizePickupAfterSwap(actor);


}

static finalizePickupAfterSwap(actor) {
  const pickup = game.tm.GridPickup.pickupData;
  if (!pickup) return;

  const app = Object.values(ui.windows).find(w => w.actor?.id === actor.id);
  const container = app?.element.find("#grid-inventory")[0];

  game.tm.GridPreview.remove();
  game.tm.GridOverlay.remove();

  // Aguarda dois frames para garantir DOM e pickupData sincronizados
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      game.tm.GridPreview.create(pickup);

      const gridEl = container?.querySelector(".grid");
      if (gridEl) {
        const bounds = gridEl.getBoundingClientRect();
        const relX = pickup.mousePos.x - bounds.left;
        const relY = pickup.mousePos.y - bounds.top;
        const grid = game.tm.GridUtils.createVirtualGrid(actor);
        game.tm.GridOverlay.update(actor, grid, relX, relY);
      }

      game.tm.GridInventory.refresh(app);
    });
  });
}

static async tryAmmoStackOnSwap(actor, pickupItem, targetItem) {
  const canStack = game.tm.GridUtils.canStackItems(pickupItem, targetItem);
  if (!canStack) return false;

  const qtyA = pickupItem.system.ammo_quantity ?? 0;
  const qtyB = targetItem.system.ammo_quantity ?? 0;
  const max = targetItem.system.stack_value ?? 1;
  const total = qtyA + qtyB;

  const newQty = Math.min(max, total);
  const remainder = Math.max(0, total - max);

  await targetItem.update({ "system.ammo_quantity": newQty });

  if (remainder > 0) {
    await pickupItem.update({ "system.ammo_quantity": remainder });
    console.log(`[STACK SWAP] ${pickupItem.name}: parcial (${newQty} + ${remainder})`);
    return true;
  }

  await actor.deleteEmbeddedDocuments("Item", [pickupItem.id]);
  console.log(`[STACK SWAP] ${pickupItem.name}: total (${newQty}) → fundido em [${targetItem.id}]`);
  // ✅ Encerra o estado de pickup se ainda estiver ativo
if (game.tm.GridPickup?.pickupData?.itemId === pickupItem.id) {
  game.tm.GridPickup.pickupData = null;
  game.tm.GridPickup._removePreview?.();
  game.tm.GridPickup._removeOverlay?.();
  game.tm.GridPickup._removeListeners?.();
}

  return true;
}

}

export class GridAutoPosition {
  /**
   * Tenta posicionar item novo no inventário.
   * 1. Tenta em pé (original)
   * 2. Tenta rotacionado
   * 3. Se nenhum couber, cancela e avisa
   */
static async placeNewItem(actor, item) {
  const noStack = item.flags?.tm?.noAutoStack === true;
if (!noStack && await game.tm.GridUtils.tryStackItem(actor, item)) return;


  if (["trait", "language"].includes(item.type)) {
    console.warn(`[GridAutoPosition] ⛔ Ignorado tipo não físico: ${item.type}`);
    return;
  }


    const rawW = item.system.grid?.w ?? 1;
    const rawH = item.system.grid?.h ?? 1;

    const grid = game.tm.GridUtils.createVirtualGrid(actor);

    // 1️⃣ Tenta original (em pé)
    for (let x = 0; x < game.tm.GridUtils.GRID_WIDTH; x++) {
      for (let y = 0; y < game.tm.GridUtils.GRID_HEIGHT; y++) {
        if (game.tm.GridUtils.isSpaceFree(grid, x, y, rawW, rawH)) {
          console.log("[GridAutoPosition] ✅ Colocado original em", x, y);
          game.tm.GridPositioner.placeItem(actor, item, x, y, false);
          return;
        }
      }
    }

    // 2️⃣ Tenta rotacionado
    for (let x = 0; x < game.tm.GridUtils.GRID_WIDTH; x++) {
      for (let y = 0; y < game.tm.GridUtils.GRID_HEIGHT; y++) {
        if (game.tm.GridUtils.isSpaceFree(grid, x, y, rawH, rawW)) {
          console.log("[GridAutoPosition] 🔁 Colocado rotacionado em", x, y);
          game.tm.GridPositioner.placeItem(actor, item, x, y, true);
          return;
        }
      }
    }

    // 3️⃣ Nenhuma posição possível
    ui.notifications.warn("Sem espaços no inventário!");
    console.warn("[GridAutoPosition] ❌ Nenhum espaço disponível para", item.name);
  }
}

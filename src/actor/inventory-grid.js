export class InventoryGrid {

  static generateGrid(html, actor) {
    console.log("[InventoryGrid] Grid gerada: 10x5");

    const gridW = 10;
    const gridH = 5;

    const grid = html.find(".inventory-grid");
    grid.empty();

    // Gera as células fixas
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const cell = $(`
          <div
            class="inventory-cell"
            data-cell-x="${x}"
            data-cell-y="${y}"
          >
            <div class="cell-inner"></div>
          </div>
        `);

        grid.append(cell);
      }
    }

    // Cria a camada de itens (flutuante)
    const itemsLayer = $(`<div class="inventory-items-layer"></div>`);
    grid.append(itemsLayer);
  }

  static renderItems(html, actor) {
    console.log("[InventoryGrid] Renderizando itens...");

    const grid = html.find(".inventory-grid");
    const itemsLayer = grid.find(".inventory-items-layer");

    itemsLayer.empty();

    const gridMaxW = Number(grid.data("grid-width")) || 10;
    const gridMaxH = Number(grid.data("grid-height")) || 5;

    for (const item of actor.items) {
      if (item.type !== "object") continue;

      const gridX = Math.max(0, Math.min(item.system.gridX, gridMaxW - item.system.gridWidth));
      const gridY = Math.max(0, Math.min(item.system.gridY, gridMaxH - item.system.gridHeight));
      const gridW = Math.max(1, item.system.gridWidth);
      const gridH = Math.max(1, item.system.gridHeight);

      console.log(`[InventoryGrid] Renderizando item ${item.name} em X=${gridX}, Y=${gridY}, W=${gridW}, H=${gridH}`);

      const div = $(`
        <div
          class="grid-item"
          data-item-id="${item.id}"
          style="
            grid-column: ${gridX + 1} / span ${gridW};
            grid-row: ${gridY + 1} / span ${gridH};
          "
        >
          <div class="cell-inner">
            <img src="${item.img}" alt="${item.name}" title="${item.name}" />
          </div>
        </div>
      `);

      itemsLayer.append(div);
    }
    // 🚀 Debug visual da grid
    InventoryGrid.debugInventoryGrid(html, actor);
  }

  static _canPlaceAt(actor, item, gridX, gridY, gridW, gridH) {
    const gridMaxW = 10;
    const gridMaxH = 5;

    // Check bounds
    if (gridX < 0 || gridY < 0) return false;
    if (gridX + gridW > gridMaxW) return false;
    if (gridY + gridH > gridMaxH) return false;

    // Check collision
    for (const other of actor.items) {
      if (other.id === item.id) continue;
      if (other.type !== "object") continue;

      const ox = other.system.gridX;
      const oy = other.system.gridY;
      const ow = other.system.gridWidth;
      const oh = other.system.gridHeight;

      const overlapX = gridX < ox + ow && gridX + gridW > ox;
      const overlapY = gridY < oy + oh && gridY + gridH > oy;

      if (overlapX && overlapY) {
        return false;
      }
    }

    return true;
  }

  static findFirstFreePosition(actor, gridW, gridH) {
    const gridMaxW = 10;
    const gridMaxH = 5;

    for (let y = 0; y <= gridMaxH - gridH; y++) {
      for (let x = 0; x <= gridMaxW - gridW; x++) {
        const canPlace = InventoryGrid._canPlaceAt(actor, { id: null, type: "object" }, x, y, gridW, gridH);
        if (canPlace) {
          return { x, y };
        }
      }
    }

    return null;
  }
  
  static _canSwapAt(actor, pickupItem, targetX, targetY) {
  // Varre os itens do inventário
  for (const other of actor.items) {
    if (other.id === pickupItem.id) continue; // Não comparar com o item na mão
    if (other.type !== "object") continue;

    const ox = other.system.gridX;
    const oy = other.system.gridY;
    const ow = other.system.gridWidth;
    const oh = other.system.gridHeight;

    // Verifica se a célula está ocupada por este item
    const overlapX = targetX >= ox && targetX < ox + ow;
    const overlapY = targetY >= oy && targetY < oy + oh;

    if (overlapX && overlapY) {
      // Verifica se é possível fazer o swap (mesmo tamanho)
      if (pickupItem.system.gridWidth === ow && pickupItem.system.gridHeight === oh) {
        return other; // Retorna o item que pode ser trocado
      } else {
        return null; // Tem item, mas não pode trocar
      }
    }
  }

  // Não tem item na célula → não é Swap
  return null;
  }

  static debugInventoryGrid(html, actor) {
  // Limpa cor anterior
  html.find(".inventory-cell").css("background-color", "");

  html.find(".inventory-cell").each((_, el) => {
    const cell = $(el);
    const cellX = Number(cell.data("cell-x"));
    const cellY = Number(cell.data("cell-y"));

    // Conta quantos itens ocupam esta célula
    let count = 0;

    for (const item of actor.items) {
      if (item.type !== "object") continue;

      const ox = item.system.gridX;
      const oy = item.system.gridY;
      const ow = item.system.gridWidth;
      const oh = item.system.gridHeight;

      const overlapX = cellX >= ox && cellX < ox + ow;
      const overlapY = cellY >= oy && cellY < oy + oh;

      if (overlapX && overlapY) {
        count++;
      }
    }

    // Aplica a cor visual com base na contagem
    if (count === 0) {
      cell.css("background-color", "rgba(0, 255, 0, 0.3)"); // verde
    } else if (count === 1) {
      cell.css("background-color", "rgba(255, 0, 0, 0.3)"); // vermelho
    } else {
      cell.css("background-color", "rgba(255, 0, 255, 0.4)"); // rosa → overlap!
    }
  });
}


}

export class InventoryGrid {

  static generateGrid(html, actor) {
    console.log("[InventoryGrid] Gerando grid dinâmica...");

    const gridW = Number(html.find(".inventory-grid").data("grid-width")) || 10;
    const gridH = Number(html.find(".inventory-grid").data("grid-height")) || 5;

    const gridEl = html.find(".inventory-grid");
    gridEl.empty(); // limpa o grid

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const cell = $(`
          <div class="inventory-cell"
               data-cell-x="${x}"
               data-cell-y="${y}">
            <div class="cell-inner"></div>
          </div>
        `);
        gridEl.append(cell);
      }
    }

    console.log(`[InventoryGrid] Grid gerada: ${gridW}x${gridH}`);
  }
////////////////////////////////////////////////
// RENDERIZAÇÃO DE ITENS NA FICA
///////////////////////////////////////////////
  static renderItems(html, actor) {
  console.log("[InventoryGrid] Renderizando itens...");

  // Primeiro, limpa itens antigos
  html.find(".inventory-grid .grid-item").remove();

  for (const item of actor.items) {
    const gridX = item.system.gridX;
    const gridY = item.system.gridY;
    const gridW = item.system.gridWidth;
    const gridH = item.system.gridHeight;

    // Cria o item como elemento GRID (ocupando área correta)
    const itemEl = $(`
      <div class="grid-item" data-item-id="${item.id}" draggable="true"
           style="
             grid-column: ${gridX + 1} / span ${gridW};
             grid-row: ${gridY + 1} / span ${gridH};
           ">
        <div class="grid-item-image-wrapper"
          ${item.system.rotated && gridW !== gridH ? 'style="transform: rotate(90deg); transform-origin: center center;"' : ''}>
          <img src="${item.img}" alt="${item.name}" />
        </div>
      </div>
    `);

    // INSERE O ITEM DIRETAMENTE na .inventory-grid
    html.find(".inventory-grid").append(itemEl);
  }

  console.log("[InventoryGrid] Itens renderizados.");
  }
////////////////////////////////////////////////
// O ITEM PODE SER COLOCADO?
///////////////////////////////////////////////
  static _canPlaceAt(actor, item, x, y, iw, ih) {
    const maxW = 10;
    const maxH = 5;

    const grid = Array.from({ length: maxH }, () =>
      Array.from({ length: maxW }, () => false)
    );

    for (const i of actor.items) {
      if (i.id === item.id) continue;

      const ix = i.system.gridX;
      const iy = i.system.gridY;
      const iw2 = i.system.gridWidth;
      const ih2 = i.system.gridHeight;

      for (let yy = iy; yy < iy + ih2; yy++) {
        for (let xx = ix; xx < ix + iw2; xx++) {
          if (yy >= 0 && yy < maxH && xx >= 0 && xx < maxW) {
            grid[yy][xx] = true;
          }
        }
      }
    }

    for (let yy = y; yy < y + ih; yy++) {
      for (let xx = x; xx < x + iw; xx++) {
        if (yy >= maxH || xx >= maxW || grid[yy][xx]) {
          return false;
        }
      }
    }

    return true;
  }
////////////////////////////////////////////////
// PROCURAR O PRIMEIRO ESPAÇO COMPATIVEL
///////////////////////////////////////////////
  static findFirstFreePosition(actor, w, h) {
    console.log(`[InventoryGrid] Procurando espaço para ${w}x${h} (PRIORIDADE VERTICAL)`);

    const gridW = 10;
    const gridH = 5;

    for (let x = 0; x <= gridW - w; x++) {
      for (let y = 0; y <= gridH - h; y++) {
        if (InventoryGrid._canPlaceAt(actor, { id: null }, x, y, w, h)) {
          console.log(`[InventoryGrid] Espaço encontrado em X=${x}, Y=${y}`);
          return { x, y };
        }
      }
    }

    console.warn("[InventoryGrid] Inventário cheio!");
    return null;
  }
}

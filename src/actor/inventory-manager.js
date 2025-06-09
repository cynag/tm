import { InventoryGrid } from "./inventory-grid.js";

export class InventoryManager {

  static _pickupItem = null;
  static _pickupGhost = null;
  static _pickupOriginalX = null;
  static _pickupOriginalY = null;

  static init(html, actor) {
    console.log("[InventoryManager] Init (GRID REAL)");

    // Gera grid e renderiza itens
    InventoryGrid.generateGrid(html, actor);
    InventoryGrid.renderItems(html, actor);

    //////////////////////////////////////////////////////
    // CLICK AND PICKUP -> PEGA O ITEM
    //////////////////////////////////////////////////////
    html.find(".inventory-items-layer .grid-item").off("click").on("click", ev => {

  ev.preventDefault();
  ev.stopPropagation(); // ESSENCIAL!

  const itemId = ev.currentTarget.dataset.itemId;
  const item = actor.items.get(itemId);
  if (!item) return;

  console.log(`[InventoryManager] Iniciando pickup de ${item.name}`);

  // Define estado de pickup
  InventoryManager._pickupItem = item;
  InventoryManager._pickupOriginalX = item.system.gridX;
  InventoryManager._pickupOriginalY = item.system.gridY;

  // Remove qualquer ghost existente
  $(".inventory-ghost").remove();










  // Cria ghost
const ghost = $(`
  <div class="inventory-ghost">
    <img src="${item.img}" alt="${item.name}" />
  </div>
`);
$("body").append(ghost);
InventoryManager._pickupGhost = ghost;

// Calcula tamanho correto do ghost
const gridW = Math.max(1, item.system.gridWidth);
const gridH = Math.max(1, item.system.gridHeight);
const cellSize = InventoryManager._getCellSize(html);

InventoryManager._pickupGhost.css({
  width: `${gridW * cellSize}px`,
  height: `${gridH * cellSize}px`,
  top: `${ev.clientY - (gridH * cellSize) / 2}px`,
  left: `${ev.clientX - (gridW * cellSize) / 2}px`
});









  // Oculta o item na grid
  $(ev.currentTarget).css("visibility", "hidden");

  // Ativa modo pickup → cursor some
  $("body").addClass("inventory-pickup-active");

  // === FORÇA ATUALIZAÇÃO DO PREVIEW IMEDIATA ===
  InventoryManager._updatePreview(html, actor, ev.clientX, ev.clientY);

  // === Ativa movimento do ghost + preview ===
  $(document).on("mousemove.inventoryPickup", ev2 => {
  const rect = InventoryManager._pickupGhost[0].getBoundingClientRect();
  const ghostW = rect.width;
  const ghostH = rect.height;

  InventoryManager._pickupGhost.css({
    top: `${ev2.clientY - ghostH / 2}px`,
    left: `${ev2.clientX - ghostW / 2}px`
  });

  const gridEl = html.find(".inventory-grid")[0];
  const gridRect = gridEl.getBoundingClientRect();
  const cellSize = InventoryManager._getCellSize(html);

  const gridWidth = Number(html.find(".inventory-grid").data("grid-width")) || 10;
  const gridHeight = Number(html.find(".inventory-grid").data("grid-height")) || 5;

  const relX = Math.max(0, ev2.clientX - gridRect.left);
  const relY = Math.max(0, ev2.clientY - gridRect.top);

  const cellX = Math.min(Math.floor(relX / cellSize), gridWidth - 1);
  const cellY = Math.min(Math.floor(relY / cellSize), gridHeight - 1);

  InventoryManager._updatePreview(html, actor, ev2.clientX, ev2.clientY);
});



  // === ESC → cancela pickup ===
  $(document).on("keydown.inventoryPickup", async ev2 => {
    if (ev2.key === "Escape") {
      console.log("[InventoryManager] Cancelando pickup (ESC)");
      await InventoryManager._cancelPickup(html, actor);
    }
  });

  // === Right Click → cancela pickup ===
  $(document).on("contextmenu.inventoryPickup", async ev2 => {
    ev2.preventDefault();
    ev2.stopPropagation(); // ESSENCIAL

    console.log("[InventoryManager] Cancelando pickup (Right Click)");
    await InventoryManager._cancelPickup(html, actor);
  });

  // === Click fora da ficha → joga fora ===
  $(document).on("mousedown.inventoryPickup", async ev2 => {
    if ($(ev2.target).closest(".window-app.actor").length > 0) return;

    console.log("[InventoryManager] Jogando item fora (click fora da ficha)");
    ev2.preventDefault();
    await InventoryManager._discardPickup(html, actor);
  });
});
    //////////////////////////////////////////////////////
    // CLICK AND DROP -> COLOCA O ITEM
    //////////////////////////////////////////////////////
    html.find(".inventory-grid .inventory-cell").off("click").on("click", async ev => {
  const item = InventoryManager._pickupItem;

  // Se não está em pickup, não faz nada
  if (!item) return;

  const gridEl = html.find(".inventory-grid")[0];
  const gridRect = gridEl.getBoundingClientRect();
  const cellSize = InventoryManager._getCellSize(html);

  const gridWidth = Number(html.find(".inventory-grid").data("grid-width")) || 10;
  const gridHeight = Number(html.find(".inventory-grid").data("grid-height")) || 5;

  const relX = Math.max(0, ev.clientX - gridRect.left);
  const relY = Math.max(0, ev.clientY - gridRect.top);

  const cellX = Math.min(Math.floor(relX / cellSize), gridWidth - 1);
  const cellY = Math.min(Math.floor(relY / cellSize), gridHeight - 1);

  console.log(`[InventoryManager] Colocando ${item.name} em X=${cellX}, Y=${cellY}`);

  const canPlace = InventoryGrid._canPlaceAt(
    actor,
    item,
    cellX,
    cellY,
    item.system.gridWidth,
    item.system.gridHeight
  );

  if (canPlace) {
    await item.update({
      "system.gridX": cellX,
      "system.gridY": cellY
    });
    console.log(`[InventoryManager] ${item.name} colocado em X=${cellX}, Y=${cellY}`);

    InventoryManager._endPickup(html, actor);
  } else {
    console.warn(`[InventoryManager] Não cabe em X=${cellX}, Y=${cellY}`);

    // Feedback visual: flash vermelho no ghost
    InventoryManager._pickupGhost.addClass("ghost-invalid");

    // Remove o flash após um pequeno delay
    setTimeout(() => {
      InventoryManager._pickupGhost.removeClass("ghost-invalid");
    }, 200);
  }
});

    //////////////////////////////////////////////////////
    // CONTEXT MENU
    //////////////////////////////////////////////////////
    html.find(".inventory-items-layer .grid-item").off("contextmenu").on("contextmenu", ev => {

      ev.preventDefault();
      ev.stopPropagation();

      const itemId = ev.currentTarget.dataset.itemId;
      const item = actor.items.get(itemId);
      if (!item) return;

      console.log(`[InventoryManager] Abrindo context menu para ${item.name}`);

      $(".inventory-context-menu").remove();

      const menu = $(`
        <div class="inventory-context-menu">
          <div class="menu-item" data-action="use">Usar</div>
          <div class="menu-item" data-action="discard">Jogar Fora</div>
        </div>
      `);

      menu.css({
        top: `${ev.clientY}px`,
        left: `${ev.clientX}px`
      });

      $("body").append(menu);

      menu.find(".menu-item").on("click", async ev2 => {
        const action = ev2.currentTarget.dataset.action;
        console.log(`[InventoryManager] Context menu action: ${action} para ${item.name}`);

        if (action === "use") {
          ui.notifications.info(`Usar ${item.name} (ainda não implementado)`);
        }

        if (action === "discard") {
          await actor.deleteEmbeddedDocuments("Item", [item.id]);
          ui.notifications.info(`${item.name} foi jogado fora!`);
        }

        menu.remove();
      });

      $(document).on("click.inventoryContext", () => {
        $(".inventory-context-menu").remove();
        $(document).off("click.inventoryContext");
      });
    });
}
    static _endPickup(html, actor) {
  console.log("[InventoryManager] Encerrando pickup.");

  InventoryManager._pickupItem = null;
  InventoryManager._pickupGhost = null;
  InventoryManager._pickupOriginalX = null;
  InventoryManager._pickupOriginalY = null;

  $(".inventory-ghost").remove();
  $(document).off(".inventoryPickup");

  $("body").removeClass("inventory-pickup-active"); // RESTAURA CURSOR

  InventoryManager.init(html, actor);
    }
    static async _cancelPickup(html, actor) {
  const item = InventoryManager._pickupItem;
  if (!item) return;

  console.log(`[InventoryManager] Tentando retornar ${item.name} para X=${InventoryManager._pickupOriginalX}, Y=${InventoryManager._pickupOriginalY}`);

  const canPlace = InventoryGrid._canPlaceAt(
    actor,
    item,
    InventoryManager._pickupOriginalX,
    InventoryManager._pickupOriginalY,
    item.system.gridWidth,
    item.system.gridHeight
  );

  if (canPlace) {
    console.log(`[InventoryManager] Retornando ${item.name} para posição original.`);
    await item.update({
      "system.gridX": InventoryManager._pickupOriginalX,
      "system.gridY": InventoryManager._pickupOriginalY
    });
  } else {
    console.warn(`[InventoryManager] Posição original ocupada. Procurando espaço livre...`);
    const newPos = InventoryGrid.findFirstFreePosition(actor, item.system.gridWidth, item.system.gridHeight);
    if (newPos) {
      console.log(`[InventoryManager] Encontrado espaço: X=${newPos.x}, Y=${newPos.y}`);
      await item.update({
        "system.gridX": newPos.x,
        "system.gridY": newPos.y
      });
    } else {
      console.error(`[InventoryManager] Não foi possível reposicionar ${item.name} — inventário cheio!`);
    }
  }
InventoryManager._clearPreview(html);
InventoryManager._endPickup(html, actor);

    }
    static async _discardPickup(html, actor) {
  const item = InventoryManager._pickupItem;
  if (!item) return;

  console.log(`[InventoryManager] Removendo item ${item.name} do inventário.`);

  await actor.deleteEmbeddedDocuments("Item", [item.id]);
  ui.notifications.info(`${item.name} foi jogado fora!`);
InventoryManager._clearPreview(html);
InventoryManager._endPickup(html, actor);

    }
    static _updatePreview(html, actor, clientX, clientY) {
  const gridEl = html.find(".inventory-grid")[0];
  const gridRect = gridEl.getBoundingClientRect();
  const cellSize = InventoryManager._getCellSize(html);

  const gridWidth = Number(html.find(".inventory-grid").data("grid-width")) || 10;
  const gridHeight = Number(html.find(".inventory-grid").data("grid-height")) || 5;

  const relX = Math.max(0, clientX - gridRect.left);
  const relY = Math.max(0, clientY - gridRect.top);

  const cellX = Math.min(Math.floor(relX / cellSize), gridWidth - 1);
  const cellY = Math.min(Math.floor(relY / cellSize), gridHeight - 1);

  html.find(".inventory-cell").removeClass("preview-valid preview-invalid");

  if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
    let canPlace;
    if (cellX === InventoryManager._pickupOriginalX && cellY === InventoryManager._pickupOriginalY) {
      canPlace = true;
    } else {
      canPlace = InventoryGrid._canPlaceAt(
        actor,
        InventoryManager._pickupItem,
        cellX,
        cellY,
        InventoryManager._pickupItem.system.gridWidth,
        InventoryManager._pickupItem.system.gridHeight
      );
    }

    for (let y = 0; y < InventoryManager._pickupItem.system.gridHeight; y++) {
      for (let x = 0; x < InventoryManager._pickupItem.system.gridWidth; x++) {
        const tx = cellX + x;
        const ty = cellY + y;

        if (tx >= 0 && tx < gridWidth && ty >= 0 && ty < gridHeight) {
          const cell = html.find(`.inventory-cell[data-cell-x="${tx}"][data-cell-y="${ty}"]`);
          if (canPlace) {
            cell.addClass("preview-valid");
          } else {
            cell.addClass("preview-invalid");
          }
        }
      }
    }
  }
    }
    static _getCellSize(html) {
  const gridEl = html.find(".inventory-grid")[0];
  if (!gridEl) {
    console.error("[ERROR] .inventory-grid não encontrado!");
    return 50; // fallback seguro
  }

  const cellSizePx = getComputedStyle(gridEl).getPropertyValue("--cell-size").trim();
  if (!cellSizePx) {
    console.error("[ERROR] --cell-size não definido!");
    return 50; // fallback seguro
  }

  const cellSize = parseInt(cellSizePx.replace("px", ""));
  if (isNaN(cellSize)) {
    console.error("[ERROR] cellSize é NaN! cellSizePx =", cellSizePx);
    return 50; // fallback seguro
  }

  return cellSize;
    }
    static _clearPreview(html) {
    html.find(".inventory-cell").removeClass("preview-valid preview-invalid");
    }



}

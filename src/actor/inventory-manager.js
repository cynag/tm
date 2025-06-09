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
    html.find(".inventory-grid .grid-item").off("click").on("click", ev => {
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

  // POSICIONA IMEDIATAMENTE no mouse
  InventoryManager._pickupGhost.css({
    top: `${ev.clientY}px`,
    left: `${ev.clientX}px`
  });

  // Oculta o item na grid
  $(ev.currentTarget).css("visibility", "hidden");

  // Ativa modo pickup → cursor some
  $("body").addClass("inventory-pickup-active");

  // Ativa movimento do ghost + preview
  $(document).on("mousemove.inventoryPickup", ev2 => {
    // Move o ghost
    InventoryManager._pickupGhost.css({
      top: `${ev2.clientY}px`,
      left: `${ev2.clientX}px`
    });

    // Calcula célula sob o mouse
    const gridOffset = html.find(".inventory-grid").offset();
    const cellSize = 50; // tamanho de uma célula

    const relX = ev2.clientX - gridOffset.left;
    const relY = ev2.clientY - gridOffset.top;

    const cellX = Math.floor(relX / cellSize);
    const cellY = Math.floor(relY / cellSize);

    const gridWidth = Number(html.find(".inventory-grid").data("grid-width")) || 10;
    const gridHeight = Number(html.find(".inventory-grid").data("grid-height")) || 5;

    // Limpa qualquer preview anterior
    html.find(".inventory-cell").removeClass("preview-valid preview-invalid");

    // Se mouse está DENTRO da grid
    if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {

      const canPlace = InventoryGrid._canPlaceAt(
        actor,
        InventoryManager._pickupItem,
        cellX,
        cellY,
        InventoryManager._pickupItem.system.gridWidth,
        InventoryManager._pickupItem.system.gridHeight
      );

      // Define a área ocupada pelo item
      for (let y = 0; y < InventoryManager._pickupItem.system.gridHeight; y++) {
        for (let x = 0; x < InventoryManager._pickupItem.system.gridWidth; x++) {
          const tx = cellX + x;
          const ty = cellY + y;

          // Só aplica se dentro da grid
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
  });

  // ESC → cancela pickup
  $(document).on("keydown.inventoryPickup", async ev2 => {
    if (ev2.key === "Escape") {
      console.log("[InventoryManager] Cancelando pickup (ESC)");
      await InventoryManager._cancelPickup(html, actor);
    }
  });

  // Botão direito → cancela pickup
  $(document).on("contextmenu.inventoryPickup", async ev2 => {
    console.log("[InventoryManager] Cancelando pickup (Right Click)");
    ev2.preventDefault();
    await InventoryManager._cancelPickup(html, actor);
  });

  // Click fora da ficha → joga fora
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

  // Se NÃO está em pickup → é um click "vazio" → faz flash
  if (!item) {
    console.log("[InventoryManager] Click em célula vazia → flash vermelho");

    const cell = $(ev.currentTarget);
    cell.addClass("flash-red");

    // Remove a classe depois de 300ms
    setTimeout(() => {
      cell.removeClass("flash-red");
    }, 300);

    return; // NÃO faz mais nada
  }

  // Caso esteja em pickup → segue com o Place normal
  const cellX = Number(ev.currentTarget.dataset.cellX);
  const cellY = Number(ev.currentTarget.dataset.cellY);

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
  } else {
    console.warn(`[InventoryManager] Não cabe em X=${cellX}, Y=${cellY}`);
  }

  // Limpa pickup
  InventoryManager._endPickup(html, actor);
});

    //////////////////////////////////////////////////////
    // CONTEXT MENU
    //////////////////////////////////////////////////////
    html.find(".inventory-grid .grid-item").off("contextmenu").on("contextmenu", ev => {
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

  // Limpa estado
  InventoryManager._pickupItem = null;
  InventoryManager._pickupGhost = null;
  InventoryManager._pickupOriginalX = null;
  InventoryManager._pickupOriginalY = null;

  // Remove ghost
  $(".inventory-ghost").remove();

  // Remove TODOS os listeners do pickup
  $(document).off(".inventoryPickup");

  // Força re-render da grid
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

  // Finaliza pickup
  InventoryManager._endPickup(html, actor);
    }
    static async _discardPickup(html, actor) {
  const item = InventoryManager._pickupItem;
  if (!item) return;

  console.log(`[InventoryManager] Removendo item ${item.name} do inventário.`);

  await actor.deleteEmbeddedDocuments("Item", [item.id]);
  ui.notifications.info(`${item.name} foi jogado fora!`);

  // Finaliza pickup
  InventoryManager._endPickup(html, actor);
    }
}

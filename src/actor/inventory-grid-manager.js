export class InventoryGridManager {

  static _clickListenerAdded = false;
  static _pickupConfirming = false;
  static _currentPickupItemId = null;

  static init(html, actor) {
    // Limpa ghost e cursor ativo
    document.body.classList.remove("inventory-pickup-active");
    document.querySelectorAll(".inventory-ghost").forEach(e => e.remove());
    console.log("[InventoryGrid] Init (click&pickup mode)");

    

    // Reset pickup state
    InventoryGridManager._pickupState = {
      active: false,
      item: null,
      ghostEl: null
    };

////////////////////////////////////////////////
// CLICK NO ITEM → inicia pickup ou executa SWAP
////////////////////////////////////////////////
html.find(".inventory-grid .grid-item").on("click", async ev => {
  ev.preventDefault();
  ev.stopPropagation();

  const itemId = ev.currentTarget.dataset.itemId;
  const clickedItem = actor.items.get(itemId);
  if (!clickedItem) return;

  const state = InventoryGridManager._pickupState;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

if (state.active && state.item) {
  console.log(`[InventoryGrid] SWAP: colocando ${state.item.name} na posição de ${clickedItem.name}`);

  // ATUALIZA pickupItemId ANTES
  InventoryGridManager._currentPickupItemId = clickedItem.id;

  // Desativa render automático TEMPORARIAMENTE
  actor.sheet.options.render = false;

  // Faz o update
  await actor.updateEmbeddedDocuments("Item", [{
    _id: state.item.id,
    "system.gridX": clickedItem.system.gridX,
    "system.gridY": clickedItem.system.gridY
  }]);

  // Aguarda um microtask — garante prepareData completo
  await new Promise(resolve => setTimeout(resolve, 0));

  // AGORA arma o Hook
  Hooks.once("renderActorSheet", async (sheet, html, data) => {
    console.log("[InventoryGrid] SWAP: renderActorSheet detectado → aguardando microtask.");

    // Aguarda mais um microtask — para total segurança
    await new Promise(resolve => setTimeout(resolve, 0));

    const freshClickedItem = sheet.object.items.get(clickedItem.id);

    console.log(`[InventoryGrid][DEBUG] freshClickedItem → id=${freshClickedItem.id}, name=${freshClickedItem.name}, gridX=${freshClickedItem.system.gridX}, gridY=${freshClickedItem.system.gridY}`);

    // Atualiza o pickupState com itemB → NÃO encerra pickup!
    const ghost = document.createElement("img");
    ghost.src = freshClickedItem.img;
    ghost.classList.add("inventory-ghost");
    ghost.style.width = `${freshClickedItem.system.gridWidth * 48}px`;
    ghost.style.height = `${freshClickedItem.system.gridHeight * 48}px`;
    ghost.style.left = `${ev.clientX - (freshClickedItem.system.gridWidth * 48) / 2}px`;
    ghost.style.top = `${ev.clientY - (freshClickedItem.system.gridHeight * 48) / 2}px`;

    document.body.appendChild(ghost);

    InventoryGridManager._pickupState = {
      active: true,
      item: freshClickedItem,
      ghostEl: ghost
    };

    InventoryGridManager._pickupConfirming = false;

    document.body.classList.add("inventory-pickup-active");

    document.addEventListener("mousemove", InventoryGridManager._onMouseMove);
    document.addEventListener("contextmenu", InventoryGridManager._onGlobalContextMenu);

    console.log(`[InventoryGrid] SWAP concluído. Agora pegando: ${freshClickedItem.name}`);

    // 🚩 ATENÇÃO: NÃO chamar _endPickup() aqui! → pickup continua ativo
  });

  // Reativa render
  actor.sheet.options.render = true;

  // Só AGORA força o render manual
  await actor.sheet.render(false);

  console.log("[InventoryGrid] SWAP: aguardando renderActorSheet...");

  // Return → impede pickup normal
  return;
}


////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////



  // Se não está em pickup → inicia pickup normal
  console.log(`[InventoryGrid] Pickup iniciado para item: ${clickedItem.name}`);

  ev.currentTarget.classList.add("being-picked-up");
InventoryGridManager._currentPickupItemId = clickedItem.id;

  const ghost = document.createElement("img");
  ghost.src = clickedItem.img;
  ghost.classList.add("inventory-ghost");
  ghost.style.width = `${clickedItem.system.gridWidth * 48}px`;
  ghost.style.height = `${clickedItem.system.gridHeight * 48}px`;
  ghost.style.left = `${ev.clientX - (clickedItem.system.gridWidth * 48) / 2}px`;
  ghost.style.top = `${ev.clientY - (clickedItem.system.gridHeight * 48) / 2}px`;

  document.body.appendChild(ghost);

  InventoryGridManager._pickupState = {
    active: true,
    item: clickedItem,
    ghostEl: ghost
  };

  InventoryGridManager._pickupConfirming = false;

  document.body.classList.add("inventory-pickup-active");

  document.addEventListener("mousemove", InventoryGridManager._onMouseMove);
  document.addEventListener("contextmenu", InventoryGridManager._onGlobalContextMenu);
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////



    // CLICK NA GRID → tenta colocar o item
    html.find(".inventory-grid").on("click", async ev => {
  if (InventoryGridManager._pickupConfirming) {
    console.log("[InventoryGrid] Ignorando click na grid, confirm dialog ativo.");
    return;
  }

  const state = InventoryGridManager._pickupState;
  if (!state.active || !state.item) return;

  ev.preventDefault();
  const grid = ev.currentTarget;

  const rect = grid.getBoundingClientRect();
let x = Math.floor((ev.clientX - rect.left) / 50);
let y = Math.floor((ev.clientY - rect.top) / 50);

x = Math.max(0, Math.min(9, x));
y = Math.max(0, Math.min(4, y)); // agora altura máxima é 4 (índice 0 a 4)


  console.log(`[InventoryGrid] Tentando colocar em X=${x}, Y=${y}`);

  const canPlace = InventoryGridManager._canPlaceAt(actor, state.item, x, y, state.item.system.gridWidth, state.item.system.gridHeight);

  if (!canPlace) {
    console.warn("[InventoryGrid] Posição inválida!");
    return;
  }

  InventoryGridManager._endPickup();
  await state.item.update({
    "system.gridX": x,
    "system.gridY": y
  });

  console.log("[InventoryGrid] Item colocado!");
});










    // CONTEXTMENU NA GRID (protege contra cancelar pelo botão direito em espaço vazio)
    html.find(".inventory-grid").on("contextmenu", ev => {
      if (InventoryGridManager._pickupConfirming) {
        console.log("[InventoryGrid] Ignorando contextmenu na grid, confirm dialog ativo.");
        ev.preventDefault();
        return;
      }

      // Se quiser, aqui você pode futuramente implementar menu da grid
    });

    // MOUSE MOVE
html.find(".inventory-grid").on("mousemove", ev => {
  const state = InventoryGridManager._pickupState;
  if (!state.active || !state.item) return;

  const grid = ev.currentTarget;

  const rect = grid.getBoundingClientRect();
let x = Math.floor((ev.clientX - rect.left) / 50);
let y = Math.floor((ev.clientY - rect.top) / 50);

x = Math.max(0, Math.min(9, x));
y = Math.max(0, Math.min(4, y)); // agora altura máxima é 4 (índice 0 a 4)


  InventoryGridManager._updatePreview(grid, x, y, actor);
});

    // CONTEXT MENU NO ITEM
    html.find(".inventory-grid .grid-item").on("contextmenu", ev => {
      if (InventoryGridManager._pickupConfirming) {
        console.log("[InventoryGrid] Ignorando contextmenu no item, confirm dialog ativo.");
        ev.preventDefault();
        return;
      }

      const state = InventoryGridManager._pickupState;

      if (state.active) {
        console.log("[InventoryGrid] Pickup cancelado (contextmenu)");
        InventoryGridManager._endPickup();
        return;
      }

      // Context menu normal
      ev.preventDefault();
      ev.stopPropagation();

      document.querySelectorAll(".inventory-context-menu").forEach(e => e.remove());

      const itemId = ev.currentTarget.dataset.itemId;
      const item = actor.items.get(itemId);
      if (!item) return;

      const menu = document.createElement("div");
      menu.classList.add("inventory-context-menu");
      menu.style.left = `${ev.pageX}px`;
      menu.style.top = `${ev.pageY}px`;

      menu.innerHTML = `
        <div class="menu-item" data-action="use">Usar</div>
        <div class="menu-item" data-action="drop">Largar</div>
      `;

      document.body.appendChild(menu);

      menu.querySelectorAll(".menu-item").forEach(btn => {
        btn.addEventListener("click", async e => {
          const action = e.currentTarget.dataset.action;

          if (action === "use") {
            ui.notifications.info(`Você usou ${item.name}!`);
          } else if (action === "drop") {
            await actor.deleteEmbeddedDocuments("Item", [itemId]);
            await actor.sheet.render();
          }

          menu.remove();
        });
      });

      document.addEventListener("pointerdown", function closeMenu(ev2) {
        if (!menu.contains(ev2.target)) {
          menu.remove();
          document.removeEventListener("pointerdown", closeMenu);
        }
      });
    });
    // Limpa listeners antigos


    if (!InventoryGridManager._clickListenerAdded) {
  document.addEventListener("pointerdown", InventoryGridManager._onDocumentClick);
  document.addEventListener("keydown", InventoryGridManager._onGlobalKeyDown);
  InventoryGridManager._clickListenerAdded = true;
  console.log("[InventoryGrid] Document pointerdown listener ADDED.");
}
  }













  static _onMouseMove(ev) {
    const state = InventoryGridManager._pickupState;
    if (!state.active || !state.ghostEl) return;

    state.ghostEl.style.left = `${ev.clientX - (state.item.system.gridWidth * 48) / 2}px`;
    state.ghostEl.style.top = `${ev.clientY - (state.item.system.gridHeight * 48) / 2}px`;
  }

  








  
  static async _onDocumentClick(event) {
  const state = InventoryGridManager._pickupState;

  // Proteção: não age se não tem pickup ativo
  if (!state || !state.active) return;

  // Se estamos em confirmação de jogar fora, ignora clique
  if (InventoryGridManager._pickupConfirming) return;

  // Se clicou dentro da grid → ignora (não cancela pickup)
  if (event.target.closest(".inventory-grid")) return;

  console.log("[InventoryGrid] Click fora da ficha - perguntar se joga fora");

  InventoryGridManager._pickupConfirming = true;
  document.body.classList.add("inventory-confirm-active");

  const item = state.item;
  const actor = item.parent;

  new Dialog({
    title: "Jogar fora",
    content: `<p>Você quer jogar fora <strong>${item.name}</strong>?`,
    buttons: {
      yes: {
        label: "Sim",
        callback: async () => {
          console.log("[InventoryGrid] Jogando item fora...");

          await actor.deleteEmbeddedDocuments("Item", [item.id]);

          // Limpa pickup
          InventoryGridManager._pickupConfirming = false;
          InventoryGridManager._currentPickupItemId = null;
          InventoryGridManager._endPickup();

          // 🚩 REMOVE a classe de bloqueio visual
    document.body.classList.remove("inventory-confirm-active");

          await actor.sheet.render();
        }
      },
      no: {
  label: "Não",
  callback: async () => {
    console.log("[InventoryGrid] Cancelou jogar fora.");

    const items = await actor.getEmbeddedCollection("Item");

    // Verifica se a célula original está ocupada
    const conflict = items.find(other =>
      other.id !== item.id &&
      other.system.gridX === item.system.gridX &&
      other.system.gridY === item.system.gridY
    );

    if (conflict) {
      console.log("[InventoryGrid] Posição original ocupada → procurando nova célula...");

      const newPos = await InventoryGridManager._findNearestFreeCell(item, items);

      if (newPos) {
        console.log(`[InventoryGrid] Nova posição encontrada: X=${newPos.x}, Y=${newPos.y}`);

        await actor.updateEmbeddedDocuments("Item", [{
          _id: item.id,
          "system.gridX": newPos.x,
          "system.gridY": newPos.y
        }]);

        // 🚩 Aguarda microtask após update → ESSENCIAL!
        await new Promise(resolve => setTimeout(resolve, 0));
      } else {
        console.log("[InventoryGrid] Nenhuma posição livre encontrada — mantendo posição.");
      }
    }

    // Limpa pickup
    InventoryGridManager._pickupConfirming = false;
    InventoryGridManager._currentPickupItemId = null;
    InventoryGridManager._endPickup();

    // Remove overlay
    document.body.classList.remove("inventory-confirm-active");

    // 🚩 Agora renderiza ficha DEPOIS do flush — ESSENCIAL!
    await actor.sheet.render();
  }
}

    },
    default: "no"
  }).render(true);
}

















  static async _onGlobalContextMenu(ev) {
  const state = InventoryGridManager._pickupState;

  if (InventoryGridManager._pickupConfirming) {
    console.log("[InventoryGrid] Ignorando contextmenu global, confirm dialog ativo.");
    ev.preventDefault();
    ev.stopPropagation();
    return;
  }

  if (!state.active) return;

  ev.preventDefault();
  ev.stopPropagation();

  console.log("[InventoryGrid] Cancelamento de pickup via botão direito.");

  const item = state.item;
  const actor = item.parent;
  const items = await actor.getEmbeddedCollection("Item");

  // Verifica se a célula original está ocupada
  const conflict = items.find(other =>
    other.id !== item.id &&
    other.system.gridX === item.system.gridX &&
    other.system.gridY === item.system.gridY
  );

  if (conflict) {
    console.log("[InventoryGrid] Posição original ocupada → procurando nova célula...");

    const newPos = await InventoryGridManager._findNearestFreeCell(item, items);

    if (newPos) {
      console.log(`[InventoryGrid] Nova posição encontrada: X=${newPos.x}, Y=${newPos.y}`);

      await actor.updateEmbeddedDocuments("Item", [{
        _id: item.id,
        "system.gridX": newPos.x,
        "system.gridY": newPos.y
      }]);

      // 🚩 Aguarda microtask após update
      await new Promise(resolve => setTimeout(resolve, 0));
    } else {
      console.log("[InventoryGrid] Nenhuma posição livre encontrada — mantendo posição.");
    }
  }

  // Limpa pickup
  InventoryGridManager._pickupConfirming = false;
  InventoryGridManager._currentPickupItemId = null;
  InventoryGridManager._endPickup();

  // Atualiza ficha
  await actor.sheet.render();
}








  static _endPickup() {
    const state = InventoryGridManager._pickupState;

    if (state.ghostEl) state.ghostEl.remove();

    document.removeEventListener("mousemove", InventoryGridManager._onMouseMove);
    document.removeEventListener("contextmenu", InventoryGridManager._onGlobalContextMenu);
    if (InventoryGridManager._clickListenerAdded) {
document.removeEventListener("pointerdown", InventoryGridManager._onDocumentClick);
  InventoryGridManager._clickListenerAdded = false;
  console.log("[InventoryGrid] Document pointerdown listener REMOVED.");

}


    const grid = document.querySelector(".inventory-grid");
    if (grid) {
      grid.querySelectorAll(".grid-item.being-picked-up").forEach(e => e.classList.remove("being-picked-up"));
    }

    document.body.classList.remove("inventory-pickup-active");

    InventoryGridManager._pickupState = {
      active: false,
      item: null,
      ghostEl: null
    };

    InventoryGridManager._clearPreview(grid);
InventoryGridManager._currentPickupItemId = null;

    console.log("[InventoryGrid] Pickup encerrado.");
  }

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

  static _updatePreview(grid, x, y, actor) {
    let preview = grid.querySelector(".grid-preview");

    const state = InventoryGridManager._pickupState;
    if (!state.active || !state.item) return;

    const iw = state.item.system.gridWidth;
    const ih = state.item.system.gridHeight;

    const valid = InventoryGridManager._canPlaceAt(actor, state.item, x, y, iw, ih);

    if (!preview) {
      preview = document.createElement("div");
      preview.classList.add("grid-preview");
      grid.appendChild(preview);
    }

    preview.style.gridColumn = `${x + 1} / span ${iw}`;
    preview.style.gridRow = `${y + 1} / span ${ih}`;
    preview.style.outline = `2px solid ${valid ? "limegreen" : "red"}`;
    preview.style.backgroundColor = valid ? "rgba(0,255,0,0.1)" : "rgba(255,0,0,0.1)";
  }

  static _clearPreview(grid) {
    grid?.querySelectorAll(".grid-preview")?.forEach(e => e.remove());
  }

 
static async _findNearestFreeCell(item, items) {
  const gridWidth = 10;
  const gridHeight = 10;

  const occupied = new Set(items.map(other => `${other.system.gridX},${other.system.gridY}`));

  const originX = item.system.gridX;
  const originY = item.system.gridY;

  for (let radius = 1; radius < Math.max(gridWidth, gridHeight); radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = originX + dx;
        const y = originY + dy;

        if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) continue;

        const key = `${x},${y}`;
        if (!occupied.has(key)) {
          return { x, y };
        }
      }
    }
  }

  return null;
}
static async _onGlobalKeyDown(ev) {
  const state = InventoryGridManager._pickupState;

  if (InventoryGridManager._pickupConfirming) {
    console.log("[InventoryGrid] Ignorando ESC, confirm dialog ativo.");
    return;
  }

  if (ev.key === "Escape" && state.active) {
    console.log("[InventoryGrid] Cancelamento de pickup via ESC.");

    const item = state.item;
    const actor = item.parent;
    const items = await actor.getEmbeddedCollection("Item");

    // Verifica se a célula original está ocupada
    const conflict = items.find(other =>
      other.id !== item.id &&
      other.system.gridX === item.system.gridX &&
      other.system.gridY === item.system.gridY
    );

    if (conflict) {
      console.log("[InventoryGrid] Posição original ocupada → procurando nova célula...");

      const newPos = await InventoryGridManager._findNearestFreeCell(item, items);

      if (newPos) {
        console.log(`[InventoryGrid] Nova posição encontrada: X=${newPos.x}, Y=${newPos.y}`);

        await actor.updateEmbeddedDocuments("Item", [{
          _id: item.id,
          "system.gridX": newPos.x,
          "system.gridY": newPos.y
        }]);

        // 🚩 Aguarda microtask após update
        await new Promise(resolve => setTimeout(resolve, 0));
      } else {
        console.log("[InventoryGrid] Nenhuma posição livre encontrada — mantendo posição.");
      }
    }

    // Limpa pickup
    InventoryGridManager._pickupConfirming = false;
    InventoryGridManager._currentPickupItemId = null;
    InventoryGridManager._endPickup();

    // Atualiza ficha
    await actor.sheet.render();
  }
}



}

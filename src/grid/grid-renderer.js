import { GridPickup } from "./grid-pickup.js";

export class GridRenderer {
  static renderGrid(container, gridData) {
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.classList.add("grid-wrapper");

    const grid = document.createElement("div");
    grid.classList.add("grid");
    grid.style.position = "relative";

    const app = Object.values(ui.windows).find(w => w.element?.find("#grid-inventory")[0] === container);
    const actor = app?.actor;

    for (let y = 0; y < gridData.length; y++) {
      for (let x = 0; x < gridData[y].length; x++) {
        const cell = gridData[y][x];

        const div = document.createElement("div");
        div.classList.add("grid-cell");

        if (cell.occupied) div.classList.add("occupied");
        if (cell.blocked) div.classList.add("blocked");
        if (cell.origin) div.classList.add("origin");

        grid.appendChild(div);

        if (cell.origin && actor && cell.itemId) {
          const item = actor.items.get(cell.itemId);
          const meta = actor.system.gridInventory.items.find(i => i.id === item.id);
          if (!item || !meta) continue;

          const img = document.createElement("div");
          img.classList.add("grid-item-image");
          img.style.backgroundImage = `url(${item.img})`;
          img.style.backgroundSize = "cover";
          img.style.backgroundRepeat = "no-repeat";
          img.style.position = "absolute";
          img.style.pointerEvents = "auto";
          img.style.zIndex = "5";

          img.style.width = `${meta.w * 50}px`;
          img.style.height = `${meta.h * 50}px`;
          if (meta.rotated) {
  img.style.width = `${meta.h * 50}px`;   // inverte w/h
  img.style.height = `${meta.w * 50}px`;
  img.style.transform = "rotate(90deg) translate(0, -100%)";
  img.style.transformOrigin = "top left";
}



          img.style.left = `${x * 50}px`;
          img.style.top = `${y * 50}px`;


          img.addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (e.button !== 0) return;

  const pickup = game.tm.GridPickup.pickupData;

  // 🛑 Se já estiver com item em mão, ignora clique na imagem
  if (pickup) return;

  const origin = { x, y };
  game.tm.GridPositioner.removeItem(actor, item.id);
  game.tm.GridInventory.refresh(app);
  game.tm.GridPickup.start(actor, item, true, origin, e);
});





          grid.appendChild(img);
        }
      }
    }

    wrapper.appendChild(grid);
container.appendChild(wrapper);

requestAnimationFrame(() => {
  game.tm.GridOverlay.create(container);
});


    // ✅ Espera o grid estar no DOM antes de criar overlay
    requestAnimationFrame(() => {
       game.tm.GridOverlay.create(wrapper); // e não container
    });

    grid.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;

      const pickup = game.tm.GridPickup.pickupData;
      if (!pickup) return;

      const bounds = grid.getBoundingClientRect();
      const relX = e.clientX - bounds.left;
      const relY = e.clientY - bounds.top;

      const gridX = Math.floor(relX / 50);
      const gridY = Math.floor(relY / 50);

      const actor = game.actors.get(pickup.actorId);
      const item = actor.items.get(pickup.itemId);
      const gridData = game.tm.GridUtils.createVirtualGrid(actor);

      const w = pickup.w;
      const h = pickup.h;

      const valid = game.tm.GridUtils.isSpaceFree(gridData, gridX, gridY, w, h);
      if (valid) {
  game.tm.GridPositioner.placeItem(actor, item, gridX, gridY, pickup.rotated);
  game.tm.GridPickup.pickupData = null;
  game.tm.GridPickup._removePreview();
  game.tm.GridPickup._removeOverlay();
  game.tm.GridPickup._removeListeners();
  game.tm.GridInventory.refresh(app);
  return;
}

// ⚠️ Só tenta swap se houver exatamente 1 item na área
const simGrid = game.tm.GridUtils.createVirtualGrid(actor);

const ids = game.tm.GridUtils.getItemsUnderAreaFromGrid(simGrid, gridX, gridY, w, h);
console.log("[GridRenderer] 💡 Tentando swap com", ids, "na área");

if (ids.length === 1) {
  game.tm.GridSwap.attemptSwap(e.clientX, e.clientY);
}




    });
  }
}

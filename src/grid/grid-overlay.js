export class GridOverlay {
  static overlay = null;

  static create(container) {
    this.overlay?.remove();

    const grid = container.querySelector(".grid");
    if (!grid) {
      //console.warn("[GridOverlay] ❌ .grid não encontrada");
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "grid-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = `${grid.offsetWidth}px`;
    overlay.style.height = `${grid.offsetHeight}px`;
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "9999";

    grid.style.position = "relative";
    grid.appendChild(overlay);

    this.overlay = overlay;
    //console.log("[GridOverlay] ✅ Overlay criado");
  }

  static update(actor, gridData, relX, relY) {
    if (!this.overlay) return;

    this.clear();

    const gridX = Math.floor(relX / 50);
    const gridY = Math.floor(relY / 50);

    const pickup = game.tm.GridPickup.pickupData;
    if (!pickup) return;

    const w = pickup.w;
    const h = pickup.h;

    const ids = game.tm.GridUtils.getItemsUnderArea(gridX, gridY, w, h, actor);
const valid = ids.length === 0;
const swapTarget = ids.length === 1;



    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.style.position = "absolute";
        cell.style.left = `${(gridX + dx) * 50}px`;
        cell.style.top = `${(gridY + dy) * 50}px`;
        cell.style.width = "50px";
        cell.style.height = "50px";
        cell.style.backgroundColor = valid
  ? "rgba(0,255,0,0.3)"
  : swapTarget
    ? "rgba(255,165,0,0.4)" // laranja
    : "rgba(255,0,0,0.3)";

        this.overlay.appendChild(cell);
      }
    }
  }

  static clear() {
    if (!this.overlay) return;
    this.overlay.innerHTML = "";
  }

  static remove() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      //console.log("[GridOverlay] 🧹 Overlay removido");
    }
  }
}
